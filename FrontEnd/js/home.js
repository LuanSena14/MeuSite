// ─────────────────────────────────────────────────────────────────────────────
// home.js — tela de overview geral (landing page)
// ─────────────────────────────────────────────────────────────────────────────

let _homeData   = {}  // dados cacheados após o primeiro fetch
let _homeMesKey = ''  // mês selecionado no filtro ("YYYY-MM")

async function initHomeSection() {
  _homeRenderGreeting()
  _homePopulateMonthFilter()

  const now = new Date()
  _homeMesKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const sel = document.getElementById('home-mes-filter')
  if (sel) sel.value = _homeMesKey

  const finOk = typeof _financesUnlocked === 'function' && _financesUnlocked()

  const [checkinsR, lancR, codR, orcR, exR, goalsEntR, goalsMetR] = await Promise.allSettled([
    fetchCheckins(),
    finOk ? fetchLancamentos()     : Promise.resolve(null),
    finOk ? fetchFinancasCodigos() : Promise.resolve(null),
    finOk ? fetchOrcamento()       : Promise.resolve(null),
    fetchExercicios(),
    fetchGoalsEntradas(),
    fetchGoalsMetas(),
  ])

  _homeData = {
    checkins:      checkinsR.status === 'fulfilled' ? checkinsR.value  : [],
    lancamentos:   lancR.status     === 'fulfilled' ? lancR.value      : null,
    codigos:       codR.status      === 'fulfilled' ? codR.value       : null,
    orcamento:     orcR.status      === 'fulfilled' ? orcR.value       : null,
    exercicios:    exR.status       === 'fulfilled' ? exR.value        : [],
    goalsEntradas: goalsEntR.status === 'fulfilled' ? goalsEntR.value  : [],
    goalsMetas:    goalsMetR.status === 'fulfilled' ? goalsMetR.value  : [],
    finOk,
  }

  _homeRenderAll()
}

function homeFilterMes(val) {
  _homeMesKey = val
  _homeRenderAll()
}

function _homeRenderAll() {
  const mes = _homeMesKey
  _homeBodyCard  (_homeData.checkins      ?? [], mes)
  _homeFinCard   (_homeData.lancamentos,   _homeData.codigos, _homeData.orcamento, _homeData.finOk, mes)
  _homeExCard    (_homeData.exercicios     ?? [], mes)
  _homeGoalsCard (_homeData.goalsEntradas ?? [], _homeData.goalsMetas ?? [], mes)
}

// ── SAUDAÇÃO + FILTRO ─────────────────────────────────────────────────────────

function _homeRenderGreeting() {
  const h      = new Date().getHours()
  const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  const grEl = document.getElementById('home-greeting')
  if (grEl) grEl.textContent = period

  const dtEl = document.getElementById('home-date')
  if (dtEl) {
    dtEl.textContent = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }
}

function _homePopulateMonthFilter() {
  const sel = document.getElementById('home-mes-filter')
  if (!sel) return
  const now  = new Date()
  const opts = []
  for (let i = 0; i < 13; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const lbl = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    opts.push(`<option value="${val}">${lbl}</option>`)
  }
  sel.innerHTML = opts.join('')
}

// ── BOTÕES DE ADIÇÃO ──────────────────────────────────────────────────────────
// Cada função para propagação para não acionar o onclick do card pai

function _homeOpenFinAdd(e) {
  e.stopPropagation()
  if (typeof _financesUnlocked === 'function' && !_financesUnlocked()) {
    switchSection('finances')
    return
  }
  if (!window.finCodigos?.length) {
    initFinancesSection().then(() => openFinModal('lancamento'))
    return
  }
  openFinModal('lancamento')
}

async function _homeOpenExAdd(e) {
  e.stopPropagation()
  if (!document.getElementById('ex-modal-overlay')) await initExSection()
  openExModal()
}

async function _homeOpenGoalsAdd(e) {
  e.stopPropagation()
  if (!document.getElementById('goals-modal-overlay')) await initGoalsSection()
  openGoalsModal()
}

