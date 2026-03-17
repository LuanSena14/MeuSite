# Linha a linha - FrontEnd/pages/body/body.js

Arquivo fonte: FrontEnd/pages/body/body.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | let entries      = []   // check-ins carregados da API | Declara variavel mutavel no escopo de bloco. |
| 4 | let medidas      = []   // Ã¡rvore de grupos/medidas carregada da API | Declara variavel mutavel no escopo de bloco. |
| 5 | let chartPeso    = null | Declara variavel mutavel no escopo de bloco. |
| 6 | let chartComp    = null | Declara variavel mutavel no escopo de bloco. |
| 7 | let chartMetrica = null | Declara variavel mutavel no escopo de bloco. |
| 8 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 9 | function _setHidden(el, hidden) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 10 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 11 |   el.classList.toggle('is-hidden', !!hidden) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 |   el.style.display = hidden ? 'none' : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 15 | function destroyBodyCharts() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 16 |   if (chartPeso) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 17 |     chartPeso.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 18 |     chartPeso = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 19 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 20 |   if (chartComp) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 21 |     chartComp.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 |     chartComp = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 23 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |   if (chartMetrica) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 25 |     chartMetrica.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 26 |     chartMetrica = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 27 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 30 | window.destroyBodyCharts = destroyBodyCharts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 32 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 33 | function formatDate(iso) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 34 |   if (!iso) return '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 35 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 36 |   const date = new Date(iso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 37 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 38 |   return date.toLocaleDateString('pt-BR', { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 39 |     day: '2-digit', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 |     month: 'short', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |     year: 'numeric' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 42 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 43 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 44 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 45 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 46 | function round1(v) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 47 |   return Number.isFinite(v) ? parseFloat(v.toFixed(1)) : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 48 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 49 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 50 | function parseHeightMeters(rawHeight) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 51 |   if (rawHeight == null) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 52 |   const h = parseFloat(rawHeight) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 53 |   if (!Number.isFinite(h) \|\| h &lt;= 0) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 54 |   return h &gt; 3 ? h / 100 : h | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 55 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 56 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 57 | function getLatestKnown(entriesList, field) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 58 |   for (let i = entriesList.length - 1; i &gt;= 0; i--) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 59 |     if (entriesList[i]?.[field] != null) return entriesList[i][field] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 60 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 61 |   return null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 62 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 63 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 64 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 65 | function calcGorduraDobras(entry) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 66 |   const triceps     = parseFloat(entry?.dobra_triceps) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 67 |   const supraIliaca = parseFloat(entry?.dobra_supra_iliaca) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 68 |   const abdome      = parseFloat(entry?.dobra_abdome) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 69 |   if (![triceps, supraIliaca, abdome].every(Number.isFinite)) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 70 |   return round1((triceps + supraIliaca + abdome) * 0.153 + 5.783) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 71 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 73 | function calcularPercGordura(entry) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 74 |   const peso    = parseFloat(entry?.peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 75 |   const gordura = parseFloat(entry?.gordura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 76 |   if (![peso, gordura].every(Number.isFinite)) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 77 |   return round1((gordura / peso) * 100) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 78 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 80 | function resolveGorduraPct(entry) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 81 |   for (const valor of [ | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 82 |     calcularPercGordura(entry), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |     calcGorduraDobras(entry), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |     entry?.perc_gordura_dobras, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |     entry?.gordura_calculada, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |     entry?.percentual_gordura, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 |     entry?.gordura_dobras, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |     entry?.gordura_formula, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 89 |   ]) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |     const n = parseFloat(valor) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 91 |     if (Number.isFinite(n)) return n | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 92 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |   return null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 94 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 96 | function calcIMC(peso, alturaRaw) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 97 |   const altura = parseHeightMeters(alturaRaw) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 98 |   const p = parseFloat(peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 99 |   if (!Number.isFinite(p) \|\| !altura) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 100 |   return round1(p / (altura * altura)) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 101 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 103 | function calcMassaLivreGordura(peso, gorduraPct) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 104 |   const p = parseFloat(peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 105 |   const g = parseFloat(gorduraPct) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 106 |   if (!Number.isFinite(p) \|\| !Number.isFinite(g)) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 107 |   return round1(p * (1 - g / 100)) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 108 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 | function calcFFMI(peso, gorduraPct, alturaRaw) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 111 |   const altura = parseHeightMeters(alturaRaw) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 112 |   const mlg = calcMassaLivreGordura(peso, gorduraPct) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 113 |   if (mlg == null \|\| !altura) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 114 |   return round1(mlg / (altura * altura)) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 115 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 117 | function calcMassaGordura(peso, gorduraPct) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 118 |   const p = parseFloat(peso) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 119 |   const g = parseFloat(gorduraPct) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 120 |   if (!Number.isFinite(p) \|\| !Number.isFinite(g)) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 121 |   return round1(p * (g / 100)) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 122 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 124 | function buildDerivedMetrics(entry, fallbackAltura) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 125 |   const altura     = entry.altura ?? fallbackAltura | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 126 |   const gorduraPct = resolveGorduraPct(entry) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 127 |   return { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 128 |     gorduraPct, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |     imc:           calcIMC(entry.peso, altura), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 |     massa_muscular: entry.massa_muscular ?? calcMassaLivreGordura(entry.peso, gorduraPct), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 131 |     ffmi:          calcFFMI(entry.peso, gorduraPct, altura), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 132 |     mlg:           calcMassaLivreGordura(entry.peso, gorduraPct), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 |     massa_gordura: calcMassaGordura(entry.peso, gorduraPct), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 134 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 137 | const DERIVED_METRICS = [ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 138 |   { descricao: 'gorduraPct',    unidade: '%',  label: '% Gordura' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 |   { descricao: 'imc',           unidade: '',   label: 'IMC' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |   { descricao: 'ffmi',          unidade: '',   label: 'FFMI' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 141 |   { descricao: 'mlg',           unidade: 'kg', label: 'Massa Livre de Gordura' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |   { descricao: 'massa_gordura', unidade: 'kg', label: 'Massa de Gordura' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 143 | ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 144 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 145 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 146 | function delta(curr, prev, unit = '') { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 147 |   if (curr == null \|\| prev == null) return '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 148 |   const diff = (parseFloat(curr) - parseFloat(prev)).toFixed(1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 149 |   if (diff == 0) return `&lt;span class="delta-neu"&gt;= sem mudanÃ§a&lt;/span&gt;` | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 150 |   const cls  = diff &lt; 0 ? 'delta-pos' : 'delta-neg' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 151 |   const sign = diff &gt; 0 ? '+' : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 152 |   return `&lt;span class="${cls}"&gt;${sign}${diff}${unit} vs anterior&lt;/span&gt;` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 153 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 154 | function getUnidade(descricao) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 155 |   for (const grupo of medidas) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 156 |     const filho = grupo.filhos.find(f =&gt; f.descricao === descricao) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 157 |     if (filho) return filho.unidade ?? '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 158 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 159 |   return '' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 160 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 161 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 162 | // Verifica se uma mÃ©trica do banco tem pelo menos 1 valor nos entries | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 163 | function metricaTemDados(descricao) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 164 |   return entries.some(e =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 165 |     const v = parseFloat(e[descricao]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 166 |     return Number.isFinite(v) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 167 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 168 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 169 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 170 | function derivedTemDados(descricao) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 171 |   const latestAltura = getLatestKnown(entries, 'altura') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 172 |   return entries.some(e =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 173 |     const derived = buildDerivedMetrics(e, latestAltura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 174 |     return derived[descricao] != null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 175 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 176 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 177 | function buildMetricSelector() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 178 |   const selector = document.getElementById('metric-selector') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 179 |   if (!selector) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 180 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 181 |   let html = '' | Declara variavel mutavel no escopo de bloco. |
| 182 |   for (const grupo of medidas) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 183 |     const filhosComDados = grupo.filhos.filter(f =&gt; metricaTemDados(f.descricao)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 184 |     if (filhosComDados.length === 0) continue | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 185 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 186 |     html += `&lt;optgroup label="${grupo.descricao}"&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 187 |     for (const filho of filhosComDados) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 188 |       const label = filho.descricao.replaceAll('_', ' ') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 189 |       const unidade = filho.unidade ? ` (${filho.unidade})` : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |       html += `&lt;option value="${filho.descricao}"&gt;${label}${unidade}&lt;/option&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 191 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 192 |     html += `&lt;/optgroup&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 193 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 194 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 195 |   const derivadasComDados = DERIVED_METRICS.filter(m =&gt; derivedTemDados(m.descricao)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 196 |   if (derivadasComDados.length &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 197 |     html += `&lt;optgroup label="Calculadas"&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 198 |     for (const m of derivadasComDados) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 199 |       const unidade = m.unidade ? ` (${m.unidade})` : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 200 |       html += `&lt;option value="${m.descricao}"&gt;${m.label}${unidade}&lt;/option&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |     html += `&lt;/optgroup&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 205 |   selector.innerHTML = html | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 206 |   if (selector.value) renderMetricChart(selector.value) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 207 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 208 | function onMetricChange() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 209 |   const selector = document.getElementById('metric-selector') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 210 |   if (selector?.value) renderMetricChart(selector.value) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 211 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 213 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 214 | function renderMetricChart(metricKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 215 |   const latestAltura = getLatestKnown(entries, 'altura') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 216 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 217 |   const isDerived = DERIVED_METRICS.some(m =&gt; m.descricao === metricKey) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 218 |   const unidade   = isDerived | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 219 |     ? (DERIVED_METRICS.find(m =&gt; m.descricao === metricKey)?.unidade ?? '') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 |     : getUnidade(metricKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 222 |   const labels = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 223 |   const data   = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 224 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 225 |   for (const e of entries) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 226 |     const derived = buildDerivedMetrics(e, latestAltura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 227 |     const raw     = isDerived ? derived[metricKey] : e[metricKey] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 228 |     const v       = parseFloat(raw) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 229 |     if (Number.isFinite(v)) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 230 |       labels.push(formatDate(e.date)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 231 |       data.push(v) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 232 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 233 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 234 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 235 |   const ctx = document.getElementById('chart-metrica').getContext('2d') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 236 |   if (chartMetrica) chartMetrica.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 237 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 238 |   chartMetrica = new Chart(ctx, { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 239 |     type: 'line', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 240 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 241 |       labels, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 242 |       datasets: [{ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 243 |         data, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |         borderColor: '#42f5b5', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 245 |         backgroundColor: '#42f5b515', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 246 |         borderWidth: 2, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 247 |         pointBackgroundColor: '#42f5b5', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 248 |         pointRadius: 4, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |         tension: 0.4, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 |         fill: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |       }] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 253 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 |       responsive: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 255 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |         legend: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 257 |         tooltip: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |           callbacks: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 259 |             label: item =&gt; unidade | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 260 |               ? `${item.parsed.y} ${unidade}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 261 |               : `${item.parsed.y}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |           } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |         x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |         y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 273 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 274 | function renderDash() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 275 |   const empty   = document.getElementById('dash-empty') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 276 |   const content = document.getElementById('dash-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 277 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 278 |   if (entries.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 279 |     _setHidden(empty, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |     _setHidden(content, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |     destroyBodyCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 283 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 |   _setHidden(empty, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 285 |   _setHidden(content, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 286 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 287 |   const last         = entries[entries.length - 1] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 288 |   const lastIdx      = entries.length - 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 289 |   const latestAltura = getLatestKnown(entries, 'altura') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 290 |   const lastDerived  = buildDerivedMetrics(last, latestAltura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 291 |   function prevDerivedVal(key) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 292 |     for (let i = lastIdx - 1; i &gt;= 0; i--) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 293 |       const d = buildDerivedMetrics(entries[i], latestAltura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 294 |       if (d[key] != null) return d[key] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 295 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 296 |     return null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 297 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 298 |   function prevFieldVal(field) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 299 |     for (let i = lastIdx - 1; i &gt;= 0; i--) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 300 |       const v = parseFloat(entries[i][field]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 301 |       if (Number.isFinite(v)) return v | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 302 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 303 |     return null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 304 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 305 |   const smartPrevDerived = lastIdx &gt; 0 ? { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 306 |     gorduraPct:     prevDerivedVal('gorduraPct'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 307 |     imc:            prevDerivedVal('imc'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 308 |     ffmi:           prevDerivedVal('ffmi'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 309 |     mlg:            prevDerivedVal('mlg'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 310 |     massa_muscular: prevDerivedVal('massa_muscular'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 311 |     massa_gordura:  prevDerivedVal('massa_gordura'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 312 |   } : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 314 |   document.getElementById('last-update-label').textContent = | Interage com DOM para ler ou atualizar elementos da interface. |
| 315 |     'Ãšltimo check-in: ' + formatDate(last.date) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 316 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 317 |   document.getElementById('kpi-peso').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 318 |     (last.peso ?? 'â€”') + '&lt;span class="kpi-unit"&gt;kg&lt;/span&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 319 |   document.getElementById('kpi-peso-delta').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 320 |     delta(last.peso, prevFieldVal('peso'), ' kg') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 321 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 322 |   document.getElementById('kpi-gordura').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 323 |     (lastDerived.gorduraPct ?? 'â€”') + '&lt;span class="kpi-unit"&gt;%&lt;/span&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |   document.getElementById('kpi-gordura-delta').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 325 |     delta(lastDerived.gorduraPct, smartPrevDerived?.gorduraPct ?? null, '%') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 326 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 327 |   document.getElementById('kpi-musculo').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 328 |     (lastDerived.massa_muscular ?? 'â€”') + '&lt;span class="kpi-unit"&gt;kg&lt;/span&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 329 |   document.getElementById('kpi-musculo-delta').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 330 |     delta(lastDerived.massa_muscular, smartPrevDerived?.massa_muscular ?? null, ' kg') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 331 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 332 |   document.getElementById('kpi-ffmi').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 333 |     (lastDerived.ffmi ?? 'â€”') + '&lt;span class="kpi-unit"&gt;&lt;/span&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 334 |   document.getElementById('kpi-ffmi-delta').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 335 |     delta(lastDerived.ffmi, smartPrevDerived?.ffmi ?? null, '') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 336 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 337 |   renderLineChart( | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 338 |     'chart-peso', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 339 |     entries.map(e =&gt; formatDate(e.date)), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 340 |     entries.map(e =&gt; e.peso), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 341 |     '#b5f542' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 342 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 |   renderDonut('chart-composicao', lastDerived.gorduraPct, lastDerived.massa_muscular, last.peso) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 344 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 345 |   buildMetricSelector()  // usa a Ã¡rvore que veio do banco (var global `medidas`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 346 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 347 |   renderMeasures(last, lastDerived, smartPrevDerived) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 348 |   renderHistory(latestAltura) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 351 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 352 | function renderLineChart(id, labels, data, color) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 353 |   const ctx = document.getElementById(id).getContext('2d') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 354 |   if (chartPeso) chartPeso.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 355 |   chartPeso = new Chart(ctx, { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 356 |     type: 'line', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 357 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 358 |       labels, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 359 |       datasets: [{ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 360 |         data, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 361 |         borderColor: color, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 362 |         backgroundColor: color + '15', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 363 |         borderWidth: 2, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |         pointBackgroundColor: color, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |         pointRadius: 4, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 366 |         tension: 0.4, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 367 |         fill: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 368 |       }] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 369 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 370 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 371 |       responsive: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 372 |       plugins: { legend: { display: false } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 373 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 374 |         x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 375 |         y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 376 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 377 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 378 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 379 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 380 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 381 | function renderDonut(id, gorduraPct, massa_muscular, peso) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 382 |   const ctx          = document.getElementById(id).getContext('2d') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 383 |   const massaGordura = calcMassaGordura(peso, gorduraPct) ?? 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 384 |   const musculo      = parseFloat(massa_muscular) \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 385 |   const outro        = Math.max(0, parseFloat(peso) - massaGordura - musculo) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 386 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 387 |   if (chartComp) chartComp.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 388 |   chartComp = new Chart(ctx, { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 389 |     type: 'doughnut', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 390 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 391 |       labels: ['Gordura', 'MÃºsculo', 'Outros'], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 392 |       datasets: [{ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 393 |         data: [massaGordura, musculo, outro], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 394 |         backgroundColor: ['#f55a4230', '#b5f54230', '#2a2e2c'], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 395 |         borderColor:     ['#f55a42',   '#b5f542',   '#3a3e3c'], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 396 |         borderWidth: 2 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 397 |       }] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 398 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 399 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 400 |       responsive: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 401 |       cutout: '70%', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 402 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 403 |         legend: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 404 |           position: 'bottom', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 405 |           labels: { color: '#9aa39d', font: { size: 11, family: 'DM Mono' }, boxWidth: 10 } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 406 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 408 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 409 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 410 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 411 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 412 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 413 | function renderMeasures(e, derived, prevDerived) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 414 |   const measures = [ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 415 |     { label: 'IMC',         value: derived.imc,        unit: '',          max: 50,  delta: prevDerived ? delta(derived.imc,  prevDerived.imc,  '') : '' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 416 |     { label: 'FFMI',        value: derived.ffmi,       unit: '',          max: 35,  delta: prevDerived ? delta(derived.ffmi, prevDerived.ffmi, '') : '' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |     { label: 'Massa livre', value: derived.mlg,        unit: 'kg',        max: 120, delta: prevDerived ? delta(derived.mlg,  prevDerived.mlg,  ' kg') : '' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 418 |     { label: 'Cintura',     value: e.cintura,          unit: 'cm',        max: 120 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |     { label: 'Quadril',     value: e.quadril,          unit: 'cm',        max: 140 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 420 |     { label: 'Abdominal',   value: e.circ_abdominal,   unit: 'cm',        max: 130 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |     { label: 'TÃ³rax',       value: e.circ_torax,       unit: 'cm',        max: 140 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 422 |     { label: 'BraÃ§o',       value: e.circ_braco,       unit: 'cm',        max: 60  }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 423 |     { label: 'Coxa',        value: e.circ_coxa,        unit: 'cm',        max: 90  }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 424 |     { label: 'Panturrilha', value: e.circ_panturrilha, unit: 'cm',        max: 60  }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 425 |     { label: 'VO2 mÃ¡x',     value: e.vo2,              unit: 'mL/kg/min', max: 70  }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 426 |   ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 428 |   document.getElementById('measures-grid').innerHTML = measures | Interage com DOM para ler ou atualizar elementos da interface. |
| 429 |     .filter(m =&gt; m.value != null) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 430 |     .map(m =&gt; ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 431 |       &lt;div class="measure-card"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 |         &lt;div class="measure-label"&gt;${m.label}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 433 |         &lt;div class="measure-value"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 434 |           ${m.value}&lt;span class="measure-unit"&gt; ${m.unit}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 435 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 436 |         ${m.delta ? `&lt;div class="kpi-delta measure-delta"&gt;${m.delta}&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 437 |         &lt;div class="measure-bar"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 438 |           &lt;div class="measure-bar-fill" style="width:${Math.min(100, (m.value / m.max) * 100)}%"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 439 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 440 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 441 |     `).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 442 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 443 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 444 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 445 | function renderHistory(fallbackAltura) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 446 |   document.getElementById('history-body').innerHTML = [...entries].reverse().map(e =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 447 |     const d = buildDerivedMetrics(e, fallbackAltura) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 448 |     return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 449 |       &lt;tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 450 |         &lt;td&gt;${formatDate(e.date)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 451 |         &lt;td&gt;${e.peso           != null ? e.peso + ' kg'            : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 452 |         &lt;td&gt;${d.gorduraPct     != null ? d.gorduraPct + '%'        : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 453 |         &lt;td&gt;${d.massa_muscular != null ? d.massa_muscular + ' kg'  : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 454 |         &lt;td&gt;${e.cintura        != null ? e.cintura + ' cm'         : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 455 |         &lt;td&gt;${e.circ_abdominal != null ? e.circ_abdominal + ' cm' : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 456 |         &lt;td&gt;${e.sono           != null ? e.sono + 'h'              : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 457 |       &lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 458 |     ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 459 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 460 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
