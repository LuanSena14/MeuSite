# Linha a linha - FrontEnd/shared/js/api.js

Arquivo fonte: FrontEnd/shared/js/api.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | //const API = 'http://localhost:8001' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 | // Endpoint alternativo para deploy remoto. | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 4 | const API = "https://meusite-3.onrender.com" | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 5 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 6 | async function _apiFetch(path, options = {}) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 7 |   const response = await fetch(`${API}${path}`, options) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 8 |   if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 9 |   return response.json() | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 10 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 12 | async function fetchCheckins() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 13 |   return _apiFetch('/api/checkins') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 14 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | async function fetchMedidas() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 17 |   return _apiFetch('/api/medidas') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 18 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 19 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 20 | async function postCheckin(date, medidas) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 21 |   return _apiFetch('/api/checkins', { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 22 |     method: 'POST', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 23 |     headers: { 'Content-Type': 'application/json' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |     body: JSON.stringify({ date, medidas }), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 25 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 26 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 28 | async function fetchCodigosExercicio() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 29 |   return _apiFetch('/api/exercicios/codigos') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 30 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 32 | async function fetchExercicios() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 33 |   return _apiFetch('/api/exercicios') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 34 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 36 | async function postExercise(entry) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 37 |   return _apiFetch('/api/exercicios', { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 38 |     method: 'POST', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 39 |     headers: { 'Content-Type': 'application/json' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 |     body: JSON.stringify(entry), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 42 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 43 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 44 | async function fetchGoalsCodigos() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 45 |   return _apiFetch('/api/goals/codigos') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 46 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 48 | async function fetchGoalsMetas() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 49 |   return _apiFetch('/api/goals/metas') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 50 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 52 | async function fetchGoalsEntradas() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 53 |   return _apiFetch('/api/goals/entradas') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 54 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 55 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 56 | async function postGoalEntrada(date, cd_goal, progresso) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 57 |   return _apiFetch('/api/goals/entradas', { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 58 |     method: 'POST', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 |     headers: { 'Content-Type': 'application/json' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 60 |     body: JSON.stringify({ date, cd_goal, progresso }), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 61 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 62 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 63 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 64 | async function fetchFinancasCodigos()   { return _apiFetch('/api/financas/codigos') } | Declara funcao JavaScript assincrona para operacoes com await. |
| 65 | async function fetchLancamentos()       { return _apiFetch('/api/financas/lancamentos') } | Declara funcao JavaScript assincrona para operacoes com await. |
| 66 | async function fetchOrcamento()         { return _apiFetch('/api/financas/orcamento') } | Declara funcao JavaScript assincrona para operacoes com await. |
| 67 | async function fetchInvestimentos()     { return _apiFetch('/api/financas/investimentos') } | Declara funcao JavaScript assincrona para operacoes com await. |
| 68 | async function fetchViagens()           { return _apiFetch('/api/financas/viagens') } | Declara funcao JavaScript assincrona para operacoes com await. |
| 69 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 70 | async function postFinancaCodigo(body) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 71 |   return _apiFetch('/api/financas/codigos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 72 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 | async function deleteFinancaCodigo(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 74 |   return _apiFetch(`/api/financas/codigos/${id}`, { method: 'DELETE' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 75 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 77 | async function postLancamento(body) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 78 |   return _apiFetch('/api/financas/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 79 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 | async function deleteLancamento(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 81 |   return _apiFetch(`/api/financas/lancamentos/${id}`, { method: 'DELETE' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 82 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 84 | async function postOrcamento(body) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 85 |   return _apiFetch('/api/financas/orcamento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 86 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 | async function deleteOrcamento(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 88 |   return _apiFetch(`/api/financas/orcamento/${id}`, { method: 'DELETE' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 89 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 91 | async function postInvestimento(body) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 92 |   return _apiFetch('/api/financas/investimentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 93 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 94 | async function deleteInvestimento(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 95 |   return _apiFetch(`/api/financas/investimentos/${id}`, { method: 'DELETE' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 96 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 98 | async function postIndicador(body) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 99 |   return _apiFetch('/api/financas/indicadores', { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 100 |     method: 'POST', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |     headers: { 'Content-Type': 'application/json' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |     body: JSON.stringify(body), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 103 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 104 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
