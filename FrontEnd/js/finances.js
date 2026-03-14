// ─────────────────────────────────────────────────────────────────────────────
// finances.js — Módulo de finanças  v28
//
// Entidades:
//   codigos_financa      → árvore de categorias (pai/filho, tipo: receita|despesa|investimento)
//   lancamentos_financ   → data, cd_financa, valor, descricao
//   orcamentos_financ    → ano, mes, cd_financa, valor_orcado
//   snapshots_investim   → data, cd_financa, saldo (cobre investimentos E indicadores ≥78)
// ─────────────────────────────────────────────────────────────────────────────

// ── ESTADO ────────────────────────────────────────────────────────────────────

window.finCodigos      = []   // [{id, nome, tipo, cd_pai}]
window.finLancamentos  = []   // [{id, data, cd_financa, valor, descricao}]
window.finOrcamento    = []   // [{id, ano, mes, cd_financa, valor_orcado}]
window.finInvestimentos = []  // [{id, data, cd_financa, saldo}]
window.finViagens      = []   // [{nome_viagem, total, num_lancamentos, lancamentos}]

let _finActiveTab = 'overview'
let _finChartsInstances = {}
let _finEvoSelectedMonth = null   // {ano, mes} | null
let _finDespCatSelected  = null   // { nome: string } | null

const _finDL = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : []

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function initFinancesSection() {
  const [codigos, lanc, orc, inv, viag] = await Promise.all([
    fetchFinancasCodigos(),
    fetchLancamentos(),
    fetchOrcamento(),
    fetchInvestimentos(),
    fetchViagens(),
  ])

  window.finCodigos       = codigos      || []
  window.finLancamentos   = lanc         || []
  window.finOrcamento     = orc          || []
  window.finInvestimentos = inv          || []
  window.finViagens       = viag         || []

  _setDefaultFilters()
  switchFinTab(_finActiveTab)
}

function _setDefaultFilters() {
  const now   = new Date()
  const ym    = now.toISOString().slice(0, 7)   // 'YYYY-MM'

  const mesEl = document.getElementById('fin-filter-mes')
  if (mesEl && !mesEl.value) mesEl.value = ym
  const invMesEl = document.getElementById('fin-inv-filter-mes')
  if (invMesEl && !invMesEl.value) invMesEl.value = ym
}

// ── ABAS ──────────────────────────────────────────────────────────────────────

function switchFinTab(tab) {
  _finActiveTab = tab

  document.querySelectorAll('.fin-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab)
  })
  document.querySelectorAll('.fin-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'fin-panel-' + tab)
  })

  if (tab === 'overview')      renderFinOverview()
  if (tab === 'lancamentos')   renderLancamentos()
  if (tab === 'investimentos') renderInvestimentos()
  if (tab === 'viagens')       renderViagens()
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function _fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function _fmtShort(v) {
  if (v === null || v === undefined) return null
  const abs  = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1).replace('.', ',') + 'k'
  return sign + Math.round(abs)
}

function _fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

// Retorna nome de um código pelo id
function _finNome(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  return cod ? cod.nome : '—'
}

// Retorna "Pai > Nome" para mostrar contexto na tabela (só 2 níveis)
function _finCatBreadcrumb(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return '—'
  if (cod.cd_pai === null) return cod.nome
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  if (!pai || pai.cd_pai === null) return cod.nome  // pai é raiz = tipo, não mostrar
  return `<span style="color:var(--text-muted);font-size:.75em">${pai.nome} ›</span> ${cod.nome}`
}

// Retorna badge HTML para forma de pagamento
function _finPagBadge(p) {
  if (p === 'credito') return '<span style="color:#7c9eff;font-size:.74rem;font-weight:600">Crédito</span>'
  if (!p || p === 'null') return '<span style="color:var(--text-muted);font-size:.74rem">—</span>'
  return '<span style="color:var(--text-muted);font-size:.74rem">Débito</span>'
}

// Retorna o orçamento vigente por categoria para um dado (ano, mes)
// Lógica de vigência: entry é válida se sua data <= (ano, mes)
// Para cada cd_financa retorna o registro mais recente dentro desse limite
function _effectiveOrcamento(ano, mes) {
  const byCode = {}
  window.finOrcamento.forEach(o => {
    const valid = o.mes === null
      ? o.ano <= ano
      : (o.ano < ano || (o.ano === ano && o.mes <= mes))
    if (!valid) return
    const prev = byCode[o.cd_financa]
    if (!prev) { byCode[o.cd_financa] = o; return }
    const score  = o.ano    * 100 + (o.mes    ?? 0)
    const pScore = prev.ano * 100 + (prev.mes ?? 0)
    if (score > pScore) byCode[o.cd_financa] = o
  })
  return Object.values(byCode)
}

// Sobe a árvore até encontrar o filho direto de uma raiz (cd_pai=null) — esse é o "grupo"
function _findGrupoId(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return null
  if (cod.cd_pai === null) return id            // nó raiz, retorna si mesmo
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  if (!pai || pai.cd_pai === null) return id    // pai é raiz → eu sou o grupo
  return _findGrupoId(cod.cd_pai)
}

// Retorna a lista de IDs intermediários entre grupoId (exclusive) e itemId (exclusive)
// Ex: Energy → Obrig_Couple → Couple → Recorrente(=grupoId)  →  [Couple, Obrig_Couple]
function _pathFromGrupo(itemId, grupoId) {
  if (itemId === grupoId) return []
  const cod = window.finCodigos.find(c => c.id === itemId)
  if (!cod || cod.cd_pai === null || cod.cd_pai === grupoId) return []
  return [..._pathFromGrupo(cod.cd_pai, grupoId), cod.cd_pai]
}

// Constrói uma árvore de nós de orçamento com profundidade arbitrária
function _buildOrcTree(orcItems, realizadoMap) {
  const root = {}

  function ensureNode(map, id) {
    if (!map[id]) map[id] = { id, nome: _finNome(id), children: {}, items: [], totalOrc: 0, totalReal: 0 }
    return map[id]
  }

  orcItems.forEach(o => {
    const gid    = _findGrupoId(o.cd_financa) || o.cd_financa
    const path   = _pathFromGrupo(o.cd_financa, gid)
    const orcado = Number(o.valor_orcado)
    const real   = realizadoMap[o.cd_financa] || 0
    let node = ensureNode(root, gid)
    for (const pid of path) node = ensureNode(node.children, pid)
    node.items.push({ ...o, orcado, real })
  })

  function computeTotals(node) {
    node.totalOrc = 0; node.totalReal = 0
    Object.values(node.children).forEach(child => {
      computeTotals(child)
      node.totalOrc  += child.totalOrc
      node.totalReal += child.totalReal
    })
    node.items.forEach(o => { node.totalOrc += o.orcado; node.totalReal += o.real })
  }

  const groups = Object.values(root)
  groups.forEach(computeTotals)
  return groups.sort((a, b) => a.nome.localeCompare(b.nome))
}

// Agrupa por tipo (receita/despesa/investimento), usando _buildOrcTree
function _groupOrcByTipoAndGrupo(orcItems, realizadoMap) {
  const tipoOrder = ['receita', 'despesa', 'investimento']
  const tipoItems = {}
  orcItems.forEach(o => {
    const tipo = window.finCodigos.find(c => c.id === o.cd_financa)?.tipo || 'outros'
    if (!tipoItems[tipo]) tipoItems[tipo] = []
    tipoItems[tipo].push(o)
  })
  return tipoOrder
    .filter(tp => tipoItems[tp])
    .map(tp => {
      const grupos    = _buildOrcTree(tipoItems[tp], realizadoMap)
      const totalOrc  = grupos.reduce((s, g) => s + g.totalOrc,  0)
      const totalReal = grupos.reduce((s, g) => s + g.totalReal, 0)
      const nome = tp.charAt(0).toUpperCase() + tp.slice(1)
      return { key: tp, nome, grupos, totalOrc, totalReal }
    })
}

// Renderiza tipos como acordeão com grupos aninhados dentro
function _buildOrcTipoHtml(tipoGroups, showDelete, uidPrefix) {
  return tipoGroups.map(t => {
    const pct    = t.totalOrc > 0 ? Math.min((t.totalReal / t.totalOrc) * 100, 100) : 0
    const over   = t.totalReal > t.totalOrc
    const uid    = uidPrefix + '-tipo-' + t.key
    const pctLbl = t.totalOrc > 0 ? ((t.totalReal / t.totalOrc) * 100).toFixed(0) + '%' : '—'
    const gruposHtml = _buildOrcGroupHtml(t.grupos, showDelete, uidPrefix + '-' + t.key)
    return `<div class="fin-orc-tipo fin-orc-tipo--${t.key}">
      <div class="fin-orc-tipo-hd" onclick="toggleOrcGroup('${uid}')">
        <span class="fin-orc-group-arrow" id="orc-arrow-${uid}">▶</span>
        <span class="fin-orc-tipo-name">${t.nome}</span>
        <span class="fin-orc-ov-vals ${over ? 'over' : ''}">
          <b>${_fmtBRL(t.totalReal)}</b> / ${_fmtBRL(t.totalOrc)} <em>${pctLbl}</em>
        </span>
      </div>
      <div class="fin-orc-bar-bg fin-orc-group-bar">
        <div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${pct}%"></div>
      </div>
      <div class="fin-orc-group-body" id="orc-body-${uid}" style="display:none">${gruposHtml}</div>
    </div>`
  }).join('')
}

