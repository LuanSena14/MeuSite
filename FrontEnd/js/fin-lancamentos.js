// ─────────────────────────────────────────────────────────────────────────────
// fin-lancamentos.js — Aba Lançamentos e Orçamento
// ─────────────────────────────────────────────────────────────────────────────

// ── FILTRO DE CATEGORIA ───────────────────────────────────────────────────────

// Reconstrói o <select> de categorias agrupando folhas (sem filhos) por tipo
function _updateLancCatFilter() {
  const tipo = document.getElementById('fin-filter-tipo')?.value || ''
  const sel  = document.getElementById('fin-filter-cat')
  if (!sel) return

  const todos   = window.finCodigos
  const raizIds = new Set(todos.filter(c => c.cd_pai === null).map(c => c.id))

  // Folhas = categorias sem filhos (excluindo as raízes de tipo)
  const temFilho = new Set(todos.filter(c => c.cd_pai !== null).map(c => c.cd_pai))
  const folhas   = todos.filter(c => !temFilho.has(c.id) && !raizIds.has(c.id))

  const porTipo = {}
  for (const f of folhas) {
    const t = f.tipo || ''
    if (!porTipo[t]) porTipo[t] = []
    porTipo[t].push(f)
  }

  let html   = '<option value="">Todas as categorias</option>'
  const tipos = tipo ? [tipo] : Object.keys(porTipo).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  for (const t of tipos) {
    const lista = (porTipo[t] || []).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    if (!lista.length) continue
    const label = t.charAt(0).toUpperCase() + t.slice(1)
    html += `<optgroup label="${label}">`
    html += lista.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
    html += '</optgroup>'
  }
  sel.innerHTML = html
}

// ── LANÇAMENTOS ───────────────────────────────────────────────────────────────

