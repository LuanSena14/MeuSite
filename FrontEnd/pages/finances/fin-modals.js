

function openFinModal(type) {
  // Se os dados ainda não carregaram (ex.: botão de ação rápida clicado antes de entrar na seção)
  if (!window.finCodigos || !window.finCodigos.length) {
    initFinancesSection()
      .then(() => {
        if (window.finCodigos && window.finCodigos.length) openFinModal(type)
      })
      .catch(() => {
        if (typeof _showFinToastErro === 'function') _showFinToastErro('Não foi possível carregar dados de Finances.')
      })
    return
  }

  ;['lancamento','orcamento','investimento','indicador','categoria','debito-investimento'].forEach(t => {
    const el = document.getElementById('fin-form-' + t)
    if (el) el.style.display = t === type ? 'block' : 'none'
  })

  const box = document.getElementById('fin-modal-box')
  if (box) box.classList.toggle('fin-modal-wide', type === 'debito-investimento')

  const today = new Date().toISOString().slice(0, 10)
  const ym    = today.slice(0, 7)

  if (type === 'lancamento') {
    document.getElementById('fin-lanc-data').value = today
    document.getElementById('fin-lanc-primeira-parcela').value = today
    document.getElementById('fin-lanc-modalidade').value = 'vista'
    document.getElementById('fin-lanc-parcelas').value = 2
    populateFinCatSelect('fin-lanc-cat', document.getElementById('fin-lanc-tipo').value)
    toggleLancamentoParcelado()
  }
  if (type === 'orcamento') {
    const now = new Date()
    document.getElementById('fin-orc-ano').value     = now.getFullYear()
    document.getElementById('fin-orc-mes-sel').value = now.getMonth() + 1
    populateFinCatSelect('fin-orc-cat', document.getElementById('fin-orc-tipo').value)
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
  if (type === 'debito-investimento') {
    _prepareDebitoInvestimentoModal()
  }

  document.getElementById('fin-modal-overlay').classList.add('open')
}

function closeFinModal() {
  document.getElementById('fin-modal-overlay').classList.remove('open')
  const box = document.getElementById('fin-modal-box')
  if (box) box.classList.remove('fin-modal-wide')
}

function toggleLancamentoParcelado() {
  const parcelado = document.getElementById('fin-lanc-modalidade')?.value === 'parcelado'
  document.getElementById('fin-lanc-parcelas-wrap')?.classList.toggle('fin-hidden', !parcelado)
  document.getElementById('fin-lanc-primeira-parcela-wrap')?.classList.toggle('fin-hidden', !parcelado)
}

function closeFinModalOutside(e) {
  if (e.target === document.getElementById('fin-modal-overlay')) closeFinModal()
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFinModal()
})


// Popula um <select> com as categorias de um tipo.
// paiOnly = apenas raízes (usado ao criar categoria nova).
// Por padrão mostra só "folhas" (contas/categorias reais, não os grupos que as agrupam,
// ex.: "Patrimonio" ou "Recorrente") com o caminho completo, pra não confundir grupo com conta.
function populateFinCatSelect(selectId, tipo, paiOnly = false) {
  const sel = document.getElementById(selectId)
  if (!sel) return

  let cats = window.finCodigos.filter(c => c.tipo === tipo)
  if (paiOnly) {
    cats = cats.filter(c => c.cd_pai === null || c.cd_pai === undefined)
    cats.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    sel.innerHTML = cats.length
      ? cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
      : '<option value="">— Nenhuma categoria —</option>'
    return
  }

  cats = _finLeafOnly(cats)
  cats.sort((a, b) => _finCatPathLabelRel(a.id).localeCompare(_finCatPathLabelRel(b.id), 'pt-BR'))

  sel.innerHTML = cats.length
    ? cats.map(c => `<option value="${c.id}">${_finCatPathLabelRel(c.id)}</option>`).join('')
    : '<option value="">— Nenhuma categoria —</option>'
}