// Renderiza lista de grupos como acordeão; showDelete=true adiciona botão ✕
function _renderOrcChild(o, showDelete) {
  const p  = o.orcado > 0 ? Math.min((o.real / o.orcado) * 100, 100) : 0
  const ov = o.real > o.orcado
  const pl = o.orcado > 0 ? p.toFixed(0) + '%' : '—'
  const del = showDelete ? `<button class="fin-del-btn" onclick="deleteOrcamentoFin(${o.id})">✕</button>` : ''
  return `<div class="fin-orc-child">
    <div class="fin-orc-ov-info">
      <span class="fin-orc-child-name">${_finNome(o.cd_financa)}</span>
      <span class="fin-orc-ov-vals ${ov ? 'over' : ''}"><b>${_fmtBRL(o.real)}</b> / ${_fmtBRL(o.orcado)} <em>${pl}</em></span>
      ${del}
    </div>
    <div class="fin-orc-bar-bg"><div class="fin-orc-bar-fill ${ov ? 'over' : ''}" style="width:${p}%"></div></div>
  </div>`
}

// Renderiza recursivamente um nó de orçamento (profundidade arbitrária)
function _renderOrcNode(node, showDelete, uidPrefix, depth) {
  const pct    = node.totalOrc > 0 ? Math.min((node.totalReal / node.totalOrc) * 100, 100) : 0
  const over   = node.totalReal > node.totalOrc
  const uid    = uidPrefix + '-' + node.id
  const pctLbl = node.totalOrc > 0 ? ((node.totalReal / node.totalOrc) * 100).toFixed(0) + '%' : '—'
  const childNodes = Object.values(node.children).sort((a, b) => a.nome.localeCompare(b.nome))
  const innerHtml  = childNodes.map(c => _renderOrcNode(c, showDelete, uidPrefix, depth + 1)).join('')
                   + node.items.map(o => _renderOrcChild(o, showDelete)).join('')
  const wrapCls = depth === 0 ? 'fin-orc-group'    : 'fin-orc-subgroup'
  const hdCls   = depth === 0 ? 'fin-orc-group-hd' : 'fin-orc-subgroup-hd'
  const nameCls = depth === 0 ? 'fin-orc-group-name' : 'fin-orc-subgroup-name'
  return `<div class="${wrapCls}">
    <div class="${hdCls}" onclick="toggleOrcGroup('${uid}')">
      <span class="fin-orc-group-arrow" id="orc-arrow-${uid}">▶</span>
      <span class="${nameCls}">${node.nome}</span>
      <span class="fin-orc-ov-vals ${over ? 'over' : ''}">
        <b>${_fmtBRL(node.totalReal)}</b> / ${_fmtBRL(node.totalOrc)} <em>${pctLbl}</em>
      </span>
    </div>
    <div class="fin-orc-bar-bg fin-orc-group-bar">
      <div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${pct}%"></div>
    </div>
    <div class="fin-orc-group-body" id="orc-body-${uid}" style="display:none">${innerHtml}</div>
  </div>`
}

function _buildOrcGroupHtml(grupos, showDelete, uidPrefix) {
  return grupos.map(g => _renderOrcNode(g, showDelete, uidPrefix, 0)).join('')
}

function toggleOrcGroup(uid) {
  const body  = document.getElementById('orc-body-'  + uid)
  const arrow = document.getElementById('orc-arrow-' + uid)
  if (!body) return
  const open = body.style.display !== 'none'
  body.style.display = open ? 'none' : 'block'
  if (arrow) arrow.textContent = open ? '▶' : '▼'
}

// Retorna nome do grupo pai de um código
function _finGrupo(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return '—'
  if (cod.cd_pai === null || cod.cd_pai === undefined) return cod.nome
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  return pai ? pai.nome : cod.nome
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────

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

  // Barra de filtro de mês ativo
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

  // Barra de filtro de categoria ativo
  const catBar = document.getElementById('fin-cat-filter-bar')
  const catLbl = document.getElementById('fin-cat-filter-label')
  if (catBar) {
    if (_finDespCatSelected) {
      catBar.style.display = 'flex'
      if (catLbl) catLbl.textContent = _finDespCatSelected.nome
    } else {
      catBar.style.display = 'none'
    }
  }

  const mesKey  = `${ano}-${String(mes).padStart(2, '0')}`
  const lancMes = window.finLancamentos.filter(l => l.data.startsWith(mesKey))

  let receitas = 0, despesas = 0
  const despGrupos = {}   // grupoNome -> { total, lancs[] }

  lancMes.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (!cod) return
    if (cod.tipo === 'receita')  receitas += Number(l.valor)
    if (cod.tipo === 'despesa') {
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

  // Total investido — exclui indicadores (id=78 e descendentes), igual à aba Investimentos
  const indicIds = new Set([78, ..._getDescendantIds(78)])
  let totalInv = 0
  const invPorCod = {}
  window.finInvestimentos
    .filter(s => !indicIds.has(s.cd_financa))
    .forEach(s => {
      if (!invPorCod[s.cd_financa] || s.data > invPorCod[s.cd_financa].data) {
        invPorCod[s.cd_financa] = s
      }
    })
  Object.values(invPorCod).forEach(s => { totalInv += Number(s.saldo) })

  // Saldo acumulado no ano (YTD)
  const anoAtual = ano
  let recYTD = 0, despYTD = 0
  window.finLancamentos.forEach(l => {
    if (!l.data.startsWith(String(anoAtual))) return
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita')  recYTD  += Number(l.valor)
    if (cod?.tipo === 'despesa') despYTD += Number(l.valor)
  })
  const saldoAno = recYTD - despYTD

  document.getElementById('fin-kpi-saldo').textContent     = _fmtBRL(receitas - despesas)
  document.getElementById('fin-kpi-investido').textContent = _fmtBRL(totalInv)
  document.getElementById('fin-kpi-credito').textContent   = _fmtBRL(totalCredito)
  const saldoAnoEl = document.getElementById('fin-kpi-saldo-ano')
  if (saldoAnoEl) {
    saldoAnoEl.textContent = _fmtBRL(saldoAno)
    saldoAnoEl.style.color = saldoAno >= 0 ? 'var(--accent)' : 'var(--danger)'
  }

  // Colorir saldo positivo/negativo
  const saldoEl = document.getElementById('fin-kpi-saldo')
  saldoEl.style.color = (receitas - despesas) >= 0 ? 'var(--accent)' : 'var(--danger)'

  _renderChartDespesas(despGrupos)
  _renderChartEvolucao()
  _renderDespDrill(despGrupos)
  _renderValidador(ano, mes)
  const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  _renderCreditoPanel(ano, mes, mesLabel)
}

function _renderOrcOverview(ano, mes) {
  const container = document.getElementById('fin-orc-overview')
  const label     = document.getElementById('fin-orc-mes-label')
  if (!container) return

  const mesStr = `${ano}-${String(mes).padStart(2, '0')}`
  if (label) {
    label.textContent = new Date(ano, mes - 1, 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  // apenas orçamentos com mês específico (anuais ficam fora do overview)
  const orcVigente = _effectiveOrcamento(ano, mes).filter(o => o.mes !== null)

  if (orcVigente.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.82rem;padding:16px 0">Nenhum orçamento cadastrado.</p>'
    return
  }

  const realizado = {}
  window.finLancamentos
    .filter(l => l.data.startsWith(mesStr))
    .forEach(l => { realizado[l.cd_financa] = (realizado[l.cd_financa] || 0) + Number(l.valor) })

  container.innerHTML = _buildOrcTipoHtml(_groupOrcByTipoAndGrupo(orcVigente, realizado), false, 'ov')
}

function _renderValidador(ano, mes) {
  const container = document.getElementById('fin-validador')
  const label     = document.getElementById('fin-val-ano-label')
  if (!container) return

  const mesStr  = `${ano}-${String(mes).padStart(2, '0')}`
  const mesNome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  if (label) label.textContent = mesNome

  const lancMes = window.finLancamentos.filter(l => l.data.startsWith(mesStr))
  const orcMes  = _effectiveOrcamento(ano, mes).filter(o => o.mes !== null)

  // ── Build recursive tree following exact DB hierarchy ───────────────────
  const isTypeRoot = id => window.finCodigos.find(c => c.id === id)?.cd_pai == null

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

    // Wire parent → children (skip tipo root level)
    Object.values(nodes).forEach(n => {
      if (n.cd_pai != null && !isTypeRoot(n.cd_pai) && nodes[n.cd_pai])
        nodes[n.cd_pai].children[n.id] = n
    })

    // Aggregate totals bottom-up
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
    return { roots,
      totalOrc:  roots.reduce((s, n) => s + n.totalOrc,  0),
      totalReal: roots.reduce((s, n) => s + n.totalReal, 0) }
  }

  // ── Recursive HTML renderer ──────────────────────────────────────────────
  // netGoodWhenPositive: true for receita (earning more is good), false for despesa
  const renderTree = (nodes, realClr, netGoodPos, depth, pfx) =>
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
      const childHtml = renderTree(kids, realClr, netGoodPos, depth + 1, pfx)
      const innerCols = `<colgroup><col style="width:100%"><col style="width:110px"><col style="width:110px"><col style="width:110px"></colgroup>`
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

  // Investimentos do mês — usa lançamentos do mês (não o snapshot/saldo acumulado)
  const indicIds = new Set([78, ..._getDescendantIds(78)])
  const orcInv   = orcMes.filter(o => window.finCodigos.find(c => c.id === o.cd_financa)?.tipo === 'investimento')
  const invLancs = lancMes.filter(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    return cod?.tipo === 'investimento' && !indicIds.has(l.cd_financa)
  })
  const invIds   = new Set([...orcInv.map(o => o.cd_financa), ...invLancs.map(l => l.cd_financa)])
  const invRows  = []
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
        </tr>`}).join('')
    : `<tr class="fin-val-tbl-child"><td colspan="4" style="color:var(--text-muted)">Nenhum lançamento de investimento no período.</td></tr>`

  // Top-level accordion row (Entradas / Saídas / Investimentos)
  const topRow = (id, lbl, cls, totalOrc, totalReal, realClr, childHtml, netGoodPos) => {
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
        ${topRow('rec',  'Entradas',      'fin-receita', rec.totalOrc,  rec.totalReal,  '', renderTree(rec.roots,  'var(--accent)', true,  0, 'r'), true)}
        ${topRow('desp', 'Saídas',        'fin-despesa', desp.totalOrc, desp.totalReal, '', renderTree(desp.roots, 'var(--danger)', false, 0, 'd'), false)}
        ${topRow('inv',  'Investimentos', '',            totalInvOrc,   totalInvReal,   '', invChildHtml, true)}
        <tr class="fin-val-tbl-saldo">
          <td>Saldo</td>
          <td class="fin-val-tbl-num">${_fmtBRL(saldoOrc)}</td>
          <td class="fin-val-tbl-num">${_fmtBRL(saldoReal)}</td>
          <td class="fin-val-tbl-num" style="color:${saldoNet >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(saldoNet)}</td>
        </tr>
      </tbody>
    </table>
  `
}

function toggleFinValAcc(id) {
  const body  = document.getElementById('fin-val-acc-' + id)
  const arrow = document.getElementById('fin-val-acc-arrow-' + id)
  if (!body) return
  const open = body.style.display !== 'none'
  body.style.display = open ? 'none' : (body.tagName === 'TR' ? 'table-row' : 'block')
  if (arrow) arrow.textContent = open ? '▶' : '▼'
}

function _destroyChart(id) {
  if (_finChartsInstances[id]) {
    _finChartsInstances[id].destroy()
    delete _finChartsInstances[id]
  }
}

function _renderChartDespesas(despGrupos) {
  const canvas = document.getElementById('fin-chart-despesas')
  if (!canvas) return
  _destroyChart('despesas')

  const labels = Object.keys(despGrupos)
  const data   = labels.map(k => despGrupos[k].total)
  if (labels.length === 0) return

  const COLORS = ['#4ecca3','#e05c5c','#f5d742','#7c9eff','#ff9f47','#9b59b6','#1abc9c','#e74c3c']
  const selNome = _finDespCatSelected?.nome

  const bgColors = labels.map((lbl, i) => {
    const hex = COLORS[i % COLORS.length]
    if (!selNome || lbl === selNome) return hex
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return `rgba(${r},${g},${b},0.2)`
  })

  _finChartsInstances['despesas'] = new Chart(canvas, {
    type: 'doughnut',
    plugins: _finDL,
    data: {
      labels,
      datasets: [{ data, backgroundColor: bgColors, borderWidth: 0 }],
    },
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
            const pct = total > 0 ? (v / total * 100) : 0
            return pct >= 4 ? pct.toFixed(0) + '%' : null
          },
        },
      },
    },
  })
}

