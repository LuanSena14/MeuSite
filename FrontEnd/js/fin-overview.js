// ─────────────────────────────────────────────────────────────────────────────
// fin-overview.js — Aba Overview: KPIs, gráficos de evolução/despesas,
//                   validador orçado×realizado e painel de crédito resumido
// ─────────────────────────────────────────────────────────────────────────────

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

function renderFinOverview() {
  let ano, mes
  if (_finEvoSelectedMonth) {
    ano = _finEvoSelectedMonth.ano
    mes = _finEvoSelectedMonth.mes
  } else {
    const now = new Date()
    ano = now.getFullYear()
    mes = now.getMonth() + 1
  }

  _updateOverviewFilterBars(ano, mes)

  const mesKey  = `${ano}-${String(mes).padStart(2, '0')}`
  const lancMes = window.finLancamentos.filter(l => l.data.startsWith(mesKey))

  let receitas = 0, despesas = 0
  const despGrupos = {}   // grupoNome → { total, lancs[] }
  lancMes.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (!cod) return
    if (cod.tipo === 'receita') {
      receitas += Number(l.valor)
    } else if (cod.tipo === 'despesa') {
      despesas += Number(l.valor)
      const grupo = _finGrupo(l.cd_financa)
      if (!despGrupos[grupo]) despGrupos[grupo] = { total: 0, lancs: [] }
      despGrupos[grupo].total += Number(l.valor)
      despGrupos[grupo].lancs.push(l)
    }
  })

  // Total no cartão de crédito no mês
  const totalCredito = lancMes
    .filter(l => l.forma_pagamento === 'credito')
    .reduce((s, l) => s + Number(l.valor), 0)

  // Saldo total de investimentos (último snapshot por categoria, excluindo indicadores)
  const indicIds = new Set([78, ..._getDescendantIds(78)])
  const invPorCod = {}
  window.finInvestimentos
    .filter(s => !indicIds.has(s.cd_financa))
    .forEach(s => {
      if (!invPorCod[s.cd_financa] || s.data > invPorCod[s.cd_financa].data)
        invPorCod[s.cd_financa] = s
    })
  const totalInv = Object.values(invPorCod).reduce((s, snap) => s + Number(snap.saldo), 0)

  // Saldo acumulado no ano (YTD)
  let recYTD = 0, despYTD = 0
  window.finLancamentos.forEach(l => {
    if (!l.data.startsWith(String(ano))) return
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita') recYTD  += Number(l.valor)
    if (cod?.tipo === 'despesa') despYTD += Number(l.valor)
  })
  const saldoAno = recYTD - despYTD

  _updateKPIs(receitas, despesas, totalInv, totalCredito, saldoAno)
  _renderChartDespesas(despGrupos)
  _renderChartEvolucao()
  _renderDespDrill(despGrupos)
  _renderValidador(ano, mes)

  const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  _renderCreditoPanel(ano, mes, mesLabel)
}

function _updateOverviewFilterBars(ano, mes) {
  const filterBar = document.getElementById('fin-overview-month-bar')
  const filterLbl = document.getElementById('fin-overview-month-label')
  if (filterBar) {
    if (_finEvoSelectedMonth) {
      const name = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      filterBar.style.display = 'flex'
      if (filterLbl) filterLbl.textContent = name
    } else {
      filterBar.style.display = 'none'
    }
  }

  const catBar = document.getElementById('fin-cat-filter-bar')
  const catLbl = document.getElementById('fin-cat-filter-label')
  if (catBar) {
    catBar.style.display = _finDespCatSelected ? 'flex' : 'none'
    if (catLbl && _finDespCatSelected) catLbl.textContent = _finDespCatSelected.nome
  }
}