// ── CARD BODY ─────────────────────────────────────────────────────────────────

function _homeBodyCard(checkins, mesKey) {
  const el = document.getElementById('home-body-content')
  if (!el) return

  if (!checkins?.length) {
    el.innerHTML = '<p class="hcard-empty">Sem dados ainda</p>'
    return
  }

  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date))
  const [my, mm] = mesKey.split('-').map(Number)
  const endOfMonthStr = new Date(my, mm, 0).toISOString().slice(0, 10)
  const upToMonth = sorted.filter(c => c.date <= endOfMonthStr)

  // Última altura conhecida — do histórico completo (backend só faz forward-fill após 1ª medição)
  const _imcAlturaRaw = sorted.slice().reverse().find(c => parseFloat(c.altura) > 0)?.altura
  const _imcAltura = _imcAlturaRaw
    ? (parseFloat(_imcAlturaRaw) > 3 ? parseFloat(_imcAlturaRaw) / 100 : parseFloat(_imcAlturaRaw))
    : null

  // Computa valor de um campo (incluindo campos derivados)
  // Para campos compostos, retorna null se QUALQUER dependência estiver ausente na mesma entrada
  function mVal(c, field) {
    switch (field) {
      case 'gorduraPct': {
        const g = parseFloat(c.gordura), p = parseFloat(c.peso)
        return Number.isFinite(g) && g > 0 && Number.isFinite(p) && p > 0 ? g / p * 100 : null
      }
      case 'imc': {
        const p = parseFloat(c.peso)
        const hRaw = parseFloat(c.altura)
        const a = Number.isFinite(hRaw) && hRaw > 0
          ? (hRaw > 3 ? hRaw / 100 : hRaw)
          : _imcAltura
        return Number.isFinite(p) && p > 0 && a != null && a > 0 ? p / (a * a) : null
      }
      default: {
        const v = parseFloat(c[field])
        return Number.isFinite(v) && v > 0 ? v : null
      }
    }
  }

  // Para cada campo: valor atual = última medição até o fim do mês selecionado
  //                 prevC       = medição anterior DAQUELE CAMPO no histórico completo
  //                 dAno        = primeira medição do campo no ano selecionado (até lastC)
  function metricInfo(field) {
    // Valor atual: último registro válido até o fim do mês
    const inWindow = upToMonth.filter(c => mVal(c, field) !== null)
    const lastC = inWindow.at(-1)
    if (!lastC) return null

    const val = mVal(lastC, field)

    // Medição anterior: busca no histórico COMPLETO antes da data de lastC
    const prevC = sorted
      .filter(c => c.date < lastC.date && mVal(c, field) !== null)
      .at(-1) ?? null
    const dLast = prevC ? val - mVal(prevC, field) : null

    // Primeira medição DESTE campo no ano selecionado (até lastC)
    const firstAnoC = inWindow.find(c => c.date.startsWith(String(my))) ?? null
    const dAno = firstAnoC && firstAnoC.date !== lastC.date
      ? val - mVal(firstAnoC, field) : null

    const firstFmt = firstAnoC
      ? new Date(firstAnoC.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      : null

    return { val, dLast, dAno, firstFmt, lastDate: lastC.date }
  }

  const pesoInfo = metricInfo('peso')
  if (!pesoInfo) {
    el.innerHTML = '<p class="hcard-empty">Sem check-in neste período</p>'
    return
  }

  const diffDays = Math.round((new Date() - new Date(pesoInfo.lastDate + 'T00:00:00')) / 86400000)
  const lastStr  = diffDays === 0 ? 'hoje' : diffDays === 1 ? 'ontem' : `há ${diffDays} dias`

  const fmtDelta = (d, digits, unit) => {
    const cls = d > 0 ? 'hcard-up' : 'hcard-down'
    return `<span class="hcard-delta ${cls}">${d > 0 ? '+' : ''}${d.toFixed(digits)}${unit}</span>`
  }

  const SEC_METRICS = [
    { field: 'gorduraPct',     lbl: '% Gordura',  unit: '%',  digits: 1 },
    { field: 'massa_muscular', lbl: 'Massa Musc.', unit: ' kg',digits: 1 },
    { field: 'imc',            lbl: 'IMC',         unit: '',   digits: 1 },
    { field: 'cintura',        lbl: 'Cintura',     unit: ' cm',digits: 1 },
  ]
  const secCards = SEC_METRICS.map(m => ({ ...m, info: metricInfo(m.field) })).filter(m => m.info)

  el.innerHTML = `
    <div class="hcard-main-row">
      <span class="hcard-big">${pesoInfo.val.toFixed(1)}<span class="hcard-unit"> kg</span></span>
      ${pesoInfo.dLast !== null ? fmtDelta(pesoInfo.dLast, 1, ' kg') : ''}
    </div>
    ${pesoInfo.dAno !== null ? `
    <div class="hcard-delta-row">
      <span class="hcard-delta-lbl">desde ${pesoInfo.firstFmt}</span>
      ${fmtDelta(pesoInfo.dAno, 1, ' kg')}
    </div>` : ''}
    ${secCards.length ? `
    <div class="hcard-metrics-grid">
      ${secCards.map(m => `
        <div class="hcard-metric">
          <div class="hcard-metric-lbl">${m.lbl}</div>
          <div class="hcard-metric-val-row">
            <span class="hcard-metric-val">${m.info.val.toFixed(m.digits)}${m.unit}</span>
            ${m.info.dLast !== null ? fmtDelta(m.info.dLast, m.digits, m.unit) : ''}
          </div>
          ${m.info.dAno !== null ? `
          <div class="hcard-delta-row" style="margin-bottom:0">
            <span class="hcard-delta-lbl">desde ${m.info.firstFmt}</span>
            ${fmtDelta(m.info.dAno, m.digits, m.unit)}
          </div>` : ''}
        </div>`).join('')}
    </div>` : ''}
    <div class="hcard-foot">Última medição: ${lastStr}</div>
  `
}

