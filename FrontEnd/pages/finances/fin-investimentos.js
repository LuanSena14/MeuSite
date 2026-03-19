
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


function renderInvestimentos() {
  const mesFilter = document.getElementById('fin-inv-filter-mes')?.value || ''
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

  const indicIds = new Set([78, ..._getDescendantIds(78)])

  _renderInvCards(mesStr, prevStr, mesLabel, indicIds)
  _renderIndCards(mesStr, prevStr, mesLabel, indicIds)
}

function _renderInvCards(mesStr, prevStr, mesLabel, indicIds) {
  const container = document.getElementById('fin-inv-cards')
  if (!container) return

  const invSnaps    = window.finInvestimentos.filter(s => !indicIds.has(s.cd_financa))
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

  let totalAtual = 0, totalAnterior = 0, totalRendimento = 0, prevCount = 0
  const cardsData = cats.map(cat => {
    const snaps    = snapsPorCat[cat.id] || []
    const curSnap  = _snapLatestUpTo(snaps, mesStr)
    const prevSnap = _snapLatestInMonth(snaps, prevStr)
    if (!curSnap) return null
    const saldo = Number(curSnap.saldo)
    totalAtual += saldo
    
    // Usa rendimento_calculado se disponível, senão fallback para diferença simples
    let rendimento = null
    if (curSnap.rendimento_calculado !== null && curSnap.rendimento_calculado !== undefined) {
      rendimento = Number(curSnap.rendimento_calculado)
    } else if (prevSnap) {
      rendimento = saldo - Number(prevSnap.saldo)
    }
    
    if (prevSnap) { 
      totalAnterior += Number(prevSnap.saldo)
      prevCount++
      if (rendimento !== null) totalRendimento += rendimento
    }
    
    return { 
      id: cat.id, 
      nome: cat.nome, 
      saldo, 
      prevSaldo: prevSnap ? Number(prevSnap.saldo) : null,
      rendimento: rendimento,
      aportes: curSnap.aportes_mes !== undefined ? Number(curSnap.aportes_mes) : null,
      resgates: curSnap.resgates_mes !== undefined ? Number(curSnap.resgates_mes) : null,
    }
  }).filter(Boolean).sort((a, b) => b.saldo - a.saldo)

  const cardHtml = ({ id, nome, saldo, rendimento, aportes, resgates }) => {
    let deltaHtml = ''
    if (rendimento !== null) {
      deltaHtml = `<div class="fin-inv-card-rend ${rendimento >= 0 ? 'pos' : 'neg'}">${rendimento >= 0 ? '+' : ''}${_fmtBRL(rendimento)} rendimento</div>`
    }
    
    let detalhesHtml = ''
    if (aportes !== null || resgates !== null) {
      const aportes_fmt = _fmtBRL(aportes || 0)
      const resgates_fmt = _fmtBRL(resgates || 0)
      detalhesHtml = `<div class="fin-inv-card-details" style="font-size:0.85em;color:var(--text-muted);margin-top:4px;">⬆ ${aportes_fmt} | ⬇ ${resgates_fmt}</div>`
    }
    
    const isSelected = window._finInvSelected === id
    return `<div class="fin-inv-card fin-clickable${isSelected ? ' fin-inv-card-selected' : ''}" onclick="_filterInvChart(${id})">
      <div class="fin-inv-card-name">${nome}</div>
      <div class="fin-inv-card-saldo">${_fmtBRL(saldo)}</div>
      ${deltaHtml}
      ${detalhesHtml}
    </div>`
  }

  const totalDelta     = prevCount > 0 ? totalAtual - totalAnterior : null
  // Usa totalRendimento se disponível, senão fallback para totalDelta
  const totalRend      = prevCount > 0 ? totalRendimento : null
  const totalDeltaHtml = totalRend !== null
    ? `<div class="fin-inv-card-rend ${totalRend >= 0 ? 'pos' : 'neg'}">${totalRend >= 0 ? '+' : ''}${_fmtBRL(totalRend)} rendimento</div>`
    : (totalDelta !== null ? `<div class="fin-inv-card-rend ${totalDelta >= 0 ? 'pos' : 'neg'}">${totalDelta >= 0 ? '+' : ''}${_fmtBRL(totalDelta)} no mês</div>` : '')
  const totalCard = `<div class="fin-inv-card fin-inv-card-total">
    <div class="fin-inv-card-name">Total geral</div>
    <div class="fin-inv-card-saldo">${_fmtBRL(totalAtual)}</div>
    ${totalDeltaHtml}
  </div>`

  container.innerHTML = totalCard + cardsData.map(cardHtml).join('')

  window._finInvSnapsPorCat = snapsPorCat
  window._finInvCats        = cats
  _renderChartInvestimentos(snapsPorCat, cats)
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
    <div class="fin-inv-section-label">Indicadores — ${mesLabel}</div>
    <div class="fin-inv-cards">${cardsHtml}</div>`

  window._finIndSnapsPorCat = snapsPorCat
  window._finIndCats        = indCats
  _renderChartIndicadores(snapsPorCat, indCats)
}


// Clique em card de investimento: drill-down (saldo + aportes + rendimento) ou visão geral
function _filterInvChart(catId) {
  window._finInvSelected = window._finInvSelected === catId ? null : catId

  document.querySelectorAll('#fin-inv-cards .fin-inv-card:not(.fin-inv-card-total)').forEach((el, i) => {
    el.classList.toggle('fin-inv-card-selected', window._finInvSelected === (window._finInvCats || [])[i]?.id)
  })

  if (window._finInvSelected !== null) {
    _renderChartInvestimentoDetalhe(window._finInvSelected, window._finInvSnapsPorCat || {})
  } else {
    _renderChartInvestimentos(window._finInvSnapsPorCat || {}, window._finInvCats || [])
  }
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
    data: { labels: allDates.map(d => _fmtDate(d)), datasets },
    options: {
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => fmtValue(v) }, grid: { color: '#2a2f2c' } },
      },
      plugins: {
        legend:     { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: { display: false },
        tooltip:    { callbacks: { label: ctx => ' ' + fmtValue(ctx.raw) } },
      },
    },
  })
}

function _renderChartInvestimentos(snapsPorCat, cats) {
  const colors = ['#4ecca3','#7c9eff','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c']
  _buildTimelineChart('fin-chart-inv', 'inv', snapsPorCat, cats, colors, v => _fmtBRL(v))
}

// Drill-down: gráfico misto com linha de saldo + barras de aportes e rendimento
function _renderChartInvestimentoDetalhe(catId, snapsPorCat) {
  const snaps = (snapsPorCat[catId] || []).slice().sort((a, b) => a.data.localeCompare(b.data))
  if (!snaps.length) return

  // Um ponto por mês (snapshot mais recente do mês)
  const byMonth = {}
  snaps.forEach(s => {
    const mk = s.data.slice(0, 7)
    if (!byMonth[mk] || s.data > byMonth[mk].data) byMonth[mk] = s
  })
  const months = Object.keys(byMonth).sort()
  const labels = months.map(mk => {
    const [y, m] = mk.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  })

  const saldos      = months.map(mk => Number(byMonth[mk].saldo))
  const aportes     = months.map(mk => byMonth[mk].aportes_mes      != null ? Number(byMonth[mk].aportes_mes)           : 0)
  const rendimentos = months.map(mk => byMonth[mk].rendimento_calculado != null ? Number(byMonth[mk].rendimento_calculado) : null)

  _destroyChart('inv')
  const canvas = document.getElementById('fin-chart-inv')
  if (!canvas) return

  _finChartsInstances['inv'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Saldo',
          data: saldos,
          borderColor: '#4ecca3',
          backgroundColor: '#4ecca320',
          fill: false,
          tension: 0.3,
          yAxisID: 'y',
          order: 0,
        },
        {
          type: 'bar',
          label: 'Aportes',
          data: aportes,
          backgroundColor: '#7c9eff55',
          borderColor: '#7c9eff',
          borderWidth: 1,
          yAxisID: 'y1',
          order: 1,
        },
        {
          type: 'bar',
          label: 'Rendimento',
          data: rendimentos,
          backgroundColor: rendimentos.map(v => v != null && v >= 0 ? '#4ecca355' : '#e05c5c55'),
          borderColor:     rendimentos.map(v => v != null && v >= 0 ? '#4ecca3'   : '#e05c5c'),
          borderWidth: 1,
          yAxisID: 'y1',
          order: 2,
        },
      ],
    },
    options: {
      scales: {
        x:  { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y:  {
          position: 'left',
          ticks: { color: '#4ecca3', font: { size: 11 }, callback: v => _fmtBRL(v) },
          grid:  { color: '#2a2f2c' },
        },
        y1: {
          position: 'right',
          ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => _fmtBRL(v) },
          grid:  { drawOnChartArea: false },
        },
      },
      plugins: {
        legend:     { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: { display: false },
        tooltip:    { callbacks: { label: ctx => ' ' + _fmtBRL(ctx.raw) } },
      },
    },
  })
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
