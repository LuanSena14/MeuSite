// ─────────────────────────────────────────────────────────────────────────────
// api.js — toda comunicação com o backend fica aqui
// ─────────────────────────────────────────────────────────────────────────────

// const API = 'http://localhost:8001'
const API = "https://meusite-3.onrender.com"

// Busca todos os check-ins do banco
async function fetchCheckins() {
  const response = await fetch(`${API}/api/checkins`)
  if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`)
  return response.json()
}

// Busca a árvore de grupos e medidas do banco
async function fetchMedidas() {
  const response = await fetch(`${API}/api/medidas`)
  if (!response.ok) throw new Error(`Erro ao buscar medidas: ${response.status}`)
  return response.json()
}

// Salva um novo check-in no banco
async function postCheckin(date, medidas) {
  const response = await fetch(`${API}/api/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, medidas })
  })
  if (!response.ok) throw new Error(`Erro ao salvar: ${response.status}`)
  return response.json()
}

// Busca a árvore de grupos e exercícios do banco
async function fetchCodigosExercicio() {
  const response = await fetch(`${API}/api/exercicios/codigos`)
  if (!response.ok) throw new Error(`Erro ao buscar exercícios: ${response.status}`)
  return response.json()
}

// Busca histórico de treinos
async function fetchExercicios() {
  const response = await fetch(`${API}/api/exercicios`)
  if (!response.ok) throw new Error(`Erro ao buscar histórico: ${response.status}`)
  return response.json()
}

// Salva um novo treino
async function postExercise(entry) {
  const response = await fetch(`${API}/api/exercicios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  if (!response.ok) throw new Error(`Erro ao salvar: ${response.status}`)
  return response.json()
}

// ── GOALS ─────────────────────────────────────────────────────────────────────

// Árvore de groups + goals cadastrados
async function fetchGoalsCodigos() {
  const response = await fetch(`${API}/api/goals/codigos`)
  if (!response.ok) throw new Error(`Erro ao buscar goals: ${response.status}`)
  return response.json()
}

// Regras de pontuação (tp_metrica, valor_alvo, pts)
async function fetchGoalsMetas() {
  const response = await fetch(`${API}/api/goals/metas`)
  if (!response.ok) throw new Error(`Erro ao buscar metas: ${response.status}`)
  return response.json()
}

// Histórico de entradas (checks diários)
async function fetchGoalsEntradas() {
  const response = await fetch(`${API}/api/goals/entradas`)
  if (!response.ok) throw new Error(`Erro ao buscar entradas: ${response.status}`)
  return response.json()
}

// Salva ou atualiza um check de goal num dia
async function postGoalEntrada(date, cd_goal, progresso) {
  const response = await fetch(`${API}/api/goals/entradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, cd_goal, progresso }),
  })
  if (!response.ok) throw new Error(`Erro ao salvar: ${response.status}`)
  return response.json()
}