function _renderChartEvolucao() {
  const canvas = document.getElementById('fin-chart-evolucao')
  if (!canvas) return
  _destroyChart('evolucao')

  // Todos os meses com lançamentos de receita ou despesa, até o mês atual
  const now = new Date()
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const mesSet = new Set()
  window.finLancamentos.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if ((cod?.tipo === 'receita' || cod?.tipo === 'despesa') && l.data.slice(0, 7) <= nowKey)
      mesSet.add(l.data.slice(0, 7))
  })
  if (mesSet.size === 0) return

  const meses = [...mesSet].sort().map(mk => {
    const [y, m] = mk.split('-')
    return {
      ano: Number(y), mes: Number(m), key: mk,
      label: new Date(Number(y), Number(m) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    }
  })

  const receitas = meses.map(m =>
    window.finLancamentos.filter(l => {
      const cod = window.finCodigos.find(c => c.id === l.cd_financa)
      return cod?.tipo === 'receita' && l.data.startsWith(m.key)
    }).reduce((s, l) => s + Number(l.valor), 0)
  )
  const despesas = meses.map(m =>
    window.finLancamentos.filter(l => {
      const cod = window.finCodigos.find(c => c.id === l.cd_financa)
      if (!cod || cod.tipo !== 'despesa' || !l.data.startsWith(m.key)) return false
      if (_finDespCatSelected) return _finGrupo(l.cd_financa) === _finDespCatSelected.nome
      return true
    }).reduce((s, l) => s + Number(l.valor), 0)
  )
  const nets = meses.map((_, i) => receitas[i] - despesas[i])

  const selKey = _finEvoSelectedMonth
    ? `${_finEvoSelectedMonth.ano}-${String(_finEvoSelectedMonth.mes).padStart(2, '0')}`
    : null

  const recBg  = meses.map(m => {
    if (!selKey)           return 'rgba(78,204,163,0.55)'
    return m.key === selKey ? 'rgba(78,204,163,0.9)' : 'rgba(78,204,163,0.12)'
  })
  const despBg = meses.map(m => {
    if (!selKey)           return 'rgba(224,92,92,0.55)'
    return m.key === selKey ? 'rgba(224,92,92,0.9)' : 'rgba(224,92,92,0.12)'
  })
  const netPt  = nets.map(n => n >= 0 ? '#4ecca3' : '#e05c5c')

  // Scroll: canvas de largura fixa
  const BAR_W = 90
  const totalW = Math.max(meses.length * BAR_W, 600)
  const H = 300
  canvas.style.width  = totalW + 'px'
  canvas.style.height = H + 'px'
  canvas.width  = totalW
  canvas.height = H

  _finChartsInstances['evolucao'] = new Chart(canvas, {
    type: 'bar',
    plugins: _finDL,
    data: {
      labels: meses.map(m => m.label),
      datasets: [
        {
          label: 'Receitas', data: receitas,
          backgroundColor: recBg, borderRadius: 3, order: 2,
          datalabels: {
            anchor: 'end', align: 'top',
            color: 'rgba(78,204,163,0.9)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: v => v > 0 ? _fmtShort(v) : null,
          },
        },
        {
          label: 'Despesas', data: despesas,
          backgroundColor: despBg, borderRadius: 3, order: 2,
          datalabels: {
            anchor: 'end', align: 'top',
            color: 'rgba(224,92,92,0.9)',
            font: { size: 9, family: 'DM Mono', weight: '600' },
            formatter: v => v > 0 ? _fmtShort(v) : null,
          },
        },
        {
          label: 'Net (R-D)', data: nets,
          type: 'line',
          borderColor: '#f5d742',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: meses.map(m => selKey ? (m.key === selKey ? 8 : 3) : 4),
          pointHoverRadius: 7,
          pointBackgroundColor: netPt,
          pointBorderColor: netPt,
          tension: 0.25,
          order: 1,
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
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'
      },
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => _fmtBRL(v) }, grid: { color: '#2a2f2c' } },
      },
      plugins: {
        legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: {},  // configurado por dataset acima
        tooltip: { callbacks: { label: ctx => ' ' + _fmtBRL(ctx.raw) } },
      },
    },
  })

  // Scroll automático para o mês atual / selecionado
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

// Drill de despesas por categoria — lista de lançamentos do grupo selecionado
function _renderDespDrill(despGrupos) {
  const container = document.getElementById('fin-desp-drill')
  if (!container) return
  if (!_finDespCatSelected) { container.style.display = 'none'; return }

  const grupo = despGrupos[_finDespCatSelected.nome]
  if (!grupo || !grupo.lancs.length) { container.style.display = 'none'; return }

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
      <table class="fin-val-table">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}



function _updateLancCatFilter() {
  const tipo = document.getElementById('fin-filter-tipo')?.value || ''
  const sel  = document.getElementById('fin-filter-cat')
  if (!sel) return

  const todos   = window.finCodigos
  const raizes  = todos.filter(c => c.cd_pai === null)
  const raizIds = new Set(raizes.map(c => c.id))

  // leaf = não tem nenhum filho
  const temFilho = new Set(todos.filter(c => c.cd_pai !== null).map(c => c.cd_pai))
  const folhas   = todos.filter(c => !temFilho.has(c.id) && !raizIds.has(c.id))

  // agrupa folhas pelo tipo (nome da raiz)
  const porTipo = {}
  for (const f of folhas) {
    const t = f.tipo || ''
    if (!porTipo[t]) porTipo[t] = []
    porTipo[t].push(f)
  }

  let html = '<option value="">Todas as categorias</option>'

  const tipos = tipo ? [tipo] : Object.keys(porTipo).sort((a,b) => a.localeCompare(b,'pt-BR'))
  for (const t of tipos) {
    const lista = (porTipo[t] || []).sort((a,b) => a.nome.localeCompare(b.nome,'pt-BR'))
    if (!lista.length) continue
    const label = t.charAt(0).toUpperCase() + t.slice(1)
    html += `<optgroup label="${label}">`
    html += lista.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
    html += '</optgroup>'
  }

  sel.innerHTML = html
}

