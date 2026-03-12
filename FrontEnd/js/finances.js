// ─────────────────────────────────────────────────────────────────────────────
// finances.js — Módulo de finanças
//
// Entidades:
//   codigos_financa      → árvore de categorias (pai/filho, tipo: receita|despesa|investimento)
//   lancamentos_financ   → data, cd_financa, valor, descricao
//   orcamentos_financ    → ano, mes, cd_financa, valor_orcado
//   snapshots_investim   → data, cd_financa, saldo
//   indicadores_mensal   → ano, mes, tipo, nome, valor
// ─────────────────────────────────────────────────────────────────────────────

// ── ESTADO ────────────────────────────────────────────────────────────────────

window.finCodigos      = []   // [{id, nome, tipo, cd_pai}]
window.finLancamentos  = []   // [{id, data, cd_financa, valor, descricao}]
window.finOrcamento    = []   // [{id, ano, mes, cd_financa, valor_orcado}]
window.finInvestimentos = []  // [{id, data, cd_financa, saldo}]
window.finIndicadores  = []   // [{id, ano, mes, tipo, nome, valor}]

let _finActiveTab = 'overview'
let _finChartsInstances = {}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────────────

async function initFinancesSection() {
  const [codigos, lanc, orc, inv, ind] = await Promise.all([
    fetchFinancasCodigos(),
    fetchLancamentos(),
    fetchOrcamento(),
    fetchInvestimentos(),
    fetchIndicadores(),
  ])

  window.finCodigos       = codigos      || []
  window.finLancamentos   = lanc         || []
  window.finOrcamento     = orc          || []
  window.finInvestimentos = inv          || []
  window.finIndicadores   = ind          || []

  _setDefaultFilters()
  switchFinTab(_finActiveTab)
}

function _setDefaultFilters() {
  const now   = new Date()
  const ym    = now.toISOString().slice(0, 7)   // 'YYYY-MM'

  const mesEl    = document.getElementById('fin-filter-mes')
  const orcMesEl = document.getElementById('fin-orc-filter-mes')
  if (mesEl    && !mesEl.value)    mesEl.value    = ym
  if (orcMesEl && !orcMesEl.value) orcMesEl.value = ym
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
  const now = new Date()
  const ano = now.getFullYear()
  const mes = now.getMonth() + 1

  const lancMes = window.finLancamentos.filter(l => {
    const d = new Date(l.data + 'T00:00:00')
    return d.getFullYear() === ano && d.getMonth() + 1 === mes
  })

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

  // Último saldo total de investimentos (maior data disponível)
  let totalInv = 0
  const invPorCod = {}
  window.finInvestimentos.forEach(s => {
    if (!invPorCod[s.cd_financa] || s.data > invPorCod[s.cd_financa].data) {
      invPorCod[s.cd_financa] = s
    }
  })
  Object.values(invPorCod).forEach(s => { totalInv += Number(s.saldo) })

  document.getElementById('fin-kpi-receitas').textContent  = _fmtBRL(receitas)
  document.getElementById('fin-kpi-despesas').textContent  = _fmtBRL(despesas)
  document.getElementById('fin-kpi-saldo').textContent     = _fmtBRL(receitas - despesas)
  document.getElementById('fin-kpi-investido').textContent = _fmtBRL(totalInv)

  // Colorir saldo positivo/negativo
  const saldoEl = document.getElementById('fin-kpi-saldo')
  saldoEl.style.color = (receitas - despesas) >= 0 ? 'var(--accent)' : 'var(--danger)'

  _renderChartDespesas(despPorCat)
  _renderChartEvolucao()
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
        datalabels: { display: false },
      },
    },
  })
}

