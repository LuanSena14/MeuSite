// ─────────────────────────────────────────────────────────────────────────────
// goals.js — Sistema de pontuação mensal com 9 indicadores
//
// Indicadores diários (8):
//   checkin   — fez check-in corporal hoje
//   sono      — sono ≥ 7h
//   movimento — campo movimento ≥ 500 kcal
//   exercicio — campo exercicio ≥ 30 min
//   bemEstar  — registrou RMR ou VO2
//   treinou   — ≥ 1 treino registrado
//   duracao   — treinos do dia ≥ 45 min no total  (só se treinou)
//   esforco   — esforço médio ≥ 7/10              (só se treinou)
//
// Indicador mensal (1):
//   pesoMeta  — último peso do mês ≤ meta configurada (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

const GOALS_STORAGE_KEY = 'bodylog_goals_v1'

// ── METAS PADRÃO DOS INDICADORES DIÁRIOS ─────────────────────────────────────

const G_TARGETS = {
  sono:      7,    // horas
  movimento: 500,  // kcal
  exercicio: 30,   // min (campo do check-in)
  duracao:   45,   // min total de treinos no dia
  esforco:   7,    // /10 (média)
}

// ── DEFINIÇÃO DOS 8 INDICADORES ───────────────────────────────────────────────

const G_INDICATORS = [
  { key: 'checkin',   label: 'Check-in',  icon: '◎', requiresTreino: false, desc: 'Fez registro corporal' },
  { key: 'sono',      label: 'Sono',      icon: '◑', requiresTreino: false, desc: `Dormiu ≥ ${G_TARGETS.sono}h` },
  { key: 'movimento', label: 'Movimento', icon: '◇', requiresTreino: false, desc: `Movimento ≥ ${G_TARGETS.movimento} kcal` },
  { key: 'exercicio', label: 'Exercício', icon: '◆', requiresTreino: false, desc: `Campo exercício ≥ ${G_TARGETS.exercicio} min` },
  { key: 'bemEstar',  label: 'Bem-estar', icon: '◈', requiresTreino: false, desc: 'Registrou RMR ou VO2' },
  { key: 'treinou',   label: 'Treinou',   icon: '◉', requiresTreino: false, desc: '≥ 1 treino registrado' },
  { key: 'duracao',   label: 'Duração',   icon: '◉', requiresTreino: true,  desc: `Total de treino ≥ ${G_TARGETS.duracao} min` },
  { key: 'esforco',   label: 'Esforço',   icon: '◉', requiresTreino: true,  desc: `Esforço médio ≥ ${G_TARGETS.esforco}/10` },
]

// ── ESTADO INTERNO ────────────────────────────────────────────────────────────

let _goalsMes   = null   // 'YYYY-MM' — mês aberto no detalhe
let _goalsMetas = {}     // { 'YYYY-MM': number } — metas de peso mensais

// ── PERSISTÊNCIA (localStorage) ───────────────────────────────────────────────

function _goalsLoad() {
  try { _goalsMetas = JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY) || '{}') }
  catch { _goalsMetas = {} }
}

function _goalsSave() {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(_goalsMetas))
}

// ── ACESSO AOS DADOS GLOBAIS ──────────────────────────────────────────────────
// entries (let no dashboard.js) e exercicios (window.exercicios no exercicios.js)

function _gEntries()    { return (typeof entries !== 'undefined' && Array.isArray(entries))    ? entries           : [] }
function _gExercicios() { return (window.exercicios && Array.isArray(window.exercicios))       ? window.exercicios : [] }

// ── SCORE DE UM DIA ───────────────────────────────────────────────────────────
// Retorna null se não há nenhum dado para aquele dia.
// Retorna { score, hits, hasTrein, hasCk } caso contrário.

function _gDayScore(dateStr) {
  const entry   = _gEntries().find(e => e.date === dateStr)
  const treinos = _gExercicios().filter(e => (e.data || '').slice(0, 10) === dateStr)

  const hasTrein = treinos.length > 0
  const hasCk    = !!entry

  if (!hasTrein && !hasCk) return null

  const t = G_TARGETS
  const hits = {
    checkin:   hasCk ? 1 : 0,
    sono:      (entry?.sono      != null && +entry.sono      >= t.sono)      ? 1 : 0,
    movimento: (entry?.movimento != null && +entry.movimento >= t.movimento) ? 1 : 0,
    exercicio: (entry?.exercicio != null && +entry.exercicio >= t.exercicio) ? 1 : 0,
    bemEstar:  (entry?.rmr != null || entry?.vo2 != null)                    ? 1 : 0,
    treinou:   hasTrein ? 1 : 0,
    // null = N/A (não entra no denominador quando não treinou)
    duracao: hasTrein
      ? (treinos.reduce((s, x) => s + (+x.duracao || 0), 0) >= t.duracao ? 1 : 0)
      : null,
    esforco: hasTrein
      ? (treinos.reduce((s, x) => s + (+x.esforco || 0), 0) / treinos.length >= t.esforco ? 1 : 0)
      : null,
  }

  const applicable = G_INDICATORS.filter(i => !i.requiresTreino || hasTrein)
  const total = applicable.length
  const sum   = applicable.reduce((s, i) => s + (hits[i.key] ?? 0), 0)

  return { score: total > 0 ? sum / total : 0, hits, hasTrein, hasCk }
}