function renderLancamentos() {
  const tipoFilter = document.getElementById('fin-filter-tipo')?.value || ''
  const mesFilter  = document.getElementById('fin-filter-mes')?.value  || ''
  const catFilter  = document.getElementById('fin-filter-cat')?.value  || ''
  const pagFilter  = document.getElementById('fin-filter-pag')?.value  || ''
  const descFilter = document.getElementById('fin-filter-desc')?.value.toLowerCase().trim() || ''

  // Popula o select de categorias na primeira vez que a aba é aberta
  const catSel = document.getElementById('fin-filter-cat')
  if (catSel && catSel.options.length <= 1) _updateLancCatFilter()

  let dados = window.finLancamentos.slice()

  if (tipoFilter) {
    const ids = window.finCodigos.filter(c => c.tipo === tipoFilter).map(c => c.id)
    dados = dados.filter(l => ids.includes(l.cd_financa))
  }
  if (catFilter)  dados = dados.filter(l => l.cd_financa === Number(catFilter))
  if (pagFilter)  dados = pagFilter === 'null'
    ? dados.filter(l => !l.forma_pagamento)
    : dados.filter(l => l.forma_pagamento === pagFilter)
  if (mesFilter)  dados = dados.filter(l => l.data.startsWith(mesFilter))
  if (descFilter) dados = dados.filter(l => (l.descricao || '').toLowerCase().includes(descFilter))

  dados.sort((a, b) => b.data.localeCompare(a.data))

  const tbody = document.getElementById('fin-tbody-lancamentos')
  if (!tbody) return

  tbody.innerHTML = dados.map(l => {
    const cod  = window.finCodigos.find(c => c.id === l.cd_financa)
    const tipo = cod?.tipo || '—'
    const cls  = tipo === 'receita' ? 'fin-receita' : 'fin-despesa'
    // Exibe "Grupo › Categoria" quando o grupo não é igual ao tipo (evita redundância)
    const catCell = l.grupo_nome && l.grupo_nome.toLowerCase() !== l.tipo
      ? `<span style="color:var(--text-muted);font-size:.76em;margin-right:2px">${l.grupo_nome} ›</span>${l.categoria_nome}`
      : l.categoria_nome
    return `<tr>
      <td>${_fmtDate(l.data)}</td>
      <td>${catCell}</td>
      <td class="${cls}">${tipo}</td>
      <td>${_finPagBadge(l.forma_pagamento)}</td>
      <td>${l.descricao || '—'}</td>
      <td class="fin-col-valor ${cls}">${_fmtBRL(l.valor)}</td>
      <td><button class="fin-del-btn" onclick="deleteLancamentoFin(${l.id})">✕</button></td>
    </tr>`
  }).join('')

  // Resumo de totais filtrados
  let totalRec = 0, totalDesp = 0
  dados.forEach(l => {
    const cod = window.finCodigos.find(c => c.id === l.cd_financa)
    if (cod?.tipo === 'receita') totalRec  += Number(l.valor)
    if (cod?.tipo === 'despesa') totalDesp += Number(l.valor)
  })
  const resumo = document.getElementById('fin-lanc-resumo')
  if (resumo) {
    const saldo = totalRec - totalDesp
    resumo.innerHTML = `
      <span>Receitas: <b class="fin-receita">${_fmtBRL(totalRec)}</b></span>
      <span>Despesas: <b class="fin-despesa">${_fmtBRL(totalDesp)}</b></span>
      <span>Saldo: <b style="color:${saldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(saldo)}</b></span>`
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
  const mesFilter = document.getElementById('fin-orc-filter-mes')?.value || ''
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

  const orc     = _effectiveOrcamento(refAno, refMes)
  const mensais = orc.filter(o => o.mes !== null)
  const anuais  = orc.filter(o => o.mes === null)
  const detEl   = document.getElementById('fin-orc-list')
  if (!detEl) return

  let html = ''
  if (mensais.length > 0) {
    html += `<div class="fin-orc-section-label">Vigente — ${mesLabel}</div>`
    html += _buildOrcGroupHtml(_buildOrcTree(mensais, realizado), true, 'tab-m')
  }
  if (anuais.length > 0) {
    html += `<div class="fin-orc-section-label" style="margin-top:20px">Base anual</div>`
    html += _buildOrcGroupHtml(_buildOrcTree(anuais, realizado), true, 'tab-a')
  }
  if (!html) html = '<p style="color:var(--text-muted);font-size:.85rem;text-align:center;padding:40px 0">Nenhum orçamento para o período.</p>'
  detEl.innerHTML = html
}

async function deleteOrcamentoFin(id) {
  await deleteOrcamento(id)
  window.finOrcamento = window.finOrcamento.filter(o => o.id !== id)
  renderFinOverview()
  _showFinToast('Orçamento removido')
}

// ── PAINEL RECORRENTE ─────────────────────────────────────────────────────────

function _renderRecorrentePanel(ano, mes, mesLabel, realizadoMap) {
  const container = document.getElementById('fin-rec-panel')
  if (!container) return

  const orc = _effectiveOrcamento(ano, mes)

  // IDs fixos: Recorrente=6, Pontual=8, Salario=4, Bonus=5
  const recIds    = _getDescendantIds(6)
  const pontIds   = _getDescendantIds(8)
  const recEntIds = _getDescendantIds(4).concat(_getDescendantIds(5))

  const sumOrc  = (ids) => orc.filter(o => ids.includes(o.cd_financa) && o.mes !== null).reduce((s, o) => s + Number(o.valor_orcado), 0)
  const sumReal = (ids) => Object.entries(realizadoMap).filter(([id]) => ids.includes(Number(id))).reduce((s, [, v]) => s + v, 0)

  const prevEntradas = sumOrc(recEntIds),  realEntradas = sumReal(recEntIds)
  const prevRec      = sumOrc(recIds),     realRec      = sumReal(recIds)
  const prevPont     = sumOrc(pontIds),    realPont     = sumReal(pontIds)
  const prevSaldo    = prevEntradas - prevRec - prevPont
  const realSaldo    = realEntradas - realRec - realPont

  const mesStr       = `${ano}-${String(mes).padStart(2, '0')}`
  const totalCredito = window.finLancamentos
    .filter(l => l.data.startsWith(mesStr) && l.forma_pagamento === 'credito')
    .reduce((s, l) => s + Number(l.valor), 0)
  const totalCreditoOrc = orc
    .filter(o => o.forma_pagamento === 'credito' && o.mes !== null)
    .reduce((s, o) => s + Number(o.valor_orcado), 0)

  const _pct = (real, prev) => prev > 0 ? ((real / prev) * 100).toFixed(0) + '%' : '—'
  const _cls = (real, prev, invert = false) => {
    if (prev === 0 && real === 0) return ''
    return (invert ? real < prev : real > prev) ? 'fin-over' : 'fin-under'
  }

  const summaryHtml = `
    <div class="fin-rec-summary">
      <div class="fin-rec-month">${mesLabel}</div>
      <table class="fin-rec-sum-table">
        <thead><tr><th></th><th>Previsto</th><th>Real</th><th>%</th></tr></thead>
        <tbody>
          <tr class="fin-rec-sum-section"><td colspan="4">Entradas</td></tr>
          <tr><td>Salário / Bonus</td>
            <td>${_fmtBRL(prevEntradas)}</td>
            <td class="${_cls(realEntradas, prevEntradas, true)}">${_fmtBRL(realEntradas)}</td>
            <td>${_pct(realEntradas, prevEntradas)}</td></tr>
          <tr class="fin-rec-sum-section"><td colspan="4">Gastos</td></tr>
          <tr><td>Recorrente</td>
            <td>${_fmtBRL(prevRec)}</td>
            <td class="${_cls(realRec, prevRec)}">${_fmtBRL(realRec)}</td>
            <td>${_pct(realRec, prevRec)}</td></tr>
          <tr><td>Pontual</td>
            <td>${prevPont > 0 ? _fmtBRL(prevPont) : '—'}</td>
            <td class="${_cls(realPont, prevPont)}">${realPont > 0 ? _fmtBRL(realPont) : '—'}</td>
            <td>${_pct(realPont, prevPont)}</td></tr>
          <tr class="fin-rec-sum-saldo"><td>Saldo</td>
            <td style="color:${prevSaldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(prevSaldo)}</td>
            <td style="color:${realSaldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${_fmtBRL(realSaldo)}</td>
            <td></td></tr>
          <tr class="fin-rec-sum-credito"><td>Cartão crédito</td>
            <td>${totalCreditoOrc > 0 ? _fmtBRL(totalCreditoOrc) : '—'}</td>
            <td style="color:${totalCreditoOrc > 0 && totalCredito > totalCreditoOrc ? 'var(--danger)' : '#7c9eff'}">${_fmtBRL(totalCredito)}</td>
            <td>${totalCreditoOrc > 0 ? ((totalCredito / totalCreditoOrc) * 100).toFixed(0) + '%' : ''}</td></tr>
        </tbody>
      </table>
    </div>`

  // Colunas por tipo (filhos diretos de Recorrente=6): Obrigatória, Luxo
  const typeOrder = ['Obrigatória', 'Luxo']
  const typeNodes = window.finCodigos
    .filter(c => c.cd_pai === 6)
    .sort((a, b) => {
      const ia = typeOrder.indexOf(a.nome), ib = typeOrder.indexOf(b.nome)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1; if (ib !== -1) return 1
      return a.nome.localeCompare(b.nome)
    })

  const typeColsHtml = typeNodes.map(typeNode => {
    const orcType = orc.filter(o =>
      _getDescendantIds(typeNode.id).includes(o.cd_financa) && o.mes !== null
    ).sort((a, b) => _finNome(a.cd_financa).localeCompare(_finNome(b.cd_financa)))

    if (!orcType.length) return ''

    const totalPrev = orcType.reduce((s, o) => s + Number(o.valor_orcado), 0)
    const totalReal = orcType.reduce((s, o) => s + (realizadoMap[o.cd_financa] || 0), 0)
    const totalOver = totalReal > totalPrev

    const rows = orcType.map(o => {
      const prev = Number(o.valor_orcado)
      const real = realizadoMap[o.cd_financa] || 0
      const over = real > prev
      const pct  = prev > 0 ? ((real / prev) * 100).toFixed(0) : '—'
      return `<tr>
        <td class="fin-rec-cat-name">${_finNome(o.cd_financa)}</td>
        <td class="fin-rec-val">${_fmtBRL(prev)}</td>
        <td class="fin-rec-val ${over ? 'fin-over' : (real > 0 ? 'fin-under' : '')}">${_fmtBRL(real)}</td>
        <td class="fin-rec-pct ${over ? 'fin-over' : (real > 0 ? 'fin-under' : '')}">${pct}%</td>
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
      <div class="fin-rec-donos">${typeColsHtml || '<p style="color:var(--text-muted);padding:20px">Sem dados recorrentes para o período.</p>'}</div>
    </div>`
}

// ── PAINEL CARTÃO DE CRÉDITO ──────────────────────────────────────────────────

function _renderCreditoPanel(ano, mes, mesLabel) {
  const container = document.getElementById('fin-credito-panel')
  if (!container) return

  const mesStr     = `${ano}-${String(mes).padStart(2, '0')}`
  const orcCredito = _effectiveOrcamento(ano, mes).filter(o => o.forma_pagamento === 'credito' && o.mes !== null)
  const lancCredito = window.finLancamentos.filter(l => l.data.startsWith(mesStr) && l.forma_pagamento === 'credito')

  const orcMap = {}
  orcCredito.forEach(o => { orcMap[o.cd_financa] = (orcMap[o.cd_financa] || 0) + Number(o.valor_orcado) })
  const lancMap = {}
  lancCredito.forEach(l => { lancMap[l.cd_financa] = (lancMap[l.cd_financa] || 0) + Number(l.valor) })

  const allIds = [...new Set([...Object.keys(orcMap).map(Number), ...Object.keys(lancMap).map(Number)])]

  if (!allIds.length) {
    container.innerHTML = `
      <div class="dash-card" style="margin-top:16px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="dash-card-title" style="color:#7c9eff">Cartão de Crédito — ${mesLabel}</div>
          <button class="btn-add" onclick="openFinModal('orcamento')">+ Orçamento</button>
        </div>
        <p style="color:var(--text-muted);font-size:.85rem;padding:12px 0 4px">Nenhum lançamento de crédito no período.</p>
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
      const orc     = orcMap[id]  || 0
      const real    = lancMap[id] || 0
      const net     = real - orc
      const pctVal  = orc > 0 ? ((real / orc) * 100).toFixed(0) + '%' : '—'
      const netFmt  = orc > 0 ? (net >= 0 ? '+' : '') + _fmtBRL(net) : '—'
      return `<tr>
        <td class="fin-rec-cat-name">${_finNome(id)}</td>
        <td class="fin-rec-val">${orc > 0 ? _fmtBRL(orc) : '—'}</td>
        <td class="fin-rec-val">${_fmtBRL(real)}</td>
        <td class="fin-rec-val">${netFmt}</td>
        <td class="fin-rec-pct">${pctVal}</td>
      </tr>`
    }).join('')

  container.innerHTML = `
    <div class="dash-card" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="dash-card-title" style="color:#7c9eff">Cartão de Crédito — ${mesLabel}</div>
        <button class="btn-add" onclick="openFinModal('orcamento')">+ Orçamento</button>
      </div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px">
        <span style="font-size:1.4rem;font-weight:700;color:#7c9eff">${_fmtBRL(totalReal)}</span>
        ${totalOrc > 0 ? `<span style="color:var(--text-muted);font-size:.85rem">de ${_fmtBRL(totalOrc)} orçado — ${((totalReal / totalOrc) * 100).toFixed(0)}%</span>` : ''}
      </div>
      ${totalOrc > 0 ? `<div class="fin-orc-bar-bg" style="margin-bottom:14px"><div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${barPct}%"></div></div>` : ''}
      <table class="fin-rec-cat-table">
        <thead><tr><th>Categoria</th><th>Orçado</th><th>Realizado</th><th>Δ</th><th>%</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}