function _updateKPIs(receitas, despesas, totalInv, totalCredito, saldoAno) {
  const saldo = receitas - despesas
  const saldoEl = document.getElementById('fin-kpi-saldo')
  if (saldoEl) {
    saldoEl.textContent = _fmtBRL(saldo)
    saldoEl.style.color = saldo >= 0 ? 'var(--accent)' : 'var(--danger)'
  }
  const invEl = document.getElementById('fin-kpi-investido')
  if (invEl) invEl.textContent = _fmtBRL(totalInv)

  const credEl = document.getElementById('fin-kpi-credito')
  if (credEl) credEl.textContent = _fmtBRL(totalCredito)

  const saldoAnoEl = document.getElementById('fin-kpi-saldo-ano')
  if (saldoAnoEl) {
    saldoAnoEl.textContent = _fmtBRL(saldoAno)
    saldoAnoEl.style.color = saldoAno >= 0 ? 'var(--accent)' : 'var(--danger)'
  }
}

// ── FILTROS: MESE E CATEGORIA ─────────────────────────────────────────────────

function _selectEvolucaoMonth(ano, mes) {
  _finEvoSelectedMonth = { ano, mes }
  renderFinOverview()
}

function _clearEvoFilter() {
  _finEvoSelectedMonth = null
  renderFinOverview()
}

function _selectDespCat(nome) {
  _finDespCatSelected = { nome }
  renderFinOverview()
}

function _clearDespCatFilter() {
  _finDespCatSelected = null
  renderFinOverview()
}

// ── GRÁFICO: DONUT DE DESPESAS POR GRUPO ──────────────────────────────────────

function _renderChartDespesas(despGrupos) {
  const canvas = document.getElementById('fin-chart-despesas')
  if (!canvas) return
  _destroyChart('despesas')

  const labels = Object.keys(despGrupos)
  const data   = labels.map(k => despGrupos[k].total)
  if (!labels.length) return

  const selNome  = _finDespCatSelected?.nome
  const bgColors = labels.map((lbl, i) => {
    const hex = CHART_COLORS[i % CHART_COLORS.length]
    if (!selNome || lbl === selNome) return hex
    // esmaece os demais quando um grupo está selecionado
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return `rgba(${r},${g},${b},0.2)`
  })

  _finChartsInstances['despesas'] = new Chart(canvas, {
    type: 'doughnut',
    plugins: _finDL,
    data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0 }] },
    options: {
      cutout: '65%',
      onClick: (e, elements) => {
        if (!elements.length) { _clearDespCatFilter(); return }
        const nome = labels[elements[0].index]
        if (_finDespCatSelected?.nome === nome) _clearDespCatFilter()
        else _selectDespCat(nome)
      },
      plugins: {
        legend: { position: 'right', labels: { color: '#a0a8a4', boxWidth: 12, padding: 12, font: { size: 11 } } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: '600', family: 'DM Mono' },
          formatter: (v, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
            const pct   = total > 0 ? (v / total * 100) : 0
            return pct >= 4 ? pct.toFixed(0) + '%' : null
          },
        },
      },
    },
  })
}

// ── GRÁFICO: EVOLUÇÃO MENSAL (BARRAS + LINHA) ─────────────────────────────────