// ── SCORE DE UM MÊS ───────────────────────────────────────────────────────────

function _gMonthScore(mesKey) {
  const [y, m]      = mesKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const today       = new Date()
  const isCurrent   = (y === today.getFullYear() && m === today.getMonth() + 1)
  const lastDay     = isCurrent ? today.getDate() : daysInMonth

  const dailyScores = []
  const indHits = Object.fromEntries(G_INDICATORS.map(i => [i.key, { hits: 0, app: 0 }]))

  for (let d = 1; d <= lastDay; d++) {
    const ds  = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const day = _gDayScore(ds)
    if (!day) continue

    dailyScores.push({ dateStr: ds, day: d, ...day })

    G_INDICATORS.forEach(ind => {
      const applicable = !ind.requiresTreino || day.hasTrein
      if (applicable) {
        indHits[ind.key].app++
        indHits[ind.key].hits += day.hits[ind.key] ?? 0
      }
    })
  }

  if (dailyScores.length === 0) return null

  const avgScore = dailyScores.reduce((s, d) => s + d.score, 0) / dailyScores.length

  const pesoMeta   = _goalsMetas[mesKey] ?? null
  const lastPeso   = _gEntries()
    .filter(e => e.date.startsWith(mesKey) && e.peso != null)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  const ultimoPeso = lastPeso?.peso ?? null
  const pesoOk     = (pesoMeta != null && ultimoPeso != null) ? +ultimoPeso <= pesoMeta : null

  return {
    mesKey, score: avgScore, grade: _gGrade(avgScore),
    daysWithData: dailyScores.length, totalDays: lastDay,
    dailyScores, indHits,
    pesoMeta, ultimoPeso, pesoOk, isCurrent,
  }
}

function _gGrade(score) {
  if (score >= 0.80) return { label: 'A', color: 'var(--accent)',  fg: '#0d0f0e' }
  if (score >= 0.65) return { label: 'B', color: 'var(--accent2)', fg: '#0d0f0e' }
  if (score >= 0.50) return { label: 'C', color: '#f5d742',        fg: '#0d0f0e' }
  return               { label: 'D', color: 'var(--danger)',   fg: '#fff'     }
}

// ── MESES COM DADOS ───────────────────────────────────────────────────────────

function _gGetMeses() {
  const s = new Set()
  _gEntries().forEach(e => e.date && s.add(e.date.slice(0, 7)))
  _gExercicios().forEach(e => e.data && s.add(e.data.slice(0, 7)))
  const now = new Date()
  s.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  return [...s].sort().reverse()
}

