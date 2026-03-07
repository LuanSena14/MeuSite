// ─────────────────────────────────────────────────────────────────────────────
// dashboard.js — toda lógica de renderização do dashboard
// ─────────────────────────────────────────────────────────────────────────────

let entries      = []   // check-ins carregados da API
let medidas      = []   // árvore de grupos/medidas carregada da API
let chartPeso    = null
let chartComp    = null
let chartMetrica = null

// ── HELPERS DE DATA ───────────────────────────────────────────────────────────

function formatDate(iso) {
  const [y, m, d] = iso.split('T')[0].split('-')
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ── HELPERS NUMÉRICOS ─────────────────────────────────────────────────────────

function round1(v) {
  return Number.isFinite(v) ? parseFloat(v.toFixed(1)) : null
}

function parseHeightMeters(rawHeight) {
  if (rawHeight == null) return null
  const h = parseFloat(rawHeight)
  if (!Number.isFinite(h) || h <= 0) return null
  return h > 3 ? h / 100 : h
}

function getLatestKnown(entriesList, field) {
  for (let i = entriesList.length - 1; i >= 0; i--) {
    if (entriesList[i]?.[field] != null) return entriesList[i][field]
  }
  return null
}

// ── CÁLCULOS DERIVADOS ────────────────────────────────────────────────────────

function calcGorduraDobras(entry) {
  const triceps     = parseFloat(entry?.dobra_triceps)
  const supraIliaca = parseFloat(entry?.dobra_supra_iliaca)
  const abdome      = parseFloat(entry?.dobra_abdome)
  if (![triceps, supraIliaca, abdome].every(Number.isFinite)) return null
  return round1((triceps + supraIliaca + abdome) * 0.153 + 5.783)
}

function calcularPercGordura(entry) {
  const peso    = parseFloat(entry?.peso)
  const gordura = parseFloat(entry?.gordura)
  if (![peso, gordura].every(Number.isFinite)) return null
  return round1((gordura / peso) * 100)
}

function resolveGorduraPct(entry) {
  for (const valor of [
    calcularPercGordura(entry),
    calcGorduraDobras(entry),
    entry?.perc_gordura_dobras,
    entry?.gordura_calculada,
    entry?.percentual_gordura,
    entry?.gordura_dobras,
    entry?.gordura_formula,
  ]) {
    const n = parseFloat(valor)
    if (Number.isFinite(n)) return n
  }
  return null
}

function calcIMC(peso, alturaRaw) {
  const altura = parseHeightMeters(alturaRaw)
  const p = parseFloat(peso)
  if (!Number.isFinite(p) || !altura) return null
  return round1(p / (altura * altura))
}

function calcMassaLivreGordura(peso, gorduraPct) {
  const p = parseFloat(peso)
  const g = parseFloat(gorduraPct)
  if (!Number.isFinite(p) || !Number.isFinite(g)) return null
  return round1(p * (1 - g / 100))
}

function calcFFMI(peso, gorduraPct, alturaRaw) {
  const altura = parseHeightMeters(alturaRaw)
  const mlg = calcMassaLivreGordura(peso, gorduraPct)
  if (mlg == null || !altura) return null
  return round1(mlg / (altura * altura))
}

function calcMassaGordura(peso, gorduraPct) {
  const p = parseFloat(peso)
  const g = parseFloat(gorduraPct)
  if (!Number.isFinite(p) || !Number.isFinite(g)) return null
  return round1(p * (g / 100))
}

// Retorna todas as métricas derivadas de um entry
function buildDerivedMetrics(entry, fallbackAltura) {
  const altura     = entry.altura ?? fallbackAltura
  const gorduraPct = resolveGorduraPct(entry)
  return {
    gorduraPct,
    imc:           calcIMC(entry.peso, altura),
    massa_muscular: entry.massa_muscular ?? calcMassaLivreGordura(entry.peso, gorduraPct),
    ffmi:          calcFFMI(entry.peso, gorduraPct, altura),
    mlg:           calcMassaLivreGordura(entry.peso, gorduraPct),
    massa_gordura: calcMassaGordura(entry.peso, gorduraPct),
  }
}

// Métricas calculadas no JS (não vêm do banco)
// Cada entrada: { descricao, unidade }
const DERIVED_METRICS = [
  { descricao: 'gorduraPct',    unidade: '%',  label: '% Gordura' },
  { descricao: 'imc',           unidade: '',   label: 'IMC' },
  { descricao: 'ffmi',          unidade: '',   label: 'FFMI' },
  { descricao: 'mlg',           unidade: 'kg', label: 'Massa Livre de Gordura' },
  { descricao: 'massa_gordura', unidade: 'kg', label: 'Massa de Gordura' },
]

// ── DELTA ─────────────────────────────────────────────────────────────────────

function delta(curr, prev, unit = '') {
  if (curr == null || prev == null) return ''
  const diff = (parseFloat(curr) - parseFloat(prev)).toFixed(1)
  if (diff == 0) return `<span class="delta-neu">= sem mudança</span>`
  const cls  = diff < 0 ? 'delta-pos' : 'delta-neg'
  const sign = diff > 0 ? '+' : ''
  return `<span class="${cls}">${sign}${diff}${unit} vs anterior</span>`
}

// ── SELETOR DE MÉTRICAS (vem do banco) ───────────────────────────────────────

// Busca a unidade de uma métrica do banco pelo descricao
function getUnidade(descricao) {
  for (const grupo of medidas) {
    const filho = grupo.filhos.find(f => f.descricao === descricao)
    if (filho) return filho.unidade ?? ''
  }
  return ''
}

// Verifica se uma métrica do banco tem pelo menos 1 valor nos entries
function metricaTemDados(descricao) {
  return entries.some(e => {
    const v = parseFloat(e[descricao])
    return Number.isFinite(v)
  })
}

// Verifica se uma métrica derivada tem pelo menos 1 valor nos entries
function derivedTemDados(descricao) {
  const latestAltura = getLatestKnown(entries, 'altura')
  return entries.some(e => {
    const derived = buildDerivedMetrics(e, latestAltura)
    return derived[descricao] != null
  })
}

// Monta o <select> com <optgroup> vindos do banco + grupo "Calculadas" no final
function buildMetricSelector() {
  const selector = document.getElementById('metric-selector')
  if (!selector) return

  let html = ''

  // Grupos e medidas vindos do banco
  for (const grupo of medidas) {
    const filhosComDados = grupo.filhos.filter(f => metricaTemDados(f.descricao))
    if (filhosComDados.length === 0) continue

    html += `<optgroup label="${grupo.descricao}">`
    for (const filho of filhosComDados) {
      const label = filho.descricao.replaceAll('_', ' ')
      const unidade = filho.unidade ? ` (${filho.unidade})` : ''
      html += `<option value="${filho.descricao}">${label}${unidade}</option>`
    }
    html += `</optgroup>`
  }

  // Métricas calculadas no JS
  const derivadasComDados = DERIVED_METRICS.filter(m => derivedTemDados(m.descricao))
  if (derivadasComDados.length > 0) {
    html += `<optgroup label="Calculadas">`
    for (const m of derivadasComDados) {
      const unidade = m.unidade ? ` (${m.unidade})` : ''
      html += `<option value="${m.descricao}">${m.label}${unidade}</option>`
    }
    html += `</optgroup>`
  }

  selector.innerHTML = html
  if (selector.value) renderMetricChart(selector.value)
}

// Chamado pelo onchange do <select>
function onMetricChange() {
  const selector = document.getElementById('metric-selector')
  if (selector?.value) renderMetricChart(selector.value)
}

// ── GRÁFICO DINÂMICO ──────────────────────────────────────────────────────────

function renderMetricChart(metricKey) {
  const latestAltura = getLatestKnown(entries, 'altura')

  // Descobre se é métrica derivada ou do banco
  const isDerived = DERIVED_METRICS.some(m => m.descricao === metricKey)
  const unidade   = isDerived
    ? (DERIVED_METRICS.find(m => m.descricao === metricKey)?.unidade ?? '')
    : getUnidade(metricKey)

  const labels = []
  const data   = []

  for (const e of entries) {
    const derived = buildDerivedMetrics(e, latestAltura)
    const raw     = isDerived ? derived[metricKey] : e[metricKey]
    const v       = parseFloat(raw)
    if (Number.isFinite(v)) {
      labels.push(formatDate(e.date))
      data.push(v)
    }
  }

  const ctx = document.getElementById('chart-metrica').getContext('2d')
  if (chartMetrica) chartMetrica.destroy()

  chartMetrica = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#42f5b5',
        backgroundColor: '#42f5b515',
        borderWidth: 2,
        pointBackgroundColor: '#42f5b5',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => unidade
              ? `${item.parsed.y} ${unidade}`
              : `${item.parsed.y}`
          }
        }
      },
      scales: {
        x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } },
        y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } }
      }
    }
  })
}

