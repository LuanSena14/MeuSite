// ─────────────────────────────────────────────────────────────────────────────
// goals.js — Sistema de pontuação mensal baseado em dados reais do banco
//
// Tabelas consumidas (via API):
//   codigo_goal   → cadastro de metas (árvore: grupos + metas folha)
//   meta          → regras de pontuação:
//                     tp_metrica  = 'diario' | 'semanal' | 'mensal'
//                     valor_alvo  = frequência alvo (diario=1, semanal=Nxsemana, mensal=1)
//                     pts         = pontos que vale se cumprir
//                     data        = NULL para sempre | 'YYYY-MM-01' para meta mensal de peso
//   entrada_goal  → check diário: data, cd_goal, progresso (0=não fez, 1=fez)
//
// Algoritmo de score mensal:
//   diario  → (dias com progresso≥1 no mês) / lastDay  × pts
//   semanal → feitos / (lastDay × valor_alvo/7)  × pts   [crédito parcial]
//   mensal  → pts inteiros se há entrada com progresso≥1 no mês
//
// Calendário: usa TODAS as metas (diario + semanal), colore por % de goals feitos no dia
// ─────────────────────────────────────────────────────────────────────────────

// ── DADOS GLOBAIS ─────────────────────────────────────────────────────────────

window.goalsCodigos  = []   // árvore [{id, nome, filhos:[...]}]
window.goalsMetas    = []   // [{id, data, tp_metrica, cd_goal, goal_nome, valor_alvo, pts}]
window.goalsEntradas = []   // [{id, data, cd_goal, progresso}]

let _goalsMesDetalhe = null   // 'YYYY-MM' — mês aberto no detalhe

// ── HELPERS DE DATA ───────────────────────────────────────────────────────────

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