function _renderChartEvolucao() {
  const canvas = document.getElementById('fin-chart-evolucao')
  if (!canvas) return
  _destroyChart('evolucao')

  const nowKey = new Date().toISOString().slice(0, 7)
  const mesSet = new Set()
  window.finLancamentos.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if ((cod?.tipo === 'receita' || cod?.tipo === 'despesa') && l.data.slice(0, 7) <= nowKey)
      mesSet.add(l.data.slice(0, 7))
  })
  if (!mesSet.size) return

  const meses = [...mesSet].sort().map(mk => {
    const [y, m] = mk.split('-')
    return {
      ano: Number(y), mes: Number(m), key: mk,
      label: new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    }
  })

  const receitas = meses.map(m =>
    window.finLancamentos
      .filter(l => window.finCodigos.find(c => c.id === l.cd_financa)?.tipo === 'receita' && l.data.startsWith(m.key))
      .reduce((s, l) => s + Number(l.valor), 0)
  )
  const despesas = meses.map(m =>
    window.finLancamentos
      .filter(l => {
        const cod = window.finCodigos.find(c => c.id === l.cd_financa)
        if (!cod || cod.tipo !== 'despesa' || !l.data.startsWith(m.key)) return false
        if (_finDespCatSelected) return _finGrupo(l.cd_financa) === _finDespCatSelected.nome
        return true
      })
      .reduce((s, l) => s + Number(l.valor), 0)
  )
  const nets  = meses.map((_, i) => receitas[i] - despesas[i])
  const selKey = _finEvoSelectedMonth
    ? `${_finEvoSelectedMonth.ano}-${String(_finEvoSelectedMonth.mes).padStart(2, '0')}`
    : null

  const recBg  = meses.map(m => selKey ? (m.key === selKey ? 'rgba(78,204,163,0.9)' : 'rgba(78,204,163,0.12)') : 'rgba(78,204,163,0.55)')
  const despBg = meses.map(m => selKey ? (m.key === selKey ? 'rgba(224,92,92,0.9)'  : 'rgba(224,92,92,0.12)')  : 'rgba(224,92,92,0.55)')
  const netPt  = nets.map(n => n >= 0 ? '#4ecca3' : '#e05c5c')

  const BAR_W  = 90
  const totalW = Math.max(meses.length * BAR_W, 600)
  canvas.style.width  = totalW + 'px'
  canvas.style.height = '300px'
  canvas.width  = totalW
  canvas.height = 300

  _finChartsInstances['evolucao'] = new Chart(canvas, {
    type: 'bar',
    plugins: _finDL,
    data: {
      labels: meses.map(m => m.label),
      datasets: [
        {
          label: 'Receitas', data: receitas, backgroundColor: recBg, borderRadius: 3, order: 2,
          datalabels: {
            anchor: 'end', align: 'top',
            color: 'rgba(78,204,163,0.9)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: v => v > 0 ? _fmtShort(v) : null,
          },
        },
        {
          label: 'Despesas', data: despesas, backgroundColor: despBg, borderRadius: 3, order: 2,
          datalabels: {
            anchor: 'end', align: 'top',
            color: 'rgba(224,92,92,0.9)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: v => v > 0 ? _fmtShort(v) : null,
          },
        },
        {
          label: 'Net (R-D)', data: nets, type: 'line',
          borderColor: '#f5d742', backgroundColor: 'transparent', borderWidth: 2.5,
          pointRadius: meses.map(m => selKey ? (m.key === selKey ? 8 : 3) : 4),
          pointHoverRadius: 7,
          pointBackgroundColor: netPt, pointBorderColor: netPt,
          tension: 0.25, order: 1,
          datalabels: {
            align: 'top', offset: 6,
            color: ctx => nets[ctx.dataIndex] >= 0 ? '#4ecca3' : '#e05c5c',
            font: { size: 9, family: 'DM Mono', weight: '700' },
            backgroundColor: 'rgba(16,20,18,0.75)',
            borderRadius: 3,
            padding: { top: 2, bottom: 2, left: 4, right: 4 },
            formatter: v => _fmtShort(v),
          },
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 28, right: 8, left: 8 } },
      onClick: (evt, _elements, chart) => {
        const pts = chart.getElementsAtEventForMode(evt.native, 'index', { intersect: false }, true)
        if (!pts.length) return
        const m = meses[pts[0].index]
        if (selKey === m.key) _clearEvoFilter()
        else _selectEvolucaoMonth(m.ano, m.mes)
      },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => _fmtBRL(v) }, grid: { color: '#2a2f2c' } },
      },
      plugins: {
        legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: {},
        tooltip: { callbacks: { label: ctx => ' ' + _fmtBRL(ctx.raw) } },
      },
    },
  })

  // Scroll automático para o mês atual ou selecionado
  setTimeout(() => {
    const wrap = document.querySelector('.fin-evo-scroll-wrap')
    if (!wrap) return
    if (selKey) {
      const idx = meses.findIndex(m => m.key === selKey)
      if (idx !== -1) wrap.scrollLeft = Math.max(0, idx * BAR_W - wrap.clientWidth / 2)
    } else {
      wrap.scrollLeft = wrap.scrollWidth
    }
  }, 60)
}

// ── DRILL DE DESPESAS ─────────────────────────────────────────────────────────