function _populatePaiSelect() {
  const sel    = document.getElementById('fin-cat-pai')
  const tipoEl = document.getElementById('fin-cat-tipo')
  if (!sel) return
  const tipo = tipoEl?.value || 'despesa'
  const pais = window.finCodigos
    .filter(c => c.tipo === tipo && (c.cd_pai === null || c.cd_pai === undefined))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  sel.innerHTML = '<option value="">— Nenhum (criar grupo) —</option>'
    + pais.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')
}

// Chamado quando o tipo muda no formulário de nova categoria
function _onFinCatTipoChange() {
  _populatePaiSelect()
}

function toggleFinIndNome(tipo) {
  const wrap = document.getElementById('fin-ind-nome-wrap')
  if (wrap) wrap.style.display = tipo === 'custom' ? 'block' : 'none'
}


async function submitLancamento() {
  const data      = document.getElementById('fin-lanc-data').value
  const cd        = Number(document.getElementById('fin-lanc-cat').value)
  const valor     = parseFloat(document.getElementById('fin-lanc-valor').value)
  const descricao = document.getElementById('fin-lanc-desc').value.trim()
  const pagamento = document.getElementById('fin-lanc-pagamento').value || null
  const modalidade = document.getElementById('fin-lanc-modalidade').value
  const totalParcelas = Number(document.getElementById('fin-lanc-parcelas').value)
  const primeiraParcela = document.getElementById('fin-lanc-primeira-parcela').value

  if (!data || !cd || isNaN(valor) || valor <= 0) {
    _showFinToastErro('Preencha data, categoria e valor.'); return
  }

  const tipo = document.getElementById('fin-lanc-tipo').value
  if (modalidade === 'parcelado' && (tipo !== 'despesa' || !Number.isInteger(totalParcelas) || totalParcelas < 2 || !primeiraParcela)) {
    _showFinToastErro('Para parcelar, informe uma despesa, ao menos 2 parcelas e a primeira data.'); return
  }
  let res
  try {
    res = modalidade === 'parcelado'
      ? await postCompraParcelada({ data, cd_financa: cd, valor, descricao: descricao || null, forma_pagamento: pagamento, total_parcelas: totalParcelas, data_primeira_parcela: primeiraParcela, parcelas: _gerarParcelasCompra(valor, totalParcelas, primeiraParcela) })
      : await postLancamento({ data, cd_financa: cd, valor, descricao: descricao || null, forma_pagamento: pagamento })
  } catch (err) {
    console.error('Erro ao salvar compra:', err)
    _showFinToastErro('Erro ao salvar.'); return
  }
  if (!res?.ok) { _showFinToastErro('Erro ao salvar.'); return }

  closeFinModal()
  await initFinancesSection()
  _showFinToast(modalidade === 'parcelado' ? 'Compra parcelada adicionada!' : 'Lançamento adicionado!')
}