// ── ENGINE DE SCORE MENSAL ────────────────────────────────────────────────────

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
  const metas = window.goalsMetas.filter(m =>
    m.data === null || m.data === undefined || m.data.startsWith(mesKey)
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
      const feito   = entradas.some(e => e.progresso >= 1) ? 1 : 0
      totalPossivel += pts
      totalGanho    += feito * pts
      metaScores.push({
        meta, feitos: feito, total: 1,
        ganho: feito * pts, possivel: pts,
        pct: feito * 100,
        label: feito ? 'Meta atingida' : 'Não atingida ainda',
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

// ── MESES COM DADOS ───────────────────────────────────────────────────────────

function _gGetMeses() {
  const s = new Set()
  window.goalsEntradas.forEach(e => e.data && s.add(e.data.slice(0, 7)))
  // Inclui meses das metas mensais
  window.goalsMetas.filter(m => m.data).forEach(m => s.add(m.data.slice(0, 7)))
  const now = new Date()
  s.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  return [...s].sort().reverse()
}

// ── RENDER: OVERVIEW ──────────────────────────────────────────────────────────

function goalsRenderOverview() {
  const meses  = _gGetMeses()
  console.log('[Goals] goalsRenderOverview — meses:', meses.length, meses)
  const scores = meses.map(mk => ({ mk, data: _gMonthScore(mk) })).filter(x => x.data)
  console.log('[Goals] scores:', scores.length, scores.map(s => ({ mk: s.mk, pct: s.data?.pct })))

  if (window.goalsMetas.length === 0) {
    document.getElementById('goals-months-grid').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:16px">◎</div>
        <div style="font-size:1rem;margin-bottom:8px;color:var(--text-dim)">Nenhuma meta configurada</div>
        <div style="font-size:0.85rem">Cadastre metas em <code>codigo_goal</code> e <code>meta</code> no banco para começar.</div>
      </div>`
    return
  }

  if (scores.length === 0) {
    document.getElementById('goals-months-grid').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:16px">◇</div>
        <div style="font-size:1rem;margin-bottom:8px;color:var(--text-dim)">Nenhum registro ainda</div>
        <div style="font-size:0.85rem">Registre entradas de goals para ver seu score.</div>
      </div>`
    return
  }

  const all      = scores.map(x => x.data.pct)
  const avg      = Math.round(all.reduce((s, v) => s + v, 0) / all.length)
  const bestVal  = Math.max(...all)
  const bestMes  = scores.find(x => x.data.pct === bestVal)

  let streak = 0
  for (const { data } of scores) {
    if (data.pct >= 70) streak++; else break
  }

  const now     = new Date()
  const curKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const curData = scores.find(x => x.mk === curKey)?.data

  document.getElementById('goals-kpi-avg').innerHTML       = `${avg}<span class="kpi-unit">%</span>`
  document.getElementById('goals-kpi-avg-sub').textContent = `${scores.length} meses`

  document.getElementById('goals-kpi-best').innerHTML      = `${bestVal}<span class="kpi-unit">%</span>`
  document.getElementById('goals-kpi-best-sub').textContent = bestMes ? _gFmtMes(bestMes.mk, false) : ''

  document.getElementById('goals-kpi-streak').innerHTML    = `${streak}<span class="kpi-unit">meses</span>`

  document.getElementById('goals-kpi-current').innerHTML   = curData
    ? `${curData.pct}<span class="kpi-unit">%</span>` : '—'
  const gradeEl = document.getElementById('goals-kpi-current-grade')
  if (curData) {
    gradeEl.textContent = `Nota ${curData.grade.label}`
    gradeEl.style.color = curData.grade.color
  }

  document.getElementById('goals-months-grid').innerHTML =
    scores.map(({ mk, data }) => _gMonthCard(mk, data)).join('')
}

function _gMonthCard(mk, data) {
  const g     = data.grade
  const label = _gFmtMes(mk)

  // Um dot por meta-score: cor = achievement
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

// ── RENDER: DETALHE ───────────────────────────────────────────────────────────

function goalsShowDetail(mk) {
  _goalsMesDetalhe = mk
  document.getElementById('goals-overview').style.display = 'none'
  document.getElementById('goals-detail').style.display   = ''
  _gRenderDetail(mk)
}

function goalsShowOverview() {
  _goalsMesDetalhe = null
  document.getElementById('goals-overview').style.display = ''
  document.getElementById('goals-detail').style.display   = 'none'
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

// Card de meta mensal (peso ou qualquer outra meta mensal)
function _gRenderWeightCard(mk, data) {
  const el      = document.getElementById('goals-weight-card')
  const mensais = data.metaScores.filter(ms => ms.meta.tp_metrica === 'mensal')

  if (mensais.length === 0) {
    el.style.display = 'none'
    return
  }
  el.style.display = ''

  const rows = mensais.map(ms => {
    const col  = ms.pct >= 100 ? 'var(--accent)' : ms.total === 1 && ms.feitos === 0 ? 'var(--danger)' : 'var(--text-muted)'
    const icon = ms.pct >= 100 ? '✓ atingida' : '– ainda não marcada'
    return `
      <div class="g-w-row"><span class="g-w-lbl">${ms.meta.goal_nome}</span>
        <strong style="color:${col}">${icon}</strong>
      </div>
      <div style="margin-bottom:10px">
        <button class="g-w-save-btn" style="font-size:0.7rem;padding:4px 12px"
          onclick="goalsMensalToggle('${mk}',${ms.meta.cd_goal},${ms.feitos === 1 ? 0 : 1})">
          ${ms.feitos === 1 ? 'Marcar como não atingida' : '+ Marcar como atingida'}
        </button>
      </div>`
  }).join('')

  el.innerHTML = `
    <div class="g-w-title">◎ Metas mensais</div>
    ${rows}`
}

async function goalsMensalToggle(mk, cd_goal, progresso) {
  const today = `${mk}-01`   // usa dia 1 como representante do mês
  try {
    await postGoalEntrada(today, cd_goal, progresso)
    // Re-carrega só as entradas e re-renderiza
    window.goalsEntradas = await fetchGoalsEntradas()
    _gRenderDetail(mk)
  } catch (err) {
    console.error('Erro ao salvar entrada mensal:', err)
  }
}

// Breakdown por meta
function _gRenderBreakdown(data) {
  const el = document.getElementById('goals-breakdown')
  if (data.metaScores.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;padding:8px 0">Nenhuma meta ativa para este mês.</div>'
    return
  }

  // Agrupa por tipo para organizar visualmente
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
      const col = ms.pct >= 80 ? 'var(--accent)' : ms.pct >= 50 ? 'var(--accent3)' : 'var(--danger)'
      return `
        <div class="g-ind-row">
          <div class="g-ind-name">${ms.meta.goal_nome}</div>
          <div class="g-ind-bar-wrap">
            <div class="g-ind-bar" style="width:${ms.pct}%;background:${col}"></div>
          </div>
          <div class="g-ind-pct" style="color:${col}">${ms.pct}%</div>
          <div class="g-ind-days">${ms.label}</div>
        </div>`
    }).join('')
  }

  el.innerHTML = html
}

// Calendário heatmap
function _gRenderCalendar(mk, data) {
  const [y, m]      = mk.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstDow    = new Date(y, m - 1, 1).getDay()
  const offset      = firstDow === 0 ? 6 : firstDow - 1
  const today       = new Date()
  const isCurMonth  = y === today.getFullYear() && m === today.getMonth() + 1
  const headers     = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  // Todas as metas ativas no mês (para tooltip do calendário)
  const metasAtivas = window.goalsMetas.filter(mm =>
    mm.data === null || mm.data === undefined || mm.data.startsWith(mk)
  )

  let html = '<div class="g-cal-grid">'
  headers.forEach(h => { html += `<div class="g-cal-hdr">${h}</div>` })
  for (let i = 0; i < offset; i++) html += '<div></div>'

  for (let d = 1; d <= daysInMonth; d++) {
    const ds       = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const dd       = data.dailyScores[d]
    const isFuture = isCurMonth && d > today.getDate()
    const isToday  = isCurMonth && d === today.getDate()

    let cls   = 'g-cal-day'
    let style = ''

    if (isFuture) {
      cls += ' g-cal-future'
    } else if (!dd) {
      cls += ' g-cal-nodata'
    } else {
      cls += ' g-cal-has'
      const dc = dd.score >= 0.8 ? 'var(--accent)' : dd.score >= 0.6 ? 'var(--accent3)' : dd.score >= 0.4 ? '#f5d742' : 'var(--danger)'
      style = `--dc:${dc}`
    }

    if (isToday) cls += ' g-cal-today'

    let titleStr = ''
    if (dd && metasAtivas.length > 0) {
      const checkedNames = metasAtivas
        .filter(mm => (window.goalsEntradas || []).some(e => e.data === ds && e.cd_goal === mm.cd_goal && e.progresso >= 1))
        .map(mm => mm.goal_nome)
      titleStr = `${Math.round(dd.score * 100)}% — ${checkedNames.join(', ') || 'nenhum'}`
    } else if (!dd && !isFuture) {
      titleStr = 'sem dados'
    }

    html += `<div class="${cls}" style="${style}" title="${titleStr}">
      <span class="g-cal-num">${d}</span>
    </div>`
  }

  html += '</div>'
  html += `
    <div class="g-cal-legend">
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--accent)"></span>≥ 80%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--accent3)"></span>60–79%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:#f5d742"></span>40–59%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--danger)"></span>< 40%</span>
      <span class="g-cal-leg"><span class="g-cal-leg-dot" style="background:var(--surface2);border:1px solid var(--border)"></span>sem dados</span>
    </div>`

  document.getElementById('goals-calendar').innerHTML = html
}

// ── INIT ──────────────────────────────────────────────────────────────────────

async function initGoalsSection() {
  let erroApi = null

  // Mostra loading inicial
  goalsShowOverview()
  document.getElementById('goals-months-grid').innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:1.5rem;margin-bottom:12px">⏳</div>
      <div style="font-size:0.9rem">Carregando dados…</div>
    </div>`

  // Tenta até 5 vezes — Render free tier pode demorar até 60s para acordar
  const grid = document.getElementById('goals-months-grid')
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    try {
      if (tentativa > 1 && grid) {
        grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:1.5rem;margin-bottom:12px">⏳</div>
          <div style="font-size:0.9rem">Acordando o servidor… (tentativa ${tentativa}/5)</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:6px">Render free tier pode demorar até 60s</div>
        </div>`
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
      console.log('[Goals] metas:', window.goalsMetas.length, 'entradas:', window.goalsEntradas.length)
      erroApi = null
      break
    } catch (err) {
      erroApi = err.message || String(err)
      console.warn(`[Goals] Tentativa ${tentativa}/5 falhou:`, erroApi)
      if (tentativa < 5) await new Promise(r => setTimeout(r, 15000))
    }
  }

  if (erroApi) {
    document.getElementById('goals-months-grid').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--danger)">
        <div style="font-size:2rem;margin-bottom:12px">⚠</div>
        <div style="font-size:0.95rem;margin-bottom:6px;color:var(--text-dim)">Erro ao carregar dados da API</div>
        <div style="font-size:0.78rem;color:var(--text-muted);font-family:'DM Mono',monospace">${erroApi}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:10px">Verifique o console e se o backend está deployado.</div>
      </div>`
    return
  }

  try {
    goalsRenderOverview()
  } catch (err) {
    console.error('[Goals] Erro em goalsRenderOverview:', err)
    document.getElementById('goals-months-grid').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--danger)">
        <div style="font-size:2rem;margin-bottom:12px">⚠</div>
        <div style="font-size:0.95rem;margin-bottom:6px;color:var(--text-dim)">Erro ao renderizar</div>
        <div style="font-size:0.78rem;color:var(--text-muted);font-family:'DM Mono',monospace">${err.message}</div>
      </div>`
  }
}