// ── RENDERIZAÇÃO PRINCIPAL ────────────────────────────────────────────────────

function renderDash() {
  const empty   = document.getElementById('dash-empty')
  const content = document.getElementById('dash-content')

  if (entries.length === 0) {
    empty.style.display = 'block'
    content.style.display = 'none'
    return
  }
  empty.style.display = 'none'
  content.style.display = 'block'

  const last         = entries[entries.length - 1]
  const prev         = entries.length > 1 ? entries[entries.length - 2] : null
  const latestAltura = getLatestKnown(entries, 'altura')
  const lastDerived  = buildDerivedMetrics(last, latestAltura)
  const prevDerived  = prev ? buildDerivedMetrics(prev, latestAltura) : null

  document.getElementById('last-update-label').textContent =
    'Último check-in: ' + formatDate(last.date)

  document.getElementById('kpi-peso').innerHTML =
    (last.peso ?? '—') + '<span class="kpi-unit">kg</span>'
  document.getElementById('kpi-peso-delta').innerHTML =
    prev ? delta(last.peso, prev.peso, ' kg') : ''

  document.getElementById('kpi-gordura').innerHTML =
    (lastDerived.gorduraPct ?? '—') + '<span class="kpi-unit">%</span>'
  document.getElementById('kpi-gordura-delta').innerHTML =
    prevDerived ? delta(lastDerived.gorduraPct, prevDerived.gorduraPct, '%') : ''

  document.getElementById('kpi-musculo').innerHTML =
    (lastDerived.massa_muscular ?? '—') + '<span class="kpi-unit">kg</span>'
  document.getElementById('kpi-musculo-delta').innerHTML =
    prevDerived ? delta(lastDerived.massa_muscular, prevDerived.massa_muscular, ' kg') : ''

  document.getElementById('kpi-ffmi').innerHTML =
    (lastDerived.ffmi ?? '—') + '<span class="kpi-unit"></span>'
  document.getElementById('kpi-ffmi-delta').innerHTML =
    prevDerived ? delta(lastDerived.ffmi, prevDerived.ffmi, '') : ''

  renderLineChart(
    'chart-peso',
    entries.map(e => formatDate(e.date)),
    entries.map(e => e.peso),
    '#b5f542'
  )
  renderDonut('chart-composicao', lastDerived.gorduraPct, lastDerived.massa_muscular, last.peso)

  buildMetricSelector()  // usa a árvore que veio do banco (var global `medidas`)

  renderMeasures(last, lastDerived, prevDerived)
  renderHistory(latestAltura)
}