function _renderChartEvolucao() {
  const canvas = document.getElementById('fin-chart-evolucao')
  if (!canvas) return
  _destroyChart('evolucao')

  // Últimos 6 meses
  const meses = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    meses.push({ ano: d.getFullYear(), mes: d.getMonth() + 1, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) })
  }

  const receitas = meses.map(m => {
    return window.finLancamentos
      .filter(l => {
        const d = new Date(l.data + 'T00:00:00')
        const cod = window.finCodigos.find(c => c.id === l.cd_financa)
        return cod?.tipo === 'receita' && d.getFullYear() === m.ano && d.getMonth() + 1 === m.mes
      })
      .reduce((s, l) => s + Number(l.valor), 0)
  })
  const despesas = meses.map(m => {
    return window.finLancamentos
      .filter(l => {
        const d = new Date(l.data + 'T00:00:00')
        const cod = window.finCodigos.find(c => c.id === l.cd_financa)
        return cod?.tipo === 'despesa' && d.getFullYear() === m.ano && d.getMonth() + 1 === m.mes
      })
      .reduce((s, l) => s + Number(l.valor), 0)
  })

  _finChartsInstances['evolucao'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: meses.map(m => m.label),
      datasets: [
        { label: 'Receitas', data: receitas, backgroundColor: '#4ecca355' },
        { label: 'Despesas', data: despesas, backgroundColor: '#e05c5c55' },
      ],
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
      <td>${_finNome(l.cd_financa)}</td>
      <td>${_finGrupo(l.cd_financa)}</td>
      <td class="${cls}">${tipo}</td>
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
  const tipoFilter = document.getElementById('fin-orc-filter-tipo')?.value || ''
  const mesFilter  = document.getElementById('fin-orc-filter-mes')?.value  || ''

  let orc = window.finOrcamento.slice()
  if (mesFilter) {
    const [ano, mes] = mesFilter.split('-').map(Number)
    orc = orc.filter(o => o.ano === ano && o.mes === mes)
  }
  if (tipoFilter) {
    const ids = window.finCodigos.filter(c => c.tipo === tipoFilter).map(c => c.id)
    orc = orc.filter(o => ids.includes(o.cd_financa))
  }

  // Calcular realizado por categoria para o mês
  const realizado = {}
  if (mesFilter) {
    const lanc = window.finLancamentos.filter(l => l.data.startsWith(mesFilter))
    lanc.forEach(l => {
      realizado[l.cd_financa] = (realizado[l.cd_financa] || 0) + Number(l.valor)
    })
  }

  const container = document.getElementById('fin-orc-list')
  if (!container) return

  if (orc.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum orçamento para o período selecionado.</p>'
    return
  }

  container.innerHTML = orc.map(o => {
    const orcado    = Number(o.valor_orcado)
    const real      = realizado[o.cd_financa] || 0
    const pct       = orcado > 0 ? Math.min((real / orcado) * 100, 150) : 0
    const over      = real > orcado
    const nome      = _finNome(o.cd_financa)
    const cod       = window.finCodigos.find(c => c.id === o.cd_financa)
    const tipo      = cod?.tipo || ''

    return `<div class="fin-orc-item">
      <div class="fin-orc-item-header">
        <div>
          <div class="fin-orc-label">${nome} <span class="fin-ind-tipo">${tipo}</span></div>
        </div>
        <div class="fin-orc-amounts">${_fmtBRL(real)} / ${_fmtBRL(orcado)}</div>
        <button class="fin-del-btn" onclick="deleteOrcamentoFin(${o.id})">✕</button>
      </div>
      <div class="fin-orc-bar-bg">
        <div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${Math.min(pct,100)}%"></div>
      </div>
    </div>`
  }).join('')
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

  // Pegar categorias de investimento
  const cats = window.finCodigos.filter(c => c.tipo === 'investimento')

  // Por categoria: primeiro snapshot, último snapshot
  const snapsPorCat = {}
  window.finInvestimentos.forEach(s => {
    if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = []
    snapsPorCat[s.cd_financa].push(s)
  })

  container.innerHTML = cats.map(cat => {
    const snaps = (snapsPorCat[cat.id] || []).sort((a, b) => a.data.localeCompare(b.data))
    const ultimo   = snaps[snaps.length - 1]
    const primeiro = snaps[0]
    const saldo    = ultimo ? Number(ultimo.saldo) : null

    let rendHtml = ''
    if (primeiro && ultimo && primeiro.id !== ultimo.id) {
      const rend = Number(ultimo.saldo) - Number(primeiro.saldo)
      const pct  = Number(primeiro.saldo) > 0 ? (rend / Number(primeiro.saldo) * 100).toFixed(1) : null
      const cls  = rend >= 0 ? 'pos' : 'neg'
      rendHtml   = `<div class="fin-inv-card-rend ${cls}">${rend >= 0 ? '+' : ''}${_fmtBRL(rend)}${pct !== null ? ` (${pct}%)` : ''} total</div>`
    }

    return `<div class="fin-inv-card">
      <div class="fin-inv-card-name">${cat.nome}</div>
      <div class="fin-inv-card-saldo">${saldo !== null ? _fmtBRL(saldo) : '—'}</div>
      ${rendHtml}
    </div>`
  }).join('')

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

function renderIndicadores() {
  // Coletar tipos únicos e meses únicos, ordenar
  const allTipos = [...new Set(window.finIndicadores.map(i => i.tipo === 'custom' ? i.nome : i.tipo))]
  const allMeses = [...new Set(window.finIndicadores.map(i => `${i.ano}-${String(i.mes).padStart(2,'0')}`))]
    .sort().reverse().slice(0, 12)

  const header = document.getElementById('fin-ind-header')
  const tbody  = document.getElementById('fin-tbody-indicadores')
  if (!header || !tbody) return

  const _labelTipo = t => ({
    livelo: 'Livelo (pts)', serasa: 'Serasa', credito_celular: 'Crédito cel.'
  }[t] || t)

  header.innerHTML = '<th>Mês</th>' + allTipos.map(t => `<th>${_labelTipo(t)}</th>`).join('')

  const lookup = {}
  window.finIndicadores.forEach(i => {
    const chave = `${i.ano}-${String(i.mes).padStart(2,'0')}`
    const tipo  = i.tipo === 'custom' ? i.nome : i.tipo
    if (!lookup[chave]) lookup[chave] = {}
    lookup[chave][tipo] = i.valor
  })

  tbody.innerHTML = allMeses.map(mk => {
    const [y, m] = mk.split('-')
    const label  = new Date(Number(y), Number(m) - 1, 1)
      .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const cells  = allTipos.map(t => {
      const v = lookup[mk]?.[t]
      return `<td>${v !== undefined ? Number(v).toLocaleString('pt-BR') : '—'}</td>`
    })
    return `<tr><td>${label}</td>${cells.join('')}</tr>`
  }).join('')
}

async function deleteIndicadorFin(id) {
  await deleteIndicador(id)
  window.finIndicadores = window.finIndicadores.filter(i => i.id !== id)
  renderIndicadores()
  _showFinToast('Indicador removido')
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
    document.getElementById('fin-orc-mes').value = ym
    const tipoEl = document.getElementById('fin-orc-tipo')
    populateFinCatSelect('fin-orc-cat', tipoEl.value, true)
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
  overlay.style.display = 'flex'
}

function closeFinModal() {
  document.getElementById('fin-modal-overlay').style.display = 'none'
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
  const data     = document.getElementById('fin-lanc-data').value
  const cd       = Number(document.getElementById('fin-lanc-cat').value)
  const valor    = parseFloat(document.getElementById('fin-lanc-valor').value)
  const descricao = document.getElementById('fin-lanc-desc').value.trim()

  if (!data || !cd || isNaN(valor) || valor <= 0) {
    _showFinToastErro('Preencha data, categoria e valor.'); return
  }

  const novo = await postLancamento({ data, cd_financa: cd, valor, descricao: descricao || null })
  if (!novo?.id) { _showFinToastErro('Erro ao salvar.'); return }

  window.finLancamentos.push(novo)
  closeFinModal()
  renderLancamentos()
  if (_finActiveTab === 'overview') renderFinOverview()
  _showFinToast('Lançamento adicionado!')
}

async function submitOrcamento() {
  const mesStr = document.getElementById('fin-orc-mes').value
  const cd     = Number(document.getElementById('fin-orc-cat').value)
  const valor  = parseFloat(document.getElementById('fin-orc-valor').value)

  if (!mesStr || !cd || isNaN(valor) || valor <= 0) {
    _showFinToastErro('Preencha período, categoria e valor.'); return
  }

  const [ano, mes] = mesStr.split('-').map(Number)
  const novo = await postOrcamento({ ano, mes, cd_financa: cd, valor_orcado: valor })
  if (!novo?.id) { _showFinToastErro('Erro ao salvar.'); return }

  window.finOrcamento.push(novo)
  closeFinModal()
  renderOrcamento()
  _showFinToast('Orçamento salvo!')
}

async function submitInvestimento() {
  const data  = document.getElementById('fin-inv-data').value
  const cd    = Number(document.getElementById('fin-inv-cat').value)
  const saldo = parseFloat(document.getElementById('fin-inv-saldo').value)

  if (!data || !cd || isNaN(saldo)) {
    _showFinToastErro('Preencha todos os campos.'); return
  }

  const novo = await postInvestimento({ data, cd_financa: cd, saldo })
  if (!novo?.id) { _showFinToastErro('Erro ao salvar.'); return }

  window.finInvestimentos.push(novo)
  closeFinModal()
  renderInvestimentos()
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
  const novo = await postIndicador({ ano, mes, tipo, nome: tipo === 'custom' ? nome : tipo, valor })
  if (!novo?.id) { _showFinToastErro('Erro ao salvar.'); return }

  window.finIndicadores.push(novo)
  closeFinModal()
  renderIndicadores()
  _showFinToast('Indicador salvo!')
}

async function submitCategoria() {
  const nome  = document.getElementById('fin-cat-nome').value.trim()
  const tipo  = document.getElementById('fin-cat-tipo').value
  const paiEl = document.getElementById('fin-cat-pai')
  const cd_pai = paiEl.value ? Number(paiEl.value) : null

  if (!nome) { _showFinToastErro('Informe o nome da categoria.'); return }

  const novo = await postFinancaCodigo({ nome, tipo, cd_pai })
  if (!novo?.id) { _showFinToastErro('Erro ao salvar.'); return }

  window.finCodigos.push(novo)
  closeFinModal()
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