function _gFmtMes(mk, long = true) {
  const [y, m] = mk.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return long
    ? d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

// ── RENDER: OVERVIEW ──────────────────────────────────────────────────────────

function goalsRenderOverview() {
  const meses  = _gGetMeses()
  const scores = meses.map(mk => ({ mk, data: _gMonthScore(mk) })).filter(x => x.data)

  if (scores.length === 0) {
    document.getElementById('goals-months-grid').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:16px">◎</div>
        <div style="font-size:1rem;margin-bottom:8px;color:var(--text-dim)">Nenhum dado encontrado</div>
        <div style="font-size:0.85rem">Registre check-ins ou treinos para ver seu score de metas.</div>
      </div>`
    return
  }

  const all     = scores.map(x => x.data.score)
  const avg     = all.reduce((s, x) => s + x, 0) / all.length
  const bestVal = Math.max(...all)
  const bestMes = scores.find(x => x.data.score === bestVal)

  let streak = 0
  for (const { data } of scores) {
    if (data.score >= 0.70) streak++; else break
  }

  const now     = new Date()
  const curKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const curData = scores.find(x => x.mk === curKey)?.data

  document.getElementById('goals-kpi-avg').innerHTML       = `${Math.round(avg * 100)}<span class="kpi-unit">%</span>`
  document.getElementById('goals-kpi-avg-sub').textContent = `${scores.length} meses com dados`

  document.getElementById('goals-kpi-best').innerHTML      = `${Math.round(bestVal * 100)}<span class="kpi-unit">%</span>`
  document.getElementById('goals-kpi-best-sub').textContent = bestMes ? _gFmtMes(bestMes.mk, false) : ''

  document.getElementById('goals-kpi-streak').innerHTML    = `${streak}<span class="kpi-unit">meses</span>`

  document.getElementById('goals-kpi-current').innerHTML   = curData
    ? `${Math.round(curData.score * 100)}<span class="kpi-unit">%</span>` : '—'
  const gradeEl = document.getElementById('goals-kpi-current-grade')
  if (curData) {
    gradeEl.textContent = `Nota ${curData.grade.label}`
    gradeEl.style.color = curData.grade.color
  }

  document.getElementById('goals-months-grid').innerHTML =
    scores.map(({ mk, data }) => _gMonthCard(mk, data)).join('')
}

function _gMonthCard(mk, data) {
  const pct   = Math.round(data.score * 100)
  const g     = data.grade
  const label = _gFmtMes(mk)

  const dots = G_INDICATORS.map(i => {
    const ih = data.indHits[i.key]
    if (ih.app === 0) return `<span class="g-dot g-dot-na" title="${i.label}: sem dados"></span>`
    const p   = ih.hits / ih.app
    const cls = p >= 0.8 ? 'g-dot-ok' : p >= 0.5 ? 'g-dot-warn' : 'g-dot-miss'
    return `<span class="g-dot ${cls}" title="${i.label}: ${Math.round(p * 100)}%"></span>`
  }).join('')

  const pesoMeta  = _goalsMetas[mk]
  const weightDot = pesoMeta != null
    ? `<span class="g-dot ${data.pesoOk === true ? 'g-dot-ok' : data.pesoOk === false ? 'g-dot-miss' : 'g-dot-na'}" title="Meta peso"></span>`
    : `<span class="g-dot g-dot-na" title="Meta de peso não definida"></span>`

  return `
    <div class="g-month-card${data.isCurrent ? ' g-month-current' : ''}" onclick="goalsShowDetail('${mk}')">
      <div class="g-month-top">
        <span class="g-month-name">${label}</span>
        ${data.isCurrent ? '<span class="g-badge-cur">atual</span>' : ''}
      </div>
      <div class="g-month-body">
        <div class="g-ring-sm" style="--sp:${pct};--sc:${g.color}">
          <div class="g-ring-sm-inner">
            <span class="g-ring-sm-num">${pct}</span>
            <span class="g-ring-sm-unit">%</span>
          </div>
        </div>
        <div class="g-month-info">
          <div class="g-grade-big" style="color:${g.color}">${g.label}</div>
          <div class="g-days-info">${data.daysWithData}/${data.totalDays} dias</div>
          <div class="g-dots-row">${dots}${weightDot}</div>
        </div>
      </div>
    </div>`
}

// ── RENDER: DETALHE ───────────────────────────────────────────────────────────

function goalsShowDetail(mk) {
  _goalsMes = mk
  document.getElementById('goals-overview').style.display = 'none'
  document.getElementById('goals-detail').style.display   = ''
  _gRenderDetail(mk)
}

function goalsShowOverview() {
  _goalsMes = null
  document.getElementById('goals-overview').style.display = ''
  document.getElementById('goals-detail').style.display   = 'none'
}

function _gRenderDetail(mk) {
  const data = _gMonthScore(mk)
  if (!data) return

  const pct = Math.round(data.score * 100)
  const g   = data.grade

  document.getElementById('goals-det-title').textContent = _gFmtMes(mk)
  const badge = document.getElementById('goals-det-grade')
  Object.assign(badge.style, { background: g.color, color: g.fg })
  badge.textContent = `Nota ${g.label}`

  const ring = document.getElementById('goals-det-ring')
  ring.style.setProperty('--sp', pct)
  ring.style.setProperty('--sc', g.color)
  document.getElementById('goals-det-pct').textContent = pct + '%'
  document.getElementById('goals-det-days').textContent =
    `${data.daysWithData} de ${data.totalDays} dias registrados`

  _gRenderWeightCard(mk, data)
  _gRenderBreakdown(data)
  _gRenderCalendar(mk, data)
}

function _gRenderWeightCard(mk, data) {
  const el   = document.getElementById('goals-weight-card')
  const meta = _goalsMetas[mk]

  let statusHtml = ''
  if (meta != null) {
    const col  = data.pesoOk === true ? 'var(--accent)' : data.pesoOk === false ? 'var(--danger)' : 'var(--text-muted)'
    const icon = data.pesoOk === true ? '✓ atingida' : data.pesoOk === false ? '✗ não atingida' : '– sem leitura'
    statusHtml = `
      <div class="g-w-row"><span class="g-w-lbl">Meta</span><strong>${meta} kg</strong></div>
      <div class="g-w-row"><span class="g-w-lbl">Atual</span>
        <strong>${data.ultimoPeso != null ? data.ultimoPeso + ' kg' : '—'}</strong>
      </div>
      <div class="g-w-status" style="color:${col}">${icon}</div>`
  } else {
    statusHtml = `<div class="g-w-empty">Defina uma meta de peso para acompanhar</div>`
  }

  el.innerHTML = `
    <div class="g-w-title">⚖ Meta mensal de peso</div>
    ${statusHtml}
    <div class="g-w-input-row">
      <input type="number" id="g-peso-input" placeholder="ex: 82.5"
        step="0.1" min="30" max="300" value="${meta != null ? meta : ''}"
        class="g-w-input">
      <button class="g-w-save-btn" onclick="goalsSavePeso('${mk}')">Salvar</button>
    </div>`
}

function goalsSavePeso(mk) {
  const v = parseFloat(document.getElementById('g-peso-input')?.value)
  if (!Number.isFinite(v) || v < 30 || v > 300) return
  _goalsMetas[mk] = v
  _goalsSave()
  _gRenderDetail(mk)
}

function _gRenderBreakdown(data) {
  const el = document.getElementById('goals-breakdown')
  el.innerHTML = G_INDICATORS.map(ind => {
    const ih = data.indHits[ind.key]

    if (ih.app === 0) return `
      <div class="g-ind-row">
        <div class="g-ind-name">${ind.label}</div>
        <div class="g-ind-bar-wrap"><div class="g-ind-na">sem dias aplicáveis</div></div>
        <div class="g-ind-pct" style="color:var(--text-muted)">—</div>
      </div>`

    const pct = Math.round((ih.hits / ih.app) * 100)
    const col = pct >= 80 ? 'var(--accent)' : pct >= 50 ? 'var(--accent3)' : 'var(--danger)'
    return `
      <div class="g-ind-row">
        <div class="g-ind-name">${ind.label}</div>
        <div class="g-ind-bar-wrap">
          <div class="g-ind-bar" style="width:${pct}%;background:${col}"></div>
        </div>
        <div class="g-ind-pct" style="color:${col}">${pct}%</div>
        <div class="g-ind-days">${ih.hits}/${ih.app}</div>
      </div>`
  }).join('')
}

function _gRenderCalendar(mk, data) {
  const [y, m]      = mk.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstDow    = new Date(y, m - 1, 1).getDay()       // 0=Dom
  const offset      = firstDow === 0 ? 6 : firstDow - 1    // Monday-based

  const dayMap = {}
  data.dailyScores.forEach(d => { dayMap[d.day] = d })

  const today      = new Date()
  const isCurMonth = (y === today.getFullYear() && m === today.getMonth() + 1)
  const headers    = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  let html = '<div class="g-cal-grid">'
  headers.forEach(h => { html += `<div class="g-cal-hdr">${h}</div>` })
  for (let i = 0; i < offset; i++) html += '<div></div>'

  for (let d = 1; d <= daysInMonth; d++) {
    const dd       = dayMap[d]
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
      const sc = dd.score
      const dc = sc >= 0.8 ? 'var(--accent)' : sc >= 0.6 ? 'var(--accent3)' : sc >= 0.4 ? '#f5d742' : 'var(--danger)'
      style = `--dc:${dc}`
    }

    if (isToday) cls += ' g-cal-today'

    const hitsStr  = dd
      ? G_INDICATORS.filter(i => dd.hits[i.key] === 1).map(i => i.label).join(', ') || 'nenhum'
      : ''
    const titleStr = dd
      ? `${Math.round(dd.score * 100)}% — ${hitsStr}`
      : (isFuture ? '' : 'sem dados')

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
  _goalsLoad()

  // Garante dados de exercícios (pode ainda não ter sido carregado)
  if (typeof fetchExercicios === 'function' && (!window.exercicios || window.exercicios.length === 0)) {
    try { window.exercicios = await fetchExercicios() } catch { window.exercicios = [] }
  }

  goalsShowOverview()
  goalsRenderOverview()
}

// placeholder para não quebrar se fetchGoals for chamada (não existe rota backend)
function fetchGoals() { return Promise.resolve([]) }