// ── CARD FINANCES ─────────────────────────────────────────────────────────────

function _homeFinCard(lancamentos, codigos, orcamento, unlocked, mesKey) {
  const el = document.getElementById('home-fin-content')
  if (!el) return

  if (!unlocked) {
    el.innerHTML = `
      <div class="hcard-locked">
        <span class="hcard-lock-icon">◈</span>
        <span>Protegido por PIN</span>
      </div>`
    return
  }

  const [my, mm] = mesKey.split('-').map(Number)
  const doMes = (lancamentos ?? []).filter(l => l.data.startsWith(mesKey))

  const codigoMap = {}
  codigos?.forEach(c => { codigoMap[c.id] = c })

  function getTipo(id) {
    let c = codigoMap[id]
    while (c) {
      if (c.tipo === 'receita' || c.tipo === 'despesa') return c.tipo
      c = codigoMap[c.cd_pai]
    }
    return 'despesa'
  }

  let receitas = 0, despesas = 0
  doMes.forEach(l => {
    if (getTipo(l.cd_financa) === 'receita') receitas += l.valor
    else despesas += l.valor
  })

  const saldo  = receitas - despesas
  const fmtBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const orcColor = pct => pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--accent3)' : 'var(--accent2)'

  // Orçamento: realizado vs orçado por categoria de despesa
  const orcRows = []
  if (orcamento?.length && codigos?.length) {
    const byCode = {}
    orcamento.forEach(o => {
      if (o.mes === null) return                                         // ignora orçamento anual
      const valid = o.ano < my || (o.ano === my && o.mes <= mm)
      if (!valid) return
      const prev  = byCode[o.cd_financa]
      const score = o.ano * 100 + (o.mes ?? 0)
      if (!prev || score > prev.ano * 100 + (prev.mes ?? 0)) byCode[o.cd_financa] = o
    })
    const realizadoMap = {}
    doMes.filter(l => getTipo(l.cd_financa) === 'despesa').forEach(l => {
      realizadoMap[l.cd_financa] = (realizadoMap[l.cd_financa] || 0) + l.valor
    })
    Object.values(byCode).forEach(o => {
      if (getTipo(o.cd_financa) !== 'despesa') return
      const cat = codigoMap[o.cd_financa]
      if (!cat) return
      const orcado    = o.valor_orcado
      const realizado = realizadoMap[o.cd_financa] || 0
      const pct       = orcado > 0 ? Math.round((realizado / orcado) * 100) : 0
      orcRows.push({ nome: cat.nome, orcado, realizado, pct })
    })
    orcRows.sort((a, b) => b.orcado - a.orcado)
  }

  if (!doMes.length && !orcRows.length) {
    el.innerHTML = '<p class="hcard-empty">Sem dados neste mês</p>'
    return
  }

  el.innerHTML = `
    <div class="hcard-main-row">
      <span class="hcard-big" style="color:${saldo >= 0 ? 'var(--accent)' : 'var(--danger)'}">${fmtBRL(saldo)}</span>
    </div>
    <div class="hcard-rec-des">
      <span style="color:var(--accent2)">↑ ${fmtBRL(receitas)}</span>
      <span class="hcard-rec-des-sep">·</span>
      <span style="color:var(--danger)">↓ ${fmtBRL(despesas)}</span>
    </div>
    ${orcRows.length ? `
    <div class="hcard-divider"></div>
    ${orcRows.map(r => `
      <div class="hcard-bar-row">
        <span class="hcard-bar-lbl hcard-bar-cat">${r.nome}</span>
        <div class="hcard-bar"><div class="hcard-bar-fill" style="width:${Math.min(r.pct, 100)}%;background:${orcColor(r.pct)}"></div></div>
        <span class="hcard-orc-vals">${fmtBRL(r.realizado)}<span class="hcard-orc-sep">/</span>${fmtBRL(r.orcado)}</span>
      </div>`).join('')}` : ''}
    <div class="hcard-foot">${doMes.length} lançamentos${orcRows.length ? ` · ${orcRows.length} cats orçadas` : ''}</div>
  `
}

