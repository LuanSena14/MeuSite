// ─────────────────────────────────────────────────────────────────────────────
// api.js — toda comunicação com o backend fica aqui
// Se mudar de servidor, só muda este arquivo
// ─────────────────────────────────────────────────────────────────────────────

const API = 'http://localhost:8001'

// Busca todos os check-ins do banco
async function fetchCheckins() {
  const response = await fetch(`${API}/api/checkins`)
  if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.status}`)
  return response.json()
}

// Salva um novo check-in no banco
// Recebe: date (string 'YYYY-MM-DD') e medidas (objeto com os valores)
async function postCheckin(date, medidas) {
  const response = await fetch(`${API}/api/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, medidas })
  })
  if (!response.ok) throw new Error(`Erro ao salvar: ${response.status}`)
  return response.json()
}