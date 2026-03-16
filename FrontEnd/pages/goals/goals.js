
//
// Tabelas consumidas (via API):
//   codigo_goals  → cadastro de metas (árvore: grupos + metas folha)
//   pontuacao_goal→ regras de pontuação:
//                     tp_metrica  = 'diario' | 'semanal' | 'mensal'
//                     valor       = frequência alvo (diario=1, semanal=Nxsemana, mensal=1)
//                     pts         = pontos que vale se cumprir
//                     data        = NULL para sempre | 'YYYY-MM-01' para meta mensal de peso
//                     cd_medida   = FK para codigo_medida (medição automática, ex: peso)
//   entrada_goals → check diário: data, cd_goal, realizado_no_dia (Boolean)
//
// Algoritmo de score mensal:
//   diario  → (dias com realizado_no_dia no mês) / lastDay  × pts
//   semanal → feitos / (lastDay × valor_alvo/7)  × pts   [crédito parcial]
//   mensal  → pts inteiros se há medição <= valor_alvo (ou entrada manual)
//
// Calendário: usa TODAS as metas (diario + semanal), colore por % de goals feitos no dia


window.goalsCodigos  = []   // árvore [{id, nome, filhos:[...]}]
window.goalsMetas    = []   // [{id, data, tp_metrica, cd_goal, goal_nome, valor_alvo, pts}]
window.goalsEntradas = []   // [{id, data, cd_goal, progresso}]

let _goalsMesDetalhe  = null   // 'YYYY-MM' — mês aberto no detalhe
let _goalsCalFilter   = null   // null = todos | cd_goal = filtrado por 1 goal
let _goalsDataLoadedAt = 0
const _GOALS_CACHE_TTL_MS = 45000

function _goalsHasFreshCache() {
  return _goalsDataLoadedAt > 0
    && (Date.now() - _goalsDataLoadedAt) < _GOALS_CACHE_TTL_MS
    && Array.isArray(window.goalsMetas)
    && Array.isArray(window.goalsEntradas)
}

// Retorna a data da segunda-feira da semana que contém dateStr
function _gWeekKey(dateStr) {
  const d   = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay() || 7       // Dom=0 → 7
  d.setDate(d.getDate() - (dow - 1))
  return d.toISOString().slice(0, 10)
}