function renderLancamentos() {
  const tipoFilter = document.getElementById('fin-filter-tipo')?.value || ''
  const mesFilter  = document.getElementById('fin-filter-mes')?.value  || ''
  const catFilter  = document.getElementById('fin-filter-cat')?.value  || ''
  const pagFilter  = document.getElementById('fin-filter-pag')?.value  || ''
  const descFilter = document.getElementById('fin-filter-desc')?.value.toLowerCase().trim() || ''

  // popula select de categorias se ainda estiver vazio
  const catSel = document.getElementById('fin-filter-cat')
  if (catSel && catSel.options.length <= 1) _updateLancCatFilter()

  let dados = window.finLancamentos.slice()

  if (tipoFilter) {
    const ids = window.finCodigos.filter(c => c.tipo === tipoFilter).map(c => c.id)
    dados = dados.filter(l => ids.includes(l.cd_financa))
  }
  if (catFilter) {
    dados = dados.filter(l => l.cd_financa === Number(catFilter))
  }
  if (pagFilter) {
    if (pagFilter === 'null') dados = dados.filter(l => !l.forma_pagamento)
    else dados = dados.filter(l => l.forma_pagamento === pagFilter)
  }
  if (mesFilter) {
    dados = dados.filter(l => l.data.startsWith(mesFilter))
  }
  if (descFilter) {
    dados = dados.filter(l => (l.descricao || '').toLowerCase().includes(descFilter))
  }
  dados.sort((a, b) => b.data.localeCompare(a.data))

  const tbody = document.getElementById('fin-tbody-lancamentos')
  if (!tbody) return

  tbody.innerHTML = dados.map(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    const tipo = cod?.tipo || '—'
    const cls  = tipo === 'receita' ? 'fin-receita' : 'fin-despesa'
    return `<tr>
      <td>${_fmtDate(l.data)}</td>
      <td>${l.grupo_nome && l.grupo_nome.toLowerCase() !== l.tipo
        ? `<span style="color:var(--text-muted);font-size:.76em;margin-right:2px">${l.grupo_nome} ›</span>${l.categoria_nome}`
        : l.categoria_nome}</td>
      <td class="${cls}">${tipo}</td>
      <td>${_finPagBadge(l.forma_pagamento)}</td>
      <td>${l.descricao || '—'}</td>
      <td class="fin-col-valor ${cls}">${_fmtBRL(l.valor)}</td>
      <td><button class="fin-del-btn" onclick="deleteLancamentoFin(${l.id})">✕</button></td>
    </tr>`
  }).join('')

  // Resumo
  let totalRec = 0, totalDesp = 0
  dados.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita')  totalRec  += Number(l.valor)
    if (cod?.tipo === 'despesa') totalDesp += Number(l.valor)
  })
  const resumo = document.getElementById('fin-lanc-resumo')
  if (resumo) {
    resumo.innerHTML = `
      <span>Receitas: <b class="fin-receita">${_fmtBRL(totalRec)}</b></span>
      <span>Despesas: <b class="fin-despesa">${_fmtBRL(totalDesp)}</b></span>
      <span>Saldo: <b style="color:${totalRec - totalDesp >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(totalRec - totalDesp)}</b></span>
    `
  }
}

async function deleteLancamentoFin(id) {
  await deleteLancamento(id)
  window.finLancamentos = window.finLancamentos.filter(l => l.id !== id)
  renderLancamentos()
  if (_finActiveTab === 'overview') renderFinOverview()
  _showFinToast('Lançamento removido')
}

// ── ORÇAMENTO ─────────────────────────────────────────────────────────────────