// ── GRÁFICOS FIXOS ────────────────────────────────────────────────────────────

function renderLineChart(id, labels, data, color) {
  const ctx = document.getElementById(id).getContext('2d')
  if (chartPeso) chartPeso.destroy()
  chartPeso = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: color + '15',
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } },
        y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } }
      }
    }
  })
}

function renderDonut(id, gorduraPct, massa_muscular, peso) {
  const ctx          = document.getElementById(id).getContext('2d')
  const massaGordura = calcMassaGordura(peso, gorduraPct) ?? 0
  const musculo      = parseFloat(massa_muscular) || 0
  const outro        = Math.max(0, parseFloat(peso) - massaGordura - musculo)

  if (chartComp) chartComp.destroy()
  chartComp = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Gordura', 'Músculo', 'Outros'],
      datasets: [{
        data: [massaGordura, musculo, outro],
        backgroundColor: ['#f55a4230', '#b5f54230', '#2a2e2c'],
        borderColor:     ['#f55a42',   '#b5f542',   '#3a3e3c'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#9aa39d', font: { size: 11, family: 'DM Mono' }, boxWidth: 10 }
        }
      }
    }
  })
}

// ── CARDS DE MEDIDAS ─────────────────────────────────────────────────────────

function renderMeasures(e, derived, prevDerived) {
  const measures = [
    { label: 'IMC',         value: derived.imc,        unit: '',          max: 50,  delta: prevDerived ? delta(derived.imc,  prevDerived.imc,  '') : '' },
    { label: 'FFMI',        value: derived.ffmi,       unit: '',          max: 35,  delta: prevDerived ? delta(derived.ffmi, prevDerived.ffmi, '') : '' },
    { label: 'Massa livre', value: derived.mlg,        unit: 'kg',        max: 120, delta: prevDerived ? delta(derived.mlg,  prevDerived.mlg,  ' kg') : '' },
    { label: 'Cintura',     value: e.cintura,          unit: 'cm',        max: 120 },
    { label: 'Quadril',     value: e.quadril,          unit: 'cm',        max: 140 },
    { label: 'Abdominal',   value: e.circ_abdominal,   unit: 'cm',        max: 130 },
    { label: 'Tórax',       value: e.circ_torax,       unit: 'cm',        max: 140 },
    { label: 'Braço',       value: e.circ_braco,       unit: 'cm',        max: 60  },
    { label: 'Coxa',        value: e.circ_coxa,        unit: 'cm',        max: 90  },
    { label: 'Panturrilha', value: e.circ_panturrilha, unit: 'cm',        max: 60  },
    { label: 'VO2 máx',     value: e.vo2,              unit: 'mL/kg/min', max: 70  },
  ]

  document.getElementById('measures-grid').innerHTML = measures
    .filter(m => m.value != null)
    .map(m => `
      <div class="measure-card">
        <div class="measure-label">${m.label}</div>
        <div class="measure-value">
          ${m.value}<span style="font-size:0.7rem;color:var(--text-muted)"> ${m.unit}</span>
        </div>
        ${m.delta ? `<div class="kpi-delta" style="margin:6px 0 0">${m.delta}</div>` : ''}
        <div class="measure-bar">
          <div class="measure-bar-fill" style="width:${Math.min(100, (m.value / m.max) * 100)}%"></div>
        </div>
      </div>
    `).join('')
}

// ── TABELA HISTÓRICO ─────────────────────────────────────────────────────────

function renderHistory(fallbackAltura) {
  document.getElementById('history-body').innerHTML = [...entries].reverse().map(e => {
    const d = buildDerivedMetrics(e, fallbackAltura)
    return `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.peso           != null ? e.peso + ' kg'            : '—'}</td>
        <td>${d.gorduraPct     != null ? d.gorduraPct + '%'        : '—'}</td>
        <td>${d.massa_muscular != null ? d.massa_muscular + ' kg'  : '—'}</td>
        <td>${e.cintura        != null ? e.cintura + ' cm'         : '—'}</td>
        <td>${e.circ_abdominal != null ? e.circ_abdominal + ' cm' : '—'}</td>
        <td>${e.sono           != null ? e.sono + 'h'              : '—'}</td>
      </tr>
    `
  }).join('')
}