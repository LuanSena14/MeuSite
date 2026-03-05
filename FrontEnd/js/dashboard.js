// ─────────────────────────────────────────────────────────────────────────────
// dashboard.js — toda lógica de renderização do dashboard
// ─────────────────────────────────────────────────────────────────────────────

let entries = []      // array com todos os check-ins carregados da API
let chartPeso = null  // referência ao gráfico de peso (para destruir antes de recriar)
let chartComp = null  // referência ao gráfico de composição

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Formata uma data ISO ('2024-01-15') para '15 jan. 2024'
function formatDate(iso) {
  const [y, m, d] = iso.split('T')[0].split('-')
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// Calcula a diferença entre dois valores e retorna HTML colorido
// Verde = caiu (bom para peso/gordura), Vermelho = subiu
function delta(curr, prev, unit = '') {
  if (curr == null || prev == null) return ''
  const diff = (parseFloat(curr) - parseFloat(prev)).toFixed(1)
  if (diff == 0) return `<span class="delta-neu">= sem mudança</span>`
  const cls = diff < 0 ? 'delta-pos' : 'delta-neg'
  const sign = diff > 0 ? '+' : ''
  return `<span class="${cls}">${sign}${diff}${unit} vs anterior</span>`
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

  const last = entries[entries.length - 1]
  const prev = entries.length > 1 ? entries[entries.length - 2] : null

  // Data do último check-in
  document.getElementById('last-update-label').textContent =
    'Último check-in: ' + formatDate(last.date)

  // ── KPIs ──
  document.getElementById('kpi-peso').innerHTML =
    (last.peso ?? '—') + '<span class="kpi-unit">kg</span>'
  document.getElementById('kpi-peso-delta').innerHTML =
    prev ? delta(last.peso, prev.peso, ' kg') : ''

  document.getElementById('kpi-gordura').innerHTML =
    (last.gordura ?? '—') + '<span class="kpi-unit">%</span>'
  document.getElementById('kpi-gordura-delta').innerHTML =
    prev ? delta(last.gordura, prev.gordura, '%') : ''

  document.getElementById('kpi-musculo').innerHTML =
    (last.massa_muscular ?? '—') + '<span class="kpi-unit">kg</span>'
  document.getElementById('kpi-musculo-delta').innerHTML =
    prev ? delta(last.massa_muscular, prev.massa_muscular, ' kg') : ''

  document.getElementById('kpi-checkins').textContent = entries.length
  const dias = Math.round((Date.now() - new Date(entries[0].date)) / 86400000)
  document.getElementById('kpi-dias').innerHTML =
    `<span class="delta-neu">em ${dias} dias de acompanhamento</span>`

  // ── Gráficos ──
  renderLineChart(
    'chart-peso',
    entries.map(e => formatDate(e.date)),
    entries.map(e => e.peso),
    '#b5f542'
  )
  renderDonut('chart-composicao', last.gordura, last.massa_muscular, last.peso)

  // ── Cards de medidas e tabela ──
  renderMeasures(last)
  renderHistory()
}

// ── GRÁFICOS ─────────────────────────────────────────────────────────────────

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
        fill: true
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

function renderDonut(id, gordura, musculo, peso) {
  const ctx = document.getElementById(id).getContext('2d')
  if (chartComp) chartComp.destroy()
  const pctMusculo = (musculo && peso) ? +((musculo / peso) * 100).toFixed(1) : (musculo ?? 0)
  const g = gordura ?? 0
  const m = pctMusculo
  const outro = Math.max(0, 100 - g - m)
  chartComp = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Gordura %', 'Músculo %', 'Outros'],
      datasets: [{
        data: [g, m, outro],
        backgroundColor: ['#f55a4230', '#b5f54230', '#2a2e2c'],
        borderColor: ['#f55a42', '#b5f542', '#3a3e3c'],
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

function renderMeasures(e) {
  const measures = [
    { label: 'Cintura',     value: e.cintura,          unit: 'cm',          max: 120 },
    { label: 'Quadril',     value: e.quadril,          unit: 'cm',          max: 140 },
    { label: 'Abdominal',   value: e.circ_abdominal,   unit: 'cm',          max: 130 },
    { label: 'Tórax',       value: e.circ_torax,       unit: 'cm',          max: 140 },
    { label: 'Braço',       value: e.circ_braco,       unit: 'cm',          max: 60  },
    { label: 'Coxa',        value: e.circ_coxa,        unit: 'cm',          max: 90  },
    { label: 'Panturrilha', value: e.circ_panturrilha, unit: 'cm',          max: 60  },
    { label: 'VO2 máx',     value: e.vo2,              unit: 'mL/kg/min',   max: 70  },
  ]

  document.getElementById('measures-grid').innerHTML = measures
    .filter(m => m.value != null)
    .map(m => `
      <div class="measure-card">
        <div class="measure-label">${m.label}</div>
        <div class="measure-value">
          ${m.value}
          <span style="font-size:0.7rem;color:var(--text-muted)"> ${m.unit}</span>
        </div>
        <div class="measure-bar">
          <div class="measure-bar-fill" style="width:${Math.min(100, (m.value / m.max) * 100)}%"></div>
        </div>
      </div>
    `).join('')
}

// ── TABELA HISTÓRICO ─────────────────────────────────────────────────────────

function renderHistory() {
  document.getElementById('history-body').innerHTML = [...entries].reverse().map(e => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.peso           != null ? e.peso + ' kg'           : '—'}</td>
      <td>${e.gordura        != null ? e.gordura + '%'          : '—'}</td>
      <td>${e.massa_muscular != null ? e.massa_muscular + ' kg' : '—'}</td>
      <td>${e.cintura        != null ? e.cintura + ' cm'        : '—'}</td>
      <td>${e.circ_abdominal != null ? e.circ_abdominal + ' cm': '—'}</td>
      <td>${e.sono           != null ? e.sono + 'h'             : '—'}</td>
    </tr>
  `).join('')
}