// ── CARD EXERCISES ────────────────────────────────────────────────────────────

function _homeExCard(exercicios, mesKey) {
  const el = document.getElementById('home-ex-content')
  if (!el) return

  if (!exercicios?.length) {
    el.innerHTML = '<p class="hcard-empty">Sem treinos ainda</p>'
    return
  }

  const doMes      = exercicios.filter(e => e.data.startsWith(mesKey))
  const totalEx    = doMes.length
  const diasUnicos = new Set(doMes.map(e => e.data)).size

  const [my, mm]  = mesKey.split('-').map(Number)
  const now       = new Date()
  const isCurrMes = now.getFullYear() === my && now.getMonth() + 1 === mm
  const diasNoMes = isCurrMes ? now.getDate() : new Date(my, mm, 0).getDate()
  const semanas   = Math.ceil(diasNoMes / 7)
  const avgSemana = semanas > 0 ? (diasUnicos / semanas).toFixed(1) : '—'

  const comEsforco = doMes.filter(e => e.esforco != null && e.esforco > 0)
  const avgEsforco = comEsforco.length
    ? (comEsforco.reduce((s, e) => s + e.esforco, 0) / comEsforco.length).toFixed(1)
    : null

  const comDur = doMes.filter(e => e.duracao != null && e.duracao > 0)
  const avgDur = comDur.length
    ? Math.round(comDur.reduce((s, e) => s + e.duracao, 0) / comDur.length)
    : null

  const grupoCount = {}
  doMes.forEach(e => {
    if (e.grupo_nome) grupoCount[e.grupo_nome] = (grupoCount[e.grupo_nome] || 0) + 1
  })
  const topGrupos = Object.entries(grupoCount).sort((a, b) => b[1] - a[1])
  const maxCount  = topGrupos[0]?.[1] || 1

  const lastData = exercicios.map(e => e.data).sort().at(-1)
  const diffDays = Math.round((now - new Date(lastData + 'T00:00:00')) / 86400000)
  const lastStr  = diffDays === 0 ? 'hoje' : diffDays === 1 ? 'ontem' : `há ${diffDays} dias`

  const kpis = [
    { val: diasUnicos,                   lbl: 'dias'    },
    avgEsforco ? { val: `${avgEsforco}/10`, lbl: 'esforço' } : null,
    avgDur     ? { val: `${avgDur}min`,     lbl: 'duração' } : null,
  ].filter(Boolean)

  el.innerHTML = `
    <div class="hcard-main-row">
      <span class="hcard-big">${totalEx}<span class="hcard-unit"> exercícios</span></span>
      <span class="hcard-sub">${avgSemana}×/sem</span>
    </div>
    <div class="hcard-stats-row">
      ${kpis.map(k => `
        <div class="hcard-stat">
          <div class="hcard-stat-val">${k.val}</div>
          <div class="hcard-stat-lbl">${k.lbl}</div>
        </div>`).join('')}
    </div>
    ${topGrupos.length ? `
    <div class="hcard-divider"></div>
    ${topGrupos.map(([g, n]) => `
      <div class="hcard-bar-row">
        <span class="hcard-bar-lbl hcard-bar-cat">${g}</span>
        <div class="hcard-bar"><div class="hcard-bar-fill" style="width:${Math.round(n / maxCount * 100)}%;background:var(--accent3)"></div></div>
        <span class="hcard-bar-val">${n}×</span>
      </div>`).join('')}` : ''}
    <div class="hcard-foot">Último treino: ${lastStr}</div>
  `
}