function renderOrcamento() {
  const mesFilter  = document.getElementById('fin-orc-filter-mes')?.value || ''
  let refAno, refMes
  if (mesFilter) {
    ;[refAno, refMes] = mesFilter.split('-').map(Number)
  } else {
    const now = new Date()
    refAno = now.getFullYear(); refMes = now.getMonth() + 1
  }

  const mesStr   = `${refAno}-${String(refMes).padStart(2, '0')}`
  const mesLabel = new Date(refAno, refMes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const realizado = {}
  window.finLancamentos
    .filter(l => l.data.startsWith(mesStr))
    .forEach(l => { realizado[l.cd_financa] = (realizado[l.cd_financa] || 0) + Number(l.valor) })

  _renderRecorrentePanel(refAno, refMes, mesLabel, realizado)
  _renderCreditoPanel(refAno, refMes, mesLabel)

  // Painel de detalhes (acorde\u00e3o completo)
  const orc = _effectiveOrcamento(refAno, refMes)
  const mensais = orc.filter(o => o.mes !== null)
  const anuais  = orc.filter(o => o.mes === null)
  const detEl  = document.getElementById('fin-orc-list')
  if (!detEl) return
  let html = ''
  if (mensais.length > 0) {
    html += `<div class="fin-orc-section-label">Vigente \u2014 ${mesLabel}</div>`
    html += _buildOrcGroupHtml(_buildOrcTree(mensais, realizado), true, 'tab-m')
  }
  if (anuais.length > 0) {
    html += `<div class="fin-orc-section-label" style="margin-top:20px">Base anual</div>`
    html += _buildOrcGroupHtml(_buildOrcTree(anuais, realizado), true, 'tab-a')
  }
  if (!html) html = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum or\u00e7amento para o per\u00edodo.</p>'
  detEl.innerHTML = html
}

// ── PAINEL RECORRENTE ─────────────────────────────────────────────────────────

function _getDescendantIds(id) {
  const filhos = window.finCodigos.filter(c => c.cd_pai === id).map(c => c.id)
  return filhos.reduce((acc, fid) => acc.concat(fid, _getDescendantIds(fid)), [])
}

function _renderRecorrentePanel(ano, mes, mesLabel, realizadoMap) {
  const container = document.getElementById('fin-rec-panel')
  if (!container) return

  const orc = _effectiveOrcamento(ano, mes)

  // ── summary ────────────────────────────────────────────────────────────────
  // IDs de todas as categorias recorrentes (id=6) e pontuais (id=8)
  const recIds    = _getDescendantIds(6)
  const pontIds   = _getDescendantIds(8)
  const recEntIds = _getDescendantIds(4).concat(_getDescendantIds(5))  // Salario + Bonus

  const sumOrc  = (ids) => orc.filter(o => ids.includes(o.cd_financa) && o.mes !== null).reduce((s, o) => s + Number(o.valor_orcado), 0)
  const sumReal = (ids) => Object.entries(realizadoMap).filter(([id]) => ids.includes(Number(id))).reduce((s, [, v]) => s + v, 0)

  const prevEntradas = sumOrc(recEntIds)
  const realEntradas = sumReal(recEntIds)
  const prevRec      = sumOrc(recIds)
  const realRec      = sumReal(recIds)
  const prevPont     = sumOrc(pontIds)
  const realPont     = sumReal(pontIds)
  const prevSaldo    = prevEntradas - prevRec - prevPont
  const realSaldo    = realEntradas - realRec - realPont
  const totalCredito = window.finLancamentos
    .filter(l => l.data.startsWith(`${ano}-${String(mes).padStart(2,'0')}`) && l.forma_pagamento === 'credito')
    .reduce((s, l) => s + Number(l.valor), 0)
  const totalCreditoOrc = orc
    .filter(o => o.forma_pagamento === 'credito' && o.mes !== null)
    .reduce((s, o) => s + Number(o.valor_orcado), 0)

  const _pct = (real, prev) => prev > 0 ? ((real / prev) * 100).toFixed(0) + '%' : '\u2014'
  const _cls = (real, prev, invert = false) => {
    if (prev === 0 && real === 0) return ''
    const over = real > prev
    return (invert ? !over : over) ? 'fin-over' : 'fin-under'
  }

  const summaryHtml = `
    <div class="fin-rec-summary">
      <div class="fin-rec-month">${mesLabel}</div>
      <table class="fin-rec-sum-table">
        <thead><tr><th></th><th>Previsto</th><th>Real</th><th>%</th></tr></thead>
        <tbody>
          <tr class="fin-rec-sum-section"><td colspan="4">Entradas</td></tr>
          <tr><td>Sal\u00e1rio / Bonus</td>
            <td>${_fmtBRL(prevEntradas)}</td>
            <td class="${_cls(realEntradas, prevEntradas, true)}">${_fmtBRL(realEntradas)}</td>
            <td>${_pct(realEntradas, prevEntradas)}</td></tr>
          <tr class="fin-rec-sum-section"><td colspan="4">Gastos</td></tr>
          <tr><td>Recorrente</td>
            <td>${_fmtBRL(prevRec)}</td>
            <td class="${_cls(realRec, prevRec)}">${_fmtBRL(realRec)}</td>
            <td>${_pct(realRec, prevRec)}</td></tr>
          <tr><td>Pontual</td>
            <td>${prevPont > 0 ? _fmtBRL(prevPont) : '\u2014'}</td>
            <td class="${_cls(realPont, prevPont)}">${realPont > 0 ? _fmtBRL(realPont) : '\u2014'}</td>
            <td>${_pct(realPont, prevPont)}</td></tr>
          <tr class="fin-rec-sum-saldo"><td>Saldo</td>
            <td style="color:${prevSaldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(prevSaldo)}</td>
            <td style="color:${realSaldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(realSaldo)}</td>
            <td></td></tr>
          <tr class="fin-rec-sum-credito"><td>Cart\u00e3o cr\u00e9dito</td>
            <td>${totalCreditoOrc > 0 ? _fmtBRL(totalCreditoOrc) : '\u2014'}</td>
            <td style="color:${totalCreditoOrc > 0 && totalCredito > totalCreditoOrc ? 'var(--danger)' : '#7c9eff'}">${_fmtBRL(totalCredito)}</td>
            <td>${totalCreditoOrc > 0 ? ((totalCredito / totalCreditoOrc) * 100).toFixed(0) + '%' : ''}</td></tr>
        </tbody>
      </table>
    </div>`

  // ── colunas por tipo (filhos diretos de Recorrente=6) ───────────────────
  // Após a migração: Recorrente → Obrigatória, Luxo
  const typeOrder = ['Obrigatória', 'Luxo']
  const typeNodes = window.finCodigos
    .filter(c => c.cd_pai === 6)
    .sort((a, b) => {
      const ia = typeOrder.indexOf(a.nome), ib = typeOrder.indexOf(b.nome)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.nome.localeCompare(b.nome)
    })

  const typeColsHtml = typeNodes.map(typeNode => {
    const orcType = orc.filter(o =>
      _getDescendantIds(typeNode.id).includes(o.cd_financa) && o.mes !== null
    ).sort((a, b) => _finNome(a.cd_financa).localeCompare(_finNome(b.cd_financa)))

    if (orcType.length === 0) return ''

    const totalPrev = orcType.reduce((s, o) => s + Number(o.valor_orcado), 0)
    const totalReal = orcType.reduce((s, o) => s + (realizadoMap[o.cd_financa] || 0), 0)
    const totalOver = totalReal > totalPrev

    const rows = orcType.map(o => {
      const prev = Number(o.valor_orcado)
      const real = realizadoMap[o.cd_financa] || 0
      const over = real > prev
      const pct  = prev > 0 ? ((real / prev) * 100).toFixed(0) : '\u2014'
      const diffCls = real === 0 ? '' : (over ? 'fin-over' : 'fin-under')
      return `<tr>
        <td class="fin-rec-cat-name">${_finNome(o.cd_financa)}</td>
        <td class="fin-rec-val">${_fmtBRL(prev)}</td>
        <td class="fin-rec-val ${over ? 'fin-over' : (real > 0 ? 'fin-under' : '')}">${_fmtBRL(real)}</td>
        <td class="fin-rec-pct ${diffCls}">${pct}%</td>
      </tr>`
    }).join('')

    return `<div class="fin-rec-dono-col">
      <div class="fin-rec-dono-hd">
        <span class="fin-rec-dono-name">${typeNode.nome}</span>
        <div class="fin-rec-dono-totals">
          <span>${_fmtBRL(totalPrev)}</span>
          <span class="${totalOver ? 'fin-over' : 'fin-under'}">${_fmtBRL(totalReal)}</span>
        </div>
      </div>
      <div class="fin-rec-dono-bar-bg">
        <div class="fin-rec-dono-bar-fill ${totalOver ? 'fin-over-bg' : ''}"
             style="width:${totalPrev > 0 ? Math.min((totalReal/totalPrev)*100,100) : 0}%"></div>
      </div>
      <table class="fin-rec-cat-table">
        <thead><tr><th>Categoria</th><th>Prev.</th><th>Real</th><th>%</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
  }).join('')

  container.innerHTML = `
    <div class="fin-rec-layout">
      ${summaryHtml}
      <div class="fin-rec-donos">${typeColsHtml || '<p style="color:var(--text-muted);padding:20px">Sem dados recorrentes para o per\u00edodo.</p>'}</div>
    </div>`
}


async function deleteOrcamentoFin(id) {
  await deleteOrcamento(id)
  window.finOrcamento = window.finOrcamento.filter(o => o.id !== id)
  renderFinOverview()
  _showFinToast('Orçamento removido')
}

function _renderCreditoPanel(ano, mes, mesLabel) {
  const container = document.getElementById('fin-credito-panel')
  if (!container) return

  const mesStr = `${ano}-${String(mes).padStart(2, '0')}`

  const orcCredito = _effectiveOrcamento(ano, mes).filter(o => o.forma_pagamento === 'credito' && o.mes !== null)
  const orcMap = {}
  orcCredito.forEach(o => { orcMap[o.cd_financa] = (orcMap[o.cd_financa] || 0) + Number(o.valor_orcado) })

  const lancCredito = window.finLancamentos.filter(l =>
    l.data.startsWith(mesStr) && l.forma_pagamento === 'credito'
  )
  const lancMap = {}
  lancCredito.forEach(l => { lancMap[l.cd_financa] = (lancMap[l.cd_financa] || 0) + Number(l.valor) })

  const allIds = [...new Set([...Object.keys(orcMap).map(Number), ...Object.keys(lancMap).map(Number)])]

  if (allIds.length === 0) {
    container.innerHTML = `
      <div class="dash-card" style="margin-top:16px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="dash-card-title" style="color:#7c9eff">Cart\u00e3o de Cr\u00e9dito \u2014 ${mesLabel}</div>
          <button class="btn-add" onclick="openFinModal('orcamento')">+ Or\u00e7amento</button>
        </div>
        <p style="color:var(--text-muted);font-size:.85rem;padding:12px 0 4px">Nenhum lan\u00e7amento de cr\u00e9dito no per\u00edodo.</p>
      </div>`
    return
  }

  const totalOrc  = Object.values(orcMap).reduce((s, v) => s + v, 0)
  const totalReal = Object.values(lancMap).reduce((s, v) => s + v, 0)
  const barPct    = totalOrc > 0 ? Math.min((totalReal / totalOrc) * 100, 100) : 0
  const over      = totalOrc > 0 && totalReal > totalOrc

  const rows = allIds
    .sort((a, b) => ((orcMap[b] || 0) - (orcMap[a] || 0)) || ((lancMap[b] || 0) - (lancMap[a] || 0)))
    .map(id => {
      const orc  = orcMap[id]  || 0
      const real = lancMap[id] || 0
      const pctVal  = orc > 0 ? ((real / orc) * 100).toFixed(0) + '%' : '\u2014'
      const net = real - orc
      const netFmt = orc > 0 ? (net >= 0 ? '+' : '') + _fmtBRL(net) : '\u2014'
      return `<tr>
        <td class="fin-rec-cat-name">${_finNome(id)}</td>
        <td class="fin-rec-val">${orc > 0 ? _fmtBRL(orc) : '\u2014'}</td>
        <td class="fin-rec-val">${_fmtBRL(real)}</td>
        <td class="fin-rec-val">${netFmt}</td>
        <td class="fin-rec-pct">${pctVal}</td>
      </tr>`
    }).join('')

  container.innerHTML = `
    <div class="dash-card" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="dash-card-title" style="color:#7c9eff">Cart\u00e3o de Cr\u00e9dito \u2014 ${mesLabel}</div>
        <button class="btn-add" onclick="openFinModal('orcamento')">+ Or\u00e7amento</button>
      </div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px">
        <span style="font-size:1.4rem;font-weight:700;color:#7c9eff">${_fmtBRL(totalReal)}</span>
        ${totalOrc > 0 ? `<span style="color:var(--text-muted);font-size:.85rem">de ${_fmtBRL(totalOrc)} or\u00e7ado \u2014 ${((totalReal / totalOrc) * 100).toFixed(0)}%</span>` : ''}
      </div>
      ${totalOrc > 0 ? `<div class="fin-orc-bar-bg" style="margin-bottom:14px"><div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${barPct}%"></div></div>` : ''}
      <table class="fin-rec-cat-table">
        <thead><tr><th>Categoria</th><th>Orçado</th><th>Realizado</th><th>Δ</th><th>%</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

// ── INVESTIMENTOS ─────────────────────────────────────────────────────────────

function renderInvestimentos() {
  const mesFilter = document.getElementById('fin-inv-filter-mes')?.value || ''
  let ano, mes
  if (mesFilter) {
    ;[ano, mes] = mesFilter.split('-').map(Number)
  } else {
    const now = new Date()
    ano = now.getFullYear(); mes = now.getMonth() + 1
  }
  const mesStr  = `${ano}-${String(mes).padStart(2, '0')}`
  const prevStr = mes === 1
    ? `${ano - 1}-12`
    : `${ano}-${String(mes - 1).padStart(2, '0')}`
  const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const latestUpTo    = (snaps, upTo) =>
    snaps.filter(s => s.data.slice(0, 7) <= upTo)
         .sort((a, b) => b.data.localeCompare(a.data))[0] || null
  const latestInMonth = (snaps, mk) =>
    snaps.filter(s => s.data.slice(0, 7) === mk)
         .sort((a, b) => b.data.localeCompare(a.data))[0] || null

  const indicIds = new Set([78, ..._getDescendantIds(78)])

  // ── INVESTIMENTOS ──────────────────────────────────────────────────────────
  const invContainer = document.getElementById('fin-inv-cards')
  const invSnaps = window.finInvestimentos.filter(s => !indicIds.has(s.cd_financa))
  const snapsPorCat = {}
  invSnaps.forEach(s => {
    if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = []
    snapsPorCat[s.cd_financa].push(s)
  })
  const cats = window.finCodigos.filter(c =>
    c.tipo === 'investimento' && !indicIds.has(c.id) && snapsPorCat[c.id]?.length > 0
  )

  if (invContainer) {
    if (cats.length === 0) {
      invContainer.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum snapshot de investimento registrado.</p>'
      _renderChartInvestimentos({}, [])
    } else {
      let totalAtual = 0, totalAnterior = 0, prevCount = 0
      const cardsData = cats.map(cat => {
        const snaps    = snapsPorCat[cat.id] || []
        const curSnap  = latestUpTo(snaps, mesStr)
        const prevSnap = latestInMonth(snaps, prevStr)
        if (!curSnap) return null
        const saldo = Number(curSnap.saldo)
        totalAtual += saldo
        if (prevSnap) { totalAnterior += Number(prevSnap.saldo); prevCount++ }
        return { id: cat.id, nome: cat.nome, saldo, prevSaldo: prevSnap ? Number(prevSnap.saldo) : null }
      }).filter(Boolean).sort((a, b) => b.saldo - a.saldo)

      const cardsHtml = cardsData.map(({ id, nome, saldo, prevSaldo }) => {
        let deltaHtml = ''
        if (prevSaldo !== null) {
          const delta = saldo - prevSaldo
          deltaHtml = `<div class="fin-inv-card-rend ${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${_fmtBRL(delta)} no m\u00eas</div>`
        }
        const isSelected = window._finInvSelected === id
        return `<div class="fin-inv-card${isSelected ? ' fin-inv-card-selected' : ''}" style="cursor:pointer" onclick="_filterInvChart(${id})">
          <div class="fin-inv-card-name">${nome}</div>
          <div class="fin-inv-card-saldo">${_fmtBRL(saldo)}</div>
          ${deltaHtml}
        </div>`
      }).join('')

      const totalDelta = prevCount > 0 ? totalAtual - totalAnterior : null
      const totalDeltaHtml = totalDelta !== null
        ? `<div class="fin-inv-card-rend ${totalDelta >= 0 ? 'pos' : 'neg'}">${totalDelta >= 0 ? '+' : ''}${_fmtBRL(totalDelta)} no m\u00eas</div>`
        : ''
      const totalCard = `<div class="fin-inv-card fin-inv-card-total">
        <div class="fin-inv-card-name">Total geral</div>
        <div class="fin-inv-card-saldo">${_fmtBRL(totalAtual)}</div>
        ${totalDeltaHtml}
      </div>`

      invContainer.innerHTML = totalCard + cardsHtml

      // guarda referência para re-filtrar sem re-render completo
      window._finInvSnapsPorCat = snapsPorCat
      window._finInvCats = cats
      _renderChartInvestimentos(snapsPorCat, cats)
    }
  }

  // ── INDICADORES ────────────────────────────────────────────────────────────
  const indContainer = document.getElementById('fin-ind-content')
  if (!indContainer) return

  const indicIdsList = [78, ..._getDescendantIds(78)]
  const indSnaps = window.finInvestimentos.filter(s => indicIdsList.includes(s.cd_financa))
  const indSnapsPorCat = {}
  indSnaps.forEach(s => {
    if (!indSnapsPorCat[s.cd_financa]) indSnapsPorCat[s.cd_financa] = []
    indSnapsPorCat[s.cd_financa].push(s)
  })
  const indCats = [...new Map(indSnaps.map(s => [s.cd_financa, s.nome])).entries()]
    .map(([id, nome]) => ({ id, nome }))
    .filter(c => (indSnapsPorCat[c.id] || []).some(s => s.data.slice(0, 7) <= mesStr))

  // Sort indicator cats by current saldo desc
  indCats.sort((a, b) => {
    const va = latestUpTo(indSnapsPorCat[a.id] || [], mesStr)
    const vb = latestUpTo(indSnapsPorCat[b.id] || [], mesStr)
    return (vb ? Number(vb.saldo) : 0) - (va ? Number(va.saldo) : 0)
  })

  if (indCats.length === 0) { indContainer.innerHTML = ''; return }

  const indCardsHtml = indCats.map(cat => {
    const snaps    = indSnapsPorCat[cat.id] || []
    const curSnap  = latestUpTo(snaps, mesStr)
    const prevSnap = latestInMonth(snaps, prevStr)
    if (!curSnap) return ''
    const val = Number(curSnap.saldo)
    let deltaHtml = ''
    if (prevSnap) {
      const delta = val - Number(prevSnap.saldo)
      deltaHtml = `<div class="fin-inv-card-rend ${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${Number(delta).toLocaleString('pt-BR')} no m\u00eas</div>`
    }
    const isSelected = window._finIndSelected === cat.id
    return `<div class="fin-inv-card${isSelected ? ' fin-inv-card-selected' : ''}" style="cursor:pointer" onclick="_filterIndChart(${cat.id})">
      <div class="fin-inv-card-name">${cat.nome}</div>
      <div class="fin-inv-card-saldo">${Number(val).toLocaleString('pt-BR')}</div>
      ${deltaHtml}
    </div>`
  }).filter(Boolean).join('')

  indContainer.innerHTML = `
    <div class="fin-inv-section-label">Indicadores — ${mesLabel}</div>
    <div class="fin-inv-cards">${indCardsHtml}</div>`

  // guarda referência para re-filtrar sem chamar renderInvestimentos inteiro
  window._finIndSnapsPorCat = indSnapsPorCat
  window._finIndCats = indCats
  _renderChartIndicadores(indSnapsPorCat, indCats)
}

function _filterInvChart(catId) {
  if (window._finInvSelected === catId) {
    window._finInvSelected = null
  } else {
    window._finInvSelected = catId
  }
  // atualiza borda dos cards (pula o primeiro = total geral)
  const cards = document.querySelectorAll('#fin-inv-cards .fin-inv-card:not(.fin-inv-card-total)')
  cards.forEach(el => el.classList.remove('fin-inv-card-selected'))
  if (window._finInvSelected !== null) {
    const idx = (window._finInvCats || []).findIndex(c => c.id === window._finInvSelected)
    if (cards[idx]) cards[idx].classList.add('fin-inv-card-selected')
  }
  const cats = window._finInvSelected !== null
    ? (window._finInvCats || []).filter(c => c.id === window._finInvSelected)
    : (window._finInvCats || [])
  const snaps = window._finInvSelected !== null
    ? { [window._finInvSelected]: (window._finInvSnapsPorCat || {})[window._finInvSelected] || [] }
    : (window._finInvSnapsPorCat || {})
  _renderChartInvestimentos(snaps, cats)
}

function _filterIndChart(catId) {
  if (window._finIndSelected === catId) {
    window._finIndSelected = null  // segundo clique = limpa filtro
  } else {
    window._finIndSelected = catId
  }
  // atualiza borda dos cards
  document.querySelectorAll('#fin-ind-content .fin-inv-card').forEach(el => {
    el.classList.remove('fin-inv-card-selected')
  })
  if (window._finIndSelected !== null) {
    const idx = (window._finIndCats || []).findIndex(c => c.id === window._finIndSelected)
    const cards = document.querySelectorAll('#fin-ind-content .fin-inv-card')
    if (cards[idx]) cards[idx].classList.add('fin-inv-card-selected')
  }
  // re-renderiza gráfico com filtro
  const cats = window._finIndSelected !== null
    ? (window._finIndCats || []).filter(c => c.id === window._finIndSelected)
    : (window._finIndCats || [])
  _renderChartIndicadores(window._finIndSnapsPorCat || {}, cats)
}

function _renderChartInvestimentos(snapsPorCat, cats) {
  const canvas = document.getElementById('fin-chart-inv')
  if (!canvas) return
  _destroyChart('inv')

  // Coletar todas as datas únicas e ordenar
  const allDates = [...new Set(window.finInvestimentos.map(s => s.data))].sort()
  if (allDates.length === 0) return

  const COLORS = ['#4ecca3','#7c9eff','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c']

  const datasets = cats.filter(c => snapsPorCat[c.id]?.length > 0).map((cat, i) => {
    const snaps = snapsPorCat[cat.id] || []
    return {
      label: cat.nome,
      data: allDates.map(d => {
        const s = snaps.filter(x => x.data <= d).sort((a, b) => b.data.localeCompare(a.data))[0]
        return s ? Number(s.saldo) : null
      }),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      fill: false,
      tension: 0.3,
      spanGaps: true,
    }
  })

  _finChartsInstances['inv'] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: allDates.map(d => _fmtDate(d)),
      datasets,
    },
    options: {
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => _fmtBRL(v) }, grid: { color: '#2a2f2c' } },
      },
      plugins: {
        legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + _fmtBRL(ctx.raw) } },
      },
    },
  })
}

