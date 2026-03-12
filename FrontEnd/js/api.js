// ─────────────────────────────────────────────────────────────────────────────
// api.js — toda comunicação com o backend fica aqui
// ─────────────────────────────────────────────────────────────────────────────

// const API = 'http://localhost:8001'
const API = "https://meusite-3.onrender.com"

async function _apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`)
  return response.json()
}

// ── BODY ──────────────────────────────────────────────────────────────────────

async function fetchCheckins() {
  return _apiFetch('/api/checkins')
}

async function fetchMedidas() {
  return _apiFetch('/api/medidas')
}

async function postCheckin(date, medidas) {
  return _apiFetch('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, medidas }),
  })
}

// ── EXERCISES ─────────────────────────────────────────────────────────────────

async function fetchCodigosExercicio() {
  return _apiFetch('/api/exercicios/codigos')
}

async function fetchExercicios() {
  return _apiFetch('/api/exercicios')
}

async function postExercise(entry) {
  return _apiFetch('/api/exercicios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
}

// ── GOALS ─────────────────────────────────────────────────────────────────────

async function fetchGoalsCodigos() {
  return _apiFetch('/api/goals/codigos')
}

async function fetchGoalsMetas() {
  return _apiFetch('/api/goals/metas')
}

async function fetchGoalsEntradas() {
  return _apiFetch('/api/goals/entradas')
}

async function postGoalEntrada(date, cd_goal, progresso) {
  return _apiFetch('/api/goals/entradas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, cd_goal, progresso }),
  })
}