// Mostra os lançamentos detalhados do grupo de despesa selecionado no donut
function _renderDespDrill(despGrupos) {
  const container = document.getElementById('fin-desp-drill')
  if (!container) return
  if (!_finDespCatSelected) { container.style.display = 'none'; return }

  const grupo = despGrupos[_finDespCatSelected.nome]
  if (!grupo?.lancs.length) { container.style.display = 'none'; return }

  const lancs = grupo.lancs.slice().sort((a, b) => Number(b.valor) - Number(a.valor))
  const rows  = lancs.map(l => {
    const catNome = l.categoria_nome || _finNome(l.cd_financa)
    const desc    = l.descricao ? ` · ${l.descricao}` : ''
    return `<tr class="fin-val-tbl-child">
      <td class="fin-val-tbl-name">${_fmtDate(l.data)} — ${catNome}${desc}</td>
      <td class="fin-val-tbl-num" style="color:var(--danger)">${_fmtBRL(l.valor)}</td>
    </tr>`
  }).join('')

  container.style.display = 'block'
  container.innerHTML = `
    <div class="fin-desp-drill-wrap">
      <div class="fin-desp-drill-title">${_finDespCatSelected.nome} — ${_fmtBRL(grupo.total)}</div>
      <table class="fin-val-table"><tbody>${rows}</tbody></table>
    </div>`
}

// ── VALIDADOR ORÇADO × REALIZADO ─────────────────────────────────────────────