async function deleteInvestimentoFin(id) {
  await deleteInvestimento(id)
  window.finInvestimentos = window.finInvestimentos.filter(s => s.id !== id)
  renderInvestimentos()
  _showFinToast('Registro removido')
}

function _renderChartIndicadores(snapsPorCat, cats) {
  const card   = document.getElementById('fin-ind-chart-card')
  const canvas = document.getElementById('fin-chart-ind')
  if (!canvas) return
  _destroyChart('ind')

  if (!cats || cats.length === 0) {
    if (card) card.style.display = 'none'
    return
  }
  if (card) card.style.display = ''

  const allSnaps = Object.values(snapsPorCat).flat()
  const allDates = [...new Set(allSnaps.map(s => s.data))].sort()
  if (allDates.length === 0) return

  const COLORS = ['#7c9eff','#4ecca3','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c']

  const datasets = cats.map((cat, i) => {
    const snaps = snapsPorCat[cat.id] || []
    return {
      label: cat.nome,
      data: allDates.map(d => {
        const s = snaps.filter(x => x.data <= d).sort((a, b) => b.data.localeCompare(a.data))[0]
        return s ? Number(s.saldo) : null
      }),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      fill: false,
      tension: 0.3,
      spanGaps: true,
    }
  })

  _finChartsInstances['ind'] = new Chart(canvas, {
    type: 'line',
    data: { labels: allDates.map(d => _fmtDate(d)), datasets },
    options: {
      scales: {
        x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } },
        y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v => Number(v).toLocaleString('pt-BR') }, grid: { color: '#2a2f2c' } },
      },
      plugins: {
        legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } },
        datalabels: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + Number(ctx.raw).toLocaleString('pt-BR') } },
      },
    },
  })
}

