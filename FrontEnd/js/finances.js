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

let _finActiveTab = 'overview'
let _finChartsInstances = {}
let _finEvoSelectedMonth = null   // {ano, mes} | null

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function initFinancesSection() {
  const [codigos, lanc, orc, inv] = await Promise.all([
    fetchFinancasCodigos(),
    fetchLancamentos(),
    fetchOrcamento(),
    fetchInvestimentos(),
  ])

  window.finCodigos       = codigos      || []
  window.finLancamentos   = lanc         || []
  window.finOrcamento     = orc          || []
  window.finInvestimentos = inv          || []

  _setDefaultFilters()
  switchFinTab(_finActiveTab)
}

function _setDefaultFilters() {
  const now   = new Date()
  const ym    = now.toISOString().slice(0, 7)   // 'YYYY-MM'

  const mesEl = document.getElementById('fin-filter-mes')
  if (mesEl && !mesEl.value) mesEl.value = ym
  // orcamento tab não pré-preenche: user vê todos por padrão
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
  if (tab === 'orcamento')     renderOrcamento()
  if (tab === 'investimentos') renderInvestimentos()
  if (tab === 'indicadores')   renderIndicadores()
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

// Retorna badge HTML para forma de pagamento
function _finPagBadge(p) {
  if (p === 'credito') return '<span style="color:#7c9eff;font-size:.74rem;font-weight:600">Crédito</span>'
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

  const mesKey  = `${ano}-${String(mes).padStart(2, '0')}`
  const lancMes = window.finLancamentos.filter(l => l.data.startsWith(mesKey))

  let receitas = 0, despesas = 0
  const despPorCat = {}

  lancMes.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (!cod) return
    if (cod.tipo === 'receita')  receitas += Number(l.valor)
    if (cod.tipo === 'despesa') {
      despesas += Number(l.valor)
      const grupo = _finGrupo(l.cd_financa)
      despPorCat[grupo] = (despPorCat[grupo] || 0) + Number(l.valor)
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

  _renderChartDespesas(despPorCat)
  _renderChartEvolucao()
  _renderOrcOverview(ano, mes)
  _renderValidador(ano, mes)
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
  // apenas orçamentos mensais (mes !== null)
  const orcMes  = _effectiveOrcamento(ano, mes).filter(o => o.mes !== null)

  let realEntradas = 0, realSaidas = 0
  lancMes.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita')  realEntradas += Number(l.valor)
    if (cod?.tipo === 'despesa') realSaidas   += Number(l.valor)
  })

  let prevEntradas = 0, prevSaidas = 0
  orcMes.forEach(o => {
    const cod = window.finCodigos.find(c => c.id === o.cd_financa)
    if (cod?.tipo === 'receita')  prevEntradas += Number(o.valor_orcado)
    if (cod?.tipo === 'despesa') prevSaidas   += Number(o.valor_orcado)
  })

  const saldoReal = realEntradas - realSaidas
  const saldoPrev = prevEntradas - prevSaidas

  // ── Abertura por grupo ────────────────────────────────────────────────────
  const _rows = (tipo, colorCls) => {
    const por = {}
    lancMes.forEach(l => {
      const cod = window.finCodigos.find(c => c.id === l.cd_financa)
      if (cod?.tipo !== tipo) return
      const grp = _finGrupo(l.cd_financa)
      por[grp] = (por[grp] || 0) + Number(l.valor)
    })
    return Object.entries(por).sort((a, b) => b[1] - a[1]).map(([nome, val]) =>
      `<div class="fin-val-detail-row"><span>${nome}</span><span class="${colorCls}">${_fmtBRL(val)}</span></div>`
    ).join('') || `<div class="fin-val-detail-row" style="color:var(--text-muted)">Nenhum lançamento.</div>`
  }

  // Investimentos: último saldo por categoria (excluindo indicadores)
  const _indicIds = new Set([78, ..._getDescendantIds(78)])
  const _invPorCod = {}
  window.finInvestimentos.filter(s => !_indicIds.has(s.cd_financa)).forEach(s => {
    if (!_invPorCod[s.cd_financa] || s.data > _invPorCod[s.cd_financa].data) _invPorCod[s.cd_financa] = s
  })
  let totalInvVal = 0
  const invRows = Object.values(_invPorCod).sort((a, b) => Number(b.saldo) - Number(a.saldo)).map(s => {
    totalInvVal += Number(s.saldo)
    const nome = window.finCodigos.find(c => c.id === s.cd_financa)?.nome || '—'
    return `<div class="fin-val-detail-row"><span>${nome}</span><span style="color:#f5d742">${_fmtBRL(s.saldo)}</span></div>`
  }).join('') || `<div class="fin-val-detail-row" style="color:var(--text-muted)">Nenhum snapshot.</div>`

  const _acc = (id, label, totalHtml, colorCls, rowsHtml) => `
    <div class="fin-val-acc">
      <div class="fin-val-acc-hd" onclick="toggleFinValAcc('${id}')">
        <span class="fin-val-acc-arrow" id="fin-val-acc-arrow-${id}">▶</span>
        <span class="${colorCls}">${label}</span>
        <span class="fin-val-acc-total ${colorCls}">${totalHtml}</span>
      </div>
      <div class="fin-val-acc-body" id="fin-val-acc-${id}" style="display:none">${rowsHtml}</div>
    </div>`

  container.innerHTML = `
    <div class="fin-val-grid">
      <div></div><div class="fin-val-hdr">Previsto</div><div class="fin-val-hdr">Realizado</div>
      <div class="fin-val-label">Entradas</div>
      <div class="fin-val-prev fin-receita">${_fmtBRL(prevEntradas)}</div>
      <div class="fin-val-real fin-receita">${_fmtBRL(realEntradas)}</div>
      <div class="fin-val-label">Saídas</div>
      <div class="fin-val-prev fin-despesa">${_fmtBRL(prevSaidas)}</div>
      <div class="fin-val-real fin-despesa">${_fmtBRL(realSaidas)}</div>
      <div class="fin-val-label fin-val-saldo-row">Saldo</div>
      <div class="fin-val-prev fin-val-saldo-row" style="color:${saldoPrev>=0?'var(--accent)':'var(--danger)'}">${_fmtBRL(saldoPrev)}</div>
      <div class="fin-val-real fin-val-saldo-row" style="color:${saldoReal>=0?'var(--accent)':'var(--danger)'}">${_fmtBRL(saldoReal)}</div>
    </div>
    <div class="fin-val-details">
      ${_acc('rec',  'Receitas',      _fmtBRL(realEntradas), 'fin-receita', _rows('receita',  'fin-receita'))}
      ${_acc('desp', 'Despesas',      _fmtBRL(realSaidas),   'fin-despesa', _rows('despesa',  'fin-despesa'))}
      ${_acc('inv',  'Investimentos', _fmtBRL(totalInvVal),  '',            invRows)}
    </div>
  `
}

