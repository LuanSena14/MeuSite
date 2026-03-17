# Linha a linha - FrontEnd/pages/finances/fin-lancamentos.js

Arquivo fonte: FrontEnd/pages/finances/fin-lancamentos.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | // ReconstrÃ³i o &lt;select&gt; de categorias agrupando folhas (sem filhos) por tipo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 4 | function _updateLancCatFilter() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 5 |   const tipo = document.getElementById('fin-filter-tipo')?.value \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 6 |   const sel  = document.getElementById('fin-filter-cat') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 7 |   if (!sel) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 8 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 9 |   const todos   = window.finCodigos | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 10 |   const raizIds = new Set(todos.filter(c =&gt; c.cd_pai === null).map(c =&gt; c.id)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 11 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 12 |   // Folhas = categorias sem filhos (excluindo as raÃ­zes de tipo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 |   const temFilho = new Set(todos.filter(c =&gt; c.cd_pai !== null).map(c =&gt; c.cd_pai)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 14 |   const folhas   = todos.filter(c =&gt; !temFilho.has(c.id) && !raizIds.has(c.id)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 |   const porTipo = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 17 |   for (const f of folhas) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 18 |     const t = f.tipo \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 19 |     if (!porTipo[t]) porTipo[t] = [] | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 20 |     porTipo[t].push(f) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 21 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 23 |   let html   = '&lt;option value=""&gt;Todas as categorias&lt;/option&gt;' | Declara variavel mutavel no escopo de bloco. |
| 24 |   const tipos = tipo ? [tipo] : Object.keys(porTipo).sort((a, b) =&gt; a.localeCompare(b, 'pt-BR')) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 25 |   for (const t of tipos) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 26 |     const lista = (porTipo[t] \|\| []).sort((a, b) =&gt; a.nome.localeCompare(b.nome, 'pt-BR')) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 27 |     if (!lista.length) continue | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 28 |     const label = t.charAt(0).toUpperCase() + t.slice(1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 29 |     html += `&lt;optgroup label="${label}"&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |     html += lista.map(c =&gt; `&lt;option value="${c.id}"&gt;${c.nome}&lt;/option&gt;`).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |     html += '&lt;/optgroup&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 32 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |   sel.innerHTML = html | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 34 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 36 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 37 | function renderLancamentos() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 38 |   const tipoFilter = document.getElementById('fin-filter-tipo')?.value \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 39 |   const mesFilter  = document.getElementById('fin-filter-mes')?.value  \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 40 |   const catFilter  = document.getElementById('fin-filter-cat')?.value  \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 41 |   const pagFilter  = document.getElementById('fin-filter-pag')?.value  \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 42 |   const descFilter = document.getElementById('fin-filter-desc')?.value.toLowerCase().trim() \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 43 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 44 |   // Popula o select de categorias na primeira vez que a aba Ã© aberta | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 45 |   const catSel = document.getElementById('fin-filter-cat') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 46 |   if (catSel && catSel.options.length &lt;= 1) _updateLancCatFilter() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 47 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 48 |   let dados = window.finLancamentos.slice() | Declara variavel mutavel no escopo de bloco. |
| 49 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 50 |   if (tipoFilter) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 51 |     const ids = window.finCodigos.filter(c =&gt; c.tipo === tipoFilter).map(c =&gt; c.id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 52 |     dados = dados.filter(l =&gt; ids.includes(l.cd_financa)) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 53 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |   if (catFilter)  dados = dados.filter(l =&gt; l.cd_financa === Number(catFilter)) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 55 |   if (pagFilter)  dados = pagFilter === 'null' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 56 |     ? dados.filter(l =&gt; !l.forma_pagamento) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |     : dados.filter(l =&gt; l.forma_pagamento === pagFilter) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 58 |   if (mesFilter)  dados = dados.filter(l =&gt; l.data.startsWith(mesFilter)) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 59 |   if (descFilter) dados = dados.filter(l =&gt; (l.descricao \|\| '').toLowerCase().includes(descFilter)) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 60 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 61 |   dados.sort((a, b) =&gt; b.data.localeCompare(a.data)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 62 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 63 |   const tbody = document.getElementById('fin-tbody-lancamentos') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 64 |   if (!tbody) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 65 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 66 |   tbody.innerHTML = dados.map(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |     const cod  = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 68 |     const tipo = cod?.tipo \|\| 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 69 |     const cls  = tipo === 'receita' ? 'fin-receita' : 'fin-despesa' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 70 |     // Exibe "Grupo â€º Categoria" quando o grupo nÃ£o Ã© igual ao tipo (evita redundÃ¢ncia) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 |     const catCell = l.grupo_nome && l.grupo_nome.toLowerCase() !== l.tipo | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 72 |       ? `&lt;span style="color:var(--text-muted);font-size:.76em;margin-right:2px"&gt;${l.grupo_nome} â€º&lt;/span&gt;${l.categoria_nome}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |       : l.categoria_nome | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 74 |     return `&lt;tr&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 75 |       &lt;td&gt;${_fmtDate(l.data)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |       &lt;td&gt;${catCell}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |       &lt;td class="${cls}"&gt;${tipo}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |       &lt;td&gt;${_finPagBadge(l.forma_pagamento)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |       &lt;td&gt;${l.descricao \|\| 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |       &lt;td class="fin-col-valor ${cls}"&gt;${_fmtBRL(l.valor)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |       &lt;td&gt;&lt;button class="fin-del-btn" onclick="deleteLancamentoFin(${l.id})"&gt;âœ•&lt;/button&gt;&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |     &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 85 |   // Resumo de totais filtrados | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |   let totalRec = 0, totalDesp = 0 | Declara variavel mutavel no escopo de bloco. |
| 87 |   dados.forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |     const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 89 |     if (cod?.tipo === 'receita') totalRec  += Number(l.valor) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 90 |     if (cod?.tipo === 'despesa') totalDesp += Number(l.valor) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 91 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 92 |   const resumo = document.getElementById('fin-lanc-resumo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 93 |   if (resumo) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 94 |     const saldo = totalRec - totalDesp | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 95 |     resumo.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |       &lt;span&gt;Receitas: &lt;b class="fin-receita"&gt;${_fmtBRL(totalRec)}&lt;/b&gt;&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |       &lt;span&gt;Despesas: &lt;b class="fin-despesa"&gt;${_fmtBRL(totalDesp)}&lt;/b&gt;&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 |       &lt;span&gt;Saldo: &lt;b style="color:${saldo &gt;= 0 ? 'var(--accent)' : 'var(--danger)'}"&gt;${_fmtBRL(saldo)}&lt;/b&gt;&lt;/span&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 102 | async function deleteLancamentoFin(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 103 |   await deleteLancamento(id) | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 104 |   window.finLancamentos = window.finLancamentos.filter(l =&gt; l.id !== id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |   renderLancamentos() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 106 |   if (_finActiveTab === 'overview') renderFinOverview() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 107 |   _showFinToast('LanÃ§amento removido') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 108 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 111 | function renderOrcamento() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 112 |   const mesFilter = document.getElementById('fin-orc-filter-mes')?.value \|\| '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 113 |   let refAno, refMes | Declara variavel mutavel no escopo de bloco. |
| 114 |   if (mesFilter) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 115 |     ;[refAno, refMes] = mesFilter.split('-').map(Number) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |     const now = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 118 |     refAno = now.getFullYear(); refMes = now.getMonth() + 1 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 119 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 120 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 121 |   const mesStr   = `${refAno}-${String(refMes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 122 |   const mesLabel = new Date(refAno, refMes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 123 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 124 |   const realizado = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 125 |   window.finLancamentos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 126 |     .filter(l =&gt; l.data.startsWith(mesStr)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 127 |     .forEach(l =&gt; { realizado[l.cd_financa] = (realizado[l.cd_financa] \|\| 0) + Number(l.valor) }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 129 |   _renderRecorrentePanel(refAno, refMes, mesLabel, realizado) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 |   _renderCreditoPanel(refAno, refMes, mesLabel) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 131 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 132 |   const orc     = _effectiveOrcamento(refAno, refMes) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 133 |   const mensais = orc.filter(o =&gt; o.mes !== null) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 134 |   const anuais  = orc.filter(o =&gt; o.mes === null) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 135 |   const detEl   = document.getElementById('fin-orc-list') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 136 |   if (!detEl) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 137 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 138 |   let html = '' | Declara variavel mutavel no escopo de bloco. |
| 139 |   if (mensais.length &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 140 |     html += `&lt;div class="fin-orc-section-label"&gt;Vigente â€” ${mesLabel}&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 141 |     html += _buildOrcGroupHtml(_buildOrcTree(mensais, realizado), true, 'tab-m') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 143 |   if (anuais.length &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 144 |     html += `&lt;div class="fin-orc-section-label fin-orc-section-label-top"&gt;Base anual&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 145 |     html += _buildOrcGroupHtml(_buildOrcTree(anuais, realizado), true, 'tab-a') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 147 |   if (!html) html = '&lt;p class="inline-empty-note-center"&gt;Nenhum orÃ§amento para o perÃ­odo.&lt;/p&gt;' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 148 |   detEl.innerHTML = html | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 150 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 151 | async function deleteOrcamentoFin(id) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 152 |   await deleteOrcamento(id) | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 153 |   window.finOrcamento = window.finOrcamento.filter(o =&gt; o.id !== id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 154 |   renderFinOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 155 |   _showFinToast('OrÃ§amento removido') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 156 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 157 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 158 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 159 | function _renderRecorrentePanel(ano, mes, mesLabel, realizadoMap) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 160 |   const container = document.getElementById('fin-rec-panel') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 161 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 162 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 163 |   const orc = _effectiveOrcamento(ano, mes) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 164 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 165 |   // IDs fixos: Recorrente=6, Pontual=8, Salario=4, Bonus=5 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 |   const recIds    = _getDescendantIds(6) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 167 |   const pontIds   = _getDescendantIds(8) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 168 |   const recEntIds = _getDescendantIds(4).concat(_getDescendantIds(5)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 169 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 170 |   const sumOrc  = (ids) =&gt; orc.filter(o =&gt; ids.includes(o.cd_financa) && o.mes !== null).reduce((s, o) =&gt; s + Number(o.valor_orcado), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 171 |   const sumReal = (ids) =&gt; Object.entries(realizadoMap).filter(([id]) =&gt; ids.includes(Number(id))).reduce((s, [, v]) =&gt; s + v, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 172 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 173 |   const prevEntradas = sumOrc(recEntIds),  realEntradas = sumReal(recEntIds) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 174 |   const prevRec      = sumOrc(recIds),     realRec      = sumReal(recIds) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 175 |   const prevPont     = sumOrc(pontIds),    realPont     = sumReal(pontIds) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 176 |   const prevSaldo    = prevEntradas - prevRec - prevPont | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 177 |   const realSaldo    = realEntradas - realRec - realPont | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 178 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 179 |   const mesStr       = `${ano}-${String(mes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 180 |   const totalCredito = window.finLancamentos | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 181 |     .filter(l =&gt; l.data.startsWith(mesStr) && l.forma_pagamento === 'credito') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 182 |     .reduce((s, l) =&gt; s + Number(l.valor), 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 183 |   const totalCreditoOrc = orc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 184 |     .filter(o =&gt; o.forma_pagamento === 'credito' && o.mes !== null) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 185 |     .reduce((s, o) =&gt; s + Number(o.valor_orcado), 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 186 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 187 |   const _pct = (real, prev) =&gt; prev &gt; 0 ? ((real / prev) * 100).toFixed(0) + '%' : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 188 |   const _cls = (real, prev, invert = false) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 189 |     if (prev === 0 && real === 0) return '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 190 |     return (invert ? real &lt; prev : real &gt; prev) ? 'fin-over' : 'fin-under' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 191 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 192 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 193 |   const summaryHtml = ` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 194 |     &lt;div class="fin-rec-summary"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 195 |       &lt;div class="fin-rec-month"&gt;${mesLabel}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 196 |       &lt;table class="fin-rec-sum-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 197 |         &lt;thead&gt;&lt;tr&gt;&lt;th&gt;&lt;/th&gt;&lt;th&gt;Previsto&lt;/th&gt;&lt;th&gt;Real&lt;/th&gt;&lt;th&gt;%&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 198 |         &lt;tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 199 |           &lt;tr class="fin-rec-sum-section"&gt;&lt;td colspan="4"&gt;Entradas&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 200 |           &lt;tr&gt;&lt;td&gt;SalÃ¡rio / Bonus&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |             &lt;td&gt;${_fmtBRL(prevEntradas)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |             &lt;td class="${_cls(realEntradas, prevEntradas, true)}"&gt;${_fmtBRL(realEntradas)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |             &lt;td&gt;${_pct(realEntradas, prevEntradas)}&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |           &lt;tr class="fin-rec-sum-section"&gt;&lt;td colspan="4"&gt;Gastos&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 205 |           &lt;tr&gt;&lt;td&gt;Recorrente&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 206 |             &lt;td&gt;${_fmtBRL(prevRec)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 207 |             &lt;td class="${_cls(realRec, prevRec)}"&gt;${_fmtBRL(realRec)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 208 |             &lt;td&gt;${_pct(realRec, prevRec)}&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 209 |           &lt;tr&gt;&lt;td&gt;Pontual&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |             &lt;td&gt;${prevPont &gt; 0 ? _fmtBRL(prevPont) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 211 |             &lt;td class="${_cls(realPont, prevPont)}"&gt;${realPont &gt; 0 ? _fmtBRL(realPont) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |             &lt;td&gt;${_pct(realPont, prevPont)}&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |           &lt;tr class="fin-rec-sum-saldo"&gt;&lt;td&gt;Saldo&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 214 |             &lt;td style="color:${prevSaldo &gt;= 0 ? 'var(--accent)' : 'var(--danger)'}"&gt;${_fmtBRL(prevSaldo)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |             &lt;td style="color:${realSaldo &gt;= 0 ? 'var(--accent)' : 'var(--danger)'}"&gt;${_fmtBRL(realSaldo)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |             &lt;td&gt;&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 |           &lt;tr class="fin-rec-sum-credito"&gt;&lt;td&gt;CartÃ£o crÃ©dito&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 218 |             &lt;td&gt;${totalCreditoOrc &gt; 0 ? _fmtBRL(totalCreditoOrc) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 219 |             &lt;td style="color:${totalCreditoOrc &gt; 0 && totalCredito &gt; totalCreditoOrc ? 'var(--danger)' : '#7c9eff'}"&gt;${_fmtBRL(totalCredito)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 |             &lt;td&gt;${totalCreditoOrc &gt; 0 ? ((totalCredito / totalCreditoOrc) * 100).toFixed(0) + '%' : ''}&lt;/td&gt;&lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |         &lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 222 |       &lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 224 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 225 |   // Colunas por tipo (filhos diretos de Recorrente=6): ObrigatÃ³ria, Luxo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 226 |   const typeOrder = ['ObrigatÃ³ria', 'Luxo'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 227 |   const typeNodes = window.finCodigos | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 228 |     .filter(c =&gt; c.cd_pai === 6) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 229 |     .sort((a, b) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 230 |       const ia = typeOrder.indexOf(a.nome), ib = typeOrder.indexOf(b.nome) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 231 |       if (ia !== -1 && ib !== -1) return ia - ib | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 232 |       if (ia !== -1) return -1; if (ib !== -1) return 1 | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 233 |       return a.nome.localeCompare(b.nome) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 234 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 235 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 236 |   const typeColsHtml = typeNodes.map(typeNode =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 237 |     const orcType = orc.filter(o =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 238 |       _getDescendantIds(typeNode.id).includes(o.cd_financa) && o.mes !== null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 239 |     ).sort((a, b) =&gt; _finNome(a.cd_financa).localeCompare(_finNome(b.cd_financa))) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 240 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 241 |     if (!orcType.length) return '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 242 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 243 |     const totalPrev = orcType.reduce((s, o) =&gt; s + Number(o.valor_orcado), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 244 |     const totalReal = orcType.reduce((s, o) =&gt; s + (realizadoMap[o.cd_financa] \|\| 0), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 245 |     const totalOver = totalReal &gt; totalPrev | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 246 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 247 |     const rows = orcType.map(o =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 248 |       const prev = Number(o.valor_orcado) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 249 |       const real = realizadoMap[o.cd_financa] \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 250 |       const over = real &gt; prev | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 251 |       const pct  = prev &gt; 0 ? ((real / prev) * 100).toFixed(0) : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 252 |       return `&lt;tr&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 253 |         &lt;td class="fin-rec-cat-name"&gt;${_finNome(o.cd_financa)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 |         &lt;td class="fin-rec-val"&gt;${_fmtBRL(prev)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 255 |         &lt;td class="fin-rec-val ${over ? 'fin-over' : (real &gt; 0 ? 'fin-under' : '')}"&gt;${_fmtBRL(real)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |         &lt;td class="fin-rec-pct ${over ? 'fin-over' : (real &gt; 0 ? 'fin-under' : '')}"&gt;${pct}%&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 257 |       &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |     }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 259 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 260 |     return `&lt;div class="fin-rec-dono-col"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 261 |       &lt;div class="fin-rec-dono-hd"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |         &lt;span class="fin-rec-dono-name"&gt;${typeNode.nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |         &lt;div class="fin-rec-dono-totals"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |           &lt;span&gt;${_fmtBRL(totalPrev)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |           &lt;span class="${totalOver ? 'fin-over' : 'fin-under'}"&gt;${_fmtBRL(totalReal)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |       &lt;div class="fin-rec-dono-bar-bg"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |         &lt;div class="fin-rec-dono-bar-fill ${totalOver ? 'fin-over-bg' : ''}" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |              style="width:${totalPrev &gt; 0 ? Math.min((totalReal/totalPrev)*100,100) : 0}%"&gt;&lt;/div&gt; | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 271 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |       &lt;table class="fin-rec-cat-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |         &lt;thead&gt;&lt;tr&gt;&lt;th&gt;Categoria&lt;/th&gt;&lt;th&gt;Prev.&lt;/th&gt;&lt;th&gt;Real&lt;/th&gt;&lt;th&gt;%&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |         &lt;tbody&gt;${rows}&lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |       &lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 279 |   container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |     &lt;div class="fin-rec-layout"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |       ${summaryHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 |       &lt;div class="fin-rec-donos"&gt;${typeColsHtml \|\| '&lt;p class="inline-empty-note-pad"&gt;Sem dados recorrentes para o perÃ­odo.&lt;/p&gt;'}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 283 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 285 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 286 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 287 | function _renderCreditoPanel(ano, mes, mesLabel) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 288 |   const container = document.getElementById('fin-credito-panel') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 289 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 290 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 291 |   const mesStr     = `${ano}-${String(mes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 292 |   const orcCredito = _effectiveOrcamento(ano, mes).filter(o =&gt; o.forma_pagamento === 'credito' && o.mes !== null) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 293 |   const lancCredito = window.finLancamentos.filter(l =&gt; l.data.startsWith(mesStr) && l.forma_pagamento === 'credito') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 294 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 295 |   const orcMap = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 296 |   orcCredito.forEach(o =&gt; { orcMap[o.cd_financa] = (orcMap[o.cd_financa] \|\| 0) + Number(o.valor_orcado) }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 297 |   const lancMap = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 298 |   lancCredito.forEach(l =&gt; { lancMap[l.cd_financa] = (lancMap[l.cd_financa] \|\| 0) + Number(l.valor) }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 299 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 300 |   const allIds = [...new Set([...Object.keys(orcMap).map(Number), ...Object.keys(lancMap).map(Number)])] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 301 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 302 |   if (!allIds.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 303 |     container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 304 |       &lt;div class="dash-card fin-block-mt16"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 305 |         &lt;div class="fin-row-between"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 306 |           &lt;div class="dash-card-title fin-title-credit"&gt;CartÃ£o de CrÃ©dito â€” ${mesLabel}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 307 |           &lt;button class="btn-add" onclick="openFinModal('orcamento')"&gt;+ OrÃ§amento&lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 308 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 309 |         &lt;p class="inline-empty-note"&gt;Nenhum lanÃ§amento de crÃ©dito no perÃ­odo.&lt;/p&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 310 |       &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 311 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 312 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 314 |   const totalOrc  = Object.values(orcMap).reduce((s, v) =&gt; s + v, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 315 |   const totalReal = Object.values(lancMap).reduce((s, v) =&gt; s + v, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 316 |   const barPct    = totalOrc &gt; 0 ? Math.min((totalReal / totalOrc) * 100, 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 317 |   const over      = totalOrc &gt; 0 && totalReal &gt; totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 318 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 319 |   const rows = allIds | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 320 |     .sort((a, b) =&gt; ((orcMap[b] \|\| 0) - (orcMap[a] \|\| 0)) \|\| ((lancMap[b] \|\| 0) - (lancMap[a] \|\| 0))) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 321 |     .map(id =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 322 |       const orc     = orcMap[id]  \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 323 |       const real    = lancMap[id] \|\| 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 324 |       const net     = real - orc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 325 |       const pctVal  = orc &gt; 0 ? ((real / orc) * 100).toFixed(0) + '%' : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 326 |       const netFmt  = orc &gt; 0 ? (net &gt;= 0 ? '+' : '') + _fmtBRL(net) : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 327 |       return `&lt;tr&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 328 |         &lt;td class="fin-rec-cat-name"&gt;${_finNome(id)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 329 |         &lt;td class="fin-rec-val"&gt;${orc &gt; 0 ? _fmtBRL(orc) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 330 |         &lt;td class="fin-rec-val"&gt;${_fmtBRL(real)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 331 |         &lt;td class="fin-rec-val"&gt;${netFmt}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 332 |         &lt;td class="fin-rec-pct"&gt;${pctVal}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 333 |       &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 334 |     }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 335 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 336 |   container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 337 |     &lt;div class="dash-card fin-block-mt16"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 338 |       &lt;div class="fin-row-between" style="margin-bottom:10px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 339 |         &lt;div class="dash-card-title fin-title-credit"&gt;CartÃ£o de CrÃ©dito â€” ${mesLabel}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 340 |         &lt;button class="btn-add" onclick="openFinModal('orcamento')"&gt;+ OrÃ§amento&lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 341 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 342 |       &lt;div class="fin-row-baseline-gap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 |         &lt;span class="fin-credit-total"&gt;${_fmtBRL(totalReal)}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 344 |         ${totalOrc &gt; 0 ? `&lt;span class="fin-credit-sub"&gt;de ${_fmtBRL(totalOrc)} orÃ§ado â€” ${((totalReal / totalOrc) * 100).toFixed(0)}%&lt;/span&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 345 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 346 |       ${totalOrc &gt; 0 ? `&lt;div class="fin-orc-bar-bg fin-credit-bar-gap"&gt;&lt;div class="fin-orc-bar-fill ${over ? 'over' : ''}" style="width:${barPct}%"&gt;&lt;/div&gt;&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 347 |       &lt;table class="fin-rec-cat-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 348 |         &lt;thead&gt;&lt;tr&gt;&lt;th&gt;Categoria&lt;/th&gt;&lt;th&gt;OrÃ§ado&lt;/th&gt;&lt;th&gt;Realizado&lt;/th&gt;&lt;th&gt;Î”&lt;/th&gt;&lt;th&gt;%&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 |         &lt;tbody&gt;${rows}&lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |       &lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 351 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 352 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
