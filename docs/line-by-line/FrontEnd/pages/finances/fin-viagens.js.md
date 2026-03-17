# Linha a linha - FrontEnd/pages/finances/fin-viagens.js

Arquivo fonte: FrontEnd/pages/finances/fin-viagens.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | //                  accordion de lanÃ§amentos e aÃ§Ãµes renomear/desvincular | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 4 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 5 | const _VIAG_COLORS = [ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 6 |   '#b4ff50','#7c9eff','#ff9f47','#ff6b6b','#f5d742', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 |   '#a78bfa','#34d399','#fb7185','#38bdf8','#fbbf24' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 8 | ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 9 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 10 | // Estado de cross-filter: selecionar uma categoria no donut filtra a barra e vice-versa | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 | let _viagCatSel  = null   // nome da categoria selecionada no donut | Declara variavel mutavel no escopo de bloco. |
| 12 | let _viagViagSel = null   // nome da viagem selecionada na barra | Declara variavel mutavel no escopo de bloco. |
| 13 | let _viagAll     = []     // lista de viagens atual (mantida para redraw sem re-fetch) | Declara variavel mutavel no escopo de bloco. |
| 14 | let _viagTotal   = 0 | Declara variavel mutavel no escopo de bloco. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | function _viagDateKey(dateRaw) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 17 |   if (!dateRaw) return Number.NEGATIVE_INFINITY | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 18 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 19 |   const raw = String(dateRaw).trim() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 20 |   const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 21 |   if (iso) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 22 |     const y = Number(iso[1]), m = Number(iso[2]), d = Number(iso[3]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 23 |     if (y &gt; 0 && m &gt;= 1 && m &lt;= 12 && d &gt;= 1 && d &lt;= 31) return y * 10000 + m * 100 + d | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 24 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 25 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 26 |   const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 27 |   if (br) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 28 |     const d = Number(br[1]), m = Number(br[2]), y = Number(br[3]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 29 |     if (y &gt; 0 && m &gt;= 1 && m &lt;= 12 && d &gt;= 1 && d &lt;= 31) return y * 10000 + m * 100 + d | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 30 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 32 |   const ts = Date.parse(raw) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 33 |   return Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 34 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 36 | function _viagLatestDate(v) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 37 |   if (v?.ultima_data) return String(v.ultima_data).slice(0, 10) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 38 |   if (!v?.lancamentos?.length) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 39 |   let best = null | Declara variavel mutavel no escopo de bloco. |
| 40 |   let bestKey = Number.NEGATIVE_INFINITY | Declara variavel mutavel no escopo de bloco. |
| 41 |   for (const l of v.lancamentos) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 42 |     const d = String(l?.data \|\| '').slice(0, 10) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 43 |     const key = _viagDateKey(d) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 44 |     if (key &gt; bestKey) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 45 |       bestKey = key | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 46 |       best = d | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 47 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 49 |   return best | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 50 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 52 | function _sortViagensLatestDesc(arr) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 53 |   return arr.slice().sort((a, b) =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 54 |     const aKey = _viagDateKey(_viagLatestDate(a)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 55 |     const bKey = _viagDateKey(_viagLatestDate(b)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 56 |     if (bKey !== aKey) return bKey - aKey | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 57 |     return String(a?.nome_viagem \|\| '').localeCompare(String(b?.nome_viagem \|\| ''), 'pt-BR') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 58 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 60 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 61 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 62 | async function renderViagens() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 63 |   window.finViagens = await fetchViagens() \|\| [] | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 64 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 65 |   const list       = document.getElementById('fin-viagens-list') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 66 |   const chartsWrap = document.getElementById('fin-viag-charts') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 67 |   if (!list) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 68 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 69 |   // Ordena por Ãºltimo lanÃ§amento real da viagem (mais recente no topo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |   const viagens = _sortViagensLatestDesc(window.finViagens) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 71 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 72 |   _viagAll     = viagens | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 73 |   _viagTotal   = viagens.reduce((s, v) =&gt; s + v.total, 0) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 74 |   _viagCatSel  = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 75 |   _viagViagSel = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 76 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 77 |   if (!viagens.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 78 |     if (chartsWrap) chartsWrap.style.display = 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 79 |     list.innerHTML = `&lt;div class="empty-state empty-state-compact"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |       &lt;div class="empty-icon"&gt;âœˆ&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |       &lt;p&gt;Nenhuma viagem registrada.&lt;br&gt;Crie lanÃ§amentos com categoria &lt;b&gt;Travel&lt;/b&gt; para aparecerem aqui.&lt;/p&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 84 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 86 |   if (chartsWrap) chartsWrap.style.display = 'grid' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 87 |   _redrawViagCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 89 |   list.innerHTML = viagens.map((v, idx) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |     const lancs  = v.lancamentos.slice().sort((a, b) =&gt; b.valor - a.valor) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 91 |     const linhas = lancs.map(l =&gt; ` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 92 |       &lt;tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |         &lt;td&gt;${_fmtDate(l.data)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 94 |         &lt;td&gt;${l.categoria_nome}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |         &lt;td&gt;${l.descricao \|\| 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |         &lt;td&gt;${_finPagBadge(l.forma_pagamento)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |         &lt;td class="fin-col-valor fin-despesa"&gt;${_fmtBRL(l.valor)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 |         &lt;td&gt;&lt;button class="fin-del-btn" title="Desvincular" onclick="_viajemUnlink(${l.id})"&gt;âœ•&lt;/button&gt;&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |       &lt;/tr&gt;`).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 101 |     // MÃªs/ano do lanÃ§amento mais recente da viagem | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |     const ultimaData = _viagLatestDate(v) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 103 |     const mesAno     = ultimaData | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 104 |       ? new Date(ultimaData + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |       : 'â€”' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 106 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 107 |     const safeId     = 'viag-body-' + idx | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 108 |     const primeiroId = v.lancamentos[0]?.id | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 109 |     const nomeEsc    = v.nome_viagem.replace(/'/g, "\\'") | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 110 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 111 |     return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 112 |     &lt;div class="viag-card"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |       &lt;div class="viag-card-header viag-accordion-trigger" onclick="_viagToggle('${safeId}', this)"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 114 |         &lt;div class="viag-card-title-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |           &lt;span class="viag-nome"&gt;âœˆ ${v.nome_viagem}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 |           &lt;div style="display:flex;align-items:center;gap:8px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |             &lt;button class="viag-rename-btn" onclick="event.stopPropagation();_viagemRenamePrompt('${primeiroId}', '${nomeEsc}')"&gt;âœŽ renomear&lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 118 |             &lt;span class="viag-chevron"&gt;â–¾&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 119 |           &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 120 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 121 |         &lt;div class="viag-card-stats"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 122 |           &lt;span&gt;${v.num_lancamentos} lanÃ§amento${v.num_lancamentos !== 1 ? 's' : ''}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 |           &lt;span class="fin-resumo-sep"&gt;Â·&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 124 |           &lt;span style="color:var(--danger);font-weight:600"&gt;${_fmtBRL(v.total)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 125 |           &lt;span class="fin-resumo-sep"&gt;Â·&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 126 |           &lt;span style="color:var(--text-muted)"&gt;${mesAno}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 127 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |       &lt;div class="viag-accordion-body" id="${safeId}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 |         &lt;div class="fin-table-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 131 |           &lt;table class="fin-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 132 |             &lt;thead&gt;&lt;tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 |               &lt;th&gt;Data&lt;/th&gt;&lt;th&gt;Categoria&lt;/th&gt;&lt;th&gt;DescriÃ§Ã£o&lt;/th&gt;&lt;th&gt;Pagamento&lt;/th&gt;&lt;th&gt;Valor&lt;/th&gt;&lt;th&gt;&lt;/th&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 134 |             &lt;/tr&gt;&lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 |             &lt;tbody&gt;${linhas}&lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |           &lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 137 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 138 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 141 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 143 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 144 | function _redrawViagCharts() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 145 |   _buildViagDonut() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |   _buildViagBar() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 147 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 148 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 149 | // Donut por categoria, com total no centro e cross-filter com a barra | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 150 | function _buildViagDonut() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 151 |   const viagens = _viagAll | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 152 |   let catEntries, donutTotal | Declara variavel mutavel no escopo de bloco. |
| 153 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 154 |   if (_viagViagSel) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 155 |     // Quando uma viagem estÃ¡ selecionada, mostra sÃ³ as categorias dessa viagem | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 156 |     const v = viagens.find(v =&gt; v.nome_viagem === _viagViagSel) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 157 |     const m = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 158 |     if (v) v.lancamentos.forEach(l =&gt; { m[l.categoria_nome] = (m[l.categoria_nome] \|\| 0) + l.valor }) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 159 |     catEntries = Object.entries(m).sort((a, b) =&gt; b[1] - a[1]) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 160 |     donutTotal = catEntries.reduce((s, [, v]) =&gt; s + v, 0) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 161 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 162 |     const m = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 163 |     viagens.forEach(v =&gt; v.lancamentos.forEach(l =&gt; { m[l.categoria_nome] = (m[l.categoria_nome] \|\| 0) + l.valor })) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 164 |     catEntries = Object.entries(m).sort((a, b) =&gt; b[1] - a[1]) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 165 |     donutTotal = _viagTotal | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 166 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 168 |   // Esmaece categorias nÃ£o selecionadas quando hÃ¡ seleÃ§Ã£o ativa | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 169 |   const bgColors = catEntries.map(([k], i) =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 170 |     (_viagCatSel && k !== _viagCatSel) ? 'rgba(255,255,255,0.1)' : _VIAG_COLORS[i % _VIAG_COLORS.length] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 171 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 172 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 173 |   // Plugin inline: exibe label + total no centro do anel | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 174 |   const centerTextPlugin = { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 175 |     id: 'viag-center', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 176 |     afterDraw(chart) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 177 |       const { ctx, chartArea: { top, bottom, left, right } } = chart | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 178 |       const cx = (left + right) / 2, cy = (top + bottom) / 2 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 179 |       ctx.save() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 180 |       ctx.textAlign = 'center'; ctx.textBaseline = 'middle' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 181 |       ctx.font = '12px system-ui'; ctx.fillStyle = '#aaa' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 182 |       ctx.fillText(_viagViagSel \|\| 'Total', cx, cy - 13) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 183 |       ctx.font = 'bold 17px system-ui'; ctx.fillStyle = '#fff' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 184 |       ctx.fillText(_fmtShort(donutTotal) \|\| _fmtBRL(donutTotal), cx, cy + 8) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 185 |       ctx.restore() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 186 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 187 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 188 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 189 |   const ctxCat = document.getElementById('fin-chart-viag-cat') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |   if (!ctxCat) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 191 |   if (_finChartsInstances['viag-cat']) _finChartsInstances['viag-cat'].destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 192 |   _finChartsInstances['viag-cat'] = new Chart(ctxCat, { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 193 |     type: 'doughnut', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 194 |     plugins: [..._finDL, centerTextPlugin], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 195 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 196 |       labels:   catEntries.map(([k]) =&gt; k), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 197 |       datasets: [{ data: catEntries.map(([, v]) =&gt; v), backgroundColor: bgColors, borderWidth: 0 }] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 198 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 199 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 200 |       responsive: true, maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |       cutout: '62%', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |       onClick: (e, els) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |         if (!els.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 204 |           _viagCatSel = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 205 |         } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 206 |           const nome   = catEntries[els[0].index][0] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 207 |           _viagCatSel  = (_viagCatSel === nome) ? null : nome | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 208 |           _viagViagSel = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 209 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |         _redrawViagCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 211 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |         legend: { position: 'bottom', labels: { color: '#ccc', boxWidth: 12, padding: 10, font: { size: 11 } } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 214 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |           color: '#0d0f0e', font: { size: 10, weight: 'bold' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |           formatter: (val) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 |             const pct = (val / donutTotal * 100).toFixed(0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 218 |             return pct &lt; 4 ? '' : `${pct}%\n${_fmtShort(val) \|\| _fmtBRL(val)}` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 219 |           } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 222 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 224 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 225 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 226 | // Barra por viagem, com cross-filter com o donut | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 227 | function _buildViagBar() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 228 |   const viagens = _sortViagensLatestDesc(_viagAll) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 229 |   let labels, data, colors | Declara variavel mutavel no escopo de bloco. |
| 230 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 231 |   if (_viagCatSel) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 232 |     // Quando uma categoria estÃ¡ selecionada, mostra sÃ³ o gasto daquela categoria por viagem | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 233 |     labels = viagens.map(v =&gt; v.nome_viagem) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 234 |     data   = viagens.map(v =&gt; v.lancamentos.filter(l =&gt; l.categoria_nome === _viagCatSel).reduce((s, l) =&gt; s + l.valor, 0)) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 235 |     colors = data.map((d, i) =&gt; d &gt; 0 ? _VIAG_COLORS[i % _VIAG_COLORS.length] : 'rgba(255,255,255,0.1)') | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 236 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 237 |     labels = viagens.map(v =&gt; v.nome_viagem) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 238 |     data   = viagens.map(v =&gt; v.total) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 239 |     colors = viagens.map((v, i) =&gt; | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 240 |       (_viagViagSel && v.nome_viagem !== _viagViagSel) ? 'rgba(255,255,255,0.12)' : _VIAG_COLORS[i % _VIAG_COLORS.length] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 241 |     ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 242 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 243 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 244 |   const maxVal = Math.max(...data.filter(d =&gt; d &gt; 0), 1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 245 |   const ctxBar = document.getElementById('fin-chart-viag-bar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 246 |   if (!ctxBar) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 247 |   if (_finChartsInstances['viag-bar']) _finChartsInstances['viag-bar'].destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 248 |   _finChartsInstances['viag-bar'] = new Chart(ctxBar, { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |     type: 'bar', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 |     plugins: _finDL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |     data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 6, borderWidth: 0 }] }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 253 |       responsive: true, maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 |       onClick: (e, els) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 255 |         if (!els.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 256 |           _viagViagSel = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 257 |         } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |           const nome   = labels[els[0].index] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 259 |           _viagViagSel = (_viagViagSel === nome) ? null : nome | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 260 |           _viagCatSel  = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 261 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |         _redrawViagCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |         legend: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |           anchor: 'end', align: 'end', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |           color: '#ccc', font: { size: 11, weight: '600' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |           formatter: v =&gt; v &gt; 0 ? (_fmtShort(v) \|\| _fmtBRL(v)) : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |         x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#aaa' } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |         y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { display: false }, suggestedMax: maxVal * 1.18 } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 279 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 280 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 281 | function _viagToggle(bodyId, header) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 282 |   const body = document.getElementById(bodyId) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 283 |   if (!body) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 284 |   const open = body.classList.toggle('open') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 285 |   const chev = header.querySelector('.viag-chevron') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 286 |   if (chev) chev.textContent = open ? 'â–´' : 'â–¾' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 287 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 288 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 289 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 290 | async function _viajemUnlink(cdLancamento) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 291 |   if (!confirm('Desvincular este lanÃ§amento da viagem?')) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 292 |   const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, { method: 'DELETE' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 293 |   if (r.ok) renderViagens() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 294 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 295 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 296 | async function _viagemRenamePrompt(cdLancamento, nomeAtual) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 297 |   const novo = prompt('Novo nome da viagem:', nomeAtual) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 298 |   if (!novo \|\| novo === nomeAtual) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 299 |   const r = await fetch(`${API}/api/financas/viagens/${cdLancamento}`, { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 300 |     method:  'PATCH', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 301 |     headers: { 'Content-Type': 'application/json' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 302 |     body:    JSON.stringify({ nome_viagem: novo }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 303 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 304 |   if (r.ok) renderViagens() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 305 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
