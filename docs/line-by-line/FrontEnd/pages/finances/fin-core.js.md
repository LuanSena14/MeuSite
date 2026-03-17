# Linha a linha - FrontEnd/pages/finances/fin-core.js

Arquivo fonte: FrontEnd/pages/finances/fin-core.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | // | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 | // Entidades: | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 4 | //   codigos_financa    â†’ Ã¡rvore de categorias (tipo: receita \| despesa \| investimento) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 5 | //   lancamentos_financ â†’ data, cd_financa, valor, descricao, forma_pagamento | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 6 | //   orcamentos_financ  â†’ ano, mes, cd_financa, valor_orcado (vigÃªncia: mais recente â‰¤ perÃ­odo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 | //   snapshots_investim â†’ data, cd_financa, saldo (investimentos E indicadores â‰¥78) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 8 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 9 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 10 | window.finCodigos       = []   // [{id, nome, tipo, cd_pai}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 | window.finLancamentos   = []   // [{id, data, cd_financa, categoria_nome, grupo_nome, tipo, valor, descricao, forma_pagamento}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 | window.finOrcamento     = []   // [{id, ano, mes, cd_financa, valor_orcado, forma_pagamento}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 | window.finInvestimentos = []   // [{id, data, cd_financa, nome, saldo}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 | window.finViagens       = []   // [{nome_viagem, total, num_lancamentos, lancamentos}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | let _finActiveTab        = 'overview' | Declara variavel mutavel no escopo de bloco. |
| 17 | let _finChartsInstances  = {} | Declara variavel mutavel no escopo de bloco. |
| 18 | let _finEvoSelectedMonth = null   // {ano, mes} \| null â€” mÃªs selecionado no grÃ¡fico de evoluÃ§Ã£o | Declara variavel mutavel no escopo de bloco. |
| 19 | let _finDespCatSelected  = null   // {nome} \| null â€” grupo de despesa selecionado no donut | Declara variavel mutavel no escopo de bloco. |
| 20 | let _finDataLoadedAt     = 0 | Declara variavel mutavel no escopo de bloco. |
| 21 | const _FIN_CACHE_TTL_MS  = 45000 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 22 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 23 | // ChartDataLabels Ã© carregado via CDN; garante um array vazio se indisponÃ­vel | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 | const _finDL = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 25 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 26 | // Paleta de cores usada nos grÃ¡ficos de despesas (compartilhada com overview) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 | const CHART_COLORS = ['#4ecca3','#e05c5c','#f5d742','#7c9eff','#ff9f47','#9b59b6','#1abc9c','#e74c3c'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 28 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 29 | const _FIN_EMPTY_DEFAULT_HTML = ` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 30 |   &lt;div class="empty-icon"&gt;â—ˆ&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |   &lt;h3&gt;Nenhum dado ainda&lt;/h3&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 32 |   &lt;p&gt;Adicione categorias e lanÃ§amentos para comeÃ§ar.&lt;/p&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |   &lt;button class="btn-add fin-empty-cta" onclick="openFinModal('lancamento')"&gt;+ Novo lanÃ§amento&lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 34 | ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 36 | function _finSetHidden(el, hidden) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 37 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 38 |   el.classList.toggle('is-hidden', !!hidden) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 39 |   el.style.display = hidden ? 'none' : 'block' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 42 | function _finHasAnyData() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 43 |   return window.finLancamentos.length &gt; 0 | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 44 |     \|\| window.finOrcamento.length &gt; 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 45 |     \|\| window.finInvestimentos.length &gt; 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 46 |     \|\| window.finViagens.length &gt; 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 49 | function _finSectionFeedbackHtml(icon, title, sub, details = '', isError = false) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 50 |   return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 51 |     &lt;div class="section-feedback${isError ? ' error' : ''}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 52 |       &lt;div class="section-feedback-icon"&gt;${icon}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 53 |       &lt;div class="section-feedback-title"&gt;${title}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |       ${sub ? `&lt;div class="section-feedback-sub"&gt;${sub}&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 55 |       ${details ? `&lt;div class="section-feedback-details"&gt;${details}&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 56 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 58 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 60 | function _finSetSectionState(state, detail = '') { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 61 |   const empty = document.getElementById('fin-empty') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 62 |   const content = document.getElementById('fin-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 63 |   if (!empty \|\| !content) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 64 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 65 |   if (state === 'ready') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 66 |     _finSetHidden(empty, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |     _finSetHidden(content, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 68 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 69 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 71 |   _finSetHidden(content, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   _finSetHidden(empty, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 74 |   if (state === 'loading') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 75 |     empty.innerHTML = _finSectionFeedbackHtml('â³', 'Carregando Finances', 'Buscando dados e preparando visualizaÃ§Ãµes...') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 77 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |   if (state === 'error') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 79 |     empty.innerHTML = _finSectionFeedbackHtml('âš ', 'Erro ao carregar Finances', 'NÃ£o foi possÃ­vel carregar os dados agora.', detail, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 81 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 83 |   // empty/default | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |   empty.innerHTML = _FIN_EMPTY_DEFAULT_HTML | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 87 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 88 | // Carrega todos os dados em paralelo e renderiza a aba ativa | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 89 | async function initFinancesSection(forceRefresh = false) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 90 |   const hasFreshCache = _finDataLoadedAt &gt; 0 && (Date.now() - _finDataLoadedAt) &lt; _FIN_CACHE_TTL_MS | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 91 |   if (!forceRefresh && hasFreshCache && _finHasAnyData()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 92 |     _finSetSectionState('ready') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |     _setDefaultFilters() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 94 |     switchFinTab(_finActiveTab) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 96 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 98 |   _destroyAllFinCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |   _finSetSectionState('loading') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 101 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 102 |     const [codigos, lanc, orc, inv, viag] = await Promise.all([ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 103 |       fetchFinancasCodigos(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 104 |       fetchLancamentos(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |       fetchOrcamento(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 106 |       fetchInvestimentos(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 107 |       fetchViagens(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 108 |     ]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 |     window.finCodigos       = codigos \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 111 |     window.finLancamentos   = lanc    \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 112 |     window.finOrcamento     = orc     \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |     window.finInvestimentos = inv     \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 114 |     window.finViagens       = viag    \|\| [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |     _finDataLoadedAt = Date.now() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 116 |   } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |     const detail = err?.message \|\| String(err) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 118 |     console.error('[Finances] Erro ao carregar dados:', err) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 119 |     _finSetSectionState('error', detail) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 120 |     _showFinToastErro('NÃ£o foi possÃ­vel carregar Finances.') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 121 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 122 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 124 |   if (!_finHasAnyData()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 125 |     _finSetSectionState('empty') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 126 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 127 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 129 |   _finSetSectionState('ready') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 |   _setDefaultFilters() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 131 |   switchFinTab(_finActiveTab) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 132 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 134 | // Define o mÃªs atual como padrÃ£o em campos de filtro ainda nÃ£o preenchidos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 | function _setDefaultFilters() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 136 |   const ym = new Date().toISOString().slice(0, 7)   // 'YYYY-MM' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 137 |   const mesEl    = document.getElementById('fin-filter-mes') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 138 |   const invMesEl = document.getElementById('fin-inv-filter-mes') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 139 |   if (mesEl    && !mesEl.value)    mesEl.value    = ym | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 140 |   if (invMesEl && !invMesEl.value) invMesEl.value = ym | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 141 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 143 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 144 | function switchFinTab(tab) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 145 |   _finActiveTab = tab | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 146 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 147 |   document.querySelectorAll('.fin-tab').forEach(btn =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 148 |     btn.classList.toggle('active', btn.dataset.tab === tab) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 150 |   document.querySelectorAll('.fin-panel').forEach(panel =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 151 |     panel.classList.toggle('active', panel.id === 'fin-panel-' + tab) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 152 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 153 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 154 |   if (tab === 'overview')      renderFinOverview() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 155 |   if (tab === 'lancamentos')   renderLancamentos() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 156 |   if (tab === 'investimentos') renderInvestimentos() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 157 |   if (tab === 'viagens')       renderViagens() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 158 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 159 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 160 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 161 | function _fmtBRL(v) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 162 |   return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 163 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 164 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 165 | // Formato compacto: 1500 â†’ "1,5k", 800 â†’ "800" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 | function _fmtShort(v) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 167 |   if (v === null \|\| v === undefined) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 168 |   const abs  = Math.abs(v) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 169 |   const sign = v &lt; 0 ? '-' : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 170 |   if (abs &gt;= 1000) return sign + (abs / 1000).toFixed(1).replace('.', ',') + 'k' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 171 |   return sign + Math.round(abs) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 172 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 173 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 174 | function _fmtDate(d) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 175 |   if (!d) return 'â€”' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 176 |   const [y, m, day] = d.slice(0, 10).split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 177 |   return `${day}/${m}/${y}` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 178 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 179 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 180 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 181 | function _finNome(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 182 |   const cod = window.finCodigos.find(c =&gt; c.id === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 183 |   return cod ? cod.nome : 'â€”' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 184 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 185 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 186 | // Retorna "Pai â€º Filho" para mostrar contexto na tabela (ignora nÃ³ raiz de tipo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 187 | function _finCatBreadcrumb(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 188 |   const cod = window.finCodigos.find(c =&gt; c.id === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 189 |   if (!cod) return 'â€”' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 190 |   if (cod.cd_pai === null) return cod.nome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 191 |   const pai = window.finCodigos.find(c =&gt; c.id === cod.cd_pai) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 192 |   if (!pai \|\| pai.cd_pai === null) return cod.nome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 193 |   return `&lt;span style="color:var(--text-muted);font-size:.75em"&gt;${pai.nome} â€º&lt;/span&gt; ${cod.nome}` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 194 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 195 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 196 | function _finPagBadge(p) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 197 |   if (p === 'credito') return '&lt;span style="color:#7c9eff;font-size:.74rem;font-weight:600"&gt;CrÃ©dito&lt;/span&gt;' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 198 |   if (!p \|\| p === 'null') return '&lt;span style="color:var(--text-muted);font-size:.74rem"&gt;â€”&lt;/span&gt;' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 199 |   return '&lt;span style="color:var(--text-muted);font-size:.74rem"&gt;DÃ©bito&lt;/span&gt;' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 200 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 202 | // Nome do grupo pai (filho direto da raiz de tipo) de um cÃ³digo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 | function _finGrupo(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 204 |   const cod = window.finCodigos.find(c =&gt; c.id === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 205 |   if (!cod) return 'â€”' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 206 |   if (cod.cd_pai === null \|\| cod.cd_pai === undefined) return cod.nome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 207 |   const pai = window.finCodigos.find(c =&gt; c.id === cod.cd_pai) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 208 |   return pai ? pai.nome : cod.nome | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 209 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 211 | // Todos os IDs de descendentes de um nÃ³ (recursivo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 | function _getDescendantIds(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 213 |   const filhos = window.finCodigos.filter(c =&gt; c.cd_pai === id).map(c =&gt; c.id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 214 |   return filhos.reduce((acc, fid) =&gt; acc.concat(fid, _getDescendantIds(fid)), []) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 215 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 217 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 218 | // Para cada cd_financa, devolve o registro mais recente cuja data &lt;= (ano, mes). | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 219 | // Isso permite um orÃ§amento anual com override mensal sem duplicar entradas. | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 | function _effectiveOrcamento(ano, mes) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 221 |   const byCode = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 222 |   window.finOrcamento.forEach(o =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 |     const valid = o.mes === null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 224 |       ? o.ano &lt;= ano | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 225 |       : (o.ano &lt; ano \|\| (o.ano === ano && o.mes &lt;= mes)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 226 |     if (!valid) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 227 |     const prev   = byCode[o.cd_financa] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 228 |     const score  = o.ano    * 100 + (o.mes    ?? 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 229 |     const pScore = prev ? prev.ano * 100 + (prev.mes ?? 0) : -1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 230 |     if (!prev \|\| score &gt; pScore) byCode[o.cd_financa] = o | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 231 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 232 |   return Object.values(byCode) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 233 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 234 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 235 | // Sobe a Ã¡rvore atÃ© o filho direto da raiz (cd_pai=null) â€” esse Ã© o "grupo" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 236 | function _findGrupoId(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 237 |   const cod = window.finCodigos.find(c =&gt; c.id === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 238 |   if (!cod) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 239 |   if (cod.cd_pai === null) return id | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 240 |   const pai = window.finCodigos.find(c =&gt; c.id === cod.cd_pai) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 241 |   if (!pai \|\| pai.cd_pai === null) return id   // pai Ã© raiz â†’ eu sou o grupo | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 242 |   return _findGrupoId(cod.cd_pai) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 243 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 245 | // Caminho de IDs entre grupoId (exclusive) e itemId (exclusive), para nesting | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 246 | function _pathFromGrupo(itemId, grupoId) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 247 |   if (itemId === grupoId) return [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 248 |   const cod = window.finCodigos.find(c =&gt; c.id === itemId) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 249 |   if (!cod \|\| cod.cd_pai === null \|\| cod.cd_pai === grupoId) return [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 250 |   return [..._pathFromGrupo(cod.cd_pai, grupoId), cod.cd_pai] | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 251 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 253 | // Monta Ã¡rvore de grupos de orÃ§amento com profundidade arbitrÃ¡ria | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 | function _buildOrcTree(orcItems, realizadoMap) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 255 |   const root = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 256 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 257 |   function ensureNode(map, id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 258 |     if (!map[id]) map[id] = { id, nome: _finNome(id), children: {}, items: [], totalOrc: 0, totalReal: 0 } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 259 |     return map[id] | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 260 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 261 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 262 |   orcItems.forEach(o =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |     const gid    = _findGrupoId(o.cd_financa) \|\| o.cd_financa | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 264 |     const path   = _pathFromGrupo(o.cd_financa, gid) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 265 |     const orcado = Number(o.valor_orcado) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 266 |     const real   = realizadoMap[o.cd_financa] \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 267 |     let node = ensureNode(root, gid) | Declara variavel mutavel no escopo de bloco. |
| 268 |     for (const pid of path) node = ensureNode(node.children, pid) | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 269 |     node.items.push({ ...o, orcado, real }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 272 |   function computeTotals(node) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 273 |     node.totalOrc = 0; node.totalReal = 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |     Object.values(node.children).forEach(child =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |       computeTotals(child) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |       node.totalOrc  += child.totalOrc | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |       node.totalReal += child.totalReal | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 279 |     node.items.forEach(o =&gt; { node.totalOrc += o.orcado; node.totalReal += o.real }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 282 |   const groups = Object.values(root) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 283 |   groups.forEach(computeTotals) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 |   return groups.sort((a, b) =&gt; a.nome.localeCompare(b.nome)) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 285 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 286 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 287 | // Agrupa itens de orÃ§amento por tipo (receita/despesa/investimento) e monta a Ã¡rvore de cada tipo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 288 | function _groupOrcByTipoAndGrupo(orcItems, realizadoMap) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 289 |   const tipoOrder = ['receita', 'despesa', 'investimento'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 290 |   const tipoItems = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 291 |   orcItems.forEach(o =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 292 |     const tipo = window.finCodigos.find(c =&gt; c.id === o.cd_financa)?.tipo \|\| 'outros' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 293 |     if (!tipoItems[tipo]) tipoItems[tipo] = [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 294 |     tipoItems[tipo].push(o) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 295 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 296 |   return tipoOrder | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 297 |     .filter(tp =&gt; tipoItems[tp]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 298 |     .map(tp =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 299 |       const grupos    = _buildOrcTree(tipoItems[tp], realizadoMap) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 300 |       const totalOrc  = grupos.reduce((s, g) =&gt; s + g.totalOrc,  0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 301 |       const totalReal = grupos.reduce((s, g) =&gt; s + g.totalReal, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 302 |       return { key: tp, nome: tp.charAt(0).toUpperCase() + tp.slice(1), grupos, totalOrc, totalReal } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 303 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 304 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 305 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 306 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 307 | function _buildOrcTipoHtml(tipoGroups, showDelete, uidPrefix) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 308 |   return tipoGroups.map(t =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 309 |     const pct    = t.totalOrc &gt; 0 ? Math.min((t.totalReal / t.totalOrc) * 100, 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 310 |     const over   = t.totalReal &gt; t.totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 311 |     const uid    = uidPrefix + '-tipo-' + t.key | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 312 |     const pctLbl = t.totalOrc &gt; 0 ? ((t.totalReal / t.totalOrc) * 100).toFixed(0) + '%' : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 313 |     const gruposHtml = _buildOrcGroupHtml(t.grupos, showDelete, uidPrefix + '-' + t.key) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 314 |     return `&lt;div class="fin-orc-tipo fin-orc-tipo--${t.key}"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 315 |       &lt;div class="fin-orc-tipo-hd" onclick="toggleOrcGroup('${uid}')"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 316 |         &lt;span class="fin-orc-group-arrow" id="orc-arrow-${uid}"&gt;â–¶&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 317 |         &lt;span class="fin-orc-tipo-name"&gt;${t.nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 |         &lt;span class="fin-orc-ov-vals ${over ? 'over' : ''}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 319 |           &lt;b&gt;${_fmtBRL(t.totalReal)}&lt;/b&gt; / ${_fmtBRL(t.totalOrc)} &lt;em&gt;${pctLbl}&lt;/em&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 320 |         &lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 321 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 322 |       &lt;div class="fin-orc-bar-bg fin-orc-group-bar"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 323 |         &lt;div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${pct}%"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 325 |       &lt;div class="fin-orc-group-body" id="orc-body-${uid}" style="display:none"&gt;${gruposHtml}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 326 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 327 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 328 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 329 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 330 | function _renderOrcChild(o, showDelete) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 331 |   const p   = o.orcado &gt; 0 ? Math.min((o.real / o.orcado) * 100, 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 332 |   const ov  = o.real &gt; o.orcado | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 333 |   const pl  = o.orcado &gt; 0 ? p.toFixed(0) + '%' : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 334 |   const del = showDelete ? `&lt;button class="fin-del-btn" onclick="deleteOrcamentoFin(${o.id})"&gt;âœ•&lt;/button&gt;` : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 335 |   return `&lt;div class="fin-orc-child"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 336 |     &lt;div class="fin-orc-ov-info"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 337 |       &lt;span class="fin-orc-child-name"&gt;${_finNome(o.cd_financa)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 338 |       &lt;span class="fin-orc-ov-vals ${ov ? 'over' : ''}"&gt;&lt;b&gt;${_fmtBRL(o.real)}&lt;/b&gt; / ${_fmtBRL(o.orcado)} &lt;em&gt;${pl}&lt;/em&gt;&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 339 |       ${del} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 340 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 341 |     &lt;div class="fin-orc-bar-bg"&gt;&lt;div class="fin-orc-bar-fill ${ov ? 'over' : ''}" style="width:${p}%"&gt;&lt;/div&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 342 |   &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 344 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 345 | // Renderiza recursivamente um nÃ³ de orÃ§amento (suporta profundidade arbitrÃ¡ria) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 346 | function _renderOrcNode(node, showDelete, uidPrefix, depth) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 347 |   const pct      = node.totalOrc &gt; 0 ? Math.min((node.totalReal / node.totalOrc) * 100, 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 348 |   const over     = node.totalReal &gt; node.totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 349 |   const uid      = uidPrefix + '-' + node.id | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 350 |   const pctLbl   = node.totalOrc &gt; 0 ? ((node.totalReal / node.totalOrc) * 100).toFixed(0) + '%' : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 351 |   const kids     = Object.values(node.children).sort((a, b) =&gt; a.nome.localeCompare(b.nome)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 352 |   const innerHtml = kids.map(c =&gt; _renderOrcNode(c, showDelete, uidPrefix, depth + 1)).join('') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 353 |                   + node.items.map(o =&gt; _renderOrcChild(o, showDelete)).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 354 |   const wrapCls  = depth === 0 ? 'fin-orc-group'    : 'fin-orc-subgroup' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 355 |   const hdCls    = depth === 0 ? 'fin-orc-group-hd' : 'fin-orc-subgroup-hd' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 356 |   const nameCls  = depth === 0 ? 'fin-orc-group-name' : 'fin-orc-subgroup-name' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 357 |   return `&lt;div class="${wrapCls}"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 358 |     &lt;div class="${hdCls}" onclick="toggleOrcGroup('${uid}')"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 359 |       &lt;span class="fin-orc-group-arrow" id="orc-arrow-${uid}"&gt;â–¶&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 360 |       &lt;span class="${nameCls}"&gt;${node.nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 361 |       &lt;span class="fin-orc-ov-vals ${over ? 'over' : ''}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 362 |         &lt;b&gt;${_fmtBRL(node.totalReal)}&lt;/b&gt; / ${_fmtBRL(node.totalOrc)} &lt;em&gt;${pctLbl}&lt;/em&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 363 |       &lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |     &lt;div class="fin-orc-bar-bg fin-orc-group-bar"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 366 |       &lt;div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${pct}%"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 367 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 368 |     &lt;div class="fin-orc-group-body" id="orc-body-${uid}" style="display:none"&gt;${innerHtml}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 369 |   &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 370 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 371 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 372 | function _buildOrcGroupHtml(grupos, showDelete, uidPrefix) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 373 |   return grupos.map(g =&gt; _renderOrcNode(g, showDelete, uidPrefix, 0)).join('') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 374 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 375 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 376 | function toggleOrcGroup(uid) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 377 |   const body  = document.getElementById('orc-body-'  + uid) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 378 |   const arrow = document.getElementById('orc-arrow-' + uid) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 379 |   if (!body) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 380 |   const open = body.style.display !== 'none' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 381 |   body.style.display = open ? 'none' : 'block' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 382 |   if (arrow) arrow.textContent = open ? 'â–¶' : 'â–¼' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 383 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 384 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 385 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 386 | function _destroyChart(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 387 |   if (_finChartsInstances[id]) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 388 |     _finChartsInstances[id].destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 389 |     delete _finChartsInstances[id] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 390 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 391 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 392 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 393 | function _destroyAllFinCharts() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 394 |   Object.keys(_finChartsInstances).forEach(_destroyChart) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 395 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 396 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 397 | function destroyFinanceCharts() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 398 |   _destroyAllFinCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 399 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 400 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 401 | window.destroyFinanceCharts = destroyFinanceCharts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 402 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 403 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 404 | function _showFinToast(msg) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 405 |   if (typeof showAppToast === 'function') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 406 |     showAppToast(msg, 'success') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 408 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 409 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 410 |   let el = document.getElementById('fin-toast') | Declara variavel mutavel no escopo de bloco. |
| 411 |   if (!el) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 412 |     el = document.createElement('div') | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 413 |     el.id = 'fin-toast' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 414 |     el.className = 'success-toast' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 415 |     document.body.appendChild(el) | Interage com DOM para ler ou atualizar elementos da interface. |
| 416 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |   el.textContent = msg | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 418 |   el.classList.add('show') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |   setTimeout(() =&gt; el.classList.remove('show'), 2400) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 420 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 422 | function _showFinToastErro(msg) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 423 |   if (typeof showAppToast === 'function') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 424 |     showAppToast(msg, 'error') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 425 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 426 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 428 |   let el = document.getElementById('fin-toast-erro') | Declara variavel mutavel no escopo de bloco. |
| 429 |   if (!el) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 430 |     el = document.createElement('div') | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 431 |     el.id = 'fin-toast-erro' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 |     el.className = 'success-toast' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 433 |     el.style.background = 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 434 |     document.body.appendChild(el) | Interage com DOM para ler ou atualizar elementos da interface. |
| 435 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 436 |   el.textContent = msg | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 437 |   el.classList.add('show') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 438 |   setTimeout(() =&gt; el.classList.remove('show'), 2800) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 439 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