function _gFmtMes(mk, long = true) {
  const [y, m] = mk.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return long
    ? d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function _gGrade(pct) {
  if (pct >= 80) return { label: 'A', color: 'var(--accent)',  fg: '#0d0f0e' }
  if (pct >= 65) return { label: 'B', color: 'var(--accent2)', fg: '#0d0f0e' }
  if (pct >= 50) return { label: 'C', color: '#f5d742',        fg: '#0d0f0e' }
  return           { label: 'D', color: 'var(--danger)',    fg: '#fff'     }
}

function _gMonthScore(mesKey) {
  const [y, m]      = mesKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const today       = new Date()
  const isCurrent   = y === today.getFullYear() && m === today.getMonth() + 1
  const lastDay     = isCurrent ? today.getDate() : daysInMonth

  // Entradas deste mês, indexadas por cd_goal
  const entradasMes = window.goalsEntradas.filter(e => e.data.startsWith(mesKey))
  const entrByGoal  = {}
  entradasMes.forEach(e => {
    ;(entrByGoal[e.cd_goal] = entrByGoal[e.cd_goal] || []).push(e)
  })

  // Metas aplicáveis ao mês:
  //   data=null  → sempre válida
  //   data set   → só vale se data.startsWith(mesKey)
  const metas = window.goalsMetas.filter(mm =>
    mm.data === null || mm.data === undefined || mm.data.startsWith(mesKey)
  )

  if (metas.length === 0 && entradasMes.length === 0) return null

  let totalPossivel = 0
  let totalGanho    = 0

  // Pontuação por meta e por período para o breakdown
  const metaScores = []

  for (const meta of metas) {
    const entradas = entrByGoal[meta.cd_goal] || []
    const pts      = meta.pts ?? 1

    if (meta.tp_metrica === 'diario') {
      // Cada dia do mês conta como 1 oportunidade
      const feitos   = entradas.filter(e => e.progresso >= 1).length
      const possivel = lastDay * pts
      const ganho    = feitos * pts
      totalPossivel += possivel
      totalGanho    += ganho
      metaScores.push({
        meta, feitos, total: lastDay,
        ganho, possivel,
        pct: lastDay > 0 ? Math.round((feitos / lastDay) * 100) : 0,
        label: `${feitos}/${lastDay} dias`,
      })

    } else if (meta.tp_metrica === 'semanal') {
      // Esperado no mês = lastDay × (valor_alvo / 7)
      // Exemplo: valor_alvo=5, 28 dias → esperado = 20 dias (71,4%/dia)
      // Score = min(feitos / esperado, 1) → pontos = score × pts
      const esperado = lastDay * (meta.valor_alvo / 7)
      const feitos   = entradas.filter(e => e.progresso >= 1).length
      const rate     = esperado > 0 ? Math.min(feitos / esperado, 1) : 0
      const ganho    = rate * pts
      totalPossivel += pts
      totalGanho    += ganho
      metaScores.push({
        meta, feitos, total: Math.round(esperado),
        ganho, possivel: pts,
        pct: Math.round(rate * 100),
        label: `${feitos}/${Math.round(esperado)} dias esperados (${meta.valor_alvo}×/sem)`,
      })

    } else if (meta.tp_metrica === 'mensal') {
      // Se tem medição real (via cd_medida), usa ela; senão cai no check manual de entrada
      let feito = 0
      let label = 'Não atingida ainda'
      if (meta.valor_medido !== null && meta.valor_medido !== undefined) {
        // Meta de redução: valor medido <= valor_alvo
        feito = meta.valor_medido <= meta.valor_alvo ? 1 : 0
        const diff = (meta.valor_medido - meta.valor_alvo).toFixed(1)
        label = feito
          ? `✓ ${meta.valor_medido} (meta: ${meta.valor_alvo})`
          : `${meta.valor_medido} → faltam ${diff > 0 ? '+' : ''}${diff} para ${meta.valor_alvo}`
      } else {
        feito = entradas.some(e => e.progresso >= 1) ? 1 : 0
        label = feito ? 'Meta atingida' : 'Não atingida ainda'
      }
      totalPossivel += pts
      totalGanho    += feito * pts
      metaScores.push({
        meta, feitos: feito, total: 1,
        ganho: feito * pts, possivel: pts,
        pct: feito * 100,
        label,
      })
    }
  }

  const pct = totalPossivel > 0 ? Math.round((totalGanho / totalPossivel) * 100) : 0

  // Score diário (para o calendário) — considera TODAS as metas com entrada no dia
  const dailyScores = {}
  for (let d = 1; d <= lastDay; d++) {
    const ds = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    let done = 0
    for (const md of metas) {
      const e = (entrByGoal[md.cd_goal] || []).find(x => x.data === ds)
      if (e && e.progresso >= 1) done++
    }
    if (done > 0) {
      dailyScores[d] = { score: done / metas.length, done, total: metas.length }
    }
  }

  const daysWithData = Object.keys(dailyScores).length

  return {
    mesKey, pct, grade: _gGrade(pct),
    totalGanho, totalPossivel,
    metaScores, dailyScores,
    daysWithData, lastDay, isCurrent,
    hasMetas: metas.length > 0,
  }
}

function _gGetMeses() {
  const s = new Set()
  // Só meses que têm entradas reais registradas
  window.goalsEntradas.forEach(e => e.data && s.add(e.data.slice(0, 7)))
  // + mês atual sempre aparece
  const now = new Date()
  s.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  return [...s].sort().reverse()
}

function goalsRenderOverview() {
  const meses  = _gGetMeses()
  const scores = meses.map(mk => ({ mk, data: _gMonthScore(mk) })).filter(x => x.data)

  if (window.goalsMetas.length === 0) {
    _gSetOverviewFeedback('◎', 'Nenhuma meta configurada', 'Cadastre metas em codigo_goal e meta no banco para começar.')
    return
  }

  if (scores.length === 0) {
    _gSetOverviewFeedback('◇', 'Nenhum registro ainda', 'Registre entradas de goals para ver seu score.')
    return
  }

  const all = scores.map(x => x.data.pct)
  const avg  = Math.round(all.reduce((s, v) => s + v, 0) / all.length)

  document.getElementById('goals-kpi-avg').innerHTML       = `${avg}<span class="kpi-unit">%</span>`
  document.getElementById('goals-kpi-avg-sub').textContent = `${scores.length} meses`

  const semanais = window.goalsMetas.filter(m => m.tp_metrica === 'semanal')
  const indMedia = semanais.map(meta => {
    const pcts = scores.map(({ data }) => {
      const ms = data.metaScores.find(x => x.meta.cd_goal === meta.cd_goal)
      return ms ? ms.pct : null
    }).filter(v => v !== null)
    const med = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
    return { nome: meta.goal_nome, med }
  }).sort((a, b) => b.med - a.med)

  if (indMedia.length > 0) {
    const best = indMedia[0]
    const worst = indMedia[indMedia.length - 1]
    document.getElementById('goals-kpi-best-ind').innerHTML      = `${best.med}<span class="kpi-unit">%</span>`
    document.getElementById('goals-kpi-best-ind-sub').textContent = best.nome
    document.getElementById('goals-kpi-worst-ind').innerHTML      = `${worst.med}<span class="kpi-unit">%</span>`
    document.getElementById('goals-kpi-worst-ind-sub').textContent = worst.nome
  }

  const mensaisNaoAtingidas = window.goalsMetas
    .filter(m => m.tp_metrica === 'mensal' && m.cd_medida)
    .filter(m => m.valor_medido === null || m.valor_medido === undefined || m.valor_medido > m.valor_alvo)
    .sort((a, b) => {
      if (!a.data && !b.data) return 0
      if (!a.data) return 1
      if (!b.data) return -1
      return a.data.localeCompare(b.data)
    })

  const proxPeso = mensaisNaoAtingidas[0]
  if (proxPeso) {
    const diff = proxPeso.valor_medido != null
      ? ` (faltam ${(proxPeso.valor_medido - proxPeso.valor_alvo).toFixed(1)})`
      : ''
    document.getElementById('goals-kpi-next-weight').innerHTML      = `${proxPeso.valor_alvo}<span class="kpi-unit">kg</span>`
    document.getElementById('goals-kpi-next-weight-sub').textContent =
      (proxPeso.data ? proxPeso.data.slice(0, 7) : '') + diff
  }

  document.getElementById('goals-months-grid').innerHTML =
    scores.map(({ mk, data }) => _gMonthCard(mk, data)).join('')
}

function _gMonthCard(mk, data) {
  const g     = data.grade
  const label = _gFmtMes(mk)

  const dots = data.metaScores.map(ms => {
    const p   = ms.possivel > 0 ? ms.ganho / ms.possivel : 0
    const cls = p >= 0.8 ? 'g-dot-ok' : p >= 0.5 ? 'g-dot-warn' : 'g-dot-miss'
    return `<span class="g-dot ${cls}" title="${ms.meta.goal_nome}: ${Math.round(p * 100)}%"></span>`
  }).join('')

  return `
    <div class="g-month-card${data.isCurrent ? ' g-month-current' : ''}" onclick="goalsShowDetail('${mk}')">
      <div class="g-month-top">
        <span class="g-month-name">${label}</span>
        ${data.isCurrent ? '<span class="g-badge-cur">atual</span>' : ''}
      </div>
      <div class="g-month-body">
        <div class="g-ring-sm" style="--sp:${data.pct};--sc:${g.color}">
          <div class="g-ring-sm-inner">
            <span class="g-ring-sm-num">${data.pct}</span>
            <span class="g-ring-sm-unit">%</span>
          </div>
        </div>
        <div class="g-month-info">
          <div class="g-grade-big" style="color:${g.color}">${g.label}</div>
          <div class="g-days-info">${Math.round(data.totalGanho)}/${Math.round(data.totalPossivel)} pts</div>
          <div class="g-dots-row">${dots}</div>
        </div>
      </div>
    </div>`
}

function goalsShowDetail(mk) {
  _goalsMesDetalhe = mk
  _goalsCalFilter   = null
  document.getElementById('goals-overview').style.display = 'none'
  const detail = document.getElementById('goals-detail')
  if (detail) {
    detail.classList.remove('fin-hidden')
    detail.style.display = ''
  }
  _gRenderDetail(mk)
}

function goalsShowOverview() {
  _goalsMesDetalhe = null
  document.getElementById('goals-overview').style.display = ''
  const detail = document.getElementById('goals-detail')
  if (detail) {
    detail.style.display = 'none'
    detail.classList.add('fin-hidden')
  }
}

function _gRenderDetail(mk) {
  const data = _gMonthScore(mk)
  if (!data) return

  const g = data.grade

  document.getElementById('goals-det-title').textContent = _gFmtMes(mk)
  const badge = document.getElementById('goals-det-grade')
  Object.assign(badge.style, { background: g.color, color: g.fg })
  badge.textContent = `Nota ${g.label}`

  const ring = document.getElementById('goals-det-ring')
  ring.style.setProperty('--sp', data.pct)
  ring.style.setProperty('--sc', g.color)
  document.getElementById('goals-det-pct').textContent = data.pct + '%'
  document.getElementById('goals-det-days').textContent =
    `${Math.round(data.totalGanho)} de ${Math.round(data.totalPossivel)} pts possíveis`

  _gRenderWeightCard(mk, data)
  _gRenderBreakdown(data)
  _gRenderCalendar(mk, data)
}

function _gRenderWeightCard(mk, data) {
  const el      = document.getElementById('goals-weight-card')
  const mensais = data.metaScores.filter(ms => ms.meta.tp_metrica === 'mensal')

  if (mensais.length === 0) {
    el.style.display = 'none'
    return
  }
  el.style.display = ''

  const rows = mensais.map(ms => {
    const m   = ms.meta
    const col = ms.pct >= 100 ? 'var(--accent)' : 'var(--danger)'

    let valorHtml = ''
    if (m.valor_medido !== null && m.valor_medido !== undefined) {
      const diff    = (m.valor_medido - m.valor_alvo).toFixed(1)
      const diffCol = diff <= 0 ? 'var(--accent)' : 'var(--danger)'
      const unidade = m.cd_medida ? '' : ''
      valorHtml = `
        <div class="g-w-vals">
          <span class="g-w-val-actual" style="color:${col}">${m.valor_medido}</span>
          <span class="g-w-val-sep">→</span>
          <span class="g-w-val-target">alvo: ${m.valor_alvo}</span>
          <span style="color:${diffCol};font-size:0.72rem">(${diff > 0 ? '+' : ''}${diff})</span>
        </div>
        ${m.data_medido ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:6px">medido em ${m.data_medido}</div>` : ''}`
    }

    const btnHtml = (m.valor_medido === null || m.valor_medido === undefined)
      ? `<div style="margin-bottom:10px">
           <button class="g-w-save-btn" style="font-size:0.7rem;padding:4px 12px"
             onclick="goalsMensalToggle('${mk}',${m.cd_goal},${ms.feitos === 1 ? 0 : 1})">
             ${ms.feitos === 1 ? 'Marcar como não atingida' : '+ Marcar como atingida'}
           </button>
         </div>`
      : ''

    return `
      <div class="g-w-row">
        <span class="g-w-lbl">${m.goal_nome}</span>
        <strong style="color:${col}">${ms.pct >= 100 ? '✓' : '✗'}</strong>
      </div>
      ${valorHtml}
      ${btnHtml}`
  }).join('')

  el.innerHTML = `
    <div class="g-w-title">◎ Metas mensais</div>
    ${rows}`
}

async function goalsMensalToggle(mk, cd_goal, progresso) {
  const today = `${mk}-01`   // usa dia 1 como representante do mês
  try {
    await postGoalEntrada(today, cd_goal, progresso)
    window.goalsEntradas = await fetchGoalsEntradas()
    _gRenderDetail(mk)
  } catch (err) {
    console.error('Erro ao salvar entrada mensal:', err)
    if (typeof showAppToast === 'function') showAppToast('Não foi possível salvar meta mensal.', 'error')
  }
}

function _gRenderBreakdown(data) {
  const el = document.getElementById('goals-breakdown')
  if (data.metaScores.length === 0) {
    el.innerHTML = '<div class="inline-empty-note">Nenhuma meta ativa para este mês.</div>'
    return
  }

  const porTipo = { diario: [], semanal: [], mensal: [] }
  data.metaScores.forEach(ms => {
    const t = ms.meta.tp_metrica
    ;(porTipo[t] = porTipo[t] || []).push(ms)
  })

  const tipoLabel = { diario: 'Diárias', semanal: 'Semanais', mensal: 'Mensais' }

  let html = ''
  for (const tipo of ['diario', 'semanal', 'mensal']) {
    const lista = porTipo[tipo]
    if (!lista || lista.length === 0) continue
    html += `<div class="g-ind-group-label">${tipoLabel[tipo]}</div>`
    html += lista.map(ms => {
      const col      = ms.pct >= 80 ? 'var(--accent)' : ms.pct >= 50 ? 'var(--accent3)' : 'var(--danger)'
      const ptsLabel = `${Math.round(ms.ganho)}/${ms.possivel} pts`
      return `
        <div class="g-ind-row">
          <div class="g-ind-top">
            <span class="g-ind-name">${ms.meta.goal_nome}</span>
            <div class="g-ind-bar-wrap">
              <div class="g-ind-bar" style="width:${ms.pct}%;background:${col}"></div>
            </div>
          </div>
          <div class="g-ind-bottom">
            <span class="g-ind-pct" style="color:${col}">${ms.pct}%</span>
            <span class="g-ind-days">${ms.label}</span>
            <span class="g-ind-pts" style="color:${col}">${ptsLabel}</span>
          </div>
        </div>`
    }).join('')
  }

  el.innerHTML = html
}

function _gRenderCalendar(mk, data) {
  const [y, m]      = mk.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstDow    = new Date(y, m - 1, 1).getDay()
  const offset      = firstDow === 0 ? 6 : firstDow - 1
  const today       = new Date()
  const isCurMonth  = y === today.getFullYear() && m === today.getMonth() + 1
  const headers     = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const metasSemanal = window.goalsMetas.filter(mm =>
    mm.tp_metrica === 'semanal' &&
    (mm.data === null || mm.data === undefined || mm.data.startsWith(mk))
  )

  const doneOn = (cd, ds) =>
    (window.goalsEntradas || []).some(e => e.data === ds && e.cd_goal === cd && e.progresso >= 1)

  let filtersHtml = `<div class="g-cal-filters">
    <button class="g-cal-chip${_goalsCalFilter === null ? ' active' : ''}" onclick="_goalsCalFilter=null;_gRenderCalendar('${mk}',_gMonthScore('${mk}'))">Todos</button>`
  metasSemanal.forEach(mm => {
    const a = _goalsCalFilter === mm.cd_goal
    filtersHtml += `<button class="g-cal-chip${a ? ' active' : ''}" onclick="_goalsCalFilter=${mm.cd_goal};_gRenderCalendar('${mk}',_gMonthScore('${mk}'))">${mm.goal_nome}</button>`
  })
  filtersHtml += `</div>`

  let html = filtersHtml + '<div class="g-cal-grid">'
  headers.forEach(h => { html += `<div class="g-cal-hdr">${h}</div>` })
  for (let i = 0; i < offset; i++) html += '<div></div>'

  for (let d = 1; d <= daysInMonth; d++) {
    const ds       = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isFuture = isCurMonth && d > today.getDate()
    const isToday  = isCurMonth && d === today.getDate()

    let cls      = 'g-cal-day'
    let style    = ''
    let dotsHtml = ''

    if (isFuture) {
      cls += ' g-cal-future'
    } else if (_goalsCalFilter !== null) {
      if (doneOn(_goalsCalFilter, ds)) {
        cls   += ' g-cal-has'
        style  = '--dc:var(--accent)'
      } else {
        cls += ' g-cal-nodata'
      }
    } else {
      const dd = data.dailyScores[d]
      if (!dd) {
        cls += ' g-cal-nodata'
      } else {
        cls  += ' g-cal-has'
        const dc = dd.score >= 0.8 ? 'var(--accent)'
                 : dd.score >= 0.6 ? 'var(--accent3)'
                 : dd.score >= 0.4 ? '#f5d742' : 'var(--danger)'
        style = `--dc:${dc}`
      }
      if (!isFuture && metasSemanal.length > 0) {
        dotsHtml = `<span class="g-cal-dots">${
          metasSemanal.map(mm =>
            `<span class="g-cal-dot${doneOn(mm.cd_goal, ds) ? ' ok' : ''}" title="${mm.goal_nome}"></span>`
          ).join('')
        }</span>`
      }
    }

    if (isToday) cls += ' g-cal-today'

    html += `<div class="${cls}" style="${style}">
      <span class="g-cal-num">${d}</span>
      ${dotsHtml}
    </div>`
  }

  html += '</div>'

  if (_goalsCalFilter !== null) {
    html += `<div class="g-cal-legend">
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--accent)"></span>feito</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--surface2);border:1px solid var(--border)"></span>não feito</span>
    </div>`
  } else {
    html += `<div class="g-cal-legend">
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--accent)"></span>≥ 80%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--accent3)"></span>60–79%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:#f5d742"></span>40–59%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--danger)"></span>< 40%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--surface2);border:1px solid var(--border)"></span>sem dados</span>
    </div>`
  }

  document.getElementById('goals-calendar').innerHTML = html
}

function _gEscHtml(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function _gFeedbackHtml(icon, title, sub = '', details = '', isError = false) {
  return `
    <div class="section-feedback${isError ? ' error' : ''}">
      <div class="section-feedback-icon">${icon}</div>
      <div class="section-feedback-title">${title}</div>
      ${sub ? `<div class="section-feedback-sub">${sub}</div>` : ''}
      ${details ? `<div class="section-feedback-details">${_gEscHtml(details)}</div>` : ''}
    </div>
  `
}

function _gSetOverviewFeedback(icon, title, sub = '', details = '', isError = false) {
  const el = document.getElementById('goals-months-grid')
  if (!el) return
  el.innerHTML = _gFeedbackHtml(icon, title, sub, details, isError)
}

async function initGoalsSection(forceRefresh = false) {
  if (!forceRefresh && _goalsHasFreshCache()) {
    goalsShowOverview()
    goalsRenderOverview()
    return
  }

  let erroApi = null

  goalsShowOverview()
  _gSetOverviewFeedback('⏳', 'Carregando Goals', 'Buscando metas e entradas...')

  const grid = document.getElementById('goals-months-grid')
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    try {
      if (tentativa > 1 && grid) {
        _gSetOverviewFeedback('⏳', `Acordando o servidor (${tentativa}/5)`, 'Render free tier pode demorar até 60s')
      }
      const [codigos, metas, entradas] = await Promise.all([
        fetchGoalsCodigos(),
        fetchGoalsMetas(),
        fetchGoalsEntradas(),
      ])
      window.goalsCodigos  = codigos
      window.goalsMetas    = metas.map(m => {
        const tp = (m.tp_metrica || '').toLowerCase()
        return { ...m, tp_metrica: tp === 'meta' ? 'mensal' : tp }
      })
      window.goalsEntradas = entradas
      _goalsDataLoadedAt = Date.now()
      erroApi = null
      break
    } catch (err) {
      erroApi = err.message || String(err)
      console.warn(`[Goals] Tentativa ${tentativa}/5 falhou:`, erroApi)
      if (tentativa < 5) await new Promise(r => setTimeout(r, 15000))
    }
  }

  if (erroApi) {
    _gSetOverviewFeedback('⚠', 'Erro ao carregar dados da API', 'Verifique conexão e disponibilidade do backend.', erroApi, true)
    if (typeof showAppToast === 'function') showAppToast('Goals indisponível no momento.', 'error')
    return
  }

  try {
    goalsRenderOverview()
  } catch (err) {
    console.error('[Goals] Erro em goalsRenderOverview:', err)
    _gSetOverviewFeedback('⚠', 'Erro ao renderizar Goals', 'Houve uma falha ao montar a visualização.', err?.message || String(err), true)
    if (typeof showAppToast === 'function') showAppToast('Falha ao renderizar Goals.', 'error')
  }
}

async function openGoalsModal() {
  if (!document.getElementById('goals-modal-overlay')) {
    await loadHTML('pages/goals/goals-modal.html', 'modal-container-goals')
  }

  const today = new Date().toISOString().split('T')[0]
  document.getElementById('goals-modal-data').value = today

  _goalsModalPopulate(today)

  document.getElementById('goals-modal-overlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeGoalsModal() {
  const el = document.getElementById('goals-modal-overlay')
  if (el) el.classList.remove('open')
  document.body.style.overflow = ''
}

function closeGoalsModalOutside(event) {
  if (event.target === document.getElementById('goals-modal-overlay')) closeGoalsModal()
}

function goalsModalOnDateChange() {
  const data = document.getElementById('goals-modal-data').value
  if (data) _goalsModalPopulate(data)
}

function _goalsModalPopulate(dateStr) {
  const metas = window.goalsMetas.filter(m => m.tp_metrica === 'semanal')
  const list  = document.getElementById('goals-modal-list')

  if (metas.length === 0) {
    list.innerHTML = '<div class="inline-empty-note">Nenhuma meta semanal cadastrada.</div>'
    return
  }

  list.innerHTML = metas.map(m => {
    const done = (window.goalsEntradas || []).some(
      e => e.data === dateStr && e.cd_goal === m.cd_goal && e.progresso >= 1
    )
    return `
      <div class="gm-row" id="gm-row-${m.cd_goal}">
        <span class="gm-name">${m.goal_nome}</span>
        <button class="gm-toggle${done ? ' done' : ''}"
          onclick="goalsModalToggle(${m.cd_goal}, this)"
          data-state="${done ? '1' : '0'}">
          ${done ? '✓ Feito' : 'Não feito'}
        </button>
      </div>`
  }).join('')
}

function goalsModalToggle(cd_goal, btn) {
  const isDone = btn.dataset.state === '1'
  btn.dataset.state = isDone ? '0' : '1'
  btn.textContent   = isDone ? 'Não feito' : '✓ Feito'
  btn.classList.toggle('done', !isDone)
}

async function saveGoalEntradas() {
  const dateStr = document.getElementById('goals-modal-data').value
  if (!dateStr) return

  const saveBtn = document.getElementById('goals-modal-save-btn')
  saveBtn.disabled    = true
  saveBtn.textContent = 'Salvando…'

  const metas = window.goalsMetas.filter(m => m.tp_metrica === 'semanal')

  try {
    await Promise.all(metas.map(m => {
      const btn      = document.querySelector(`#gm-row-${m.cd_goal} .gm-toggle`)
      const progresso = btn && btn.dataset.state === '1' ? 1 : 0
      return postGoalEntrada(dateStr, m.cd_goal, progresso)
    }))

    window.goalsEntradas = await fetchGoalsEntradas()

    saveBtn.disabled    = false
    saveBtn.textContent = 'Salvar'
    closeGoalsModal()

    if (_goalsMesDetalhe) {
      _gRenderDetail(_goalsMesDetalhe)
    } else {
      goalsRenderOverview()
    }
  } catch (err) {
    console.error('Erro ao salvar goals:', err)
    if (typeof showAppToast === 'function') showAppToast('Erro ao salvar progresso de Goals.', 'error')
    saveBtn.textContent = 'Erro!'
    setTimeout(() => { saveBtn.disabled = false; saveBtn.textContent = 'Salvar' }, 2000)
  }
}