// ── INDICADORES ───────────────────────────────────────────────────────────────
// Mostra snapshots cujo cd_financa é descendente do nó 78 (indicadores não-financeiros)

function renderIndicadores() {
  const mesFilter = document.getElementById('fin-ind-filter-mes')?.value || ''
  // Nó raiz dos indicadores = 78; inclui o próprio nó e todos os descendentes
  const indicIds = [78, ..._getDescendantIds(78)]
  let snaps = window.finInvestimentos.filter(s => indicIds.includes(s.cd_financa))
  if (mesFilter) snaps = snaps.filter(s => s.data.startsWith(mesFilter))

  const container = document.getElementById('fin-ind-content')
  if (!container) return

  if (snaps.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum indicador registrado' + (mesFilter ? ' para o período.' : '.') + '</p>'
    return
  }

  // Pivot: linhas = meses, colunas = categorias
  const allMes = [...new Set(snaps.map(s => s.data.slice(0,7)))].sort().reverse().slice(0, 18)
  const allCats = [...new Map(snaps.map(s => [s.cd_financa, s.nome])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id, nome]) => ({ id, nome }))

  const lookup = {}
  snaps.forEach(s => {
    const mk = s.data.slice(0,7)
    if (!lookup[mk]) lookup[mk] = {}
    // Usa o valor mais recente do mês (último snapshot)
    if (!lookup[mk][s.cd_financa] || s.data > lookup[mk][s.cd_financa].data)
      lookup[mk][s.cd_financa] = s
  })

  // Pivot: colunas = [ Valor | Δ | Δ% ] por categoria
  const header = '<tr><th>Mês</th>' +
    allCats.flatMap(c => [
      `<th>${c.nome}</th>`,
      '<th class="fin-ind-delta-h">Δ</th>',
      '<th class="fin-ind-delta-h">Δ%</th>',
    ]).join('') + '</tr>'

  const rows = allMes.map((mk, idx) => {
    const prevMk = allMes[idx + 1] || null
    const [y, m] = mk.split('-')
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const cells = allCats.flatMap(c => {
      const cur  = lookup[mk]?.[c.id]
      const prev = prevMk ? lookup[prevMk]?.[c.id] : null
      const curVal  = cur  ? Number(cur.saldo)  : null
      const prevVal = prev ? Number(prev.saldo) : null

      const valCell = `<td>${curVal !== null ? Number(curVal).toLocaleString('pt-BR') : '—'}</td>`
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

// ── MODAL ─────────────────────────────────────────────────────────────────────

function openFinModal(type) {
  // Se dados ainda não carregaram (ex.: clique do botão de ação rápida antes de entrar na seção)
  if (!window.finCodigos || window.finCodigos.length === 0) {
    initFinancesSection().then(() => openFinModal(type))
    return
  }

  // Esconder todos os formulários
  ;['lancamento','orcamento','investimento','indicador','categoria'].forEach(t => {
    const el = document.getElementById('fin-form-' + t)
    if (el) el.style.display = t === type ? 'block' : 'none'
  })

  // Pré-preenchimento
  const today = new Date().toISOString().slice(0, 10)
  const ym    = today.slice(0, 7)

  if (type === 'lancamento') {
    document.getElementById('fin-lanc-data').value  = today
    const tipoEl = document.getElementById('fin-lanc-tipo')
    populateFinCatSelect('fin-lanc-cat', tipoEl.value)
  }
  if (type === 'orcamento') {
    const now = new Date()
    document.getElementById('fin-orc-ano').value     = now.getFullYear()
    document.getElementById('fin-orc-mes-sel').value = now.getMonth() + 1
    const tipoEl = document.getElementById('fin-orc-tipo')
    populateFinCatSelect('fin-orc-cat', tipoEl.value)
  }
  if (type === 'investimento') {
    document.getElementById('fin-inv-data').value = today
    populateFinCatSelect('fin-inv-cat', 'investimento')
  }
  if (type === 'indicador') {
    document.getElementById('fin-ind-mes').value = ym
    toggleFinIndNome(document.getElementById('fin-ind-tipo').value)
  }
  if (type === 'categoria') {
    _populatePaiSelect()
  }

  const overlay = document.getElementById('fin-modal-overlay')
  overlay.classList.add('open')
}

function closeFinModal() {
  document.getElementById('fin-modal-overlay').classList.remove('open')
}

function closeFinModalOutside(e) {
  if (e.target === document.getElementById('fin-modal-overlay')) closeFinModal()
}

// Fechar com Esc (registrado no app.js via keydown genérico)
// O app.js não conhece closeFinModal, então registrar aqui:
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFinModal()
})

// ── DROPDOWN DE CATEGORIAS ────────────────────────────────────────────────────

function populateFinCatSelect(selectId, tipo, paiOnly = false) {
  const sel = document.getElementById(selectId)
  if (!sel) return

  let cats = window.finCodigos.filter(c => c.tipo === tipo)
  if (paiOnly) cats = cats.filter(c => c.cd_pai === null || c.cd_pai === undefined)
  cats.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  sel.innerHTML = cats.length
    ? cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
    : '<option value="">— Nenhuma categoria —</option>'
}

function _populatePaiSelect() {
  const sel = document.getElementById('fin-cat-pai')
  if (!sel) return
  const tipoEl   = document.getElementById('fin-cat-tipo')
  const tipo     = tipoEl?.value || 'despesa'
  const pais     = window.finCodigos
    .filter(c => c.tipo === tipo && (c.cd_pai === null || c.cd_pai === undefined))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  sel.innerHTML  = '<option value="">— Nenhum (criar grupo) —</option>'
    + pais.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
}

// Quando o tipo muda no form categoria, reiniciar a lista de pais
function _onFinCatTipoChange() {
  _populatePaiSelect()
}

function toggleFinIndNome(tipo) {
  const wrap = document.getElementById('fin-ind-nome-wrap')
  if (wrap) wrap.style.display = tipo === 'custom' ? 'block' : 'none'
}

// ── SUBMIT FORMS ──────────────────────────────────────────────────────────────

async function submitLancamento() {
  const data      = document.getElementById('fin-lanc-data').value
  const cd        = Number(document.getElementById('fin-lanc-cat').value)
  const valor     = parseFloat(document.getElementById('fin-lanc-valor').value)
  const descricao = document.getElementById('fin-lanc-desc').value.trim()
  const pagamento = document.getElementById('fin-lanc-pagamento').value || null

  if (!data || !cd || isNaN(valor) || valor <= 0) {
    _showFinToastErro('Preencha data, categoria e valor.'); return
  }

  const res = await postLancamento({ data, cd_financa: cd, valor, descricao: descricao || null, forma_pagamento: pagamento })
  if (!res?.ok) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast('Lançamento adicionado!')
}

async function submitOrcamento() {
  const ano     = parseInt(document.getElementById('fin-orc-ano').value)
  const mesVal  = document.getElementById('fin-orc-mes-sel').value
  const mes     = mesVal ? parseInt(mesVal) : null
  const cd      = Number(document.getElementById('fin-orc-cat').value)
  const valor   = parseFloat(document.getElementById('fin-orc-valor').value)
  const pagamento = document.getElementById('fin-orc-pagamento').value || null

  if (!ano || !cd || isNaN(valor) || valor <= 0) {
    _showFinToastErro('Preencha ano, categoria e valor.'); return
  }

  const res = await postOrcamento({ ano, mes, cd_financa: cd, valor_orcado: valor, forma_pagamento: pagamento })
  if (!res?.ok) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast('Orçamento salvo!')
}

async function submitInvestimento() {
  const data  = document.getElementById('fin-inv-data').value
  const cd    = Number(document.getElementById('fin-inv-cat').value)
  const saldo = parseFloat(document.getElementById('fin-inv-saldo').value)

  if (!data || !cd || isNaN(saldo)) {
    _showFinToastErro('Preencha todos os campos.'); return
  }

  const res = await postInvestimento({ data, cd_financa: cd, saldo })
  if (!res?.ok) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast('Saldo registrado!')
}

async function submitIndicador() {
  const mesStr = document.getElementById('fin-ind-mes').value
  const tipo   = document.getElementById('fin-ind-tipo').value
  const valor  = parseFloat(document.getElementById('fin-ind-valor').value)
  const nome   = document.getElementById('fin-ind-nome').value.trim()

  if (!mesStr || isNaN(valor)) {
    _showFinToastErro('Preencha período e valor.'); return
  }
  if (tipo === 'custom' && !nome) {
    _showFinToastErro('Informe o nome do indicador.'); return
  }

  const [ano, mes] = mesStr.split('-').map(Number)
  const res = await postIndicador({ ano, mes, tipo, nome: tipo === 'custom' ? nome : tipo, valor })
  if (!res?.ok) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast('Indicador salvo!')
}

async function submitCategoria() {
  const nome   = document.getElementById('fin-cat-nome').value.trim()
  const tipo   = document.getElementById('fin-cat-tipo').value
  const paiEl  = document.getElementById('fin-cat-pai')
  const cd_pai = paiEl.value ? Number(paiEl.value) : null

  if (!nome) { _showFinToastErro('Informe o nome da categoria.'); return }

  const res = await postFinancaCodigo({ nome, tipo, cd_pai })
  if (!res?.id) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast('Categoria criada!')
}

// ── TOAST ─────────────────────────────────────────────────────────────────────

function _showFinToast(msg) {
  let el = document.getElementById('fin-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'fin-toast'
    el.className = 'success-toast'
    document.body.appendChild(el)
  }
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2400)
}

function _showFinToastErro(msg) {
  let el = document.getElementById('fin-toast-erro')
  if (!el) {
    el = document.createElement('div')
    el.id = 'fin-toast-erro'
    el.className = 'success-toast'
    el.style.background = 'var(--danger)'
    document.body.appendChild(el)
  }
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2800)
}

