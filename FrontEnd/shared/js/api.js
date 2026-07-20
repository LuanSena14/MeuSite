
function _throwIfError(error) {
  if (error) throw new Error(error.message || String(error))
}

// Supabase/PostgREST limita cada select a 1000 linhas por padrão.
// Para tabelas que podem passar disso, pagina com .range() até esgotar.
async function _fetchAllPaginated(buildQuery, pageSize = 1000) {
  let all = []
  let from = 0
  while (true) {
    const { data, error } = await buildQuery().range(from, from + pageSize - 1)
    _throwIfError(error)
    all = all.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

async function ensureBackendAwake() {
  return true
}

// ── helpers de hierarquia ───────────────────────────────────────────────────

async function _fetchAllCodigoFinanca() {
  const { data, error } = await sb.from('codigo_financa').select('id, nome, cd_pai')
  _throwIfError(error)
  const lookup = new Map()
  for (const row of data) lookup.set(row.id, row)
  return lookup
}

function _deriveTipo(id, lookup) {
  const node = lookup.get(id)
  if (!node) return ''
  if (node.cd_pai == null) return node.nome.toLowerCase()
  return _deriveTipo(node.cd_pai, lookup)
}

function _isDescendantOf(idFilho, idAncestral, lookup) {
  let atual = lookup.get(idFilho)
  const visitados = new Set()
  while (atual && !visitados.has(atual.id)) {
    if (atual.id === idAncestral) return true
    visitados.add(atual.id)
    if (atual.cd_pai == null) break
    atual = lookup.get(atual.cd_pai)
  }
  return false
}

// ── Body / Medidas ──────────────────────────────────────────────────────────

async function fetchMedidas() {
  const { data, error } = await sb
    .from('codigo_medida')
    .select('id, descricao, cd_pai, unidade_medida(sigla)')
  _throwIfError(error)

  const grupos = data.filter(m => m.cd_pai == null)
  return grupos.map(g => ({
    id: g.id,
    descricao: g.descricao,
    filhos: data
      .filter(f => f.cd_pai === g.id)
      .map(f => ({ id: f.id, descricao: f.descricao, unidade: f.unidade_medida?.sigla || '' })),
  }))
}

async function fetchCheckins() {
  const { data, error } = await sb
    .from('checkins')
    .select('date, valor, codigo_medida!inner(descricao, cd_pai)')
    .not('codigo_medida.cd_pai', 'is', null)
    .order('date', { ascending: true })
  _throwIfError(error)

  const porData = new Map()
  for (const row of data) {
    const d = row.date
    if (!porData.has(d)) porData.set(d, { date: d })
    porData.get(d)[row.codigo_medida.descricao] = row.valor
  }
  return [...porData.keys()].sort().map(d => porData.get(d))
}

async function postCheckin(date, medidas) {
  const { data: codigos, error: e1 } = await sb
    .from('codigo_medida')
    .select('id, descricao')
    .not('cd_pai', 'is', null)
  _throwIfError(e1)

  const mapa = new Map(codigos.map(c => [c.descricao, c.id]))
  const rows = []
  for (const [campo, valor] of Object.entries(medidas)) {
    if (valor == null || !mapa.has(campo)) continue
    rows.push({ date, cd_medida: mapa.get(campo), valor: Number(valor) })
  }
  if (rows.length) {
    const { error } = await sb.from('checkins').insert(rows)
    _throwIfError(error)
  }
  return { ok: true }
}

async function patchCheckinDate(oldDate, newDate) {
  const { data: existingNew, error: e0 } = await sb.from('checkins').select('id').eq('date', newDate).limit(1)
  _throwIfError(e0)
  if (existingNew.length) throw new Error('Já existe um check-in para a data de destino')

  const { data: rows, error: e1 } = await sb.from('checkins').select('id').eq('date', oldDate)
  _throwIfError(e1)
  if (!rows.length) throw new Error('Nenhum check-in encontrado para essa data')

  const { error } = await sb.from('checkins').update({ date: newDate }).eq('date', oldDate)
  _throwIfError(error)
  return { ok: true, updated: rows.length }
}

// ── Exercises ────────────────────────────────────────────────────────────────

async function fetchCodigosExercicio() {
  const { data, error } = await sb.from('codigo_exercicio').select('id, descricao, cd_pai')
  _throwIfError(error)

  const grupos = data.filter(g => g.cd_pai == null)
  return grupos.map(g => ({
    id: g.id,
    descricao: g.descricao,
    filhos: data.filter(f => f.cd_pai === g.id).map(f => ({ id: f.id, descricao: f.descricao })),
  }))
}

async function fetchExercicios() {
  const data = await _fetchAllPaginated(() => sb
    .from('entrada_exercicio')
    .select('id, data, hora, cd_exercicio, duracao, esforco, codigo_exercicio(descricao, cd_pai)')
    .order('data', { ascending: true })
    .order('hora', { ascending: true })
  )

  const { data: todosCod, error: e2 } = await sb.from('codigo_exercicio').select('id, descricao')
  _throwIfError(e2)
  const nomesPai = new Map(todosCod.map(c => [c.id, c.descricao]))

  return data.map(e => ({
    id: e.id,
    data: e.data,
    hora: e.hora,
    cd_exercicio: e.cd_exercicio,
    exercicio_nome: e.codigo_exercicio?.descricao,
    grupo_nome: e.codigo_exercicio?.cd_pai != null ? nomesPai.get(e.codigo_exercicio.cd_pai) : null,
    duracao: e.duracao,
    esforco: e.esforco,
  }))
}

async function postExercise(entry) {
  const { error } = await sb.from('entrada_exercicio').insert({
    data: entry.date,
    hora: entry.hora,
    cd_exercicio: entry.cd_exercicio,
    duracao: entry.duracao ?? null,
    esforco: entry.esforco ?? null,
  })
  _throwIfError(error)
  return { ok: true }
}

async function patchExercicioDate(id, novaData) {
  const { error } = await sb.from('entrada_exercicio').update({ data: novaData }).eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

// ── Goals (desativado — nova tela ainda será definida) ──────────────────────

async function fetchGoalsCodigos()  { return [] }
async function fetchGoalsMetas()    { return [] }
async function fetchGoalsEntradas() { return [] }
async function postGoalEntrada()    { return { ok: true } }

// ── Finances ─────────────────────────────────────────────────────────────────

async function fetchFinancasCodigos() {
  const lookup = await _fetchAllCodigoFinanca()
  return [...lookup.values()].map(c => ({
    id: c.id, nome: c.nome, tipo: _deriveTipo(c.id, lookup), cd_pai: c.cd_pai,
  }))
}

async function postFinancaCodigo(body) {
  const { data, error } = await sb
    .from('codigo_financa')
    .insert({ nome: body.nome, cd_pai: body.cd_pai ?? null })
    .select()
    .single()
  _throwIfError(error)
  const lookup = await _fetchAllCodigoFinanca()
  return { id: data.id, nome: data.nome, tipo: _deriveTipo(data.id, lookup), cd_pai: data.cd_pai }
}

async function deleteFinancaCodigo(id) {
  const { error } = await sb.from('codigo_financa').delete().eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

async function fetchLancamentos() {
  const lookup = await _fetchAllCodigoFinanca()
  const data = await _fetchAllPaginated(() => sb
    .from('lancamento_financeiro')
    .select('id, data, cd_financa, valor, descricao, forma_pagamento')
    .order('data', { ascending: false })
  )

  return data.map(l => {
    const cat = lookup.get(l.cd_financa)
    const pai = cat && cat.cd_pai != null ? lookup.get(cat.cd_pai) : null
    return {
      id: l.id, data: l.data, cd_financa: l.cd_financa,
      categoria_nome: cat ? cat.nome : '',
      grupo_nome: pai ? pai.nome : (cat ? cat.nome : ''),
      tipo: _deriveTipo(l.cd_financa, lookup),
      valor: l.valor, descricao: l.descricao, forma_pagamento: l.forma_pagamento,
    }
  })
}

async function postLancamento(body) {
  const { error } = await sb.from('lancamento_financeiro').insert({
    data: body.data, cd_financa: body.cd_financa, valor: body.valor,
    descricao: body.descricao ?? null, forma_pagamento: body.forma_pagamento ?? 'debito',
  })
  _throwIfError(error)
  return { ok: true }
}

async function deleteLancamento(id) {
  const { error } = await sb.from('lancamento_financeiro').delete().eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

async function patchLancamentoDate(id, novaData) {
  const { error } = await sb.from('lancamento_financeiro').update({ data: novaData }).eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

async function fetchOrcamento() {
  const lookup = await _fetchAllCodigoFinanca()
  const { data, error } = await sb.from('orcamento_financeiro').select('*')
  _throwIfError(error)

  return data.map(r => {
    const cat = lookup.get(r.cd_financa)
    return {
      id: r.id, ano: r.ano, mes: r.mes, cd_financa: r.cd_financa,
      categoria_nome: cat ? cat.nome : '',
      tipo: cat ? _deriveTipo(r.cd_financa, lookup) : '',
      valor_orcado: r.valor_orcado, forma_pagamento: r.forma_pagamento,
    }
  })
}

async function postOrcamento(body) {
  let query = sb.from('orcamento_financeiro').select('id')
    .eq('ano', body.ano).eq('cd_financa', body.cd_financa)
  query = body.mes == null ? query.is('mes', null) : query.eq('mes', body.mes)
  const { data: existing, error: e0 } = await query
  _throwIfError(e0)

  if (existing.length) {
    const { error } = await sb.from('orcamento_financeiro')
      .update({ valor_orcado: body.valor_orcado, forma_pagamento: body.forma_pagamento ?? null })
      .eq('id', existing[0].id)
    _throwIfError(error)
  } else {
    const { error } = await sb.from('orcamento_financeiro').insert({
      ano: body.ano, mes: body.mes ?? null, cd_financa: body.cd_financa,
      valor_orcado: body.valor_orcado, forma_pagamento: body.forma_pagamento ?? null,
    })
    _throwIfError(error)
  }
  return { ok: true }
}

async function deleteOrcamento(id) {
  const { error } = await sb.from('orcamento_financeiro').delete().eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

const ID_DESPESA_RECORRENTE = 6
const ID_INVEST_DEFAULT_YEAR_BILLS = 57

function _findDefaultInvestimentoId(lookup) {
  if (lookup.has(ID_INVEST_DEFAULT_YEAR_BILLS)) return ID_INVEST_DEFAULT_YEAR_BILLS
  for (const c of lookup.values()) {
    if (_deriveTipo(c.id, lookup) === 'investimento' && c.nome.trim().toLowerCase() === 'year bills') return c.id
  }
  return null
}

function _resolveInvestimentoDebito(cdFinancaDespesa, relMap, lookup, defaultInvestId) {
  let atual = lookup.get(cdFinancaDespesa)
  const visitados = new Set()
  while (atual && !visitados.has(atual.id)) {
    visitados.add(atual.id)
    const mapped = relMap.get(atual.id)
    if (mapped != null && _deriveTipo(mapped, lookup) === 'investimento') return mapped
    if (atual.cd_pai == null) break
    atual = lookup.get(atual.cd_pai)
  }
  return defaultInvestId
}

function _getInvestimentoMovimentacoes(cdFinanca, lancamentosMes, lookup, relMap, defaultInvestId) {
  let aportes = 0, resgates = 0
  for (const l of lancamentosMes) {
    const tipo = _deriveTipo(l.cd_financa, lookup)
    if (tipo === 'investimento' && l.cd_financa === cdFinanca) { aportes += Number(l.valor); continue }
    if (tipo !== 'despesa') continue
    if (_isDescendantOf(l.cd_financa, ID_DESPESA_RECORRENTE, lookup)) continue
    const alvo = _resolveInvestimentoDebito(l.cd_financa, relMap, lookup, defaultInvestId)
    if (alvo === cdFinanca) resgates += Number(l.valor)
  }
  return { aportes_mes: aportes, resgates_mes: resgates }
}

async function fetchInvestimentos() {
  const lookup = await _fetchAllCodigoFinanca()
  const { data: snapshots, error: e1 } = await sb.from('snapshot_investimento').select('*').order('data', { ascending: true })
  _throwIfError(e1)
  const { data: rels, error: e2 } = await sb.from('relacionamento_debito_investimento').select('*')
  _throwIfError(e2)
  const relMap = new Map(rels.map(r => [r.cd_financa_origem, r.cd_financa_investimento]))
  const defaultInvestId = _findDefaultInvestimentoId(lookup)

  const monthsNeeded = new Set(snapshots.map(s => s.data.slice(0, 7)))
  const allLanc = await _fetchAllPaginated(() => sb.from('lancamento_financeiro').select('cd_financa, valor, data'))
  const lancamentosPorMes = new Map()
  for (const l of allLanc) {
    const key = l.data.slice(0, 7)
    if (!monthsNeeded.has(key)) continue
    if (!lancamentosPorMes.has(key)) lancamentosPorMes.set(key, [])
    lancamentosPorMes.get(key).push(l)
  }

  const snapsPorCat = new Map()
  for (const s of snapshots) {
    if (!snapsPorCat.has(s.cd_financa)) snapsPorCat.set(s.cd_financa, [])
    snapsPorCat.get(s.cd_financa).push(s)
  }

  return snapshots.map(r => {
    const catSnaps = snapsPorCat.get(r.cd_financa)
    const [ano, mes] = r.data.slice(0, 7).split('-').map(Number)
    const prevMes = mes > 1 ? mes - 1 : 12
    const prevAno = mes > 1 ? ano : ano - 1
    const prevKey = `${prevAno}-${String(prevMes).padStart(2, '0')}`
    const prevSnaps = catSnaps.filter(s => s.data.slice(0, 7) === prevKey)
    const saldoAnterior = prevSnaps.length ? prevSnaps[prevSnaps.length - 1].saldo : null

    const mov = _getInvestimentoMovimentacoes(
      r.cd_financa, lancamentosPorMes.get(r.data.slice(0, 7)) || [], lookup, relMap, defaultInvestId
    )

    let rendimento = null
    if (saldoAnterior != null) {
      rendimento = r.saldo - saldoAnterior - (mov.aportes_mes - mov.resgates_mes)
    }

    const cat = lookup.get(r.cd_financa)
    return {
      id: r.id, data: r.data, cd_financa: r.cd_financa,
      nome: cat ? cat.nome : '',
      saldo: r.saldo, saldo_anterior: saldoAnterior,
      aportes_mes: mov.aportes_mes, resgates_mes: mov.resgates_mes,
      rendimento_calculado: rendimento,
    }
  })
}

async function postInvestimento(body) {
  const { error } = await sb.from('snapshot_investimento').insert({
    data: body.data, cd_financa: body.cd_financa, saldo: body.saldo,
  })
  _throwIfError(error)
  return { ok: true }
}

async function deleteInvestimento(id) {
  const { error } = await sb.from('snapshot_investimento').delete().eq('id', id)
  _throwIfError(error)
  return { ok: true }
}

async function fetchDebitoInvestimento() {
  const lookup = await _fetchAllCodigoFinanca()
  const { data, error } = await sb.from('relacionamento_debito_investimento').select('*')
  _throwIfError(error)
  return data.map(r => ({
    cd_financa_origem: r.cd_financa_origem,
    origem_nome: lookup.get(r.cd_financa_origem)?.nome || '',
    cd_financa_investimento: r.cd_financa_investimento,
    investimento_nome: lookup.get(r.cd_financa_investimento)?.nome || '',
  }))
}

async function postDebitoInvestimento(body) {
  const lookup = await _fetchAllCodigoFinanca()
  if (!lookup.has(body.cd_financa_origem)) throw new Error('cd_financa_origem inexistente')
  if (!lookup.has(body.cd_financa_investimento)) throw new Error('cd_financa_investimento inexistente')
  if (_deriveTipo(body.cd_financa_origem, lookup) !== 'despesa') throw new Error('cd_financa_origem deve ser categoria de despesa')
  if (_deriveTipo(body.cd_financa_investimento, lookup) !== 'investimento') throw new Error('cd_financa_investimento deve ser categoria de investimento')

  const { error } = await sb.from('relacionamento_debito_investimento').upsert({
    cd_financa_origem: body.cd_financa_origem,
    cd_financa_investimento: body.cd_financa_investimento,
  })
  _throwIfError(error)
  return { ok: true }
}

async function deleteDebitoInvestimento(cdFinancaOrigem) {
  const { error } = await sb.from('relacionamento_debito_investimento').delete().eq('cd_financa_origem', cdFinancaOrigem)
  _throwIfError(error)
  return { ok: true }
}

async function fetchViagens() {
  const lookup = await _fetchAllCodigoFinanca()
  const { data: rels, error: e1 } = await sb.from('relacionamento_lancamento_viagem').select('*')
  _throwIfError(e1)
  if (!rels.length) return []

  const ids = rels.map(r => r.cd_lancamento)
  const { data: lancs, error: e2 } = await sb
    .from('lancamento_financeiro')
    .select('id, data, cd_financa, valor, descricao, forma_pagamento')
    .in('id', ids)
  _throwIfError(e2)
  const lancMap = new Map(lancs.map(l => [l.id, l]))

  const grupos = new Map()
  for (const r of rels) {
    const l = lancMap.get(r.cd_lancamento)
    if (!l) continue
    const cat = lookup.get(l.cd_financa)
    if (!grupos.has(r.nome_viagem)) grupos.set(r.nome_viagem, [])
    grupos.get(r.nome_viagem).push({
      id: l.id, data: l.data, cd_financa: l.cd_financa,
      categoria_nome: cat ? cat.nome : '',
      tipo: _deriveTipo(l.cd_financa, lookup),
      valor: l.valor, descricao: l.descricao, forma_pagamento: l.forma_pagamento,
    })
  }

  const viagens = []
  for (const [nome, items] of grupos.entries()) {
    const sorted = [...items].sort((a, b) => a.data.localeCompare(b.data))
    viagens.push({
      nome_viagem: nome,
      total: items.reduce((s, l) => s + l.valor, 0),
      num_lancamentos: items.length,
      ultima_data: sorted.length ? sorted[sorted.length - 1].data : null,
      lancamentos: sorted,
    })
  }

  viagens.sort((a, b) => a.nome_viagem.localeCompare(b.nome_viagem))
  viagens.sort((a, b) => (b.ultima_data || '').localeCompare(a.ultima_data || ''))
  return viagens
}

async function renameViagem(cdLancamento, novoNome) {
  const { data: rel, error: e1 } = await sb
    .from('relacionamento_lancamento_viagem').select('*').eq('cd_lancamento', cdLancamento).maybeSingle()
  _throwIfError(e1)
  if (!rel) throw new Error('Lançamento não vinculado a viagem')

  const { error } = await sb
    .from('relacionamento_lancamento_viagem')
    .update({ nome_viagem: novoNome })
    .eq('nome_viagem', rel.nome_viagem)
  _throwIfError(error)
  return { ok: true }
}

async function unlinkViagem(cdLancamento) {
  const { error } = await sb.from('relacionamento_lancamento_viagem').delete().eq('cd_lancamento', cdLancamento)
  _throwIfError(error)
  return { ok: true }
}

async function postIndicador(body) {
  const { data: existingCat, error: e1 } = await sb
    .from('codigo_financa').select('id').eq('cd_pai', 78).ilike('nome', body.nome).maybeSingle()
  _throwIfError(e1)

  let catId = existingCat?.id
  if (!catId) {
    const { data: novaCat, error: e2 } = await sb
      .from('codigo_financa').insert({ nome: body.nome, cd_pai: 78 }).select().single()
    _throwIfError(e2)
    catId = novaCat.id
  }

  const data = `${body.ano}-${String(body.mes).padStart(2, '0')}-01`
  const { data: existingSnap, error: e3 } = await sb
    .from('snapshot_investimento').select('id').eq('cd_financa', catId).eq('data', data).maybeSingle()
  _throwIfError(e3)

  if (existingSnap) {
    const { error } = await sb.from('snapshot_investimento').update({ saldo: body.valor }).eq('id', existingSnap.id)
    _throwIfError(error)
  } else {
    const { error } = await sb.from('snapshot_investimento').insert({ data, cd_financa: catId, saldo: body.valor })
    _throwIfError(error)
  }
  return { ok: true }
}
