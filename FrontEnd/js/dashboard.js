
 // ─────────────────────────────────────────────────────────────────────────────
 // dashboard.js — toda lógica de renderização do dashboard
 // ─────────────────────────────────────────────────────────────────────────────
 
 let entries = []      // array com todos os check-ins carregados da API
 let chartPeso = null  // referência ao gráfico de peso (para destruir antes de recriar)
 let chartComp = null  // referência ao gráfico de composição
 
 // ── HELPERS ──────────────────────────────────────────────────────────────────
 

 function formatDate(iso) {
   const [y, m, d] = iso.split('T')[0].split('-')
   return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
     day: '2-digit', month: 'short', year: 'numeric'
   })
 }
 

function round1(v) {
  return Number.isFinite(v) ? v.toFixed(1) : null
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

// Reaproveita gordura salva e mantém compatibilidade com cálculo personalizado.
// Ordem de prioridade:
// 1) campo "gordura" vindo da bioimpedância/BD
// 2) campos alternativos que você possa ter criado para a fórmula
// 3) null (não força fórmula específica sem confirmação)

function calcGorduraDobras(entry) {
  const triceps = parseFloat(entry?.dobra_triceps)
  const supraIliaca = parseFloat(entry?.dobra_supra_iliaca)
  const abdome = parseFloat(entry?.dobra_abdome)
  const subescapular = parseFloat(entry?.dobra_subescapular)
  const todasValidas = [triceps, supraIliaca, abdome, subescapular].every(Number.isFinite)
  if (!todasValidas) return null
  return round1((triceps + supraIliaca + abdome  + subescapular) * 0.153  + 5.783)
}

function resolveGorduraPct(entry) {
  const gorduraDobras = calcGorduraDobras(entry)
  const candidatos = [
    entry?.perc_gordura_dobras,
    gorduraDobras,
    entry?.gordura_calculada,
    entry?.percentual_gordura,
    entry?.gordura_dobras,
    entry?.gordura_formula,   
    
  ]
  for (const valor of candidatos) {
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

function buildDerivedMetrics(entry, fallbackAltura) {
  const altura = entry.altura ?? fallbackAltura
  const gorduraPct = resolveGorduraPct(entry)
  return {
    gorduraPct,
    imc: calcIMC(entry.peso, altura),
    massa_muscular: entry.massa_muscular ?? calcMassaLivreGordura(entry.peso, gorduraPct),
    ffmi: calcFFMI(entry.peso, gorduraPct, altura),
    mlg: calcMassaLivreGordura(entry.peso, gorduraPct),
  }
}

 function delta(curr, prev, unit = '') {
   if (curr == null || prev == null) return ''
   const diff = (parseFloat(curr) - parseFloat(prev)).toFixed(1)
   if (diff == 0) return `<span class="delta-neu">= sem mudança</span>`
   const cls = diff < 0 ? 'delta-pos' : 'delta-neg'
   const sign = diff > 0 ? '' : ''
   return `<span class="${cls}">${sign}${diff}${unit} vs anterior</span>`
 }
 
 // ── RENDERIZAÇÃO PRINCIPAL ────────────────────────────────────────────────────
 
 function renderDash() {
  const empty = document.getElementById('dash-empty')
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
  const latestAltura = getLatestKnown(entries, 'altura')
  const lastDerived = buildDerivedMetrics(last, latestAltura)
  const prevDerived = prev ? buildDerivedMetrics(prev, latestAltura) : null
 
   document.getElementById('last-update-label').textContent =
     'Último check-in: ' +  formatDate(last.date)
 
   document.getElementById('kpi-peso').innerHTML =
     (last.peso ?? '—')  + '<span class="kpi-unit">kg</span>'
   document.getElementById('kpi-peso-delta').innerHTML =
     prev ? delta(last.peso, prev.peso, ' kg') : ''
 
   document.getElementById('kpi-gordura').innerHTML =
    (lastDerived.gorduraPct ?? '—')  + '<span class="kpi-unit">%</span>'
   document.getElementById('kpi-gordura-delta').innerHTML =
    prevDerived ? delta(lastDerived.gorduraPct, prevDerived.gorduraPct, '%') : ''
 
   document.getElementById('kpi-musculo').innerHTML =
     (last.massa_muscular ?? '—')  + '<span class="kpi-unit">kg</span>'
   document.getElementById('kpi-musculo-delta').innerHTML =
     prev ? delta(last.massa_muscular, prev.massa_muscular, ' kg') : ''
 
   document.getElementById('kpi-ffmi').innerHTML =
    (lastDerived.ffmi ?? '—')  + '<span class="kpi-unit">%</span>'
   document.getElementById('kpi-ffmi-delta').innerHTML =
    prevDerived ? delta(lastDerived.ffmi, prevDerived.ffmi, '%') : ''
 
   renderLineChart(
     'chart-peso',
     entries.map(e => formatDate(e.date)),
     entries.map(e => e.peso),
     '#b5f542'
   )
  renderDonut('chart-composicao', lastDerived.gorduraPct, last.massa_muscular, last.peso)
 

  renderMeasures(last, lastDerived, prevDerived)
  renderHistory(latestAltura)
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
       plugins: { legend: { display: false } }
     }
   })
 } 
