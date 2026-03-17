# Linha a linha - FrontEnd/pages/finances/fin-overview.js

Arquivo fonte: FrontEnd/pages/finances/fin-overview.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | //                   validador orÃ§adoÃ—realizado e painel de crÃ©dito resumido | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 4 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 5 | function renderFinOverview() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 6 |   let ano, mes | Declara variavel mutavel no escopo de bloco. |
| 7 |   if (_finEvoSelectedMonth) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 8 |     ano = _finEvoSelectedMonth.ano | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 9 |     mes = _finEvoSelectedMonth.mes | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 10 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 |     const now = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 12 |     ano = now.getFullYear() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 13 |     mes = now.getMonth() + 1 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 14 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 |   _updateOverviewFilterBars(ano, mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 17 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 18 |   const mesKey  = `${ano}-${String(mes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 19 |   const lancMes = window.finLancamentos.filter(l =&gt; l.data.startsWith(mesKey)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 20 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 21 |   let receitas = 0, despesas = 0 | Declara variavel mutavel no escopo de bloco. |
| 22 |   const despGrupos = {}   // grupoNome â†’ { total, lancs[] } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 23 |   lancMes.forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |     const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 25 |     if (!cod) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 26 |     if (cod.tipo === 'receita') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 27 |       receitas += Number(l.valor) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 |     } else if (cod.tipo === 'despesa') { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |       despesas += Number(l.valor) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |       const grupo = _finGrupo(l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 31 |       if (!despGrupos[grupo]) despGrupos[grupo] = { total: 0, lancs: [] } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 32 |       despGrupos[grupo].total += Number(l.valor) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |       despGrupos[grupo].lancs.push(l) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 34 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 37 |   // Total no cartÃ£o de crÃ©dito no mÃªs | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 |   const totalCredito = lancMes | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 39 |     .filter(l =&gt; l.forma_pagamento === 'credito') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 |     .reduce((s, l) =&gt; s + Number(l.valor), 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 42 |   // Saldo total de investimentos (Ãºltimo snapshot por categoria, excluindo indicadores) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 43 |   const indicIds = new Set([78, ..._getDescendantIds(78)]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 44 |   const invPorCod = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 45 |   window.finInvestimentos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 46 |     .filter(s =&gt; !indicIds.has(s.cd_financa)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 |     .forEach(s =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |       if (!invPorCod[s.cd_financa] \|\| s.data &gt; invPorCod[s.cd_financa].data) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 49 |         invPorCod[s.cd_financa] = s | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 |   const totalInv = Object.values(invPorCod).reduce((s, snap) =&gt; s + Number(snap.saldo), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 52 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 53 |   // Saldo acumulado no ano (YTD) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |   let recYTD = 0, despYTD = 0 | Declara variavel mutavel no escopo de bloco. |
| 55 |   window.finLancamentos.forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 56 |     if (!l.data.startsWith(String(ano))) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 57 |     const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 58 |     if (cod?.tipo === 'receita') recYTD  += Number(l.valor) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 59 |     if (cod?.tipo === 'despesa') despYTD += Number(l.valor) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 60 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 61 |   const saldoAno = recYTD - despYTD | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 62 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 63 |   _updateKPIs(receitas, despesas, totalInv, totalCredito, saldoAno) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 64 |   _renderChartDespesas(despGrupos) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 65 |   _renderChartEvolucao() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 66 |   _renderDespDrill(despGrupos) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |   _renderValidador(ano, mes) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 68 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 69 |   const mesLabel = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 70 |   _renderCreditoPanel(ano, mes, mesLabel) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 73 | function _updateOverviewFilterBars(ano, mes) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 74 |   const filterBar = document.getElementById('fin-overview-month-bar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 75 |   const filterLbl = document.getElementById('fin-overview-month-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 76 |   if (filterBar) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 77 |     if (_finEvoSelectedMonth) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 78 |       const name = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 79 |       filterBar.style.display = 'flex' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |       if (filterLbl) filterLbl.textContent = name | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 81 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |       filterBar.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 86 |   const catBar = document.getElementById('fin-cat-filter-bar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 87 |   const catLbl = document.getElementById('fin-cat-filter-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 88 |   if (catBar) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 89 |     catBar.style.display = _finDespCatSelected ? 'flex' : 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |     if (catLbl && _finDespCatSelected) catLbl.textContent = _finDespCatSelected.nome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 91 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 92 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 94 | function _updateKPIs(receitas, despesas, totalInv, totalCredito, saldoAno) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 95 |   const saldo = receitas - despesas | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 96 |   const saldoEl = document.getElementById('fin-kpi-saldo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 97 |   if (saldoEl) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 98 |     saldoEl.textContent = _fmtBRL(saldo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |     saldoEl.style.color = saldo &gt;= 0 ? 'var(--accent)' : 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |   const invEl = document.getElementById('fin-kpi-investido') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 102 |   if (invEl) invEl.textContent = _fmtBRL(totalInv) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 103 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 104 |   const credEl = document.getElementById('fin-kpi-credito') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 105 |   if (credEl) credEl.textContent = _fmtBRL(totalCredito) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 106 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 107 |   const saldoAnoEl = document.getElementById('fin-kpi-saldo-ano') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 108 |   if (saldoAnoEl) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 109 |     saldoAnoEl.textContent = _fmtBRL(saldoAno) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 110 |     saldoAnoEl.style.color = saldoAno &gt;= 0 ? 'var(--accent)' : 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 111 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 112 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 114 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 115 | function _selectEvolucaoMonth(ano, mes) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 116 |   _finEvoSelectedMonth = { ano, mes } | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 117 |   renderFinOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 118 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 119 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 120 | function _clearEvoFilter() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 121 |   _finEvoSelectedMonth = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 122 |   renderFinOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 124 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 125 | function _selectDespCat(nome) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 126 |   _finDespCatSelected = { nome } | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 127 |   renderFinOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 129 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 130 | function _clearDespCatFilter() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 131 |   _finDespCatSelected = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 132 |   renderFinOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 133 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 134 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 135 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 136 | function _renderChartDespesas(despGrupos) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 137 |   const canvas = document.getElementById('fin-chart-despesas') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 138 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 139 |   _destroyChart('despesas') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 141 |   const labels = Object.keys(despGrupos) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 142 |   const data   = labels.map(k =&gt; despGrupos[k].total) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 143 |   if (!labels.length) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 144 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 145 |   const selNome  = _finDespCatSelected?.nome | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 146 |   const bgColors = labels.map((lbl, i) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 147 |     const hex = CHART_COLORS[i % CHART_COLORS.length] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 148 |     if (!selNome \|\| lbl === selNome) return hex | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 149 |     // esmaece os demais quando um grupo estÃ¡ selecionado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 150 |     const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 151 |     return `rgba(${r},${g},${b},0.2)` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 152 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 153 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 154 |   _finChartsInstances['despesas'] = new Chart(canvas, { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 155 |     type: 'doughnut', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 156 |     plugins: _finDL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 157 |     data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0 }] }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 158 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 159 |       cutout: '65%', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 160 |       onClick: (e, elements) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 161 |         if (!elements.length) { _clearDespCatFilter(); return } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 162 |         const nome = labels[elements[0].index] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 163 |         if (_finDespCatSelected?.nome === nome) _clearDespCatFilter() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 164 |         else _selectDespCat(nome) | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 165 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 166 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 |         legend: { position: 'right', labels: { color: '#a0a8a4', boxWidth: 12, padding: 12, font: { size: 11 } } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 168 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 169 |           color: '#fff', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 170 |           font: { size: 10, weight: '600', family: 'DM Mono' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 171 |           formatter: (v, ctx) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 172 |             const total = ctx.dataset.data.reduce((a, b) =&gt; a + b, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 173 |             const pct   = total &gt; 0 ? (v / total * 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 174 |             return pct &gt;= 4 ? pct.toFixed(0) + '%' : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 175 |           }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 176 |         }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 177 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 178 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 179 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 180 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 181 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 182 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 183 | function _renderChartEvolucao() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 184 |   const canvas = document.getElementById('fin-chart-evolucao') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 185 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 186 |   _destroyChart('evolucao') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 187 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 188 |   const nowKey = new Date().toISOString().slice(0, 7) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 189 |   const mesSet = new Set() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |   window.finLancamentos.forEach(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 191 |     const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 192 |     if ((cod?.tipo === 'receita' \|\| cod?.tipo === 'despesa') && l.data.slice(0, 7) &lt;= nowKey) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 193 |       mesSet.add(l.data.slice(0, 7)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 194 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 195 |   if (!mesSet.size) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 196 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 197 |   const meses = [...mesSet].sort().map(mk =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 198 |     const [y, m] = mk.split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 199 |     return { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 200 |       ano: Number(y), mes: Number(m), key: mk, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |       label: new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 205 |   const receitas = meses.map(m =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 206 |     window.finLancamentos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 207 |       .filter(l =&gt; window.finCodigos.find(c =&gt; c.id === l.cd_financa)?.tipo === 'receita' && l.data.startsWith(m.key)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 208 |       .reduce((s, l) =&gt; s + Number(l.valor), 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 209 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |   const despesas = meses.map(m =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 211 |     window.finLancamentos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |       .filter(l =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |         const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 214 |         if (!cod \|\| cod.tipo !== 'despesa' \|\| !l.data.startsWith(m.key)) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 215 |         if (_finDespCatSelected) return _finGrupo(l.cd_financa) === _finDespCatSelected.nome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 216 |         return true | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 217 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 218 |       .reduce((s, l) =&gt; s + Number(l.valor), 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 219 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 220 |   const nets  = meses.map((_, i) =&gt; receitas[i] - despesas[i]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 221 |   const selKey = _finEvoSelectedMonth | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 222 |     ? `${_finEvoSelectedMonth.ano}-${String(_finEvoSelectedMonth.mes).padStart(2, '0')}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 |     : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 224 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 225 |   const recBg  = meses.map(m =&gt; selKey ? (m.key === selKey ? 'rgba(78,204,163,0.9)' : 'rgba(78,204,163,0.12)') : 'rgba(78,204,163,0.55)') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 226 |   const despBg = meses.map(m =&gt; selKey ? (m.key === selKey ? 'rgba(224,92,92,0.9)'  : 'rgba(224,92,92,0.12)')  : 'rgba(224,92,92,0.55)') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 227 |   const netPt  = nets.map(n =&gt; n &gt;= 0 ? '#4ecca3' : '#e05c5c') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 228 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 229 |   const BAR_W  = 90 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 230 |   const totalW = Math.max(meses.length * BAR_W, 600) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 231 |   canvas.style.width  = totalW + 'px' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 232 |   canvas.style.height = '300px' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 233 |   canvas.width  = totalW | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 234 |   canvas.height = 300 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 235 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 236 |   _finChartsInstances['evolucao'] = new Chart(canvas, { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 237 |     type: 'bar', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 238 |     plugins: _finDL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 239 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 240 |       labels: meses.map(m =&gt; m.label), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 241 |       datasets: [ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 242 |         { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 243 |           label: 'Receitas', data: receitas, backgroundColor: recBg, borderRadius: 3, order: 2, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |           datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 245 |             anchor: 'end', align: 'top', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 246 |             color: 'rgba(78,204,163,0.9)', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 247 |             font: { size: 9, family: 'DM Mono', weight: '600' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 248 |             formatter: v =&gt; v &gt; 0 ? _fmtShort(v) : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |           }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 |         }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |         { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |           label: 'Despesas', data: despesas, backgroundColor: despBg, borderRadius: 3, order: 2, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 253 |           datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 |             anchor: 'end', align: 'top', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 255 |             color: 'rgba(224,92,92,0.9)', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |             font: { size: 9, family: 'DM Mono', weight: '600' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 257 |             formatter: v =&gt; v &gt; 0 ? _fmtShort(v) : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |           }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 259 |         }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 260 |         { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 261 |           label: 'Net (R-D)', data: nets, type: 'line', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |           borderColor: '#f5d742', backgroundColor: 'transparent', borderWidth: 2.5, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |           pointRadius: meses.map(m =&gt; selKey ? (m.key === selKey ? 8 : 3) : 4), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |           pointHoverRadius: 7, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |           pointBackgroundColor: netPt, pointBorderColor: netPt, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |           tension: 0.25, order: 1, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |           datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |             align: 'top', offset: 6, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |             color: ctx =&gt; nets[ctx.dataIndex] &gt;= 0 ? '#4ecca3' : '#e05c5c', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |             font: { size: 9, family: 'DM Mono', weight: '700' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |             backgroundColor: 'rgba(16,20,18,0.75)', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |             borderRadius: 3, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |             padding: { top: 2, bottom: 2, left: 4, right: 4 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |             formatter: v =&gt; _fmtShort(v), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |           }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |         }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |       ], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 279 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |       responsive: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |       maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 |       layout: { padding: { top: 28, right: 8, left: 8 } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 283 |       onClick: (evt, _elements, chart) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 |         const pts = chart.getElementsAtEventForMode(evt.native, 'index', { intersect: false }, true) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 285 |         if (!pts.length) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 286 |         const m = meses[pts[0].index] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 287 |         if (selKey === m.key) _clearEvoFilter() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 288 |         else _selectEvolucaoMonth(m.ano, m.mes) | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 289 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 290 |       onHover: (evt, elements) =&gt; { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 291 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 292 |         x: { ticks: { color: '#a0a8a4', font: { size: 11 } }, grid: { color: '#2a2f2c' } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 293 |         y: { ticks: { color: '#a0a8a4', font: { size: 11 }, callback: v =&gt; _fmtBRL(v) }, grid: { color: '#2a2f2c' } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 294 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 295 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 296 |         legend: { labels: { color: '#a0a8a4', font: { size: 11 }, boxWidth: 12 } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 297 |         datalabels: {}, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 298 |         tooltip: { callbacks: { label: ctx =&gt; ' ' + _fmtBRL(ctx.raw) } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 299 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 300 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 301 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 302 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 303 |   // Scroll automÃ¡tico para o mÃªs atual ou selecionado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 304 |   setTimeout(() =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 305 |     const wrap = document.querySelector('.fin-evo-scroll-wrap') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 306 |     if (!wrap) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 307 |     if (selKey) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 308 |       const idx = meses.findIndex(m =&gt; m.key === selKey) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 309 |       if (idx !== -1) wrap.scrollLeft = Math.max(0, idx * BAR_W - wrap.clientWidth / 2) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 310 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 311 |       wrap.scrollLeft = wrap.scrollWidth | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 312 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |   }, 60) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 314 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 315 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 316 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 317 | // Mostra os lanÃ§amentos detalhados do grupo de despesa selecionado no donut | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 | function _renderDespDrill(despGrupos) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 319 |   const container = document.getElementById('fin-desp-drill') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 320 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 321 |   if (!_finDespCatSelected) { container.style.display = 'none'; return } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 322 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 323 |   const grupo = despGrupos[_finDespCatSelected.nome] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 324 |   if (!grupo?.lancs.length) { container.style.display = 'none'; return } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 325 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 326 |   const lancs = grupo.lancs.slice().sort((a, b) =&gt; Number(b.valor) - Number(a.valor)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 327 |   const rows  = lancs.map(l =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 328 |     const catNome = l.categoria_nome \|\| _finNome(l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 329 |     const desc    = l.descricao ? ` Â· ${l.descricao}` : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 330 |     return `&lt;tr class="fin-val-tbl-child"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 331 |       &lt;td class="fin-val-tbl-name"&gt;${_fmtDate(l.data)} â€” ${catNome}${desc}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 332 |       &lt;td class="fin-val-tbl-num" style="color:var(--danger)"&gt;${_fmtBRL(l.valor)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 333 |     &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 334 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 335 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 336 |   container.style.display = 'block' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 337 |   container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 338 |     &lt;div class="fin-desp-drill-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 339 |       &lt;div class="fin-desp-drill-title"&gt;${_finDespCatSelected.nome} â€” ${_fmtBRL(grupo.total)}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 340 |       &lt;table class="fin-val-table"&gt;&lt;tbody&gt;${rows}&lt;/tbody&gt;&lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 341 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 342 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 344 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 345 | function _renderValidador(ano, mes) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 346 |   const container = document.getElementById('fin-validador') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 347 |   const label     = document.getElementById('fin-val-ano-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 348 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 349 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 350 |   const mesStr  = `${ano}-${String(mes).padStart(2, '0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 351 |   const mesNome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 352 |   if (label) label.textContent = mesNome | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 353 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 354 |   const lancMes = window.finLancamentos.filter(l =&gt; l.data.startsWith(mesStr)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 355 |   const orcMes  = _effectiveOrcamento(ano, mes).filter(o =&gt; o.mes !== null) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 356 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 357 |   const isTypeRoot = id =&gt; window.finCodigos.find(c =&gt; c.id === id)?.cd_pai == null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 358 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 359 |   // ConstrÃ³i Ã¡rvore hierÃ¡rquica para um tipo (receita \| despesa) usando apenas os nÃ³s ativos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 360 |   const buildTree = (tipo) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 361 |     const orcTipo  = orcMes.filter(o =&gt; window.finCodigos.find(c =&gt; c.id === o.cd_financa)?.tipo === tipo) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 362 |     const activeIds = new Set([ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 363 |       ...orcTipo.map(o =&gt; o.cd_financa), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |       ...lancMes.filter(l =&gt; window.finCodigos.find(c =&gt; c.id === l.cd_financa)?.tipo === tipo).map(l =&gt; l.cd_financa) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |     ]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 366 |     if (!activeIds.size) return { roots: [], totalOrc: 0, totalReal: 0 } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 367 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 368 |     const orcById  = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 369 |     orcTipo.forEach(o =&gt; { orcById[o.cd_financa] = Number(o.valor_orcado) }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 370 |     const realById = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 371 |     lancMes.filter(l =&gt; window.finCodigos.find(c =&gt; c.id === l.cd_financa)?.tipo === tipo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 372 |            .forEach(l =&gt; { realById[l.cd_financa] = (realById[l.cd_financa] \|\| 0) + Number(l.valor) }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 373 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 374 |     const nodes = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 375 |     const getNode = id =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 376 |       if (!nodes[id]) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 377 |         const cod = window.finCodigos.find(c =&gt; c.id === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 378 |         nodes[id] = { id, nome: cod?.nome \|\| String(id), cd_pai: cod?.cd_pai, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 379 |                       dirOrc: 0, dirReal: 0, totalOrc: 0, totalReal: 0, children: {} } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 380 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 381 |       return nodes[id] | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 382 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 383 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 384 |     activeIds.forEach(id =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 385 |       getNode(id).dirOrc  = orcById[id]  \|\| 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 386 |       getNode(id).dirReal = realById[id] \|\| 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 387 |       let cur = id | Declara variavel mutavel no escopo de bloco. |
| 388 |       while (true) { | Loop: repete bloco enquanto a condicao permanecer verdadeira. |
| 389 |         const cod = window.finCodigos.find(c =&gt; c.id === cur) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 390 |         if (!cod \|\| cod.cd_pai == null \|\| isTypeRoot(cod.cd_pai)) break | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 391 |         getNode(cod.cd_pai) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 392 |         cur = cod.cd_pai | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 393 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 394 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 395 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 396 |     // Liga pai â†’ filhos (ignora nÃ³ raiz de tipo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 397 |     Object.values(nodes).forEach(n =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 398 |       if (n.cd_pai != null && !isTypeRoot(n.cd_pai) && nodes[n.cd_pai]) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 399 |         nodes[n.cd_pai].children[n.id] = n | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 400 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 401 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 402 |     // Agrega totais bottom-up | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 403 |     const computeTotals = n =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 404 |       n.totalOrc  = n.dirOrc | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 405 |       n.totalReal = n.dirReal | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 406 |       Object.values(n.children).forEach(c =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |         computeTotals(c) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 408 |         n.totalOrc  += c.totalOrc | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 409 |         n.totalReal += c.totalReal | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 410 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 411 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 412 |     const roots = Object.values(nodes).filter(n =&gt; n.cd_pai != null && isTypeRoot(n.cd_pai)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 413 |     roots.forEach(computeTotals) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 414 |     roots.sort((a, b) =&gt; b.totalOrc - a.totalOrc) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 415 |     return { roots, totalOrc: roots.reduce((s, n) =&gt; s + n.totalOrc, 0), totalReal: roots.reduce((s, n) =&gt; s + n.totalReal, 0) } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 416 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 418 |   // Renderer recursivo de nÃ³s da Ã¡rvore | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |   const renderTree = (nodes, netGoodPos, depth, pfx) =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 420 |     nodes.map(node =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |       const uid   = `${pfx}-${node.id}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 422 |       const net   = node.totalReal - node.totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 423 |       const kids  = Object.values(node.children).sort((a, b) =&gt; b.totalOrc - a.totalOrc) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 424 |       const pad   = `${(depth + 1) * 14}px` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 425 |       const netClr = net === 0 ? 'var(--text-muted)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 426 |                    : (net &gt; 0) === netGoodPos ? 'var(--accent)' : 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |       const orcTd  = `&lt;td class="fin-val-tbl-num"&gt;${node.totalOrc &gt; 0 ? _fmtBRL(node.totalOrc) : 'â€”'}&lt;/td&gt;` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 428 |       const realTd = `&lt;td class="fin-val-tbl-num"&gt;${_fmtBRL(node.totalReal)}&lt;/td&gt;` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 429 |       const netTd  = `&lt;td class="fin-val-tbl-num" style="color:${netClr}"&gt;${net !== 0 ? _fmtBRL(net) : 'â€”'}&lt;/td&gt;` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 430 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 431 |       if (!kids.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 432 |         return `&lt;tr class="fin-val-tbl-child"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 433 |           &lt;td class="fin-val-tbl-name" style="padding-left:${pad}"&gt;${node.nome}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 434 |           ${orcTd}${realTd}${netTd} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 435 |         &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 436 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 437 |       const childHtml  = renderTree(kids, netGoodPos, depth + 1, pfx) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 438 |       const innerCols  = `&lt;colgroup&gt;&lt;col style="width:100%"&gt;&lt;col style="width:110px"&gt;&lt;col style="width:110px"&gt;&lt;col style="width:110px"&gt;&lt;/colgroup&gt;` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 439 |       return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 440 |         &lt;tr class="fin-val-tbl-hd" onclick="toggleFinValAcc('${uid}')"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 441 |           &lt;td class="fin-val-tbl-label-cell" style="padding-left:${pad}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 442 |             &lt;span class="fin-val-acc-arrow" id="fin-val-acc-arrow-${uid}"&gt;â–¶&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 443 |             &lt;span style="margin-left:6px"&gt;${node.nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 444 |           &lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 445 |           ${orcTd}${realTd}${netTd} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 446 |         &lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 447 |         &lt;tr id="fin-val-acc-${uid}" style="display:none"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 448 |           &lt;td colspan="4" class="fin-val-tbl-children-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 449 |             &lt;table class="fin-val-tbl-children"&gt;${innerCols}&lt;tbody&gt;${childHtml}&lt;/tbody&gt;&lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 450 |           &lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 451 |         &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 452 |     }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 453 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 454 |   const rec       = buildTree('receita') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 455 |   const desp      = buildTree('despesa') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 456 |   const saldoOrc  = rec.totalOrc   - desp.totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 457 |   const saldoReal = rec.totalReal  - desp.totalReal | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 458 |   const saldoNet  = saldoReal      - saldoOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 459 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 460 |   // Investimentos do mÃªs â€” usa lanÃ§amentos do mÃªs (nÃ£o o snapshot acumulado) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 461 |   const indicIds   = new Set([78, ..._getDescendantIds(78)]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 462 |   const orcInv     = orcMes.filter(o =&gt; window.finCodigos.find(c =&gt; c.id === o.cd_financa)?.tipo === 'investimento') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 463 |   const invLancs   = lancMes.filter(l =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 464 |     const cod = window.finCodigos.find(c =&gt; c.id === l.cd_financa) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 465 |     return cod?.tipo === 'investimento' && !indicIds.has(l.cd_financa) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 466 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 467 |   const invIds     = new Set([...orcInv.map(o =&gt; o.cd_financa), ...invLancs.map(l =&gt; l.cd_financa)]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 468 |   const invRows    = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 469 |   invIds.forEach(id =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 470 |     const orc  = orcInv.find(o =&gt; o.cd_financa === id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 471 |     const real = invLancs.filter(l =&gt; l.cd_financa === id).reduce((s, l) =&gt; s + Number(l.valor), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 472 |     invRows.push({ nome: _finNome(id), orc: orc ? Number(orc.valor_orcado) : null, real: real \|\| null }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 473 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 474 |   invRows.sort((a, b) =&gt; ((b.orc \|\| 0) - (a.orc \|\| 0)) \|\| ((b.real \|\| 0) - (a.real \|\| 0))) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 475 |   const totalInvOrc  = orcInv.reduce((s, o) =&gt; s + Number(o.valor_orcado), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 476 |   const totalInvReal = invRows.reduce((s, r) =&gt; s + (r.real \|\| 0), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 477 |   const invChildHtml = invRows.length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 478 |     ? invRows.map(r =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 479 |         const net = (r.real \|\| 0) - (r.orc \|\| 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 480 |         const nc  = net === 0 ? 'var(--text-muted)' : net &gt; 0 ? 'var(--accent)' : 'var(--danger)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 481 |         return `&lt;tr class="fin-val-tbl-child"&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 482 |           &lt;td class="fin-val-tbl-name"&gt;${r.nome}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 483 |           &lt;td class="fin-val-tbl-num"&gt;${r.orc != null ? _fmtBRL(r.orc) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 484 |           &lt;td class="fin-val-tbl-num"&gt;${r.real != null ? _fmtBRL(r.real) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 485 |           &lt;td class="fin-val-tbl-num" style="color:${nc}"&gt;${net !== 0 ? _fmtBRL(net) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 486 |         &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 487 |       }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 488 |     : `&lt;tr class="fin-val-tbl-child"&gt;&lt;td colspan="4" style="color:var(--text-muted)"&gt;Nenhum lanÃ§amento de investimento no perÃ­odo.&lt;/td&gt;&lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 489 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 490 |   // Linha de accordion de nÃ­vel 1 (Entradas / SaÃ­das / Investimentos) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 491 |   const topRow = (id, lbl, cls, totalOrc, totalReal, childHtml, netGoodPos) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 492 |     const net    = totalReal - totalOrc | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 493 |     const netClr = net === 0 ? 'var(--text-muted)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 494 |                  : (net &gt; 0) === netGoodPos ? 'var(--accent)' : 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 495 |     return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 496 |       &lt;tr class="fin-val-tbl-hd" onclick="toggleFinValAcc('${id}')"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 497 |         &lt;td class="fin-val-tbl-label-cell"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 498 |           &lt;span class="fin-val-acc-arrow" id="fin-val-acc-arrow-${id}"&gt;â–¶&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 499 |           &lt;span class="${cls}" style="margin-left:6px"&gt;${lbl}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 500 |         &lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 501 |         &lt;td class="fin-val-tbl-num"&gt;${totalOrc &gt; 0 ? _fmtBRL(totalOrc) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 502 |         &lt;td class="fin-val-tbl-num"&gt;${_fmtBRL(totalReal)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 503 |         &lt;td class="fin-val-tbl-num" style="color:${netClr}"&gt;${net !== 0 ? _fmtBRL(net) : 'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 504 |       &lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 505 |       &lt;tr id="fin-val-acc-${id}" style="display:none"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 506 |         &lt;td colspan="4" class="fin-val-tbl-children-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 507 |           &lt;table class="fin-val-tbl-children"&gt;&lt;colgroup&gt;&lt;col style="width:100%"&gt;&lt;col style="width:110px"&gt;&lt;col style="width:110px"&gt;&lt;col style="width:110px"&gt;&lt;/colgroup&gt;&lt;tbody&gt;${childHtml}&lt;/tbody&gt;&lt;/table&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 508 |         &lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 509 |       &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 510 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 511 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 512 |   container.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 513 |     &lt;table class="fin-val-table"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 514 |       &lt;colgroup&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 515 |         &lt;col style="width:100%"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 516 |         &lt;col style="width:110px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 517 |         &lt;col style="width:110px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 518 |         &lt;col style="width:110px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 519 |       &lt;/colgroup&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 520 |       &lt;thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 521 |         &lt;tr class="fin-val-tbl-head"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 522 |           &lt;th&gt;&lt;/th&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 523 |           &lt;th class="fin-val-tbl-num"&gt;OrÃ§ado&lt;/th&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 524 |           &lt;th class="fin-val-tbl-num"&gt;Realizado&lt;/th&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 525 |           &lt;th class="fin-val-tbl-num"&gt;Net&lt;/th&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 526 |         &lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 527 |       &lt;/thead&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 528 |       &lt;tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 529 |         ${topRow('rec',  'Entradas',      'fin-receita', rec.totalOrc,  rec.totalReal,  renderTree(rec.roots,  true,  0, 'r'), true)} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 530 |         ${topRow('desp', 'SaÃ­das',        'fin-despesa', desp.totalOrc, desp.totalReal, renderTree(desp.roots, false, 0, 'd'), false)} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 531 |         ${topRow('inv',  'Investimentos', '',            totalInvOrc,   totalInvReal,   invChildHtml,                         true)} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 532 |         &lt;tr class="fin-val-tbl-saldo"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 533 |           &lt;td&gt;Saldo&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 534 |           &lt;td class="fin-val-tbl-num"&gt;${_fmtBRL(saldoOrc)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 535 |           &lt;td class="fin-val-tbl-num"&gt;${_fmtBRL(saldoReal)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 536 |           &lt;td class="fin-val-tbl-num" style="color:${saldoNet &gt;= 0 ? 'var(--accent)' : 'var(--danger)'}"&gt;${_fmtBRL(saldoNet)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 537 |         &lt;/tr&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 538 |       &lt;/tbody&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 539 |     &lt;/table&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 540 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 541 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 542 | function toggleFinValAcc(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 543 |   const body  = document.getElementById('fin-val-acc-' + id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 544 |   const arrow = document.getElementById('fin-val-acc-arrow-' + id) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 545 |   if (!body) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 546 |   const open = body.style.display !== 'none' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 547 |   body.style.display = open ? 'none' : (body.tagName === 'TR' ? 'table-row' : 'block') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 548 |   if (arrow) arrow.textContent = open ? 'â–¶' : 'â–¼' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 549 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