// ── VIAGENS ───────────────────────────────────────────────────────────────────

const _VIAG_COLORS = [
  '#b4ff50','#7c9eff','#ff9f47','#ff6b6b','#f5d742',
  '#a78bfa','#34d399','#fb7185','#38bdf8','#fbbf24'
]
let _viagCatSel  = null   // categoria selecionada no donut
let _viagViagSel = null   // viagem selecionada na barra
let _viagAll     = []     // viagens atuais (para redraw do cross-filter)
let _viagTotal   = 0

async function renderViagens() {
  window.finViagens = await fetchViagens() || []

  const list       = document.getElementById('fin-viagens-list')
  const chartsWrap = document.getElementById('fin-viag-charts')
  if (!list) return

  // ordena por data decrescente
  const viagens = window.finViagens.slice().sort((a, b) => {
    const dA = a.lancamentos[0]?.data || ''
    const dB = b.lancamentos[0]?.data || ''
    return dB.localeCompare(dA)
  })

  _viagAll     = viagens
  _viagTotal   = viagens.reduce((s, v) => s + v.total, 0)
  _viagCatSel  = null
  _viagViagSel = null

  if (!viagens.length) {
    if (chartsWrap) chartsWrap.style.display = 'none'
    list.innerHTML = `<div class="empty-state" style="padding:60px 0">
      <div class="empty-icon">✈</div>
      <p>Nenhuma viagem registrada.<br>Crie lançamentos com categoria <b>Travel</b> para aparecerem aqui.</p>
    </div>`
    return
  }

  if (chartsWrap) chartsWrap.style.display = 'grid'
  _redrawViagCharts()

  // Cards accordion
  list.innerHTML = viagens.map((v, idx) => {
    const lancs = v.lancamentos.slice().sort((a, b) => b.valor - a.valor)
    const linhas = lancs.map(l => `
      <tr>
        <td>${_fmtDate(l.data)}</td>
        <td>${l.categoria_nome}</td>
        <td>${l.descricao || '—'}</td>
        <td>${_finPagBadge(l.forma_pagamento)}</td>
        <td class="fin-col-valor fin-despesa">${_fmtBRL(l.valor)}</td>
        <td><button class="fin-del-btn" title="Desvincular" onclick="_viajemUnlink(${l.id})">✕</button></td>
      </tr>`).join('')

    const safeId = 'viag-body-' + idx
    return `
    <div class="viag-card">
      <div class="viag-card-header viag-accordion-trigger" onclick="_viagToggle('${safeId}', this)">
        <div class="viag-card-title-row">
          <span class="viag-nome">✈ ${v.nome_viagem}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="viag-rename-btn" onclick="event.stopPropagation();_viagemRenamePrompt('${v.lancamentos[0]?.id}', '${v.nome_viagem.replace(/'/g, "\\'")}')">✎ renomear</button>
            <span class="viag-chevron">▾</span>
          </div>
        </div>
        <div class="viag-card-stats">
          <span>${v.num_lancamentos} lançamento${v.num_lancamentos !== 1 ? 's' : ''}</span>
          <span class="fin-resumo-sep">·</span>
          <span style="color:var(--danger);font-weight:600">${_fmtBRL(v.total)}</span>
          <span class="fin-resumo-sep">·</span>
          <span style="color:var(--text-muted)">${(() => { const d = new Date(v.lancamentos.slice().sort((a,b) => b.data.localeCompare(a.data))[0].data + 'T12:00:00'); return d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}) })()}</span>
        </div>
      </div>
      <div class="viag-accordion-body" id="${safeId}">
        <div class="fin-table-wrap">
          <table class="fin-table">
            <thead><tr>
              <th>Data</th><th>Categoria</th><th>Descrição</th><th>Pagamento</th><th>Valor</th><th></th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`
  }).join('')
}

function _redrawViagCharts() {
  _buildViagDonut()
  _buildViagBar()
}

function _buildViagDonut() {
  const viagens = _viagAll
  let catEntries, donutTotal

  if (_viagViagSel) {
    // filtrado pela viagem selecionada na barra
    const v = viagens.find(v => v.nome_viagem === _viagViagSel)
    const m = {}
    if (v) v.lancamentos.forEach(l => { m[l.categoria_nome] = (m[l.categoria_nome] || 0) + l.valor })
    catEntries = Object.entries(m).sort((a, b) => b[1] - a[1])
    donutTotal = catEntries.reduce((s, [, v]) => s + v, 0)
  } else {
    const m = {}
    viagens.forEach(v => v.lancamentos.forEach(l => { m[l.categoria_nome] = (m[l.categoria_nome] || 0) + l.valor }))
    catEntries = Object.entries(m).sort((a, b) => b[1] - a[1])
    donutTotal = _viagTotal
  }

  const bgColors = catEntries.map(([k], i) =>
    (_viagCatSel && k !== _viagCatSel) ? 'rgba(255,255,255,0.1)' : _VIAG_COLORS[i % _VIAG_COLORS.length]
  )

  const centerTextPlugin = {
    id: 'viag-center',
    afterDraw(chart) {
      const { ctx, chartArea: { top, bottom, left, right } } = chart
      const cx = (left + right) / 2, cy = (top + bottom) / 2
      ctx.save()
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = '12px system-ui'; ctx.fillStyle = '#aaa'
      ctx.fillText(_viagViagSel || 'Total', cx, cy - 13)
      ctx.font = 'bold 17px system-ui'; ctx.fillStyle = '#fff'
      ctx.fillText(_fmtShort(donutTotal) || _fmtBRL(donutTotal), cx, cy + 8)
      ctx.restore()
    }
  }

  const ctxCat = document.getElementById('fin-chart-viag-cat')
  if (!ctxCat) return
  if (_finChartsInstances['viag-cat']) _finChartsInstances['viag-cat'].destroy()
  _finChartsInstances['viag-cat'] = new Chart(ctxCat, {
    type: 'doughnut',
    plugins: [..._finDL, centerTextPlugin],
    data: {
      labels: catEntries.map(([k]) => k),
      datasets: [{ data: catEntries.map(([, v]) => v), backgroundColor: bgColors, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      onClick: (e, els) => {
        if (!els.length) { _viagCatSel = null }
        else {
          const nome = catEntries[els[0].index][0]
          _viagCatSel  = (_viagCatSel === nome) ? null : nome
          _viagViagSel = null
        }
        _redrawViagCharts()
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ccc', boxWidth: 12, padding: 10, font: { size: 11 } } },
        datalabels: {
          color: '#0d0f0e', font: { size: 10, weight: 'bold' },
          formatter: (val) => {
            const pct = (val / donutTotal * 100).toFixed(0)
            if (pct < 4) return ''
            return `${pct}%\n${_fmtShort(val) || _fmtBRL(val)}`
          }
        }
      }
    }
  })
}

function _buildViagBar() {
  const viagens = _viagAll
  let labels, data, colors

  if (_viagCatSel) {
    // mostra gasto da categoria selecionada por viagem
    labels = viagens.map(v => v.nome_viagem)
    data   = viagens.map(v => v.lancamentos.filter(l => l.categoria_nome === _viagCatSel).reduce((s, l) => s + l.valor, 0))
    colors = data.map((d, i) => d > 0 ? _VIAG_COLORS[i % _VIAG_COLORS.length] : 'rgba(255,255,255,0.1)')
  } else {
    labels = viagens.map(v => v.nome_viagem)
    data   = viagens.map(v => v.total)
    colors = viagens.map((v, i) =>
      (_viagViagSel && v.nome_viagem !== _viagViagSel) ? 'rgba(255,255,255,0.12)' : _VIAG_COLORS[i % _VIAG_COLORS.length]
    )
  }

  const maxVal = Math.max(...data.filter(d => d > 0), 1)
  const ctxBar = document.getElementById('fin-chart-viag-bar')
  if (!ctxBar) return
  if (_finChartsInstances['viag-bar']) _finChartsInstances['viag-bar'].destroy()
  _finChartsInstances['viag-bar'] = new Chart(ctxBar, {
    type: 'bar',
    plugins: _finDL,
    data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      onClick: (e, els) => {
        if (!els.length) { _viagViagSel = null }
        else {
          const nome = labels[els[0].index]
          _viagViagSel = (_viagViagSel === nome) ? null : nome
          _viagCatSel  = null
        }
        _redrawViagCharts()
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end', align: 'end',
          color: '#ccc', font: { size: 11, weight: '600' },
          formatter: v => v > 0 ? (_fmtShort(v) || _fmtBRL(v)) : ''
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#aaa' } },
        y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { display: false }, suggestedMax: maxVal * 1.18 }
      }
    }
  })
}

function _viagToggle(bodyId, header) {
  const body = document.getElementById(bodyId)
  if (!body) return
  const open = body.classList.toggle('open')
  const chev = header.querySelector('.viag-chevron')
  if (chev) chev.textContent = open ? '▴' : '▾'
}

async function _viajemUnlink(cdLancamento) {
  if (!confirm('Desvincular este lançamento da viagem?')) return
  const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, { method: 'DELETE' })
  if (r.ok) renderViagens()
}

async function _viagemRenamePrompt(cdLancamento, nomeAtual) {
  const novo = prompt('Novo nome da viagem:', nomeAtual)
  if (!novo || novo === nomeAtual) return
  const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome_viagem: novo })
  })
  if (r.ok) renderViagens()
}
