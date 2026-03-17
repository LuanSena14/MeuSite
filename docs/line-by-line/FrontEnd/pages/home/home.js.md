# Linha a linha - FrontEnd/pages/home/home.js

Arquivo fonte: FrontEnd/pages/home/home.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | let _homeData   = {}  // dados cacheados apÃ³s o primeiro fetch | Declara variavel mutavel no escopo de bloco. |
| 4 | let _homeMesKey = ''  // mÃªs selecionado no filtro ("YYYY-MM") | Declara variavel mutavel no escopo de bloco. |
| 5 | let _homeDataLoadedAt = 0 | Declara variavel mutavel no escopo de bloco. |
| 6 | const _HOME_CACHE_TTL_MS = 45000 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 7 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 8 | function _homeHasFreshCache() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 9 |   return _homeDataLoadedAt &gt; 0 | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 10 |     && (Date.now() - _homeDataLoadedAt) &lt; _HOME_CACHE_TTL_MS | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 |     && _homeData | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 |     && Object.keys(_homeData).length &gt; 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 15 | function _homeSetFeedback(failedSources = []) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 16 |   const el = document.getElementById('home-feedback') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 17 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 18 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 19 |   if (!failedSources.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 20 |     el.classList.add('is-hidden') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 21 |     el.classList.remove('error') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 |     el.innerHTML = '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 23 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 24 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 25 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 26 |   el.classList.remove('is-hidden') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |   el.classList.add('error') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |     &lt;div class="section-feedback-title"&gt;Home carregada parcialmente&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |     &lt;div class="section-feedback-sub"&gt;Alguns mÃ³dulos nÃ£o responderam nesta tentativa.&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |     &lt;div class="section-feedback-details"&gt;${failedSources.join(' Â· ')}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 32 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 34 |   if (typeof showAppToast === 'function') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 35 |     showAppToast('Home carregada parcialmente. Verifique a conexÃ£o.', 'error') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 37 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 39 | async function initHomeSection(forceRefresh = false) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 40 |   _homeRenderGreeting() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |   _homePopulateMonthFilter() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 42 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 43 |   const now = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 44 |   _homeMesKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 45 |   const sel = document.getElementById('home-mes-filter') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 46 |   if (sel) sel.value = _homeMesKey | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 47 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 48 |   if (!forceRefresh && _homeHasFreshCache()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 49 |     _homeRenderAll() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 51 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 52 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 53 |   const finOk = typeof _financesUnlocked === 'function' && _financesUnlocked() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 54 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 55 |   const [checkinsR, lancR, codR, orcR, exR, goalsEntR, goalsMetR] = await Promise.allSettled([ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 56 |     fetchCheckins(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |     finOk ? fetchLancamentos()     : Promise.resolve(null), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 58 |     finOk ? fetchFinancasCodigos() : Promise.resolve(null), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 |     finOk ? fetchOrcamento()       : Promise.resolve(null), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 60 |     fetchExercicios(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 61 |     fetchGoalsEntradas(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 62 |     fetchGoalsMetas(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 63 |   ]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 64 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 65 |   const failedSources = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 66 |   if (checkinsR.status !== 'fulfilled') failedSources.push('Body') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 67 |   if (exR.status !== 'fulfilled') failedSources.push('Exercises') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 68 |   if (goalsEntR.status !== 'fulfilled' \|\| goalsMetR.status !== 'fulfilled') failedSources.push('Goals') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 69 |   if (finOk && (lancR.status !== 'fulfilled' \|\| codR.status !== 'fulfilled' \|\| orcR.status !== 'fulfilled')) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 70 |     failedSources.push('Finances') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   _homeSetFeedback(failedSources) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 74 |   _homeData = { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 75 |     checkins:      checkinsR.status === 'fulfilled' ? checkinsR.value  : [], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |     lancamentos:   lancR.status     === 'fulfilled' ? lancR.value      : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |     codigos:       codR.status      === 'fulfilled' ? codR.value       : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |     orcamento:     orcR.status      === 'fulfilled' ? orcR.value       : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |     exercicios:    exR.status       === 'fulfilled' ? exR.value        : [], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |     goalsEntradas: goalsEntR.status === 'fulfilled' ? goalsEntR.value  : [], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |     goalsMetas:    goalsMetR.status === 'fulfilled' ? goalsMetR.value  : [], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |     finOk, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |   _homeDataLoadedAt = Date.now() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 85 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 86 |   _homeRenderAll() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 89 | function homeFilterMes(val) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 90 |   _homeMesKey = val | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 91 |   _homeRenderAll() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 92 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 94 | function _homeRenderAll() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 95 |   const mes = _homeMesKey | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 96 |   _homeBodyCard  (_homeData.checkins      ?? [], mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |   _homeFinCard   (_homeData.lancamentos,   _homeData.codigos, _homeData.orcamento, _homeData.finOk, mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 |   _homeExCard    (_homeData.exercicios     ?? [], mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |   _homeGoalsCard (_homeData.goalsEntradas ?? [], _homeData.goalsMetas ?? [], mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 102 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 103 | function _homeRenderGreeting() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 104 |   const h      = new Date().getHours() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 105 |   const period = h &lt; 12 ? 'Bom dia' : h &lt; 18 ? 'Boa tarde' : 'Boa noite' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 106 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 107 |   const grEl = document.getElementById('home-greeting') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 108 |   if (grEl) grEl.textContent = period | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 |   const dtEl = document.getElementById('home-date') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 111 |   if (dtEl) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 112 |     dtEl.textContent = new Date().toLocaleDateString('pt-BR', { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |       weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 114 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 118 | function _homePopulateMonthFilter() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 119 |   const sel = document.getElementById('home-mes-filter') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 120 |   if (!sel) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 121 |   const now  = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 122 |   const opts = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 123 |   for (let i = 0; i &lt; 13; i++) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 124 |     const d   = new Date(now.getFullYear(), now.getMonth() - i, 1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 125 |     const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 126 |     const lbl = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 127 |     opts.push(`&lt;option value="${val}"&gt;${lbl}&lt;/option&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |   sel.innerHTML = opts.join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 131 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 132 | // Cada funÃ§Ã£o para propagaÃ§Ã£o para nÃ£o acionar o onclick do card pai | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 134 | function _homeOpenFinAdd(e) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 135 |   e.stopPropagation() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |   if (typeof _financesUnlocked === 'function' && !_financesUnlocked()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 137 |     switchSection('finances') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 138 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 139 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |   if (!window.finCodigos?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 141 |     initFinancesSection().then(() =&gt; openFinModal('lancamento')) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 143 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 144 |   openFinModal('lancamento') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 145 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 147 | async function _homeOpenExAdd(e) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 148 |   e.stopPropagation() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   if (!document.getElementById('ex-modal-overlay')) await initExSection() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 150 |   openExModal() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 151 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 152 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 153 | async function _homeOpenGoalsAdd(e) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 154 |   e.stopPropagation() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 155 |   if (!document.getElementById('goals-modal-overlay')) await initGoalsSection() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 156 |   openGoalsModal() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 157 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 158 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 159 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 160 | function _homeBodyCard(checkins, mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 161 |   const el = document.getElementById('home-body-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 162 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 163 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 164 |   if (!checkins?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 165 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem dados ainda&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 167 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 168 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 169 |   const sorted = [...checkins].sort((a, b) =&gt; a.date.localeCompare(b.date)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 170 |   const [my, mm] = mesKey.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 171 |   const endOfMonthStr = new Date(my, mm, 0).toISOString().slice(0, 10) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 172 |   const upToMonth = sorted.filter(c =&gt; c.date &lt;= endOfMonthStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 173 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 174 |   // Ãšltima altura conhecida â€” do histÃ³rico completo (backend sÃ³ faz forward-fill apÃ³s 1Âª mediÃ§Ã£o) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 175 |   const _imcAlturaRaw = sorted.slice().reverse().find(c =&gt; parseFloat(c.altura) &gt; 0)?.altura | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 176 |   const _imcAltura = _imcAlturaRaw | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 177 |     ? (parseFloat(_imcAlturaRaw) &gt; 3 ? parseFloat(_imcAlturaRaw) / 100 : parseFloat(_imcAlturaRaw)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 178 |     : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 179 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 180 |   // Computa valor de um campo (incluindo campos derivados) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 181 |   // Para campos compostos, retorna null se QUALQUER dependÃªncia estiver ausente na mesma entrada | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 182 |   function mVal(c, field) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 183 |     switch (field) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 184 |       case 'gorduraPct': { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 185 |         const g = parseFloat(c.gordura), p = parseFloat(c.peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 186 |         return Number.isFinite(g) && g &gt; 0 && Number.isFinite(p) && p &gt; 0 ? g / p * 100 : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 187 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 188 |       case 'imc': { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 189 |         const p = parseFloat(c.peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |         const hRaw = parseFloat(c.altura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 191 |         const a = Number.isFinite(hRaw) && hRaw &gt; 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 192 |           ? (hRaw &gt; 3 ? hRaw / 100 : hRaw) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 193 |           : _imcAltura | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 194 |         return Number.isFinite(p) && p &gt; 0 && a != null && a &gt; 0 ? p / (a * a) : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 195 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 196 |       default: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 197 |         const v = parseFloat(c[field]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 198 |         return Number.isFinite(v) && v &gt; 0 ? v : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 199 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 200 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 203 |   // Para cada campo: valor atual = Ãºltima mediÃ§Ã£o atÃ© o fim do mÃªs selecionado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |   //                 prevC       = mediÃ§Ã£o anterior DAQUELE CAMPO no histÃ³rico completo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 205 |   //                 dAno        = primeira mediÃ§Ã£o do campo no ano selecionado (atÃ© lastC) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 206 |   function metricInfo(field) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 207 |     // Valor atual: Ãºltimo registro vÃ¡lido atÃ© o fim do mÃªs | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 208 |     const inWindow = upToMonth.filter(c =&gt; mVal(c, field) !== null) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 209 |     const lastC = inWindow.at(-1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 210 |     if (!lastC) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 211 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 212 |     const val = mVal(lastC, field) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 213 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 214 |     // MediÃ§Ã£o anterior: busca no histÃ³rico COMPLETO antes da data de lastC | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |     const prevC = sorted | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 216 |       .filter(c =&gt; c.date &lt; lastC.date && mVal(c, field) !== null) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 |       .at(-1) ?? null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 218 |     const dLast = prevC ? val - mVal(prevC, field) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 219 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 220 |     // Primeira mediÃ§Ã£o DESTE campo no ano selecionado (atÃ© lastC) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |     const firstAnoC = inWindow.find(c =&gt; c.date.startsWith(String(my))) ?? null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 222 |     const dAno = firstAnoC && firstAnoC.date !== lastC.date | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 223 |       ? val - mVal(firstAnoC, field) : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 224 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 225 |     const firstFmt = firstAnoC | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 226 |       ? new Date(firstAnoC.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 227 |       : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 228 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 229 |     return { val, dLast, dAno, firstFmt, lastDate: lastC.date } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 230 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 231 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 232 |   const pesoInfo = metricInfo('peso') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 233 |   if (!pesoInfo) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 234 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem check-in neste perÃ­odo&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 235 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 236 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 237 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 238 |   const diffDays = Math.round((new Date() - new Date(pesoInfo.lastDate + 'T00:00:00')) / 86400000) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 239 |   const lastStr  = diffDays === 0 ? 'hoje' : diffDays === 1 ? 'ontem' : `hÃ¡ ${diffDays} dias` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 240 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 241 |   const fmtDelta = (d, digits, unit) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 242 |     const cls = d &gt; 0 ? 'hcard-up' : 'hcard-down' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 243 |     return `&lt;span class="hcard-delta ${cls}"&gt;${d &gt; 0 ? '+' : ''}${d.toFixed(digits)}${unit}&lt;/span&gt;` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 244 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 245 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 246 |   const SEC_METRICS = [ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 247 |     { field: 'gorduraPct',     lbl: '% Gordura',  unit: '%',  digits: 1 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 248 |     { field: 'massa_muscular', lbl: 'Massa Musc.', unit: ' kg',digits: 1 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |     { field: 'imc',            lbl: 'IMC',         unit: '',   digits: 1 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 |     { field: 'cintura',        lbl: 'Cintura',     unit: ' cm',digits: 1 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |   ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |   const secCards = SEC_METRICS.map(m =&gt; ({ ...m, info: metricInfo(m.field) })).filter(m =&gt; m.info) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 253 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 254 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 255 |     &lt;div class="hcard-main-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |       &lt;span class="hcard-big"&gt;${pesoInfo.val.toFixed(1)}&lt;span class="hcard-unit"&gt; kg&lt;/span&gt;&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 257 |       ${pesoInfo.dLast !== null ? fmtDelta(pesoInfo.dLast, 1, ' kg') : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 259 |     ${pesoInfo.dAno !== null ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 260 |     &lt;div class="hcard-delta-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 261 |       &lt;span class="hcard-delta-lbl"&gt;desde ${pesoInfo.firstFmt}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |       ${fmtDelta(pesoInfo.dAno, 1, ' kg')} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |     &lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |     ${secCards.length ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |     &lt;div class="hcard-metrics-grid"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |       ${secCards.map(m =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |         &lt;div class="hcard-metric"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |           &lt;div class="hcard-metric-lbl"&gt;${m.lbl}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |           &lt;div class="hcard-metric-val-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |             &lt;span class="hcard-metric-val"&gt;${m.info.val.toFixed(m.digits)}${m.unit}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |             ${m.info.dLast !== null ? fmtDelta(m.info.dLast, m.digits, m.unit) : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |           &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |           ${m.info.dAno !== null ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |           &lt;div class="hcard-delta-row hcard-delta-row-tight"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |             &lt;span class="hcard-delta-lbl"&gt;desde ${m.info.firstFmt}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |             ${fmtDelta(m.info.dAno, m.digits, m.unit)} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |           &lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |         &lt;/div&gt;`).join('')} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 279 |     &lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |     &lt;div class="hcard-foot"&gt;Ãšltima mediÃ§Ã£o: ${lastStr}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 283 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 284 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 285 | function _homeFinCard(lancamentos, codigos, orcamento, unlocked, mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 286 |   const el = document.getElementById('home-fin-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 287 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 288 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 289 |   if (!unlocked) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 290 |     el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 291 |       &lt;div class="hcard-locked"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 292 |         &lt;span class="hcard-lock-icon"&gt;â—ˆ&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 293 |         &lt;span&gt;Protegido por PIN&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 294 |       &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 295 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 296 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 297 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 298 |   const [my, mm] = mesKey.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 299 |   const doMes = (lancamentos ?? []).filter(l =&gt; l.data.startsWith(mesKey)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 300 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 301 |   const codigoMap = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 302 |   codigos?.forEach(c =&gt; { codigoMap[c.id] = c }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 303 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 304 |   function getTipo(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 305 |     let c = codigoMap[id] | Declara variavel mutavel no escopo de bloco. |
| 306 |     while (c) { | Loop: repete bloco enquanto a condicao permanecer verdadeira. |
| 307 |       if (c.tipo === 'receita' \|\| c.tipo === 'despesa') return c.tipo | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 308 |       c = codigoMap[c.cd_pai] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 309 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 310 |     return 'despesa' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 311 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 312 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 313 |   let receitas = 0, despesas = 0 | Declara variavel mutavel no escopo de bloco. |
| 314 |   doMes.forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 315 |     if (getTipo(l.cd_financa) === 'receita') receitas += l.valor | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 316 |     else despesas += l.valor | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 317 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 319 |   const saldo  = receitas - despesas | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 320 |   const fmtBRL = v =&gt; v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 321 |   const orcColor = pct =&gt; pct &gt;= 100 ? 'var(--danger)' : pct &gt;= 80 ? 'var(--accent3)' : 'var(--accent2)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 322 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 323 |   // OrÃ§amento: realizado vs orÃ§ado por categoria de despesa | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |   const orcRows = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 325 |   if (orcamento?.length && codigos?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 326 |     const byCode = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 327 |     orcamento.forEach(o =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 328 |       if (o.mes === null) return                                         // ignora orÃ§amento anual | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 329 |       const valid = o.ano &lt; my \|\| (o.ano === my && o.mes &lt;= mm) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 330 |       if (!valid) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 331 |       const prev  = byCode[o.cd_financa] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 332 |       const score = o.ano * 100 + (o.mes ?? 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 333 |       if (!prev \|\| score &gt; prev.ano * 100 + (prev.mes ?? 0)) byCode[o.cd_financa] = o | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 334 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 335 |     const realizadoMap = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 336 |     doMes.filter(l =&gt; getTipo(l.cd_financa) === 'despesa').forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 337 |       realizadoMap[l.cd_financa] = (realizadoMap[l.cd_financa] \|\| 0) + l.valor | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 338 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 339 |     Object.values(byCode).forEach(o =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 340 |       if (getTipo(o.cd_financa) !== 'despesa') return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 341 |       const cat = codigoMap[o.cd_financa] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 342 |       if (!cat) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 343 |       const orcado    = o.valor_orcado | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 344 |       const realizado = realizadoMap[o.cd_financa] \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 345 |       const pct       = orcado &gt; 0 ? Math.round((realizado / orcado) * 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 346 |       orcRows.push({ nome: cat.nome, orcado, realizado, pct }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 347 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 348 |     orcRows.sort((a, b) =&gt; b.orcado - a.orcado) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 351 |   if (!doMes.length && !orcRows.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 352 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem dados neste mÃªs&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 353 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 354 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 355 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 356 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 357 |     &lt;div class="hcard-main-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 358 |       &lt;span class="hcard-big" style="color:${saldo &gt;= 0 ? 'var(--accent)' : 'var(--danger)'}"&gt;${fmtBRL(saldo)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 359 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 360 |     &lt;div class="hcard-rec-des"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 361 |       &lt;span style="color:var(--accent2)"&gt;â†‘ ${fmtBRL(receitas)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 362 |       &lt;span class="hcard-rec-des-sep"&gt;Â·&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 363 |       &lt;span style="color:var(--danger)"&gt;â†“ ${fmtBRL(despesas)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |     ${orcRows.length ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 366 |     &lt;div class="hcard-divider"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 367 |     ${orcRows.map(r =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 368 |       &lt;div class="hcard-bar-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 369 |         &lt;span class="hcard-bar-lbl hcard-bar-cat"&gt;${r.nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 370 |         &lt;div class="hcard-bar"&gt;&lt;div class="hcard-bar-fill" style="width:${Math.min(r.pct, 100)}%;background:${orcColor(r.pct)}"&gt;&lt;/div&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 371 |         &lt;span class="hcard-orc-vals"&gt;${fmtBRL(r.realizado)}&lt;span class="hcard-orc-sep"&gt;/&lt;/span&gt;${fmtBRL(r.orcado)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 372 |       &lt;/div&gt;`).join('')}` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 373 |     &lt;div class="hcard-foot"&gt;${doMes.length} lanÃ§amentos${orcRows.length ? ` Â· ${orcRows.length} cats orÃ§adas` : ''}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 374 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 375 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 376 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 377 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 378 | function _homeExCard(exercicios, mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 379 |   const el = document.getElementById('home-ex-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 380 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 381 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 382 |   if (!exercicios?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 383 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem treinos ainda&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 384 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 385 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 386 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 387 |   const doMes      = exercicios.filter(e =&gt; e.data.startsWith(mesKey)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 388 |   const totalEx    = doMes.length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 389 |   const diasUnicos = new Set(doMes.map(e =&gt; e.data)).size | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 390 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 391 |   const [my, mm]  = mesKey.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 392 |   const now       = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 393 |   const isCurrMes = now.getFullYear() === my && now.getMonth() + 1 === mm | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 394 |   const diasNoMes = isCurrMes ? now.getDate() : new Date(my, mm, 0).getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 395 |   const semanas   = Math.ceil(diasNoMes / 7) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 396 |   const avgSemana = semanas &gt; 0 ? (diasUnicos / semanas).toFixed(1) : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 397 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 398 |   const comEsforco = doMes.filter(e =&gt; e.esforco != null && e.esforco &gt; 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 399 |   const avgEsforco = comEsforco.length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 400 |     ? (comEsforco.reduce((s, e) =&gt; s + e.esforco, 0) / comEsforco.length).toFixed(1) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 401 |     : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 402 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 403 |   const comDur = doMes.filter(e =&gt; e.duracao != null && e.duracao &gt; 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 404 |   const avgDur = comDur.length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 405 |     ? Math.round(comDur.reduce((s, e) =&gt; s + e.duracao, 0) / comDur.length) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 406 |     : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 408 |   const grupoCount = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 409 |   doMes.forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 410 |     if (e.grupo_nome) grupoCount[e.grupo_nome] = (grupoCount[e.grupo_nome] \|\| 0) + 1 | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 411 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 412 |   const topGrupos = Object.entries(grupoCount).sort((a, b) =&gt; b[1] - a[1]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 413 |   const maxCount  = topGrupos[0]?.[1] \|\| 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 414 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 415 |   const lastData = exercicios.map(e =&gt; e.data).sort().at(-1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 416 |   const diffDays = Math.round((now - new Date(lastData + 'T00:00:00')) / 86400000) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 417 |   const lastStr  = diffDays === 0 ? 'hoje' : diffDays === 1 ? 'ontem' : `hÃ¡ ${diffDays} dias` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 418 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 419 |   const kpis = [ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 420 |     { val: diasUnicos,                   lbl: 'dias'    }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |     avgEsforco ? { val: `${avgEsforco}/10`, lbl: 'esforÃ§o' } : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 422 |     avgDur     ? { val: `${avgDur}min`,     lbl: 'duraÃ§Ã£o' } : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 423 |   ].filter(Boolean) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 424 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 425 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 426 |     &lt;div class="hcard-main-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |       &lt;span class="hcard-big"&gt;${totalEx}&lt;span class="hcard-unit"&gt; exercÃ­cios&lt;/span&gt;&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 428 |       &lt;span class="hcard-sub"&gt;${avgSemana}Ã—/sem&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 429 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 430 |     &lt;div class="hcard-stats-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 431 |       ${kpis.map(k =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 |         &lt;div class="hcard-stat"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 433 |           &lt;div class="hcard-stat-val"&gt;${k.val}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 434 |           &lt;div class="hcard-stat-lbl"&gt;${k.lbl}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 435 |         &lt;/div&gt;`).join('')} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 436 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 437 |     ${topGrupos.length ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 438 |     &lt;div class="hcard-divider"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 439 |     ${topGrupos.map(([g, n]) =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 440 |       &lt;div class="hcard-bar-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 441 |         &lt;span class="hcard-bar-lbl hcard-bar-cat"&gt;${g}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 442 |         &lt;div class="hcard-bar"&gt;&lt;div class="hcard-bar-fill" style="width:${Math.round(n / maxCount * 100)}%;background:var(--accent3)"&gt;&lt;/div&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 443 |         &lt;span class="hcard-bar-val"&gt;${n}Ã—&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 444 |       &lt;/div&gt;`).join('')}` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 445 |     &lt;div class="hcard-foot"&gt;Ãšltimo treino: ${lastStr}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 446 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 447 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 448 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 449 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 450 | function _homeGoalsCard(entradas, metas, mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 451 |   const el = document.getElementById('home-goals-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 452 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 453 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 454 |   if (!metas?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 455 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem metas cadastradas&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 456 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 457 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 458 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 459 |   // Normaliza tp_metrica â€” o banco pode gravar 'meta' em vez de 'mensal' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 460 |   window.goalsMetas = metas.map(m =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 461 |     const tp = (m.tp_metrica \|\| '').toLowerCase() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 462 |     return { ...m, tp_metrica: tp === 'meta' ? 'mensal' : tp } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 463 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 464 |   window.goalsEntradas = entradas \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 465 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 466 |   const score = typeof _gMonthScore === 'function' ? _gMonthScore(mesKey) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 467 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 468 |   if (!score?.hasMetas) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 469 |     el.innerHTML = '&lt;p class="hcard-empty"&gt;Sem dados neste mÃªs&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 470 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 471 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 472 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 473 |   const grade    = score.grade ?? { label: '?', color: 'var(--surface2)', fg: 'var(--text-muted)' } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 474 |   const allMetas = [...(score.metaScores ?? [])].sort((a, b) =&gt; b.pct - a.pct) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 475 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 476 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 477 |     &lt;div class="hcard-main-row" style="align-items:center;gap:12px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 478 |       &lt;div class="hcard-grade" style="background:${grade.color};color:${grade.fg}"&gt;${grade.label}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 479 |       &lt;span class="hcard-big" style="font-size:1.8rem"&gt;${score.pct}%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 480 |       &lt;span class="hcard-sub"&gt;${score.totalGanho.toFixed(0)}/${score.totalPossivel.toFixed(0)} pts&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 481 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 482 |     ${allMetas.length ? ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 483 |     &lt;div class="hcard-divider"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 484 |     ${allMetas.map(ms =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 485 |       &lt;div class="hcard-bar-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 486 |         &lt;span class="hcard-bar-lbl hcard-bar-cat"&gt;${ms.meta.goal_nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 487 |         &lt;div class="hcard-bar"&gt;&lt;div class="hcard-bar-fill" style="width:${ms.pct}%;background:${ms.pct &gt;= 80 ? 'var(--accent)' : ms.pct &gt;= 50 ? 'var(--accent3)' : 'var(--danger)'}"&gt;&lt;/div&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 488 |         &lt;span class="hcard-bar-val"&gt;${ms.pct}%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 489 |       &lt;/div&gt;`).join('')}` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 490 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 491 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
