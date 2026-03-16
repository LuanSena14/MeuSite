
//
// Entidades:
//   codigos_financa    → árvore de categorias (tipo: receita | despesa | investimento)
//   lancamentos_financ → data, cd_financa, valor, descricao, forma_pagamento
//   orcamentos_financ  → ano, mes, cd_financa, valor_orcado (vigência: mais recente ≤ período)
//   snapshots_investim → data, cd_financa, saldo (investimentos E indicadores ≥78)


window.finCodigos       = []   // [{id, nome, tipo, cd_pai}]
window.finLancamentos   = []   // [{id, data, cd_financa, categoria_nome, grupo_nome, tipo, valor, descricao, forma_pagamento}]
window.finOrcamento     = []   // [{id, ano, mes, cd_financa, valor_orcado, forma_pagamento}]
window.finInvestimentos = []   // [{id, data, cd_financa, nome, saldo}]
window.finViagens       = []   // [{nome_viagem, total, num_lancamentos, lancamentos}]

let _finActiveTab        = 'overview'
let _finChartsInstances  = {}
let _finEvoSelectedMonth = null   // {ano, mes} | null — mês selecionado no gráfico de evolução
let _finDespCatSelected  = null   // {nome} | null — grupo de despesa selecionado no donut
let _finDataLoadedAt     = 0
const _FIN_CACHE_TTL_MS  = 45000

// ChartDataLabels é carregado via CDN; garante um array vazio se indisponível
const _finDL = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : []

// Paleta de cores usada nos gráficos de despesas (compartilhada com overview)
const CHART_COLORS = ['#4ecca3','#e05c5c','#f5d742','#7c9eff','#ff9f47','#9b59b6','#1abc9c','#e74c3c']

const _FIN_EMPTY_DEFAULT_HTML = `
  <div class="empty-icon">◈</div>
  <h3>Nenhum dado ainda</h3>
  <p>Adicione categorias e lançamentos para começar.</p>
  <button class="btn-add fin-empty-cta" onclick="openFinModal('lancamento')">+ Novo lançamento</button>
`

function _finSetHidden(el, hidden) {
  if (!el) return
  el.classList.toggle('is-hidden', !!hidden)
  el.style.display = hidden ? 'none' : 'block'
}

function _finHasAnyData() {
  return window.finLancamentos.length > 0
    || window.finOrcamento.length > 0
    || window.finInvestimentos.length > 0
    || window.finViagens.length > 0
}

function _finSectionFeedbackHtml(icon, title, sub, details = '', isError = false) {
  return `
    <div class="section-feedback${isError ? ' error' : ''}">
      <div class="section-feedback-icon">${icon}</div>
      <div class="section-feedback-title">${title}</div>
      ${sub ? `<div class="section-feedback-sub">${sub}</div>` : ''}
      ${details ? `<div class="section-feedback-details">${details}</div>` : ''}
    </div>
  `
}

function _finSetSectionState(state, detail = '') {
  const empty = document.getElementById('fin-empty')
  const content = document.getElementById('fin-content')
  if (!empty || !content) return

  if (state === 'ready') {
    _finSetHidden(empty, true)
    _finSetHidden(content, false)
    return
  }

  _finSetHidden(content, true)
  _finSetHidden(empty, false)

  if (state === 'loading') {
    empty.innerHTML = _finSectionFeedbackHtml('⏳', 'Carregando Finances', 'Buscando dados e preparando visualizações...')
    return
  }
  if (state === 'error') {
    empty.innerHTML = _finSectionFeedbackHtml('⚠', 'Erro ao carregar Finances', 'Não foi possível carregar os dados agora.', detail, true)
    return
  }

  // empty/default
  empty.innerHTML = _FIN_EMPTY_DEFAULT_HTML
}


// Carrega todos os dados em paralelo e renderiza a aba ativa
async function initFinancesSection(forceRefresh = false) {
  const hasFreshCache = _finDataLoadedAt > 0 && (Date.now() - _finDataLoadedAt) < _FIN_CACHE_TTL_MS
  if (!forceRefresh && hasFreshCache && _finHasAnyData()) {
    _finSetSectionState('ready')
    _setDefaultFilters()
    switchFinTab(_finActiveTab)
    return
  }

  _destroyAllFinCharts()
  _finSetSectionState('loading')

  try {
    const [codigos, lanc, orc, inv, viag] = await Promise.all([
      fetchFinancasCodigos(),
      fetchLancamentos(),
      fetchOrcamento(),
      fetchInvestimentos(),
      fetchViagens(),
    ])

    window.finCodigos       = codigos || []
    window.finLancamentos   = lanc    || []
    window.finOrcamento     = orc     || []
    window.finInvestimentos = inv     || []
    window.finViagens       = viag    || []
    _finDataLoadedAt = Date.now()
  } catch (err) {
    const detail = err?.message || String(err)
    console.error('[Finances] Erro ao carregar dados:', err)
    _finSetSectionState('error', detail)
    _showFinToastErro('Não foi possível carregar Finances.')
    return
  }

  if (!_finHasAnyData()) {
    _finSetSectionState('empty')
    return
  }

  _finSetSectionState('ready')
  _setDefaultFilters()
  switchFinTab(_finActiveTab)
}

// Define o mês atual como padrão em campos de filtro ainda não preenchidos
function _setDefaultFilters() {
  const ym = new Date().toISOString().slice(0, 7)   // 'YYYY-MM'
  const mesEl    = document.getElementById('fin-filter-mes')
  const invMesEl = document.getElementById('fin-inv-filter-mes')
  if (mesEl    && !mesEl.value)    mesEl.value    = ym
  if (invMesEl && !invMesEl.value) invMesEl.value = ym
}


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