// ── CARD GOALS ────────────────────────────────────────────────────────────────

function _homeGoalsCard(entradas, metas, mesKey) {
  const el = document.getElementById('home-goals-content')
  if (!el) return

  if (!metas?.length) {
    el.innerHTML = '<p class="hcard-empty">Sem metas cadastradas</p>'
    return
  }

  // Normaliza tp_metrica — o banco pode gravar 'meta' em vez de 'mensal'
  window.goalsMetas = metas.map(m => {
    const tp = (m.tp_metrica || '').toLowerCase()
    return { ...m, tp_metrica: tp === 'meta' ? 'mensal' : tp }
  })
  window.goalsEntradas = entradas || []

  const score = typeof _gMonthScore === 'function' ? _gMonthScore(mesKey) : null

  if (!score?.hasMetas) {
    el.innerHTML = '<p class="hcard-empty">Sem dados neste mês</p>'
    return
  }

  const grade    = score.grade ?? { label: '?', color: 'var(--surface2)', fg: 'var(--text-muted)' }
  const allMetas = [...(score.metaScores ?? [])].sort((a, b) => b.pct - a.pct)

  el.innerHTML = `
    <div class="hcard-main-row" style="align-items:center;gap:12px">
      <div class="hcard-grade" style="background:${grade.color};color:${grade.fg}">${grade.label}</div>
      <span class="hcard-big" style="font-size:1.8rem">${score.pct}%</span>
      <span class="hcard-sub">${score.totalGanho.toFixed(0)}/${score.totalPossivel.toFixed(0)} pts</span>
    </div>
    ${allMetas.length ? `
    <div class="hcard-divider"></div>
    ${allMetas.map(ms => `
      <div class="hcard-bar-row">
        <span class="hcard-bar-lbl hcard-bar-cat">${ms.meta.goal_nome}</span>
        <div class="hcard-bar"><div class="hcard-bar-fill" style="width:${ms.pct}%;background:${ms.pct >= 80 ? 'var(--accent)' : ms.pct >= 50 ? 'var(--accent3)' : 'var(--danger)'}"></div></div>
        <span class="hcard-bar-val">${ms.pct}%</span>
      </div>`).join('')}` : ''}
  `
}
