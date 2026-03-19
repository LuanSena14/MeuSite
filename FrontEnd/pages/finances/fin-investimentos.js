
//                        indicadores não-financeiros e tabela pivot de histórico


// Snapshot mais recente cuja data <= upTo
function _snapLatestUpTo(snaps, upTo) {
  return snaps.filter(s => s.data.slice(0, 7) <= upTo)
              .sort((a, b) => b.data.localeCompare(a.data))[0] || null
}

// Snapshot mais recente dentro de um mês específico
function _snapLatestInMonth(snaps, mk) {
  return snaps.filter(s => s.data.slice(0, 7) === mk)
              .sort((a, b) => b.data.localeCompare(a.data))[0] || null
}

function _fmtMonthYearShort(isoDate) {
  const ym = String(isoDate || '').slice(0, 7)
  const [y, m] = ym.split('-')
  const mm = Number(m)
  if (!y || !Number.isFinite(mm) || mm < 1 || mm > 12) return '—'
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${months[mm - 1]}/${String(y).slice(2)}`
}

function _markInvMesFilterTouched() {
  const invFilterEl = document.getElementById('fin-inv-filter-mes')
  if (invFilterEl) invFilterEl.dataset.userTouched = '1'
}


function renderInvestimentos() {
  const invFilterEl = document.getElementById('fin-inv-filter-mes')
  let mesFilter = invFilterEl?.value || ''
  const indicIds = new Set([78, ..._getDescendantIds(78)])
  const isUserTouched = invFilterEl?.dataset.userTouched === '1'

  // Enquanto o usuário não tocar no filtro, mantém no último mês com snapshot.
  const lastSnapshotDate = (window.finInvestimentos || [])
    .filter(s => !indicIds.has(s.cd_financa) && s?.data)
    .map(s => s.data)
    .sort()
    .at(-1)
  const lastSnapshotMonth = lastSnapshotDate ? lastSnapshotDate.slice(0, 7) : ''
  if (lastSnapshotMonth && (!isUserTouched || !mesFilter)) {
    mesFilter = lastSnapshotMonth
    if (invFilterEl) invFilterEl.value = mesFilter
  }

  let ano, mes
  if (mesFilter) {
    ;[ano, mes] = mesFilter.split('-').map(Number)
  } else {
    const now = new Date()
    ano = now.getFullYear(); mes = now.getMonth() + 1
  }

  const mesStr   = `${ano}-${String(mes).padStart(2, '0')}`
  const prevStr  = mes === 1 ? `${ano - 1}-12` : `${ano}-${String(mes - 1).padStart(2, '0')}`
  const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  _renderInvCards(mesStr, prevStr, mesLabel, indicIds)
  _renderIndCards(mesStr, prevStr, mesLabel, indicIds)
}

function _renderInvCards(mesStr, prevStr, mesLabel, indicIds) {
  const container = document.getElementById('fin-inv-cards')
  if (!container) return

  if (!(window._finInvSelectedIds instanceof Set)) window._finInvSelectedIds = new Set()

  const invSnaps = window.finInvestimentos.filter(s => !indicIds.has(s.cd_financa))
  const snapsPorCat = {}
  invSnaps.forEach(s => {
    if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = []
    snapsPorCat[s.cd_financa].push(s)
  })
  const cats = window.finCodigos.filter(c =>
    c.tipo === 'investimento' && !indicIds.has(c.id) && snapsPorCat[c.id]?.length > 0
  )

  if (!cats.length) {
    container.innerHTML = '<p class="inline-empty-note-center">Nenhum snapshot de investimento registrado.</p>'
    _renderChartInvestimentos({}, [])
    return
  }

  const _fmtSignedBRL = v => `${v >= 0 ? '+' : ''}${_fmtBRL(v)}`

  let totalAtual = 0
  let totalVariacaoMes = 0
  let totalAportesPeriodo = 0
  let totalResgatesPeriodo = 0
  let totalRendimentoPeriodo = 0
  let prevCount = 0
  let rendPeriodoCount = 0

  const cardsData = cats.map(cat => {
    const snaps = (snapsPorCat[cat.id] || []).slice().sort((a, b) => a.data.localeCompare(b.data))
    const curSnap = _snapLatestUpTo(snaps, mesStr)
    const prevMonthSnap = _snapLatestInMonth(snaps, prevStr)
    if (!curSnap) return null

    const prevEntrySnap = snaps.filter(s => s.data < curSnap.data).sort((a, b) => b.data.localeCompare(a.data))[0] || null
    const curMonth = curSnap.data.slice(0, 7)
    const prevEntryMonth = prevEntrySnap ? prevEntrySnap.data.slice(0, 7) : null

    const latestByMonth = {}
    snaps.forEach(s => {
      if (s.data > curSnap.data) return
      const mk = s.data.slice(0, 7)
      if (!latestByMonth[mk] || s.data > latestByMonth[mk].data) latestByMonth[mk] = s
    })

    const periodoMeses = Object.keys(latestByMonth).sort().filter(mk => {
      if (!prevEntryMonth) return mk === curMonth
      return mk > prevEntryMonth && mk <= curMonth
    })

    const aportesPeriodo = periodoMeses.reduce((acc, mk) => acc + Number(latestByMonth[mk].aportes_mes || 0), 0)
    const resgatesPeriodo = periodoMeses.reduce((acc, mk) => acc + Number(latestByMonth[mk].resgates_mes || 0), 0)

    const saldo = Number(curSnap.saldo)
    totalAtual += saldo

    const variacaoMes = prevMonthSnap ? saldo - Number(prevMonthSnap.saldo) : null
    if (variacaoMes !== null) {
      totalVariacaoMes += variacaoMes
      prevCount++
    }

    const rendimentoPeriodo = prevEntrySnap
      ? saldo - Number(prevEntrySnap.saldo) - (aportesPeriodo - resgatesPeriodo)
      : null

    totalAportesPeriodo += aportesPeriodo
    totalResgatesPeriodo += resgatesPeriodo
    if (rendimentoPeriodo !== null) {
      totalRendimentoPeriodo += rendimentoPeriodo
      rendPeriodoCount++
    }

    return {
      id: cat.id,
      nome: cat.nome,
      saldo,
      variacaoMes,
      aportesPeriodo,
      resgatesPeriodo,
      rendimentoPeriodo,
    }
  }).filter(Boolean).sort((a, b) => b.saldo - a.saldo)

  // Remove seleções de cards que não existem mais no recorte atual.
  const validIds = new Set(cardsData.map(c => c.id))
  ;[...window._finInvSelectedIds].forEach(id => {
    if (!validIds.has(id)) window._finInvSelectedIds.delete(id)
  })

  const cardHtml = ({ id, nome, saldo, variacaoMes, aportesPeriodo, resgatesPeriodo, rendimentoPeriodo }) => {
    const variacaoClass = variacaoMes > 0 ? 'pos' : variacaoMes < 0 ? 'neg' : 'neu'
    const variacaoHtml = variacaoMes !== null
      ? `<div class="fin-inv-card-rend ${variacaoClass}">${_fmtSignedBRL(variacaoMes)} Δ M/M</div>`
      : '<div class="fin-inv-card-meta">— Δ M/M</div>'

    const fluxoLiquidoPeriodo = aportesPeriodo - resgatesPeriodo
    const fluxoLiquidoHtml = `<div class="fin-inv-card-meta">Líquido: ${_fmtSignedBRL(fluxoLiquidoPeriodo)}</div>`

    const rendimentoPeriodoHtml = rendimentoPeriodo !== null
      ? `<div class="fin-inv-card-meta">Rend.: ${_fmtSignedBRL(rendimentoPeriodo)}</div>`
      : '<div class="fin-inv-card-meta">— Rend.</div>'

    const isSelected = window._finInvSelectedIds.has(id)
    return `<div class="fin-inv-card fin-clickable${isSelected ? ' fin-inv-card-selected' : ''}" data-inv-id="${id}" onclick="_toggleInvChartFilter(${id})">
      <div class="fin-inv-card-name">${nome}</div>
      <div class="fin-inv-card-saldo">${_fmtBRL(saldo)}</div>
      ${variacaoHtml}
      ${fluxoLiquidoHtml}
      ${rendimentoPeriodoHtml}
    </div>`
  }

  const totalDelta = prevCount > 0 ? totalVariacaoMes : null
  const totalDeltaClass = totalDelta > 0 ? 'pos' : totalDelta < 0 ? 'neg' : 'neu'
  const totalDeltaHtml = totalDelta !== null
    ? `<div class="fin-inv-card-rend ${totalDeltaClass}">${_fmtSignedBRL(totalDelta)} Δ M/M</div>`
    : '<div class="fin-inv-card-meta">— Δ M/M</div>'
  const totalFluxoLiquidoPeriodo = totalAportesPeriodo - totalResgatesPeriodo
  const totalFluxoLiquidoHtml = `<div class="fin-inv-card-meta">Líquido: ${_fmtSignedBRL(totalFluxoLiquidoPeriodo)}</div>`
  const totalRendimentoHtml = rendPeriodoCount > 0
    ? `<div class="fin-inv-card-meta">Rend.: ${_fmtSignedBRL(totalRendimentoPeriodo)}</div>`
    : '<div class="fin-inv-card-meta">— Rend.</div>'
  const totalSelected = window._finInvSelectedIds.size === 0
  const totalCard = `<div class="fin-inv-card fin-inv-card-total fin-clickable${totalSelected ? ' fin-inv-card-selected' : ''}" onclick="_clearInvChartFilter()">
    <div class="fin-inv-card-name">Total geral</div>
    <div class="fin-inv-card-saldo">${_fmtBRL(totalAtual)}</div>
    ${totalDeltaHtml}
    ${totalFluxoLiquidoHtml}
    ${totalRendimentoHtml}
  </div>`

  container.innerHTML = totalCard + cardsData.map(cardHtml).join('')

  window._finInvSnapsPorCat = snapsPorCat
  window._finInvCats = cats
  _renderChartInvestimentos(snapsPorCat, cats)
}

function _syncInvCardSelectionClasses() {
  const selected = window._finInvSelectedIds instanceof Set ? window._finInvSelectedIds : new Set()

  document.querySelectorAll('#fin-inv-cards [data-inv-id]').forEach(el => {
    const id = Number(el.getAttribute('data-inv-id'))
    el.classList.toggle('fin-inv-card-selected', selected.has(id))
  })

  const totalCard = document.querySelector('#fin-inv-cards .fin-inv-card-total')
  if (totalCard) totalCard.classList.toggle('fin-inv-card-selected', selected.size === 0)
}

function _toggleInvChartFilter(catId) {
  if (!(window._finInvSelectedIds instanceof Set)) window._finInvSelectedIds = new Set()

  if (window._finInvSelectedIds.has(catId)) window._finInvSelectedIds.delete(catId)
  else window._finInvSelectedIds.add(catId)

  _syncInvCardSelectionClasses()
  _renderChartInvestimentos(window._finInvSnapsPorCat || {}, window._finInvCats || [])
}

function _clearInvChartFilter() {
  window._finInvSelectedIds = new Set()
  _syncInvCardSelectionClasses()
  _renderChartInvestimentos(window._finInvSnapsPorCat || {}, window._finInvCats || [])
}

function _updateInvChartTitle(activeCats, selectedCount) {
  const titleEl = document.getElementById('fin-inv-chart-title')
  if (!titleEl) return

  const base = 'Evolução mensal consolidada (Fluxo, Investimento e Total)'
  if (!selectedCount) {
    titleEl.textContent = `${base} - Total Geral`
    return
  }

  const scope = activeCats.map(c => c.nome).join(' + ')
  titleEl.textContent = `${base} - ${scope}`
}

function _renderInvChartSummary({ variacaoTotal, liquidoTotal, rendimentoTotal } = {}) {
  const box = document.getElementById('fin-inv-chart-kpis')
  if (!box) return

  if (
    variacaoTotal === undefined ||
    liquidoTotal === undefined ||
    rendimentoTotal === undefined
  ) {
    box.innerHTML = ''
    return
  }

  const fmtSigned = v => `${v >= 0 ? '+' : ''}${_fmtBRL(v)}`
  const variacaoClass = variacaoTotal > 0 ? 'pos' : variacaoTotal < 0 ? 'neg' : 'neu'

  box.innerHTML = `
    <div class="fin-inv-kpi-item">
      <div class="fin-inv-kpi-label">Δ Total</div>
      <div class="fin-inv-card-rend ${variacaoClass}">${fmtSigned(variacaoTotal)}</div>
    </div>
    <div class="fin-inv-kpi-item">
      <div class="fin-inv-kpi-label">Líquido</div>
      <div class="fin-inv-card-meta">${fmtSigned(liquidoTotal)}</div>
    </div>
    <div class="fin-inv-kpi-item">
      <div class="fin-inv-kpi-label">Rend.</div>
      <div class="fin-inv-card-meta">${fmtSigned(rendimentoTotal)}</div>
    </div>`
}

function _renderIndCards(mesStr, prevStr, mesLabel, indicIds) {
  const container = document.getElementById('fin-ind-content')
  if (!container) return

  const indicIdsList = [78, ..._getDescendantIds(78)]
  const indSnaps     = window.finInvestimentos.filter(s => indicIdsList.includes(s.cd_financa))
  const snapsPorCat  = {}
  indSnaps.forEach(s => {
    if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = []
    snapsPorCat[s.cd_financa].push(s)
  })

  const indCats = [...new Map(indSnaps.map(s => [s.cd_financa, s.nome])).entries()]
    .map(([id, nome]) => ({ id, nome }))
    .filter(c => (snapsPorCat[c.id] || []).some(s => s.data.slice(0, 7) <= mesStr))
    .sort((a, b) => {
      const va = _snapLatestUpTo(snapsPorCat[a.id] || [], mesStr)
      const vb = _snapLatestUpTo(snapsPorCat[b.id] || [], mesStr)
      return (vb ? Number(vb.saldo) : 0) - (va ? Number(va.saldo) : 0)
    })

  if (!indCats.length) { container.innerHTML = ''; return }

  const cardsHtml = indCats.map(cat => {
    const curSnap  = _snapLatestUpTo(snapsPorCat[cat.id] || [], mesStr)
    const prevSnap = _snapLatestInMonth(snapsPorCat[cat.id] || [], prevStr)
    if (!curSnap) return ''
    const val = Number(curSnap.saldo)
    const deltaHtml = prevSnap
      ? (() => {
          const d = val - Number(prevSnap.saldo)
          return `<div class="fin-inv-card-rend ${d >= 0 ? 'pos' : 'neg'}">${d >= 0 ? '+' : ''}${Number(d).toLocaleString('pt-BR')} no mês</div>`
        })()
      : ''
    const isSelected = window._finIndSelected === cat.id
    return `<div class="fin-inv-card fin-clickable${isSelected ? ' fin-inv-card-selected' : ''}" onclick="_filterIndChart(${cat.id})">
      <div class="fin-inv-card-name">${cat.nome}</div>
      <div class="fin-inv-card-saldo">${Number(val).toLocaleString('pt-BR')}</div>
      ${deltaHtml}
    </div>`
  }).filter(Boolean).join('')

  container.innerHTML = `
    <div class="fin-ind-section">
      <div class="fin-inv-section-label">Indicadores — ${mesLabel}</div>
      <div class="fin-ind-grid">
        <div class="dash-card fin-card-min0 fin-ind-cards-card">
          <div class="fin-ind-cards-grid">${cardsHtml}</div>
        </div>
        <div class="dash-card fin-card-min0 fin-ind-chart-card" id="fin-ind-chart-card">
          <div class="dash-card-title">Evolução dos indicadores</div>
          <div class="fin-chart-wrap fin-ind-chart-wrap"><canvas id="fin-chart-ind"></canvas></div>
        </div>
      </div>
    </div>`

  window._finIndSnapsPorCat = snapsPorCat
  window._finIndCats        = indCats
  _renderChartIndicadores(snapsPorCat, indCats)
}


// Clique em card de indicador: filtra o gráfico para mostrar só aquele indicador
function _filterIndChart(catId) {
  window._finIndSelected = window._finIndSelected === catId ? null : catId

  document.querySelectorAll('#fin-ind-content .fin-inv-card').forEach((el, i) => {
    el.classList.toggle('fin-inv-card-selected', window._finIndSelected === (window._finIndCats || [])[i]?.id)
  })

  const cats = window._finIndSelected !== null
    ? (window._finIndCats || []).filter(c => c.id === window._finIndSelected)
    : (window._finIndCats || [])
  _renderChartIndicadores(window._finIndSnapsPorCat || {}, cats)
}


// Constrói um gráfico de linha temporal com múltiplas séries (investimentos ou indicadores)
function _buildTimelineChart(canvasId, chartKey, snapsPorCat, cats, colors, fmtValue) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  _destroyChart(chartKey)

  const allSnaps = Object.values(snapsPorCat).flat()
  const allDates = [...new Set(allSnaps.map(s => s.data))].sort()
  if (!allDates.length) return

  const datasets = cats.filter(c => snapsPorCat[c.id]?.length > 0).map((cat, i) => {
    const snaps = snapsPorCat[cat.id] || []
    return {
      label: cat.nome,
      data: allDates.map(d => {
        const s = snaps.filter(x => x.data <= d).sort((a, b) => b.data.localeCompare(a.data))[0]
        return s ? Number(s.saldo) : null
      }),
      borderColor:     colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '20',
      fill: false, tension: 0.3, spanGaps: true,
    }
  })

  _finChartsInstances[chartKey] = new Chart(canvas, {
    type: 'line',
    plugins: _finDL,
    data: { labels: allDates.map(d => _fmtMonthYearShort(d)), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { display: false }, grid: { display: false, drawBorder: false } },
      },
      plugins: {
        legend:     { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: {
          display: true,
          align: 'top',
          anchor: 'end',
          offset: 4,
          color: ctx => ctx.dataset.borderColor,
          font: { size: 9, family: 'DM Mono', weight: '600' },
          formatter: v => (v === null || v === undefined ? null : Number(v).toLocaleString('pt-BR')),
          clamp: true,
        },
        tooltip:    { callbacks: { label: ctx => ' ' + fmtValue(ctx.raw) } },
      },
    },
  })
}

function _renderChartInvestimentos(snapsPorCat, cats) {
  _destroyChart('inv')
  _destroyChart('inv-total')
  _destroyChart('inv-bars')

  const canvasTotal = document.getElementById('fin-chart-inv-total')
  const canvasBars  = document.getElementById('fin-chart-inv-bars')
  const wrap        = document.querySelector('.fin-inv-scroll-wrap')
  if (!canvasTotal || !canvasBars || !wrap) return
  const stack = wrap.querySelector('.fin-inv-chart-stack')

  const selected = window._finInvSelectedIds instanceof Set ? window._finInvSelectedIds : new Set()
  const activeCats = selected.size
    ? cats.filter(c => selected.has(c.id))
    : cats

  _updateInvChartTitle(activeCats, selected.size)

  const activeSnapsPorCat = {}
  activeCats.forEach(c => { activeSnapsPorCat[c.id] = snapsPorCat[c.id] || [] })

  const mesesSet = new Set(Object.values(activeSnapsPorCat).flat().map(s => s.data.slice(0, 7)))
  const meses = [...mesesSet].sort()
  if (!meses.length) {
    _renderInvChartSummary()
    return
  }

  // Agrega por mês: total geral consolidado + componentes do balanço mensal.
  const aportesMes = Array(meses.length).fill(0)
  const resgatesMes = Array(meses.length).fill(0)
  const rendimentosMes = Array(meses.length).fill(0)
  const saldoTotal = Array(meses.length).fill(0)

  activeCats.forEach(cat => {
    const snaps = (activeSnapsPorCat[cat.id] || []).slice().sort((a, b) => a.data.localeCompare(b.data))
    if (!snaps.length) return

    const latestByMonth = {}
    snaps.forEach(s => {
      const mk = s.data.slice(0, 7)
      if (!latestByMonth[mk] || s.data > latestByMonth[mk].data) latestByMonth[mk] = s
    })

    let runningSaldo = null
    meses.forEach((mk, idx) => {
      const mSnap = latestByMonth[mk]
      if (mSnap) {
        runningSaldo = Number(mSnap.saldo)
        aportesMes[idx] += Number(mSnap.aportes_mes || 0)
        resgatesMes[idx] += Number(mSnap.resgates_mes || 0)
        rendimentosMes[idx] += Number(mSnap.rendimento_calculado || 0)
      }
      if (runningSaldo !== null) saldoTotal[idx] += runningSaldo
    })
  })

  const fluxoMes = meses.map((_, idx) => aportesMes[idx] - resgatesMes[idx])
  const balancoMes = meses.map((_, idx) => aportesMes[idx] - resgatesMes[idx] + rendimentosMes[idx])

  const variacaoTotal = saldoTotal.length >= 2 ? saldoTotal[saldoTotal.length - 1] - saldoTotal[0] : 0
  const liquidoTotal = fluxoMes.reduce((acc, v) => acc + v, 0)
  const rendimentoTotal = rendimentosMes.reduce((acc, v) => acc + v, 0)
  _renderInvChartSummary({ variacaoTotal, liquidoTotal, rendimentoTotal })

  // Reduz impacto de meses fora da curva para evitar excesso de espaço em branco.
  const rawBarVals = [...fluxoMes, ...rendimentosMes].filter(v => Number.isFinite(v) && v !== 0)
  const percentile = (arr, p) => {
    if (!arr.length) return 0
    const sorted = arr.slice().sort((a, b) => a - b)
    const idx = (sorted.length - 1) * p
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    if (lo === hi) return sorted[lo]
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
  }

  const absP75 = percentile(rawBarVals.map(v => Math.abs(v)), 0.75)
  const maxAbs = rawBarVals.length ? Math.max(...rawBarVals.map(v => Math.abs(v))) : 0
  const clampAbs = Math.max(1200, rawBarVals.length >= 8 ? absP75 * 1.6 : maxAbs * 1.05)

  const hasPos = rawBarVals.some(v => v > 0)
  const hasNeg = rawBarVals.some(v => v < 0)
  const y1Min = hasNeg ? -clampAbs : 0
  const y1Max = hasPos ? clampAbs : 1200

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
  const fluxoMesPlot = fluxoMes.map(v => clamp(v, y1Min, y1Max))
  const rendimentosMesPlot = rendimentosMes.map(v => clamp(v, y1Min, y1Max))

  const labels = meses.map(mk => {
    const [y, m] = mk.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  })

  const BAR_W = 88
  const minW = Math.max(wrap.clientWidth || 900, 900)
  const totalW = Math.max(meses.length * BAR_W, minW)

  const TOP_H = 150
  const BOTTOM_H = 230
  ;[canvasTotal, canvasBars].forEach(c => {
    c.style.width = totalW + 'px'
    c.width = totalW
  })
  if (stack) {
    stack.style.width = totalW + 'px'
    stack.style.setProperty('--fin-inv-step', `${BAR_W}px`)
    stack.style.setProperty('--fin-inv-offset', '0px')
  }
  canvasTotal.style.height = TOP_H + 'px'
  canvasTotal.height = TOP_H
  canvasBars.style.height = BOTTOM_H + 'px'
  canvasBars.height = BOTTOM_H

  // Escala da linha (só total geral): sem mistura com barras.
  const saldoVals = saldoTotal.filter(v => Number.isFinite(v))
  const saldoMin = saldoVals.length ? Math.min(...saldoVals) : 0
  const saldoMax = saldoVals.length ? Math.max(...saldoVals) : 0
  const saldoRange = Math.max(1, saldoMax - saldoMin)
  const yLineMin = saldoMin - saldoRange * 0.2
  const yLineMax = saldoMax + saldoRange * 0.35

  _finChartsInstances['inv-total'] = new Chart(canvasTotal, {
    type: 'line',
    plugins: _finDL,
    data: {
      labels,
      datasets: [
        {
          label: 'Total geral',
          data: saldoTotal,
          borderColor: '#f5d742',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.25,
          datalabels: {
            align: 'top',
            offset: 10,
            color: '#f5d742',
            font: { size: 9, family: 'DM Mono', weight: '700' },
            backgroundColor: 'rgba(16,20,18,0.75)',
            borderRadius: 3,
            padding: { top: 2, bottom: 2, left: 4, right: 4 },
            clamp: true,
            formatter: v => Number(v) !== 0 ? _fmtShort(v) : null,
          },
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 16, right: 8, left: 8, bottom: 0 } },
      scales: {
        x: {
          offset: true,
          bounds: 'ticks',
          ticks: { display: false },
          grid: { display: false },
        },
        y: {
          min: yLineMin,
          max: yLineMax,
          ticks: { display: false },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: {},
        tooltip: {
          callbacks: {
            label: ctx => {
              const i = ctx.dataIndex
              return ` Total geral: ${_fmtBRL(saldoTotal[i])} | Balanço do mês: ${_fmtBRL(balancoMes[i])} (A: ${_fmtBRL(aportesMes[i])} R: ${_fmtBRL(-resgatesMes[i])} I: ${_fmtBRL(rendimentosMes[i])})`
            },
          },
        },
      },
    },
  })

  _finChartsInstances['inv-bars'] = new Chart(canvasBars, {
    type: 'bar',
    plugins: _finDL,
    data: {
      labels,
      datasets: [
        {
          label: 'Fluxo (Aportes - Resgates)',
          data: fluxoMesPlot,
          backgroundColor: fluxoMes.map(v => v >= 0 ? 'rgba(78,204,163,0.55)' : 'rgba(224,92,92,0.55)'),
          borderRadius: 3,
          barThickness: 24,
          maxBarThickness: 28,
          categoryPercentage: 0.55,
          barPercentage: 0.9,
          yAxisID: 'y1',
          order: 2,
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: ctx => fluxoMes[ctx.dataIndex] >= 0 ? 'rgba(78,204,163,0.95)' : 'rgba(224,92,92,0.95)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: (_v, ctx) => {
              const realV = fluxoMes[ctx.dataIndex]
              return Number(realV) !== 0 ? _fmtShort(realV) : null
            },
          },
        },
        {
          label: 'Investimento (Rendimento)',
          data: rendimentosMesPlot,
          backgroundColor: rendimentosMes.map(v => v >= 0 ? 'rgba(124,158,255,0.55)' : 'rgba(255,159,71,0.55)'),
          borderRadius: 3,
          barThickness: 24,
          maxBarThickness: 28,
          categoryPercentage: 0.55,
          barPercentage: 0.9,
          yAxisID: 'y1',
          order: 2,
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: ctx => rendimentosMes[ctx.dataIndex] >= 0 ? 'rgba(124,158,255,0.95)' : 'rgba(255,159,71,0.95)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: (_v, ctx) => {
              const realV = rendimentosMes[ctx.dataIndex]
              return Number(realV) !== 0 ? _fmtShort(realV) : null
            },
          },
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 2, right: 8, left: 8, bottom: 0 } },
      scales: {
        x: {
          offset: true,
          bounds: 'ticks',
          ticks: { color: '#a0a8a4', font: { size: 11 } },
          grid: { display: false },
        },
        y1: {
          position: 'right',
          min: y1Min,
          max: y1Max,
          ticks: { display: false },
          grid: { drawOnChartArea: false },
        },
      },
      plugins: {
        legend:     { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: {},
        tooltip: {
          callbacks: {
            label: ctx => {
              const i = ctx.dataIndex
              if (ctx.datasetIndex === 0) {
                return ` Fluxo: ${_fmtBRL(fluxoMes[i])} (A ${_fmtBRL(aportesMes[i])} | R ${_fmtBRL(resgatesMes[i])})`
              }
              if (ctx.datasetIndex === 1) {
                return ` Investimento: ${_fmtBRL(rendimentosMes[i])}`
              }
              return ` Total geral: ${_fmtBRL(saldoTotal[i])}`
            },
          },
        },
      },
    },
  })

  // Mantém foco nos meses mais recentes e evita gráfico "amontoado".
  setTimeout(() => {
    wrap.scrollLeft = wrap.scrollWidth
  }, 60)
}

function _renderChartIndicadores(snapsPorCat, cats) {
  const card   = document.getElementById('fin-ind-chart-card')
  const canvas = document.getElementById('fin-chart-ind')
  if (!canvas) return

  if (!cats?.length) {
    if (card) card.style.display = 'none'
    _destroyChart('ind')
    return
  }
  if (card) card.style.display = ''

  const colors = ['#7c9eff','#4ecca3','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c']
  _buildTimelineChart('fin-chart-ind', 'ind', snapsPorCat, cats, colors, v => Number(v).toLocaleString('pt-BR'))
}

async function deleteInvestimentoFin(id) {
  await deleteInvestimento(id)
  window.finInvestimentos = window.finInvestimentos.filter(s => s.id !== id)
  renderInvestimentos()
  _showFinToast('Registro removido')
}


// Mostra os últimos 18 meses com colunas Valor | Δ | Δ% por indicador
function renderIndicadores() {
  const mesFilter = document.getElementById('fin-ind-filter-mes')?.value || ''
  const indicIds  = [78, ..._getDescendantIds(78)]
  let snaps = window.finInvestimentos.filter(s => indicIds.includes(s.cd_financa))
  if (mesFilter) snaps = snaps.filter(s => s.data.startsWith(mesFilter))

  const container = document.getElementById('fin-ind-content')
  if (!container) return

  if (!snaps.length) {
    container.innerHTML = '<p class="inline-empty-note-center">Nenhum indicador registrado' + (mesFilter ? ' para o período.' : '.') + '</p>'
    return
  }

  const allMes  = [...new Set(snaps.map(s => s.data.slice(0,7)))].sort().reverse().slice(0, 18)
  const allCats = [...new Map(snaps.map(s => [s.cd_financa, s.nome])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id, nome]) => ({ id, nome }))

  // Pivot: {mes: {cd_financa: snapshot}}; guarda o snapshot mais recente por mês
  const lookup = {}
  snaps.forEach(s => {
    const mk = s.data.slice(0, 7)
    if (!lookup[mk]) lookup[mk] = {}
    if (!lookup[mk][s.cd_financa] || s.data > lookup[mk][s.cd_financa].data)
      lookup[mk][s.cd_financa] = s
  })

  const header = '<tr><th>Mês</th>' +
    allCats.flatMap(c => [
      `<th>${c.nome}</th>`,
      '<th class="fin-ind-delta-h">Δ</th>',
      '<th class="fin-ind-delta-h">Δ%</th>',
    ]).join('') + '</tr>'

  const rows = allMes.map((mk, idx) => {
    const prevMk = allMes[idx + 1] || null
    const [y, m] = mk.split('-')
    const label  = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const cells  = allCats.flatMap(c => {
      const cur      = lookup[mk]?.[c.id]
      const prev     = prevMk ? lookup[prevMk]?.[c.id] : null
      const curVal   = cur  ? Number(cur.saldo)  : null
      const prevVal  = prev ? Number(prev.saldo) : null
      const valCell  = `<td>${curVal !== null ? Number(curVal).toLocaleString('pt-BR') : '—'}</td>`
      if (curVal === null || prevVal === null) return [valCell, '<td></td>', '<td></td>']
      const d   = curVal - prevVal
      const pct = prevVal > 0 ? (d / prevVal * 100).toFixed(1) : null
      const cls = d >= 0 ? 'fin-under' : 'fin-over'
      return [
        valCell,
        `<td class="${cls}">${d >= 0 ? '+' : ''}${Number(d).toLocaleString('pt-BR')}</td>`,
        `<td class="${cls}">${pct !== null ? (d >= 0 ? '+' : '') + pct + '%' : '—'}</td>`,
      ]
    })
    return `<tr><td>${label}</td>${cells.join('')}</tr>`
  }).join('')

  container.innerHTML = `<div class="fin-table-wrap">
    <table class="fin-table fin-ind-table">
      <thead>${header}</thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}