function _fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Formato compacto: 1500 → "1,5k", 800 → "800"
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


function _finNome(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  return cod ? cod.nome : '—'
}

// Retorna "Pai › Filho" para mostrar contexto na tabela (ignora nó raiz de tipo)
function _finCatBreadcrumb(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return '—'
  if (cod.cd_pai === null) return cod.nome
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  if (!pai || pai.cd_pai === null) return cod.nome
  return `<span style="color:var(--text-muted);font-size:.75em">${pai.nome} ›</span> ${cod.nome}`
}

function _finPagBadge(p) {
  if (p === 'credito') return '<span style="color:#7c9eff;font-size:.74rem;font-weight:600">Crédito</span>'
  if (!p || p === 'null') return '<span style="color:var(--text-muted);font-size:.74rem">—</span>'
  return '<span style="color:var(--text-muted);font-size:.74rem">Débito</span>'
}

// Nome do grupo pai (filho direto da raiz de tipo) de um código
function _finGrupo(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return '—'
  if (cod.cd_pai === null || cod.cd_pai === undefined) return cod.nome
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  return pai ? pai.nome : cod.nome
}

// Todos os IDs de descendentes de um nó (recursivo)
function _getDescendantIds(id) {
  const filhos = window.finCodigos.filter(c => c.cd_pai === id).map(c => c.id)
  return filhos.reduce((acc, fid) => acc.concat(fid, _getDescendantIds(fid)), [])
}


// Para cada cd_financa, devolve o registro mais recente cuja data <= (ano, mes).
// Isso permite um orçamento anual com override mensal sem duplicar entradas.
function _effectiveOrcamento(ano, mes) {
  const byCode = {}
  window.finOrcamento.forEach(o => {
    const valid = o.mes === null
      ? o.ano <= ano
      : (o.ano < ano || (o.ano === ano && o.mes <= mes))
    if (!valid) return
    const prev   = byCode[o.cd_financa]
    const score  = o.ano    * 100 + (o.mes    ?? 0)
    const pScore = prev ? prev.ano * 100 + (prev.mes ?? 0) : -1
    if (!prev || score > pScore) byCode[o.cd_financa] = o
  })
  return Object.values(byCode)
}

// Sobe a árvore até o filho direto da raiz (cd_pai=null) — esse é o "grupo"
function _findGrupoId(id) {
  const cod = window.finCodigos.find(c => c.id === id)
  if (!cod) return null
  if (cod.cd_pai === null) return id
  const pai = window.finCodigos.find(c => c.id === cod.cd_pai)
  if (!pai || pai.cd_pai === null) return id   // pai é raiz → eu sou o grupo
  return _findGrupoId(cod.cd_pai)
}

// Caminho de IDs entre grupoId (exclusive) e itemId (exclusive), para nesting
function _pathFromGrupo(itemId, grupoId) {
  if (itemId === grupoId) return []
  const cod = window.finCodigos.find(c => c.id === itemId)
  if (!cod || cod.cd_pai === null || cod.cd_pai === grupoId) return []
  return [..._pathFromGrupo(cod.cd_pai, grupoId), cod.cd_pai]
}

// Monta árvore de grupos de orçamento com profundidade arbitrária
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

// Agrupa itens de orçamento por tipo (receita/despesa/investimento) e monta a árvore de cada tipo
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
      return { key: tp, nome: tp.charAt(0).toUpperCase() + tp.slice(1), grupos, totalOrc, totalReal }
    })
}


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

function _renderOrcChild(o, showDelete) {
  const p   = o.orcado > 0 ? Math.min((o.real / o.orcado) * 100, 100) : 0
  const ov  = o.real > o.orcado
  const pl  = o.orcado > 0 ? p.toFixed(0) + '%' : '—'
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

// Renderiza recursivamente um nó de orçamento (suporta profundidade arbitrária)
function _renderOrcNode(node, showDelete, uidPrefix, depth) {
  const pct      = node.totalOrc > 0 ? Math.min((node.totalReal / node.totalOrc) * 100, 100) : 0
  const over     = node.totalReal > node.totalOrc
  const uid      = uidPrefix + '-' + node.id
  const pctLbl   = node.totalOrc > 0 ? ((node.totalReal / node.totalOrc) * 100).toFixed(0) + '%' : '—'
  const kids     = Object.values(node.children).sort((a, b) => a.nome.localeCompare(b.nome))
  const innerHtml = kids.map(c => _renderOrcNode(c, showDelete, uidPrefix, depth + 1)).join('')
                  + node.items.map(o => _renderOrcChild(o, showDelete)).join('')
  const wrapCls  = depth === 0 ? 'fin-orc-group'    : 'fin-orc-subgroup'
  const hdCls    = depth === 0 ? 'fin-orc-group-hd' : 'fin-orc-subgroup-hd'
  const nameCls  = depth === 0 ? 'fin-orc-group-name' : 'fin-orc-subgroup-name'
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


function _destroyChart(id) {
  if (_finChartsInstances[id]) {
    _finChartsInstances[id].destroy()
    delete _finChartsInstances[id]
  }
}

function _destroyAllFinCharts() {
  Object.keys(_finChartsInstances).forEach(_destroyChart)
}

function destroyFinanceCharts() {
  _destroyAllFinCharts()
}

window.destroyFinanceCharts = destroyFinanceCharts


function _showFinToast(msg) {
  if (typeof showAppToast === 'function') {
    showAppToast(msg, 'success')
    return
  }

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
  if (typeof showAppToast === 'function') {
    showAppToast(msg, 'error')
    return
  }

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