function renderDonut(gorduraPct, massa_muscular, peso) {
   const outro = Math.max(0, peso - gorduraPct - massa_muscular)
   chartComp = new Chart(ctx, {
     type: 'doughnut',
     data: {
       labels: ['Gordura %', 'Músculo %', 'Outros'],
       datasets: [{
         data: [gorduraPct, massa_muscular, outro],
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

function renderMeasures(e, derived, prevDerived) {
   const measures = [
    { label: 'IMC', value: derived.imc, unit: '', max: 50, delta: prevDerived ? delta(derived.imc, prevDerived.imc, '') : '' },
    { label: 'FFMI', value: derived.ffmi, unit: '', max: 35, delta: prevDerived ? delta(derived.ffmi, prevDerived.ffmi, '') : '' },
    { label: 'Massa livre', value: derived.mlg, unit: 'kg', max: 120, delta: prevDerived ? delta(derived.mlg, prevDerived.mlg, ' kg') : '' },
    { label: 'Cintura', value: e.cintura, unit: 'cm', max: 120 },
    { label: 'Quadril', value: e.quadril, unit: 'cm', max: 140 },
    { label: 'Abdominal', value: e.circ_abdominal, unit: 'cm', max: 130 },
    { label: 'Tórax', value: e.circ_torax, unit: 'cm', max: 140 },
    { label: 'Braço', value: e.circ_braco, unit: 'cm', max: 60 },
    { label: 'Coxa', value: e.circ_coxa, unit: 'cm', max: 90 },
    { label: 'Panturrilha', value: e.circ_panturrilha, unit: 'cm', max: 60 },
    { label: 'VO2 máx', value: e.vo2, unit: 'mL/kg/min', max: 70 },
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
        ${m.delta ? `<div class="kpi-delta" style="margin:6px 0 0">${m.delta}</div>` : ''}
         <div class="measure-bar">
           <div class="measure-bar-fill" style="width:${Math.min(100, (m.value / m.max) * 100)}%"></div>
         </div>
       </div>
     `).join('')
 }

function renderHistory(fallbackAltura) {
  document.getElementById('history-body').innerHTML = [...entries].reverse().map(e => {
    const derived = buildDerivedMetrics(e, fallbackAltura)
    return `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.peso != null ? e.peso  + ' kg' : '—'}</td>
        <td>${derived.gorduraPct != null ? derived.gorduraPct  + '%' : '—'}</td>
        <td>${e.massa_muscular != null ? e.massa_muscular  + ' kg' : '—'}</td>
        <td>${e.cintura != null ? e.cintura  + ' cm' : '—'}</td>
        <td>${e.circ_abdominal != null ? e.circ_abdominal  + ' cm' : '—'}</td>
        <td>${e.sono != null ? e.sono  + 'h' : '—'}</td>
      </tr>
    `
  }).join('')
}