function _gerarParcelasCompra(total, quantidade, primeiraData) {
  const totalCentavos = Math.round(Number(total) * 100)
  const base = Math.floor(totalCentavos / quantidade)
  const resto = totalCentavos - (base * quantidade)
  const [ano, mes, dia] = primeiraData.split('-').map(Number)
  return Array.from({ length: quantidade }, (_, i) => {
    const data = new Date(ano, mes - 1 + i, dia)
    if (data.getDate() !== dia) data.setDate(0)
    return { numero: i + 1, vencimento: data.toISOString().slice(0, 10), valor: (base + (i < resto ? 1 : 0)) / 100 }
  })
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
  // O nome final: tipo predefinido usa o próprio tipo como nome; custom usa o nome digitado
  const nomeIndicador = tipo === 'custom' ? nome : tipo
  const res = await postIndicador({ ano, mes, nome: nomeIndicador, valor })
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

function _isDescendantOfFin(id, ancestorId) {
  let cur = window.finCodigos.find(c => c.id === id)
  const visited = new Set()
  while (cur && !visited.has(cur.id)) {
    if (cur.id === ancestorId) return true
    visited.add(cur.id)
    if (cur.cd_pai === null || cur.cd_pai === undefined) break
    cur = window.finCodigos.find(c => c.id === cur.cd_pai)
  }
  return false
}

function _finCatPathLabel(id) {
  const map = new Map((window.finCodigos || []).map(c => [c.id, c]))
  const parts = []
  let cur = map.get(id)
  const visited = new Set()
  while (cur && !visited.has(cur.id)) {
    parts.push(cur.nome)
    visited.add(cur.id)
    if (cur.cd_pai === null || cur.cd_pai === undefined) break
    cur = map.get(cur.cd_pai)
  }
  return parts.reverse().join(' › ')
}

// Igual a _finCatPathLabel, mas sem o primeiro segmento (o tipo-raiz: Receita/Despesa/Investimento),
// útil quando o tipo já é escolhido em outro campo do formulário.
function _finCatPathLabelRel(id) {
  const partes = _finCatPathLabel(id).split(' › ')
  return partes.length > 1 ? partes.slice(1).join(' › ') : partes[0]
}

// Só folhas: nós que agrupam outras categorias (ex.: "Home", "Pontual", "Patrimonio")
// não são despesas/caixinhas de verdade e não devem aparecer pra escolha.
function _finLeafOnly(cats) {
  const idsComFilho = new Set(cats.map(c => c.cd_pai).filter(id => id != null))
  return cats.filter(c => !idsComFilho.has(c.id))
}

function _populateDebitoOrigemSelect() {
  const sel = document.getElementById('fin-debito-origem')
  if (!sel) return

  // Aqui grupos (ex.: "Home", "Caixinha") são válidos de propósito: uma regra num grupo
  // cobre qualquer despesa nova dentro dele, a não ser que exista uma regra mais específica.
  const opts = (window.finCodigos || [])
    .filter(c => c.tipo === 'despesa' && c.cd_pai !== null && !_isDescendantOfFin(c.id, ID_DESPESA_RECORRENTE))
    .sort((a, b) => _finCatPathLabel(a.id).localeCompare(_finCatPathLabel(b.id), 'pt-BR'))

  sel.innerHTML = opts.length
    ? opts.map(c => `<option value="${c.id}">${_finCatPathLabel(c.id)}</option>`).join('')
    : '<option value="">— Nenhuma despesa elegível —</option>'
}

function _populateDebitoInvestSelect() {
  const sel = document.getElementById('fin-debito-invest')
  if (!sel) return

  const opts = _finLeafOnly((window.finCodigos || []).filter(c => c.tipo === 'investimento'))
    .filter(c => c.cd_pai !== null)
    .sort((a, b) => _finCatPathLabel(a.id).localeCompare(_finCatPathLabel(b.id), 'pt-BR'))

  sel.innerHTML = opts.length
    ? opts.map(c => `<option value="${c.id}">${_finCatPathLabel(c.id)}</option>`).join('')
    : '<option value="">— Nenhuma caixinha disponível —</option>'
}

async function _renderDebitoInvestimentoRules() {
  const container = document.getElementById('fin-debito-regras-list')
  if (!container) return

  const rows = await fetchDebitoInvestimento()

  const regrasHtml = rows.length
    ? `<table class="fin-table fin-debito-table">
        <thead><tr><th>Despesa</th><th>Debita em</th><th></th></tr></thead>
        <tbody>${
          rows
            .sort((a, b) => (a.origem_nome || '').localeCompare((b.origem_nome || ''), 'pt-BR'))
            .map(r => `<tr>
              <td>${_finCatPathLabel(r.cd_financa_origem)}</td>
              <td>${_finCatPathLabel(r.cd_financa_investimento)}</td>
              <td><button class="fin-del-btn" onclick="deleteDebitoInvestimentoRule(${r.cd_financa_origem})">✕</button></td>
            </tr>`)
            .join('')
        }</tbody>
      </table>`
    : '<p class="inline-empty-note-center">Nenhuma regra cadastrada.</p>'

  // Despesas não recorrentes sem regra própria NEM herdada de um grupo pai:
  // o cálculo de resgate as joga automaticamente na caixinha "Year Bills" (ou equivalente).
  // Deixa isso visível pra não precisar descobrir o motivo só olhando o banco no fechamento do mês.
  const lookup = new Map((window.finCodigos || []).map(c => [c.id, c]))
  const relMap = new Map(rows.map(r => [r.cd_financa_origem, r.cd_financa_investimento]))
  const yearBills = (window.finCodigos || [])
    .find(c => c.tipo === 'investimento' && c.nome.trim().toLowerCase() === 'year bills')
  const defaultLabel = yearBills ? _finCatPathLabel(yearBills.id) : '(nenhuma caixinha "Year Bills" encontrada)'

  function _temRegraNaCadeia(id) {
    let atual = lookup.get(id)
    const visitados = new Set()
    while (atual && !visitados.has(atual.id)) {
      visitados.add(atual.id)
      if (relMap.has(atual.id)) return true
      if (atual.cd_pai == null) break
      atual = lookup.get(atual.cd_pai)
    }
    return false
  }

  const semRegra = _finLeafOnly((window.finCodigos || []).filter(c => c.tipo === 'despesa'))
    .filter(c => c.cd_pai !== null && !_isDescendantOfFin(c.id, ID_DESPESA_RECORRENTE))
    .filter(c => !_temRegraNaCadeia(c.id))
    .sort((a, b) => _finCatPathLabel(a.id).localeCompare(_finCatPathLabel(b.id), 'pt-BR'))

  const semRegraHtml = semRegra.length
    ? `<div class="fin-orc-section-label-top" style="margin-top:18px">
        Sem regra própria — caem automaticamente em <b>${defaultLabel}</b>
      </div>
      <table class="fin-table fin-debito-table">
        <tbody>${semRegra.map(c => `<tr><td>${_finCatPathLabel(c.id)}</td></tr>`).join('')}</tbody>
      </table>`
    : ''

  container.innerHTML = regrasHtml + semRegraHtml
}

async function _prepareDebitoInvestimentoModal() {
  _populateDebitoOrigemSelect()
  _populateDebitoInvestSelect()
  try {
    await _renderDebitoInvestimentoRules()
  } catch (err) {
    console.error('Erro ao carregar regras de débito:', err)
    const container = document.getElementById('fin-debito-regras-list')
    if (container) container.innerHTML = '<p class="inline-empty-note-center">Erro ao carregar regras.</p>'
  }
}

async function submitDebitoInvestimento() {
  const origem = Number(document.getElementById('fin-debito-origem')?.value)
  const invest = Number(document.getElementById('fin-debito-invest')?.value)

  if (!origem || !invest) {
    _showFinToastErro('Selecione a despesa e a caixinha.'); return
  }

  const res = await postDebitoInvestimento({
    cd_financa_origem: origem,
    cd_financa_investimento: invest,
  })
  if (!res?.ok) {
    _showFinToastErro('Erro ao salvar regra.'); return
  }

  await _renderDebitoInvestimentoRules()
  await initFinancesSection(true)
  _showFinToast('Regra de débito salva!')
}

async function deleteDebitoInvestimentoRule(cdFinancaOrigem) {
  const res = await deleteDebitoInvestimento(cdFinancaOrigem)
  if (!res?.ok) {
    _showFinToastErro('Erro ao remover regra.'); return
  }

  await _renderDebitoInvestimentoRules()
  await initFinancesSection(true)
  _showFinToast('Regra removida')
}
