# Linha a linha - FrontEnd/pages/finances/fin-investimentos.js

Arquivo fonte: FrontEnd/pages/finances/fin-investimentos.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | //                        indicadores nÃ£o-financeiros e tabela pivot de histÃ³rico | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 4 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 5 | // Snapshot mais recente cuja data &lt;= upTo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 6 | function _snapLatestUpTo(snaps, upTo) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 7 |   return snaps.filter(s =&gt; s.data.slice(0, 7) &lt;= upTo) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 8 |               .sort((a, b) =&gt; b.data.localeCompare(a.data))[0] \|\| null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 9 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 10 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 11 | // Snapshot mais recente dentro de um mÃªs especÃ­fico | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 | function _snapLatestInMonth(snaps, mk) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 13 |   return snaps.filter(s =&gt; s.data.slice(0, 7) === mk) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 14 |               .sort((a, b) =&gt; b.data.localeCompare(a.data))[0] \|\| null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 16 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 17 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 18 | function renderInvestimentos() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 19 |   const mesFilter = document.getElementById('fin-inv-filter-mes')?.value \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 20 |   let ano, mes | Declara variavel mutavel no escopo de bloco. |
| 21 |   if (mesFilter) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 22 |     ;[ano, mes] = mesFilter.split('-').map(Number) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 23 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |     const now = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 25 |     ano = now.getFullYear(); mes = now.getMonth() + 1 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 26 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 28 |   const mesStr   = `${ano}-${String(mes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 29 |   const prevStr  = mes === 1 ? `${ano - 1}-12` : `${ano}-${String(mes - 1).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 30 |   const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 31 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 32 |   const indicIds = new Set([78, ..._getDescendantIds(78)]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 33 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 34 |   _renderInvCards(mesStr, prevStr, mesLabel, indicIds) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   _renderIndCards(mesStr, prevStr, mesLabel, indicIds) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 37 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 38 | function _renderInvCards(mesStr, prevStr, mesLabel, indicIds) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 39 |   const container = document.getElementById('fin-inv-cards') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 40 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 41 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 42 |   const invSnaps    = window.finInvestimentos.filter(s =&gt; !indicIds.has(s.cd_financa)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 43 |   const snapsPorCat = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 44 |   invSnaps.forEach(s =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 45 |     if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 46 |     snapsPorCat[s.cd_financa].push(s) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |   const cats = window.finCodigos.filter(c =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 49 |     c.tipo === 'investimento' && !indicIds.has(c.id) && snapsPorCat[c.id]?.length &gt; 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 52 |   if (!cats.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 53 |     container.innerHTML = '&lt;p class="inline-empty-note-center"&gt;Nenhum snapshot de investimento registrado.&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |     _renderChartInvestimentos({}, []) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 55 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 56 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 58 |   let totalAtual = 0, totalAnterior = 0, prevCount = 0 | Declara variavel mutavel no escopo de bloco. |
| 59 |   const cardsData = cats.map(cat =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 60 |     const snaps    = snapsPorCat[cat.id] \|\| [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 61 |     const curSnap  = _snapLatestUpTo(snaps, mesStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 62 |     const prevSnap = _snapLatestInMonth(snaps, prevStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 63 |     if (!curSnap) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 64 |     const saldo = Number(curSnap.saldo) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 65 |     totalAtual += saldo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 66 |     if (prevSnap) { totalAnterior += Number(prevSnap.saldo); prevCount++ } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 67 |     return { id: cat.id, nome: cat.nome, saldo, prevSaldo: prevSnap ? Number(prevSnap.saldo) : null } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 68 |   }).filter(Boolean).sort((a, b) =&gt; b.saldo - a.saldo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 69 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 70 |   const cardHtml = ({ id, nome, saldo, prevSaldo }) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 71 |     const deltaHtml = prevSaldo !== null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 72 |       ? `&lt;div class="fin-inv-card-rend ${saldo - prevSaldo &gt;= 0 ? 'pos' : 'neg'}"&gt;${saldo - prevSaldo &gt;= 0 ? '+' : ''}${_fmtBRL(saldo - prevSaldo)} no mÃªs&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |       : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 74 |     const isSelected = window._finInvSelected === id | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 75 |     return `&lt;div class="fin-inv-card fin-clickable${isSelected ? ' fin-inv-card-selected' : ''}" onclick="_filterInvChart(${id})"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 76 |       &lt;div class="fin-inv-card-name"&gt;${nome}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |       &lt;div class="fin-inv-card-saldo"&gt;${_fmtBRL(saldo)}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |       ${deltaHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 82 |   const totalDelta     = prevCount &gt; 0 ? totalAtual - totalAnterior : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 83 |   const totalDeltaHtml = totalDelta !== null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 84 |     ? `&lt;div class="fin-inv-card-rend ${totalDelta &gt;= 0 ? 'pos' : 'neg'}"&gt;${totalDelta &gt;= 0 ? '+' : ''}${_fmtBRL(totalDelta)} no mÃªs&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |     : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |   const totalCard = `&lt;div class="fin-inv-card fin-inv-card-total"&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 87 |     &lt;div class="fin-inv-card-name"&gt;Total geral&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |     &lt;div class="fin-inv-card-saldo"&gt;${_fmtBRL(totalAtual)}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 89 |     ${totalDeltaHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |   &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 91 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 92 |   container.innerHTML = totalCard + cardsData.map(cardHtml).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 94 |   window._finInvSnapsPorCat = snapsPorCat | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |   window._finInvCats        = cats | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |   _renderChartInvestimentos(snapsPorCat, cats) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 99 | function _renderIndCards(mesStr, prevStr, mesLabel, indicIds) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 100 |   const container = document.getElementById('fin-ind-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 101 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 102 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 103 |   const indicIdsList = [78, ..._getDescendantIds(78)] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 104 |   const indSnaps     = window.finInvestimentos.filter(s =&gt; indicIdsList.includes(s.cd_financa)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 105 |   const snapsPorCat  = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 106 |   indSnaps.forEach(s =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 107 |     if (!snapsPorCat[s.cd_financa]) snapsPorCat[s.cd_financa] = [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 108 |     snapsPorCat[s.cd_financa].push(s) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 109 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 110 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 111 |   const indCats = [...new Map(indSnaps.map(s =&gt; [s.cd_financa, s.nome])).entries()] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 112 |     .map(([id, nome]) =&gt; ({ id, nome })) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |     .filter(c =&gt; (snapsPorCat[c.id] \|\| []).some(s =&gt; s.data.slice(0, 7) &lt;= mesStr)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 114 |     .sort((a, b) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |       const va = _snapLatestUpTo(snapsPorCat[a.id] \|\| [], mesStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 116 |       const vb = _snapLatestUpTo(snapsPorCat[b.id] \|\| [], mesStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 117 |       return (vb ? Number(vb.saldo) : 0) - (va ? Number(va.saldo) : 0) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 118 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 119 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 120 |   if (!indCats.length) { container.innerHTML = ''; return } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 121 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 122 |   const cardsHtml = indCats.map(cat =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 123 |     const curSnap  = _snapLatestUpTo(snapsPorCat[cat.id] \|\| [], mesStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 124 |     const prevSnap = _snapLatestInMonth(snapsPorCat[cat.id] \|\| [], prevStr) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 125 |     if (!curSnap) return '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 126 |     const val = Number(curSnap.saldo) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 127 |     const deltaHtml = prevSnap | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 128 |       ? (() =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |           const d = val - Number(prevSnap.saldo) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 130 |           return `&lt;div class="fin-inv-card-rend ${d &gt;= 0 ? 'pos' : 'neg'}"&gt;${d &gt;= 0 ? '+' : ''}${Number(d).toLocaleString('pt-BR')} no mÃªs&lt;/div&gt;` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 131 |         })() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 132 |       : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 |     const isSelected = window._finIndSelected === cat.id | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 134 |     return `&lt;div class="fin-inv-card fin-clickable${isSelected ? ' fin-inv-card-selected' : ''}" onclick="_filterIndChart(${cat.id})"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 135 |       &lt;div class="fin-inv-card-name"&gt;${cat.nome}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |       &lt;div class="fin-inv-card-saldo"&gt;${Number(val).toLocaleString('pt-BR')}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 137 |       ${deltaHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 138 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 |   }).filter(Boolean).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 141 |   container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |     &lt;div class="fin-inv-section-label"&gt;Indicadores â€” ${mesLabel}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 143 |     &lt;div class="fin-inv-cards"&gt;${cardsHtml}&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 144 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 145 |   window._finIndSnapsPorCat = snapsPorCat | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |   window._finIndCats        = indCats | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 147 |   _renderChartIndicadores(snapsPorCat, indCats) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 148 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 150 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 151 | // Clique em card de investimento: filtra o grÃ¡fico para mostrar sÃ³ aquele ativo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 152 | function _filterInvChart(catId) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 153 |   window._finInvSelected = window._finInvSelected === catId ? null : catId | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 154 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 155 |   document.querySelectorAll('#fin-inv-cards .fin-inv-card:not(.fin-inv-card-total)').forEach((el, i) =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 156 |     el.classList.toggle('fin-inv-card-selected', window._finInvSelected === (window._finInvCats \|\| [])[i]?.id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 157 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 158 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 159 |   const cats  = window._finInvSelected !== null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 160 |     ? (window._finInvCats \|\| []).filter(c =&gt; c.id === window._finInvSelected) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 161 |     : (window._finInvCats \|\| []) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 162 |   const snaps = window._finInvSelected !== null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 163 |     ? { [window._finInvSelected]: (window._finInvSnapsPorCat \|\| {})[window._finInvSelected] \|\| [] } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 164 |     : (window._finInvSnapsPorCat \|\| {}) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 165 |   _renderChartInvestimentos(snaps, cats) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 168 | // Clique em card de indicador: filtra o grÃ¡fico para mostrar sÃ³ aquele indicador | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 169 | function _filterIndChart(catId) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 170 |   window._finIndSelected = window._finIndSelected === catId ? null : catId | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 171 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 172 |   document.querySelectorAll('#fin-ind-content .fin-inv-card').forEach((el, i) =&gt; { | Interage com DOM para ler ou atualizar elementos da interface. |
| 173 |     el.classList.toggle('fin-inv-card-selected', window._finIndSelected === (window._finIndCats \|\| [])[i]?.id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 174 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 175 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 176 |   const cats = window._finIndSelected !== null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 177 |     ? (window._finIndCats \|\| []).filter(c =&gt; c.id === window._finIndSelected) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 178 |     : (window._finIndCats \|\| []) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 179 |   _renderChartIndicadores(window._finIndSnapsPorCat \|\| {}, cats) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 180 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 181 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 182 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 183 | // ConstrÃ³i um grÃ¡fico de linha temporal com mÃºltiplas sÃ©ries (investimentos ou indicadores) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 184 | function _buildTimelineChart(canvasId, chartKey, snapsPorCat, cats, colors, fmtValue) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 185 |   const canvas = document.getElementById(canvasId) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 186 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 187 |   _destroyChart(chartKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 188 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 189 |   const allSnaps = Object.values(snapsPorCat).flat() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |   const allDates = [...new Set(allSnaps.map(s =&gt; s.data))].sort() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 191 |   if (!allDates.length) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 192 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 193 |   const datasets = cats.filter(c =&gt; snapsPorCat[c.id]?.length &gt; 0).map((cat, i) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 194 |     const snaps = snapsPorCat[cat.id] \|\| [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 195 |     return { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 196 |       label: cat.nome, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 197 |       data: allDates.map(d =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 198 |         const s = snaps.filter(x =&gt; x.data &lt;= d).sort((a, b) =&gt; b.data.localeCompare(a.data))[0] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 199 |         return s ? Number(s.saldo) : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 200 |       }), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |       borderColor:     colors[i % colors.length], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |       backgroundColor: colors[i % colors.length] + '20', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |       fill: false, tension: 0.3, spanGaps: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 205 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 206 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 207 |   _finChartsInstances[chartKey] = new Chart(canvas, { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 208 |     type: 'line', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 209 |     data: { labels: allDates.map(d =&gt; _fmtDate(d)), datasets }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 211 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |         x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |         y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v =&gt; fmtValue(v) }, grid: { color: '#2a2f2c' } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 214 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |         legend:     { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 |         datalabels: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 218 |         tooltip:    { callbacks: { label: ctx =&gt; ' ' + fmtValue(ctx.raw) } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 219 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 222 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 224 | function _renderChartInvestimentos(snapsPorCat, cats) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 225 |   const colors = ['#4ecca3','#7c9eff','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 226 |   _buildTimelineChart('fin-chart-inv', 'inv', snapsPorCat, cats, colors, v =&gt; _fmtBRL(v)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 227 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 228 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 229 | function _renderChartIndicadores(snapsPorCat, cats) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 230 |   const card   = document.getElementById('fin-ind-chart-card') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 231 |   const canvas = document.getElementById('fin-chart-ind') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 232 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 233 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 234 |   if (!cats?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 235 |     if (card) card.style.display = 'none' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 236 |     _destroyChart('ind') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 237 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 238 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 239 |   if (card) card.style.display = '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 240 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 241 |   const colors = ['#7c9eff','#4ecca3','#f5d742','#ff9f47','#9b59b6','#e05c5c','#1abc9c'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 242 |   _buildTimelineChart('fin-chart-ind', 'ind', snapsPorCat, cats, colors, v =&gt; Number(v).toLocaleString('pt-BR')) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 243 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 245 | async function deleteInvestimentoFin(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 246 |   await deleteInvestimento(id) | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 247 |   window.finInvestimentos = window.finInvestimentos.filter(s =&gt; s.id !== id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 248 |   renderInvestimentos() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |   _showFinToast('Registro removido') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 252 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 253 | // Mostra os Ãºltimos 18 meses com colunas Valor \| Î” \| Î”% por indicador | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 | function renderIndicadores() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 255 |   const mesFilter = document.getElementById('fin-ind-filter-mes')?.value \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 256 |   const indicIds  = [78, ..._getDescendantIds(78)] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 257 |   let snaps = window.finInvestimentos.filter(s =&gt; indicIds.includes(s.cd_financa)) | Declara variavel mutavel no escopo de bloco. |
| 258 |   if (mesFilter) snaps = snaps.filter(s =&gt; s.data.startsWith(mesFilter)) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 259 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 260 |   const container = document.getElementById('fin-ind-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 261 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 262 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 263 |   if (!snaps.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 264 |     container.innerHTML = '&lt;p class="inline-empty-note-center"&gt;Nenhum indicador registrado' + (mesFilter ? ' para o perÃ­odo.' : '.') + '&lt;/p&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 266 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 268 |   const allMes  = [...new Set(snaps.map(s =&gt; s.data.slice(0,7)))].sort().reverse().slice(0, 18) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 269 |   const allCats = [...new Map(snaps.map(s =&gt; [s.cd_financa, s.nome])).entries()] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 270 |     .sort((a, b) =&gt; a[1].localeCompare(b[1])) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |     .map(([id, nome]) =&gt; ({ id, nome })) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 273 |   // Pivot: {mes: {cd_financa: snapshot}}; guarda o snapshot mais recente por mÃªs | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |   const lookup = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 275 |   snaps.forEach(s =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |     const mk = s.data.slice(0, 7) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 277 |     if (!lookup[mk]) lookup[mk] = {} | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 278 |     if (!lookup[mk][s.cd_financa] \|\| s.data &gt; lookup[mk][s.cd_financa].data) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 279 |       lookup[mk][s.cd_financa] = s | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 282 |   const header = '&lt;tr&gt;&lt;th&gt;MÃªs&lt;/th&gt;' + | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 283 |     allCats.flatMap(c =&gt; [ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 |       `&lt;th&gt;${c.nome}&lt;/th&gt;`, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 285 |       '&lt;th class="fin-ind-delta-h"&gt;Î”&lt;/th&gt;', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 286 |       '&lt;th class="fin-ind-delta-h"&gt;Î”%&lt;/th&gt;', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 287 |     ]).join('') + '&lt;/tr&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 288 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 289 |   const rows = allMes.map((mk, idx) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 290 |     const prevMk = allMes[idx + 1] \|\| null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 291 |     const [y, m] = mk.split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 292 |     const label  = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 293 |     const cells  = allCats.flatMap(c =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 294 |       const cur      = lookup[mk]?.[c.id] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 295 |       const prev     = prevMk ? lookup[prevMk]?.[c.id] : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 296 |       const curVal   = cur  ? Number(cur.saldo)  : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 297 |       const prevVal  = prev ? Number(prev.saldo) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 298 |       const valCell  = `&lt;td&gt;${curVal !== null ? Number(curVal).toLocaleString('pt-BR') : 'â€”'}&lt;/td&gt;` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 299 |       if (curVal === null \|\| prevVal === null) return [valCell, '&lt;td&gt;&lt;/td&gt;', '&lt;td&gt;&lt;/td&gt;'] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 300 |       const d   = curVal - prevVal | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 301 |       const pct = prevVal &gt; 0 ? (d / prevVal * 100).toFixed(1) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 302 |       const cls = d &gt;= 0 ? 'fin-under' : 'fin-over' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 303 |       return [ | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 304 |         valCell, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 305 |         `&lt;td class="${cls}"&gt;${d &gt;= 0 ? '+' : ''}${Number(d).toLocaleString('pt-BR')}&lt;/td&gt;`, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 306 |         `&lt;td class="${cls}"&gt;${pct !== null ? (d &gt;= 0 ? '+' : '') + pct + '%' : 'â€”'}&lt;/td&gt;`, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 307 |       ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 308 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 309 |     return `&lt;tr&gt;&lt;td&gt;${label}&lt;/td&gt;${cells.join('')}&lt;/tr&gt;` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 310 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 311 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 312 |   container.innerHTML = `&lt;div class="fin-table-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |     &lt;table class="fin-table fin-ind-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 314 |       &lt;thead&gt;${header}&lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 315 |       &lt;tbody&gt;${rows}&lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 316 |     &lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 317 |   &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
