
const API_DEFAULT_LOCAL  = 'http://127.0.0.1:8001'
const API_DEFAULT_REMOTE = 'https://meusite-3.onrender.com'

function _safeNormalizeApiBase(v) {
  return String(v || '').trim().replace(/\/+$/, '')
}

function _resolveApiBase() {
  try {
    const q = new URLSearchParams(window.location.search)
    const qApi = _safeNormalizeApiBase(q.get('api'))
    if (qApi) return qApi
  } catch (_) {}

  try {
    const lsApi = _safeNormalizeApiBase(window.localStorage?.getItem('bodylog_api_base'))
    if (lsApi) return lsApi
  } catch (_) {}

  const host = window.location.hostname
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'
  return isLocalHost ? API_DEFAULT_LOCAL : API_DEFAULT_REMOTE
}

const API = _resolveApiBase()

const _API_GET_CACHE_TTL_MS = 20000
const _apiGetCache = new Map()
const _apiGetInFlight = new Map()

function _cloneApiPayload(data) {
  if (data == null || typeof data !== 'object') return data
  try {
    return structuredClone(data)
  } catch (_) {
    return JSON.parse(JSON.stringify(data))
  }
}

function _clearApiGetCaches() {
  _apiGetCache.clear()
  _apiGetInFlight.clear()
}

async function _apiFetch(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase()
  const isGet = method === 'GET'
  const key = `${method} ${path}`

  if (isGet) {
    const cached = _apiGetCache.get(key)
    if (cached && (Date.now() - cached.ts) < _API_GET_CACHE_TTL_MS) {
      return _cloneApiPayload(cached.data)
    }

    const pending = _apiGetInFlight.get(key)
    if (pending) {
      const result = await pending
      return _cloneApiPayload(result)
    }
  }

  const fetchPromise = (async () => {
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 12000
    const controller = new AbortController()
    const merged = {
      ...options,
      method,
      signal: controller.signal,
    }
    delete merged.timeoutMs

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(`${API}${path}`, merged)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`)
      const payload = await response.json()

      if (isGet) {
        _apiGetCache.set(key, { ts: Date.now(), data: payload })
      } else {
        _clearApiGetCaches()
      }

      return payload
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw new Error(`Timeout após ${timeoutMs}ms: ${path}`)
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
      if (isGet) _apiGetInFlight.delete(key)
    }
  })()

  if (isGet) _apiGetInFlight.set(key, fetchPromise)
  return fetchPromise
}

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

async function fetchFinancasCodigos()   { return _apiFetch('/api/financas/codigos') }
async function fetchLancamentos()       { return _apiFetch('/api/financas/lancamentos') }
async function fetchOrcamento()         { return _apiFetch('/api/financas/orcamento') }
async function fetchInvestimentos()     { return _apiFetch('/api/financas/investimentos') }
async function fetchViagens()           { return _apiFetch('/api/financas/viagens') }
async function fetchDebitoInvestimento(){ return _apiFetch('/api/financas/debito-investimento') }

async function postFinancaCodigo(body) {
  return _apiFetch('/api/financas/codigos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
async function deleteFinancaCodigo(id) {
  return _apiFetch(`/api/financas/codigos/${id}`, { method: 'DELETE' })
}

async function postLancamento(body) {
  return _apiFetch('/api/financas/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
async function deleteLancamento(id) {
  return _apiFetch(`/api/financas/lancamentos/${id}`, { method: 'DELETE' })
}

async function postOrcamento(body) {
  return _apiFetch('/api/financas/orcamento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
async function deleteOrcamento(id) {
  return _apiFetch(`/api/financas/orcamento/${id}`, { method: 'DELETE' })
}

async function postInvestimento(body) {
  return _apiFetch('/api/financas/investimentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
async function deleteInvestimento(id) {
  return _apiFetch(`/api/financas/investimentos/${id}`, { method: 'DELETE' })
}

async function postDebitoInvestimento(body) {
  return _apiFetch('/api/financas/debito-investimento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function deleteDebitoInvestimento(cdFinancaOrigem) {
  return _apiFetch(`/api/financas/debito-investimento/${cdFinancaOrigem}`, { method: 'DELETE' })
}

async function postIndicador(body) {
  return _apiFetch('/api/financas/indicadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