function toggleFinValAcc(id) {
  const body  = document.getElementById('fin-val-acc-' + id)
  const arrow = document.getElementById('fin-val-acc-arrow-' + id)
  if (!body) return
  const open = body.style.display !== 'none'
  body.style.display = open ? 'none' : 'block'
  if (arrow) arrow.textContent = open ? '▶' : '▼'
}

function _destroyChart(id) {
  if (_finChartsInstances[id]) {
    _finChartsInstances[id].destroy()
    delete _finChartsInstances[id]
  }
}

function _renderChartDespesas(despPorCat) {
  const canvas = document.getElementById('fin-chart-despesas')
  if (!canvas) return
  _destroyChart('despesas')

  const labels = Object.keys(despPorCat)
  const data   = Object.values(despPorCat)
  if (labels.length === 0) { canvas.closest('.dash-card').querySelector('.dash-card-title').nextSibling?.remove(); return }

  const COLORS = ['#4ecca3','#e05c5c','#f5d742','#7c9eff','#ff9f47','#9b59b6','#1abc9c','#e74c3c']

  _finChartsInstances['despesas'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 0 }],
    },
    options: {
      cutout: '65%',
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

  // Todos os meses com lançamentos de receita ou despesa
  const mesSet = new Set()
  window.finLancamentos.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita' || cod?.tipo === 'despesa') mesSet.add(l.data.slice(0, 7))
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
      return cod?.tipo === 'despesa' && l.data.startsWith(m.key)
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

// ── LANÇAMENTOS ───────────────────────────────────────────────────────────────

function renderLancamentos() {
  const tipoFilter = document.getElementById('fin-filter-tipo')?.value || ''
  const mesFilter  = document.getElementById('fin-filter-mes')?.value  || ''

  let dados = window.finLancamentos.slice()

  if (tipoFilter) {
    const ids = window.finCodigos.filter(c => c.tipo === tipoFilter).map(c => c.id)
    dados = dados.filter(l => ids.includes(l.cd_financa))
  }
  if (mesFilter) {
    dados = dados.filter(l => l.data.startsWith(mesFilter))
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
      <td>${l.categoria_nome || _finNome(l.cd_financa)}</td>
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
            <td>\u2014</td>
            <td style="color:#7c9eff">${_fmtBRL(totalCredito)}</td>
            <td></td></tr>
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
  renderOrcamento()
  _showFinToast('Orçamento removido')
}

// ── INVESTIMENTOS ─────────────────────────────────────────────────────────────

function renderInvestimentos() {
  const container = document.getElementById('fin-inv-cards')
  if (!container) return

  // Nós de indicadores (id=78 e descendentes) — excluir da aba investimentos
  const indicIds = new Set([78, ..._getDescendantIds(78)])

  // Snapshots só de investimentos financeiros
  const invSnaps = window.finInvestimentos.filter(s => !indicIds.has(s.cd_financa))

  // Agrupar por categoria
  const snapsPorCat = {}
  invSnaps.forEach(s => {
    if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = []
    snapsPorCat[s.cd_financa].push(s)
  })

  // Apenas categorias que têm ao menos um snapshot
  const cats = window.finCodigos
    .filter(c => c.tipo === 'investimento' && snapsPorCat[c.id]?.length > 0)

  if (cats.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum snapshot de investimento registrado.</p>'
    _renderChartInvestimentos({}, [])
    return
  }

  // ── Cards: saldo atual + variação total ──
  let totalGeral = 0
  const cardsHtml = cats.map(cat => {
    const snaps  = (snapsPorCat[cat.id] || []).sort((a, b) => a.data.localeCompare(b.data))
    const ultimo  = snaps[snaps.length - 1]
    const primeiro = snaps[0]
    const saldo   = Number(ultimo.saldo)
    totalGeral   += saldo

    let rendHtml = ''
    if (primeiro.id !== ultimo.id) {
      const rend = saldo - Number(primeiro.saldo)
      const pct  = Number(primeiro.saldo) > 0 ? (rend / Number(primeiro.saldo) * 100).toFixed(1) : null
      const cls  = rend >= 0 ? 'pos' : 'neg'
      rendHtml = `<div class="fin-inv-card-rend ${cls}">${rend >= 0 ? '+' : ''}${_fmtBRL(rend)}${pct !== null ? ` (${pct}%)` : ''} total</div>`
    }
    return `<div class="fin-inv-card">
      <div class="fin-inv-card-name">${cat.nome}</div>
      <div class="fin-inv-card-saldo">${_fmtBRL(saldo)}</div>
      ${rendHtml}
    </div>`
  }).join('')

  // Card de total geral
  const totalCard = `<div class="fin-inv-card fin-inv-card-total">
    <div class="fin-inv-card-name">Total geral</div>
    <div class="fin-inv-card-saldo">${_fmtBRL(totalGeral)}</div>
  </div>`

  // ── Tabela de evolução mensal ──
  // Agrupar snapshots por mês (yyyy-mm): último snapshot do mês por categoria
  const mesesSet = new Set(invSnaps.map(s => s.data.slice(0, 7)))
  const allMes   = [...mesesSet].sort().reverse().slice(0, 18)

  const mesLookup = {}   // mesLookup[mes][cd_financa] = saldo
  invSnaps.forEach(s => {
    const mk = s.data.slice(0, 7)
    if (!mesLookup[mk]) mesLookup[mk] = {}
    if (!mesLookup[mk][s.cd_financa] || s.data > mesLookup[mk][s.cd_financa].data)
      mesLookup[mk][s.cd_financa] = s
  })

  const _mesLabel = mk => {
    const [y, m] = mk.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  }

  const _diffCell = (cur, prev) => {
    if (cur === null || prev === null) return '<td></td><td></td>'
    const d = cur - prev
    const p = prev > 0 ? (d / prev * 100).toFixed(1) : null
    const cls = d >= 0 ? 'fin-under' : 'fin-over'
    return `<td class="${cls}">${d >= 0 ? '+' : ''}${_fmtBRL(d)}</td>` +
           `<td class="${cls}">${p !== null ? (d >= 0 ? '+' : '') + p + '%' : '—'}</td>`
  }

  const evoHeader = '<tr><th>Mês</th>' +
    cats.flatMap(c => [`<th>${c.nome}</th>`, '<th></th>', '<th>Δ%</th>']).join('') +
    '<th>Total</th><th></th><th>Δ%</th></tr>'

  const evoRows = allMes.map((mk, idx) => {
    const prevMk = allMes[idx + 1] || null
    let rowTotal = 0, prevTotal = 0, hasAll = true
    const cells = cats.map(c => {
      const cur  = mesLookup[mk]?.[c.id]  ? Number(mesLookup[mk][c.id].saldo)  : null
      const prev = prevMk && mesLookup[prevMk]?.[c.id] ? Number(mesLookup[prevMk][c.id].saldo) : null
      if (cur !== null) rowTotal += cur; else hasAll = false
      if (prev !== null) prevTotal += prev
      return `<td class="fin-rec-val">${cur !== null ? _fmtBRL(cur) : '—'}</td>` + _diffCell(cur, prev)
    }).join('')
    const totalDiff = _diffCell(rowTotal, prevTotal > 0 ? prevTotal : null)
    const [y, m] = mk.split('-')
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    return `<tr><td>${label}</td>${cells}<td class="fin-rec-val"><b>${_fmtBRL(rowTotal)}</b></td>${totalDiff}</tr>`
  }).join('')

  const evoTable = `<div class="fin-table-wrap" style="margin-top:16px">
    <table class="fin-table fin-inv-evo-table">
      <thead>${evoHeader}</thead>
      <tbody>${evoRows}</tbody>
    </table>
  </div>`

  container.innerHTML = totalCard + cardsHtml
  const chartWrap = document.querySelector('#fin-panel-investimentos .dash-card')
  if (chartWrap) {
    let evoEl = document.getElementById('fin-inv-evo')
    if (!evoEl) {
      evoEl = document.createElement('div')
      evoEl.id = 'fin-inv-evo'
      chartWrap.after(evoEl)
    }
    evoEl.innerHTML = `<div class="dash-card" style="margin-top:16px">
      <div class="dash-card-title">Evolução mensal</div>
      ${evoTable}
    </div>`
  }

  _renderChartInvestimentos(snapsPorCat, cats)
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

  sel.innerHTML = cats.length
    ? cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
    : '<option value="">— Nenhuma categoria —</option>'
}

function _populatePaiSelect() {
  const sel = document.getElementById('fin-cat-pai')
  if (!sel) return
  const tipoEl   = document.getElementById('fin-cat-tipo')
  const tipo     = tipoEl?.value || 'despesa'
  const pais     = window.finCodigos.filter(c => c.tipo === tipo && (c.cd_pai === null || c.cd_pai === undefined))
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
  const pagamento = document.getElementById('fin-lanc-pagamento').value

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
  const pagamento = document.getElementById('fin-orc-pagamento').value

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