function _renderValidador(ano, mes) {
  const container = document.getElementById('fin-validador')
  const label     = document.getElementById('fin-val-ano-label')
  if (!container) return

  const mesStr  = `${ano}-${String(mes).padStart(2, '0')}`
  const mesNome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  if (label) label.textContent = mesNome

  const lancMes = window.finLancamentos.filter(l => l.data.startsWith(mesStr))
  const orcMes  = _effectiveOrcamento(ano, mes).filter(o => o.mes !== null)

  const isTypeRoot = id => window.finCodigos.find(c => c.id === id)?.cd_pai == null

  // Constrói árvore hierárquica para um tipo (receita | despesa) usando apenas os nós ativos
  const buildTree = (tipo) => {
    const orcTipo  = orcMes.filter(o => window.finCodigos.find(c => c.id === o.cd_financa)?.tipo === tipo)
    const activeIds = new Set([
      ...orcTipo.map(o => o.cd_financa),
      ...lancMes.filter(l => window.finCodigos.find(c => c.id === l.cd_financa)?.tipo === tipo).map(l => l.cd_financa)
    ])
    if (!activeIds.size) return { roots: [], totalOrc: 0, totalReal: 0 }

    const orcById  = {}
    orcTipo.forEach(o => { orcById[o.cd_financa] = Number(o.valor_orcado) })
    const realById = {}
    lancMes.filter(l => window.finCodigos.find(c => c.id === l.cd_financa)?.tipo === tipo)
           .forEach(l => { realById[l.cd_financa] = (realById[l.cd_financa] || 0) + Number(l.valor) })

    const nodes = {}
    const getNode = id => {
      if (!nodes[id]) {
        const cod = window.finCodigos.find(c => c.id === id)
        nodes[id] = { id, nome: cod?.nome || String(id), cd_pai: cod?.cd_pai,
                      dirOrc: 0, dirReal: 0, totalOrc: 0, totalReal: 0, children: {} }
      }
      return nodes[id]
    }

    activeIds.forEach(id => {
      getNode(id).dirOrc  = orcById[id]  || 0
      getNode(id).dirReal = realById[id] || 0
      let cur = id
      while (true) {
        const cod = window.finCodigos.find(c => c.id === cur)
        if (!cod || cod.cd_pai == null || isTypeRoot(cod.cd_pai)) break
        getNode(cod.cd_pai)
        cur = cod.cd_pai
      }
    })

    // Liga pai → filhos (ignora nó raiz de tipo)
    Object.values(nodes).forEach(n => {
      if (n.cd_pai != null && !isTypeRoot(n.cd_pai) && nodes[n.cd_pai])
        nodes[n.cd_pai].children[n.id] = n
    })

    // Agrega totais bottom-up
    const computeTotals = n => {
      n.totalOrc  = n.dirOrc
      n.totalReal = n.dirReal
      Object.values(n.children).forEach(c => {
        computeTotals(c)
        n.totalOrc  += c.totalOrc
        n.totalReal += c.totalReal
      })
    }
    const roots = Object.values(nodes).filter(n => n.cd_pai != null && isTypeRoot(n.cd_pai))
    roots.forEach(computeTotals)
    roots.sort((a, b) => b.totalOrc - a.totalOrc)
    return { roots, totalOrc: roots.reduce((s, n) => s + n.totalOrc, 0), totalReal: roots.reduce((s, n) => s + n.totalReal, 0) }
  }

  // Renderer recursivo de nós da árvore
  const renderTree = (nodes, netGoodPos, depth, pfx) =>
    nodes.map(node => {
      const uid   = `${pfx}-${node.id}`
      const net   = node.totalReal - node.totalOrc
      const kids  = Object.values(node.children).sort((a, b) => b.totalOrc - a.totalOrc)
      const pad   = `${(depth + 1) * 14}px`
      const netClr = net === 0 ? 'var(--text-muted)'
                   : (net > 0) === netGoodPos ? 'var(--accent)' : 'var(--danger)'
      const orcTd  = `<td class="fin-val-tbl-num">${node.totalOrc > 0 ? _fmtBRL(node.totalOrc) : '—'}</td>`
      const realTd = `<td class="fin-val-tbl-num">${_fmtBRL(node.totalReal)}</td>`
      const netTd  = `<td class="fin-val-tbl-num" style="color:${netClr}">${net !== 0 ? _fmtBRL(net) : '—'}</td>`

      if (!kids.length) {
        return `<tr class="fin-val-tbl-child">
          <td class="fin-val-tbl-name" style="padding-left:${pad}">${node.nome}</td>
          ${orcTd}${realTd}${netTd}
        </tr>`
      }
      const childHtml  = renderTree(kids, netGoodPos, depth + 1, pfx)
      const innerCols  = `<colgroup><col style="width:100%"><col style="width:110px"><col style="width:110px"><col style="width:110px"></colgroup>`
      return `
        <tr class="fin-val-tbl-hd" onclick="toggleFinValAcc('${uid}')">
          <td class="fin-val-tbl-label-cell" style="padding-left:${pad}">
            <span class="fin-val-acc-arrow" id="fin-val-acc-arrow-${uid}">▶</span>
            <span style="margin-left:6px">${node.nome}</span>
          </td>
          ${orcTd}${realTd}${netTd}
        </tr>
        <tr id="fin-val-acc-${uid}" style="display:none">
          <td colspan="4" class="fin-val-tbl-children-wrap">
            <table class="fin-val-tbl-children">${innerCols}<tbody>${childHtml}</tbody></table>
          </td>
        </tr>`
    }).join('')

  const rec       = buildTree('receita')
  const desp      = buildTree('despesa')
  const saldoOrc  = rec.totalOrc   - desp.totalOrc
  const saldoReal = rec.totalReal  - desp.totalReal
  const saldoNet  = saldoReal      - saldoOrc

  // Investimentos do mês — usa lançamentos do mês (não o snapshot acumulado)
  const indicIds   = new Set([78, ..._getDescendantIds(78)])
  const orcInv     = orcMes.filter(o => window.finCodigos.find(c => c.id === o.cd_financa)?.tipo === 'investimento')
  const invLancs   = lancMes.filter(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    return cod?.tipo === 'investimento' && !indicIds.has(l.cd_financa)
  })
  const invIds     = new Set([...orcInv.map(o => o.cd_financa), ...invLancs.map(l => l.cd_financa)])
  const invRows    = []
  invIds.forEach(id => {
    const orc  = orcInv.find(o => o.cd_financa === id)
    const real = invLancs.filter(l => l.cd_financa === id).reduce((s, l) => s + Number(l.valor), 0)
    invRows.push({ nome: _finNome(id), orc: orc ? Number(orc.valor_orcado) : null, real: real || null })
  })
  invRows.sort((a, b) => ((b.orc || 0) - (a.orc || 0)) || ((b.real || 0) - (a.real || 0)))
  const totalInvOrc  = orcInv.reduce((s, o) => s + Number(o.valor_orcado), 0)
  const totalInvReal = invRows.reduce((s, r) => s + (r.real || 0), 0)
  const invChildHtml = invRows.length
    ? invRows.map(r => {
        const net = (r.real || 0) - (r.orc || 0)
        const nc  = net === 0 ? 'var(--text-muted)' : net > 0 ? 'var(--accent)' : 'var(--danger)'
        return `<tr class="fin-val-tbl-child">
          <td class="fin-val-tbl-name">${r.nome}</td>
          <td class="fin-val-tbl-num">${r.orc != null ? _fmtBRL(r.orc) : '—'}</td>
          <td class="fin-val-tbl-num">${r.real != null ? _fmtBRL(r.real) : '—'}</td>
          <td class="fin-val-tbl-num" style="color:${nc}">${net !== 0 ? _fmtBRL(net) : '—'}</td>
        </tr>`
      }).join('')
    : `<tr class="fin-val-tbl-child"><td colspan="4" style="color:var(--text-muted)">Nenhum lançamento de investimento no período.</td></tr>`

  // Linha de accordion de nível 1 (Entradas / Saídas / Investimentos)
  const topRow = (id, lbl, cls, totalOrc, totalReal, childHtml, netGoodPos) => {
    const net    = totalReal - totalOrc
    const netClr = net === 0 ? 'var(--text-muted)'
                 : (net > 0) === netGoodPos ? 'var(--accent)' : 'var(--danger)'
    return `
      <tr class="fin-val-tbl-hd" onclick="toggleFinValAcc('${id}')">
        <td class="fin-val-tbl-label-cell">
          <span class="fin-val-acc-arrow" id="fin-val-acc-arrow-${id}">▶</span>
          <span class="${cls}" style="margin-left:6px">${lbl}</span>
        </td>
        <td class="fin-val-tbl-num">${totalOrc > 0 ? _fmtBRL(totalOrc) : '—'}</td>
        <td class="fin-val-tbl-num">${_fmtBRL(totalReal)}</td>
        <td class="fin-val-tbl-num" style="color:${netClr}">${net !== 0 ? _fmtBRL(net) : '—'}</td>
      </tr>
      <tr id="fin-val-acc-${id}" style="display:none">
        <td colspan="4" class="fin-val-tbl-children-wrap">
          <table class="fin-val-tbl-children"><colgroup><col style="width:100%"><col style="width:110px"><col style="width:110px"><col style="width:110px"></colgroup><tbody>${childHtml}</tbody></table>
        </td>
      </tr>`
  }

  container.innerHTML = `
    <table class="fin-val-table">
      <colgroup>
        <col style="width:100%">
        <col style="width:110px">
        <col style="width:110px">
        <col style="width:110px">
      </colgroup>
      <thead>
        <tr class="fin-val-tbl-head">
          <th></th>
          <th class="fin-val-tbl-num">Orçado</th>
          <th class="fin-val-tbl-num">Realizado</th>
          <th class="fin-val-tbl-num">Net</th>
        </tr>
      </thead>
      <tbody>
        ${topRow('rec',  'Entradas',      'fin-receita', rec.totalOrc,  rec.totalReal,  renderTree(rec.roots,  true,  0, 'r'), true)}
        ${topRow('desp', 'Saídas',        'fin-despesa', desp.totalOrc, desp.totalReal, renderTree(desp.roots, false, 0, 'd'), false)}
        ${topRow('inv',  'Investimentos', '',            totalInvOrc,   totalInvReal,   invChildHtml,                         true)}
        <tr class="fin-val-tbl-saldo">
          <td>Saldo</td>
          <td class="fin-val-tbl-num">${_fmtBRL(saldoOrc)}</td>
          <td class="fin-val-tbl-num">${_fmtBRL(saldoReal)}</td>
          <td class="fin-val-tbl-num" style="color:${saldoNet >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(saldoNet)}</td>
        </tr>
      </tbody>
    </table>`
}

function toggleFinValAcc(id) {
  const body  = document.getElementById('fin-val-acc-' + id)
  const arrow = document.getElementById('fin-val-acc-arrow-' + id)
  if (!body) return
  const open = body.style.display !== 'none'
  body.style.display = open ? 'none' : (body.tagName === 'TR' ? 'table-row' : 'block')
  if (arrow) arrow.textContent = open ? '▶' : '▼'
}
