# Linha a linha - FrontEnd/pages/exercises/exercises.js

Arquivo fonte: FrontEnd/pages/exercises/exercises.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | window.exercicios = [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 4 | window.codigosEx  = [] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 5 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 6 | // SeguranÃ§a: ChartDataLabels passado por instÃ¢ncia | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 | const _DL = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 8 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 9 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 10 | const exFiltros = { de: null, ate: null, mes: null, grupoNome: null, exNome: null } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 11 | const exCross   = { mes: null, grupo: null } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 12 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 13 | // Estado de drill-down | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 | const exDrill = { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 15 |   barMode:   'mes',    // 'mes' \| 'dia' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 16 |   barMes:    null,     // "YYYY-MM" â€” mÃªs aberto no drill | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 17 |   roscaMode: 'grupo',  // 'grupo' \| 'exercicio' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 18 |   roscaGrupo: null,    // nome do grupo aberto no drill | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 19 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 20 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 21 | let _exRenderRAF = null | Declara variavel mutavel no escopo de bloco. |
| 22 | let _exBarScrollTimer = null | Declara variavel mutavel no escopo de bloco. |
| 23 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 24 | function _setHidden(el, hidden) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 25 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 26 |   el.classList.toggle('is-hidden', !!hidden) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 29 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 30 | function applyExFilters() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 31 |   const de  = document.getElementById('ex-filter-de')?.value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 32 |   const ate = document.getElementById('ex-filter-ate')?.value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 33 |   const mes = document.getElementById('ex-filter-mes')?.value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 34 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 35 |   exFiltros.de        = de  ? new Date(de  + 'T00:00:00') : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |   exFiltros.ate       = ate ? new Date(ate + 'T23:59:59') : null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 37 |   exFiltros.mes       = mes \|\| null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 |   exFiltros.grupoNome = document.getElementById('ex-filter-grupo')?.value    \|\| null | Interage com DOM para ler ou atualizar elementos da interface. |
| 39 |   exFiltros.exNome    = document.getElementById('ex-filter-exercicio')?.value \|\| null | Interage com DOM para ler ou atualizar elementos da interface. |
| 40 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 41 |   if (exFiltros.mes) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 42 |     const [y, m] = exFiltros.mes.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 43 |     exFiltros.de  = new Date(y, m - 1, 1) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 44 |     exFiltros.ate = new Date(y, m, 0, 23, 59, 59) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 45 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 46 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 49 | function clearExFilters() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 50 |   document.getElementById('ex-filter-de').value        = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 51 |   document.getElementById('ex-filter-ate').value       = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 52 |   document.getElementById('ex-filter-mes').value       = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 53 |   document.getElementById('ex-filter-grupo').value     = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 54 |   document.getElementById('ex-filter-exercicio').value = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 55 |   exFiltros.de = exFiltros.ate = exFiltros.mes = exFiltros.grupoNome = exFiltros.exNome = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 56 |   exCross.mes = exCross.grupo = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |   exDrill.barMode = 'mes'; exDrill.barMes = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 58 |   exDrill.roscaMode = 'grupo'; exDrill.roscaGrupo = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 60 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 61 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 62 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 63 | function setCrossMes(mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 64 |   exCross.mes = exCross.mes === mesKey ? null : mesKey | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 65 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 66 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 68 | function setCrossGrupo(grupoNome) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 69 |   exCross.grupo = exCross.grupo === grupoNome ? null : grupoNome | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 73 | function clearCross(tipo) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 74 |   exCross[tipo] = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 75 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 78 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 79 | function exDrillIntoMes(mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 80 |   exDrill.barMode = 'dia' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |   exDrill.barMes  = mesKey | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |   exCross.mes     = null   // limpa cross-filter de mÃªs ao entrar no drill | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 86 | function exDrillBack() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 87 |   exDrill.barMode = 'mes' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |   exDrill.barMes  = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 89 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 91 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 92 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 93 | function exRoscaDrillInto(grupoNome) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 94 |   exDrill.roscaMode  = 'exercicio' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |   exDrill.roscaGrupo = grupoNome | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |   exCross.grupo      = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 100 | function exRoscaDrillBack() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 101 |   exDrill.roscaMode  = 'grupo' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |   exDrill.roscaGrupo = null | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 103 |   renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 104 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 106 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 107 | function _baseFilter(e) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 108 |   const d = new Date(e.data.split('T')[0] + 'T00:00:00') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 109 |   if (exFiltros.de  && d &lt; exFiltros.de)  return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 110 |   if (exFiltros.ate && d &gt; exFiltros.ate) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 111 |   if (exFiltros.grupoNome && e.grupo_nome     !== exFiltros.grupoNome) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 112 |   if (exFiltros.exNome    && e.exercicio_nome !== exFiltros.exNome)    return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 113 |   return true | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 114 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 115 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 116 | function getExFiltrados() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 117 |   return exercicios.filter(e =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 118 |     if (!_baseFilter(e)) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 119 |     const d   = new Date(e.data.split('T')[0] + 'T00:00:00') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 120 |     const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 121 |     if (exCross.mes   && key !== exCross.mes)        return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 122 |     if (exCross.grupo && e.grupo_nome !== exCross.grupo) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 123 |     // drill de mÃªs filtra tambÃ©m | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 124 |     if (exDrill.barMode === 'dia' && exDrill.barMes && key !== exDrill.barMes) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 125 |     return true | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 126 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 127 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 128 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 129 | // Para o grÃ¡fico de barras: sem cross de mÃªs (para nÃ£o colapsar) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 | function _barBase() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 131 |   return exercicios.filter(e =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 132 |     if (!_baseFilter(e)) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 133 |     if (exCross.grupo && e.grupo_nome !== exCross.grupo) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 134 |     return true | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 135 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 137 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 138 | // Para a rosca: sem cross de grupo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 | function _roscaBase() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 140 |   return exercicios.filter(e =&gt; { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 141 |     if (!_baseFilter(e)) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 142 |     const d   = new Date(e.data.split('T')[0] + 'T00:00:00') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 143 |     const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 144 |     if (exCross.mes && key !== exCross.mes) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 145 |     if (exDrill.barMode === 'dia' && exDrill.barMes && key !== exDrill.barMes) return false | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 146 |     return true | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 147 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 148 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 150 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 151 | function renderExChips() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 152 |   const container = document.getElementById('ex-active-chips') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 153 |   if (!container) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 154 |   const chips = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 155 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 156 |   if (exCross.mes && exDrill.barMode === 'mes') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 157 |     const [y, m] = exCross.mes.split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 158 |     const label  = new Date(parseInt(y), parseInt(m)-1, 1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 159 |       .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 160 |     chips.push(`&lt;span class="ex-chip" onclick="clearCross('mes')"&gt;ðŸ“… ${label} &lt;span class="ex-chip-x"&gt;âœ•&lt;/span&gt;&lt;/span&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 161 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 162 |   if (exCross.grupo && exDrill.roscaMode === 'grupo') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 163 |     chips.push(`&lt;span class="ex-chip" onclick="clearCross('grupo')"&gt;ðŸ’ª ${exCross.grupo} &lt;span class="ex-chip-x"&gt;âœ•&lt;/span&gt;&lt;/span&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 164 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 165 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 166 |   container.innerHTML = chips.join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 |   _setHidden(container, chips.length === 0) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 168 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 169 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 170 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 171 | function populateExFilterSelects() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 172 |   const grupos = [...new Set(exercicios.map(e =&gt; e.grupo_nome).filter(Boolean))].sort() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 173 |   const exs    = [...new Set(exercicios.map(e =&gt; e.exercicio_nome).filter(Boolean))].sort() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 174 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 175 |   const selG = document.getElementById('ex-filter-grupo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 176 |   const selE = document.getElementById('ex-filter-exercicio') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 177 |   if (!selG \|\| !selE) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 178 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 179 |   const prevG = selG.value, prevE = selE.value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 180 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 181 |   selG.innerHTML = '&lt;option value=""&gt;Todos&lt;/option&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 182 |   grupos.forEach(g =&gt; selG.innerHTML += `&lt;option value="${g}"${g===prevG?' selected':''}&gt;${g}&lt;/option&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 183 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 184 |   selE.innerHTML = '&lt;option value=""&gt;Todos&lt;/option&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 185 |   exs.forEach(x =&gt; selE.innerHTML += `&lt;option value="${x}"${x===prevE?' selected':''}&gt;${x}&lt;/option&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 186 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 187 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 188 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 189 | function openExModal() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 190 |   document.getElementById('ex-modal-overlay').classList.add('open') | Interage com DOM para ler ou atualizar elementos da interface. |
| 191 |   document.body.style.overflow = 'hidden' | Interage com DOM para ler ou atualizar elementos da interface. |
| 192 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 193 | function closeExModal() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 194 |   document.getElementById('ex-modal-overlay').classList.remove('open') | Interage com DOM para ler ou atualizar elementos da interface. |
| 195 |   document.body.style.overflow = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 196 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 197 | function closeExModalOutside(e) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 198 |   if (e.target === document.getElementById('ex-modal-overlay')) closeExModal() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 199 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 200 | function clearExForm() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 201 |   document.getElementById('ex-grupo').value        = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 202 |   document.getElementById('ex-exercicio').value    = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 203 |   document.getElementById('ex-exercicio').disabled = true | Interage com DOM para ler ou atualizar elementos da interface. |
| 204 |   document.getElementById('ex-duracao').value      = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 205 |   document.getElementById('ex-esforco').value      = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 206 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 207 | function onGrupoChange() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 208 |   const grupoId = parseInt(document.getElementById('ex-grupo').value) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 209 |   const selEx   = document.getElementById('ex-exercicio') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 210 |   const grupo   = codigosEx.find(g =&gt; g.id === grupoId) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 211 |   selEx.innerHTML = '&lt;option value=""&gt;Selecione...&lt;/option&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |   if (grupo?.filhos?.length) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 213 |     grupo.filhos.forEach(f =&gt; selEx.innerHTML += `&lt;option value="${f.id}"&gt;${f.descricao}&lt;/option&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 214 |     selEx.disabled = false | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |   } else { selEx.disabled = true } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 | function populateGrupos() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 218 |   const sel = document.querySelector('#ex-grupo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 219 |   if (!sel) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 220 |   sel.innerHTML = '&lt;option value=""&gt;Selecione um grupo...&lt;/option&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 221 |   codigosEx.forEach(g =&gt; sel.innerHTML += `&lt;option value="${g.id}"&gt;${g.descricao}&lt;/option&gt;`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 222 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 223 | async function saveExercise() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 224 |   const cdExercicio = parseInt(document.getElementById('ex-exercicio').value) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 225 |   const hora        = document.getElementById('ex-hora').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 226 |   const duracao     = document.getElementById('ex-duracao').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 227 |   const esforco     = document.getElementById('ex-esforco').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 228 |   const data        = document.getElementById('ex-data').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 229 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 230 |   if (!cdExercicio) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 231 |     if (typeof showAppToast === 'function') showAppToast('Selecione um exercÃ­cio.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 232 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 233 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 234 |   if (!hora) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 235 |     if (typeof showAppToast === 'function') showAppToast('Informe a hora.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 236 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 237 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 238 |   if (!data) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 239 |     if (typeof showAppToast === 'function') showAppToast('Informe a data.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 240 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 241 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 242 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 243 |   const btn = document.getElementById('ex-btn-salvar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 244 |   btn.disabled = true | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 245 |   btn.innerHTML = '&lt;span&gt;â³&lt;/span&gt; Salvando...' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 246 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 247 |     const result = await postExercise({ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 248 |       date: data, hora: hora+':00', cd_exercicio: cdExercicio, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |       duracao: duracao ? parseInt(duracao) : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 250 |       esforco: esforco ? parseInt(esforco) : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 251 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 252 |     if (result.ok) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 253 |       clearExForm(); closeExModal(); showToast('toast') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 254 |       window.exercicios = await fetchExercicios() | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 255 |       populateExFilterSelects(); renderExDash() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |     } else { showToast('toast-erro') } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 257 |   } catch (err) { console.error(err); showToast('toast-erro') } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 258 |   finally { btn.disabled = false; btn.innerHTML = '&lt;span&gt;ðŸ’¾&lt;/span&gt; Salvar treino' } | Bloco sempre executado, com erro ou sem erro. |
| 259 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 260 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 261 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 262 | function renderExDash() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 263 |   if (_exRenderRAF != null) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 264 |   _exRenderRAF = requestAnimationFrame(() =&gt; { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 265 |     _exRenderRAF = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 266 |     _renderExDashNow() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 270 | function _renderExDashNow() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 271 |   const empty   = document.getElementById('ex-empty') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 272 |   const content = document.getElementById('ex-content') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 273 |   const lastLbl = document.getElementById('ex-last-update-label') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 274 |   if (!empty \|\| !content) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 275 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 276 |   populateExFilterSelects() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |   renderExChips() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 279 |   if (exercicios.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 280 |     _setHidden(empty, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |     _setHidden(content, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 |     destroyExerciseCharts() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 283 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 284 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 285 |   _setHidden(empty, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 286 |   _setHidden(content, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 287 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 288 |   const ultimo = exercicios[exercicios.length - 1] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 289 |   if (ultimo && lastLbl) lastLbl.textContent = 'Ãšltimo: ' + formatExDate(ultimo.data) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 290 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 291 |   const filtrados = getExFiltrados() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 292 |   renderExKPIs(filtrados) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 293 |   renderExChartBar(_barBase()) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 294 |   renderExChartRosca(_roscaBase()) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 295 |   renderExChartPeriodo(filtrados) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 296 |   renderExHistory(filtrados) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 297 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 298 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 299 | function formatExDate(iso) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 300 |   const [y, m, d] = iso.split('T')[0].split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 301 |   return new Date(y, m-1, d).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' }) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 302 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 303 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 304 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 305 | function renderExKPIs(filtrados) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 306 |   document.getElementById('ex-kpi-total').textContent     = filtrados.length \|\| '0' | Interage com DOM para ler ou atualizar elementos da interface. |
| 307 |   document.getElementById('ex-kpi-total-delta').innerHTML = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 308 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 309 |   const comDur = filtrados.filter(e =&gt; e.duracao) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 310 |   const media  = comDur.length ? Math.round(comDur.reduce((s,e) =&gt; s+e.duracao, 0) / comDur.length) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 311 |   document.getElementById('ex-kpi-media').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 312 |     media != null ? `${media}&lt;span class="kpi-unit"&gt;min&lt;/span&gt;` : 'â€”' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |   document.getElementById('ex-kpi-media-delta').innerHTML = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 314 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 315 |   const total = filtrados.reduce((s,e) =&gt; s+(e.duracao\|\|0), 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 316 |   document.getElementById('ex-kpi-tempo').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 317 |     total &gt; 0 ? `${total}&lt;span class="kpi-unit"&gt;min&lt;/span&gt;` : 'â€”' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 319 |   const comEsf = filtrados.filter(e =&gt; e.esforco) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 320 |   const esf    = comEsf.length ? (comEsf.reduce((s,e) =&gt; s+e.esforco,0)/comEsf.length).toFixed(1) : null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 321 |   document.getElementById('ex-kpi-esforco').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 322 |     esf != null ? `${esf}&lt;span class="kpi-unit"&gt;/10&lt;/span&gt;` : 'â€”' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 323 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 325 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 326 | let exChartBar = null | Declara variavel mutavel no escopo de bloco. |
| 327 | const BAR_W    = 56 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 328 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 329 | function renderExChartBar(base) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 330 |   const canvas    = document.getElementById('ex-chart-freq') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 331 |   const container = canvas?.parentElement | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 332 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 333 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 334 |   const titleEl     = document.getElementById('ex-bar-title') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 335 |   const hintEl      = document.getElementById('ex-bar-hint') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 336 |   const breadcrumb  = document.getElementById('ex-bar-breadcrumb') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 337 |   const isDrill     = exDrill.barMode === 'dia' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 338 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 339 |   let keys, labels, data, accentKey | Declara variavel mutavel no escopo de bloco. |
| 340 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 341 |   if (!isDrill) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 342 |     // NÃ­vel mÃªs | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 |     const meses = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 344 |     base.forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 345 |       const [y,m,day] = e.data.split('T')[0].split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 346 |       const d = new Date(y, m-1, day) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 347 |       const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 348 |       meses[key] = (meses[key]\|\|0) + 1 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |     keys   = Object.keys(meses).sort() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 351 |     labels = keys.map(k =&gt; { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 352 |       const [y,m] = k.split('-') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 353 |       return new Date(parseInt(y), parseInt(m)-1, 1) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 354 |         .toLocaleDateString('pt-BR', { month:'short', year:'2-digit' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 355 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 356 |     data      = keys.map(k =&gt; meses[k]) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 357 |     accentKey = exCross.mes | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 358 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 359 |     if (titleEl) titleEl.textContent = 'Treinos por mÃªs' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 360 |     if (hintEl)  hintEl.textContent  = 'clique numa barra para ver os dias' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 361 |     _setHidden(breadcrumb, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 362 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 363 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |     // NÃ­vel dia (drill-down do mÃªs selecionado) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |     const [dy, dm] = exDrill.barMes.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 366 |     const diasNoMes = new Date(dy, dm, 0).getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 367 |     const diasMap   = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 368 |     for (let i = 1; i &lt;= diasNoMes; i++) diasMap[String(i).padStart(2,'0')] = 0 | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 369 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 370 |     base.filter(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 371 |       const [y,m,day] = e.data.split('T')[0].split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 372 |       const d = new Date(y, m-1, day) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 373 |       const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 374 |       return key === exDrill.barMes | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 375 |     }).forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 376 |       const dia = e.data.split('T')[0].split('-')[2] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 377 |       diasMap[dia] = (diasMap[dia]\|\|0) + 1 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 378 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 379 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 380 |     keys   = Object.keys(diasMap).sort() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 381 |     labels = keys.map(k =&gt; { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 382 |       const mesNome = new Date(dy, dm-1, 1).toLocaleDateString('pt-BR', { month:'short' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 383 |       return `${parseInt(k)} ${mesNome}` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 384 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 385 |     data      = keys.map(k =&gt; diasMap[k]) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 386 |     accentKey = null  // sem cross-filter no nÃ­vel dia | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 387 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 388 |     const mesLabel = new Date(dy, dm-1, 1).toLocaleDateString('pt-BR', { month:'long', year:'numeric' }) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 389 |     if (titleEl) titleEl.textContent = `Treinos em ${mesLabel}` | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 390 |     if (hintEl)  hintEl.textContent  = '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 391 |     _setHidden(breadcrumb, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 392 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 393 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 394 |   const bgColors     = keys.map(k =&gt; k === accentKey ? '#b5f542'   : '#b5f54222') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 395 |   const borderColors = keys.map(k =&gt; k === accentKey ? '#b5f542'   : '#b5f54270') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 396 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 397 |   const totalWidth = Math.max(keys.length * BAR_W, container.clientWidth \|\| 600) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 398 |   canvas.style.width  = totalWidth + 'px' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 399 |   canvas.style.height = '180px' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 400 |   canvas.width  = totalWidth | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 401 |   canvas.height = 180 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 402 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 403 |   if (exChartBar) exChartBar.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 404 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 405 |   exChartBar = new Chart(canvas.getContext('2d'), { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 406 |     type: 'bar', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |     plugins: _DL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 408 |     data: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 409 |       labels, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 410 |       datasets: [{ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 411 |         data, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 412 |         backgroundColor: bgColors, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 413 |         borderColor:     borderColors, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 414 |         borderWidth: 2, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 415 |         borderRadius: 6, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 416 |       }] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |     }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 418 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |       responsive: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 420 |       maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |       layout: { padding: { top: 22 } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 422 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 423 |         legend: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 424 |         tooltip: { callbacks: { label: ctx =&gt; `${ctx.parsed.y} treino${ctx.parsed.y!==1?'s':''}` } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 425 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 426 |           anchor: 'end', align: 'top', offset: 0, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |           color: ctx =&gt; keys[ctx.dataIndex] === accentKey ? '#b5f542' : '#555f59', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 428 |           font: { size: 10, family: 'DM Mono', weight: '700' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 429 |           formatter: v =&gt; v &gt; 0 ? v : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 430 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 431 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 |       onClick: (evt, elements) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 433 |         if (!elements.length) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 434 |         const idx = elements[0].index | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 435 |         if (!isDrill) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 436 |           // primeiro clique: cross-filter; segundo clique no mesmo: drill | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 437 |           if (exCross.mes === keys[idx]) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 438 |             exDrillIntoMes(keys[idx]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 439 |           } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 440 |             setCrossMes(keys[idx]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 441 |           } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 442 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 443 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 444 |       onHover: (evt, elements) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 445 |         canvas.style.cursor = (!isDrill && elements.length) ? 'pointer' : 'default' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 446 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 447 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 448 |         x: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 } } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 449 |         y: { grid: { color: '#2a2e2c' }, ticks: { color: '#6b7570', font: { size: 11 }, stepSize: 1 }, beginAtZero: true } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 450 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 451 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 452 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 453 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 454 |   if (_exBarScrollTimer) clearTimeout(_exBarScrollTimer) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 455 |   _exBarScrollTimer = setTimeout(() =&gt; { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 456 |     if (!isDrill) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 457 |       if (exCross.mes) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 458 |         const idx = keys.indexOf(exCross.mes) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 459 |         if (idx !== -1) container.scrollLeft = Math.max(0, idx*BAR_W - container.clientWidth/2) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 460 |       } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 461 |         container.scrollLeft = container.scrollWidth | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 462 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 463 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 464 |       container.scrollLeft = 0 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 465 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 466 |     _exBarScrollTimer = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 467 |   }, 60) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 468 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 469 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 470 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 471 | let exChartRosca = null | Declara variavel mutavel no escopo de bloco. |
| 472 | const CORES = ['#b5f542','#42f5b5','#f5a742','#f55a42','#a742f5','#42a7f5','#f542a7','#f5f542'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 473 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 474 | function renderExChartRosca(base) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 475 |   const canvas = document.getElementById('ex-chart-tipo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 476 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 477 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 478 |   const titleEl    = document.getElementById('ex-rosca-title') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 479 |   const hintEl     = document.getElementById('ex-rosca-hint') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 480 |   const breadcrumb = document.getElementById('ex-rosca-breadcrumb') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 481 |   const isDrill    = exDrill.roscaMode === 'exercicio' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 482 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 483 |   let porChave = {} | Declara variavel mutavel no escopo de bloco. |
| 484 |   let accentKey = null | Declara variavel mutavel no escopo de bloco. |
| 485 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 486 |   if (!isDrill) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 487 |     // NÃ­vel: grupo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 488 |     base.forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 489 |       const nome = e.grupo_nome \|\| 'Sem grupo' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 490 |       porChave[nome] = (porChave[nome]\|\|0) + 1 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 491 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 492 |     accentKey = exCross.grupo | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 493 |     if (titleEl) titleEl.textContent = 'Por grupo muscular' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 494 |     if (hintEl)  hintEl.textContent  = 'clique para ver exercÃ­cios' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 495 |     _setHidden(breadcrumb, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 496 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 497 |     // NÃ­vel: exercÃ­cio dentro do grupo selecionado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 498 |     base.filter(e =&gt; e.grupo_nome === exDrill.roscaGrupo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 499 |         .forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 500 |           const nome = e.exercicio_nome \|\| 'Sem nome' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 501 |           porChave[nome] = (porChave[nome]\|\|0) + 1 | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 502 |         }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 503 |     if (titleEl) titleEl.textContent = exDrill.roscaGrupo | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 504 |     if (hintEl)  hintEl.textContent  = '' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 505 |     _setHidden(breadcrumb, false) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 506 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 507 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 508 |   const sorted = Object.entries(porChave).sort((a,b) =&gt; b[1]-a[1]).slice(0,8) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 509 |   const labels = sorted.map(([k]) =&gt; k) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 510 |   const data   = sorted.map(([,v]) =&gt; v) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 511 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 512 |   const bgColors     = labels.map((l,i) =&gt; l===accentKey ? CORES[i%CORES.length]+'60' : CORES[i%CORES.length]+'25') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 513 |   const borderColors = labels.map((l,i) =&gt; l===accentKey ? CORES[i%CORES.length]      : CORES[i%CORES.length]+'80') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 514 |   const borderWidths = labels.map(l =&gt; l===accentKey ? 3 : 1.5) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 515 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 516 |   if (exChartRosca) exChartRosca.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 517 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 518 |   exChartRosca = new Chart(canvas.getContext('2d'), { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 519 |     type: 'doughnut', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 520 |     plugins: _DL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 521 |     data: { labels, datasets: [{ data, backgroundColor: bgColors, borderColor: borderColors, borderWidth: borderWidths, hoverOffset: 6 }] }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 522 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 523 |       responsive: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 524 |       maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 525 |       cutout: '55%', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 526 |       layout: { padding: 16 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 527 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 528 |         legend: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 529 |         tooltip: { callbacks: { label: item =&gt; `${item.label}: ${item.parsed} treino${item.parsed!==1?'s':''}` } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 530 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 531 |           color: '#e8ede9', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 532 |           font: { size: 10, family: 'DM Mono', weight: '700' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 533 |           textAlign: 'center', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 534 |           formatter: (v, ctx) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 535 |             const total = ctx.dataset.data.reduce((a,b)=&gt;a+b, 0) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 536 |             const pct   = Math.round((v/total)*100) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 537 |             if (pct &lt; 6) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 538 |             const name  = labels[ctx.dataIndex] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 539 |             return `${name.length&gt;10?name.slice(0,9)+'â€¦':name}\n${pct}%` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 540 |           }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 541 |           anchor: 'center', align: 'center', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 542 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 543 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 544 |       onClick: (evt, elements) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 545 |         if (!elements.length) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 546 |         const nome = labels[elements[0].index] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 547 |         if (!isDrill) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 548 |           // primeiro clique: cross; segundo clique no mesmo: drill | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 549 |           if (exCross.grupo === nome) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 550 |             exRoscaDrillInto(nome) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 551 |           } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 552 |             setCrossGrupo(nome) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 553 |           } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 554 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 555 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 556 |       onHover: (evt, elements) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 557 |         canvas.style.cursor = (!isDrill && elements.length) ? 'pointer' : 'default' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 558 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 559 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 560 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 561 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 562 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 563 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 564 | let exChartPeriodo = null | Declara variavel mutavel no escopo de bloco. |
| 565 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 566 | function destroyExerciseCharts() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 567 |   if (_exRenderRAF != null) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 568 |     cancelAnimationFrame(_exRenderRAF) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 569 |     _exRenderRAF = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 570 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 571 |   if (_exBarScrollTimer) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 572 |     clearTimeout(_exBarScrollTimer) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 573 |     _exBarScrollTimer = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 574 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 575 |   if (exChartBar) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 576 |     exChartBar.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 577 |     exChartBar = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 578 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 579 |   if (exChartRosca) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 580 |     exChartRosca.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 581 |     exChartRosca = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 582 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 583 |   if (exChartPeriodo) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 584 |     exChartPeriodo.destroy() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 585 |     exChartPeriodo = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 586 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 587 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 588 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 589 | window.destroyExerciseCharts = destroyExerciseCharts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 590 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 591 | function getHoraPeriodo(h) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 592 |   if (!h) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 593 |   const hr = parseInt(h.split(':')[0]) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 594 |   if (hr &gt;= 5  && hr &lt; 12) return 'manha' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 595 |   if (hr &gt;= 12 && hr &lt; 18) return 'tarde' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 596 |   if (hr &gt;= 18 && hr &lt; 23) return 'noite' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 597 |   return 'madrugada' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 598 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 599 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 600 | function renderExChartPeriodo(filtrados) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 601 |   const canvas = document.getElementById('ex-chart-periodo') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 602 |   if (!canvas) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 603 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 604 |   const periodos = { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 605 |     manha:     { label:'ManhÃ£',     emoji:'ðŸŒ…', range:'05â€“12h', cor:'#f5d742', count:0 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 606 |     tarde:     { label:'Tarde',     emoji:'â˜€ï¸',  range:'12â€“18h', cor:'#f5a742', count:0 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 607 |     noite:     { label:'Noite',     emoji:'ðŸŒ™', range:'18â€“23h', cor:'#42a7f5', count:0 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 608 |     madrugada: { label:'Madrugada', emoji:'ðŸŒ‘', range:'00â€“05h', cor:'#a742f5', count:0 }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 609 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 610 |   filtrados.forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 611 |     const p = getHoraPeriodo(e.hora) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 612 |     if (p && periodos[p]) periodos[p].count++ | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 613 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 614 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 615 |   const ordem  = ['manha','tarde','noite','madrugada'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 616 |   const labels = ordem.map(k =&gt; `${periodos[k].emoji} ${periodos[k].label}`) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 617 |   const data   = ordem.map(k =&gt; periodos[k].count) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 618 |   const cores  = ordem.map(k =&gt; periodos[k].cor) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 619 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 620 |   if (exChartPeriodo) exChartPeriodo.destroy() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 621 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 622 |   exChartPeriodo = new Chart(canvas.getContext('2d'), { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 623 |     type: 'bar', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 624 |     plugins: _DL, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 625 |     data: { labels, datasets: [{ data, backgroundColor: cores.map(c=&gt;c+'22'), borderColor: cores, borderWidth:2, borderRadius:6, borderSkipped:false }] }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 626 |     options: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 627 |       indexAxis: 'y', | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 628 |       responsive: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 629 |       maintainAspectRatio: false, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 630 |       layout: { padding: { right: 40 } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 631 |       plugins: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 632 |         legend: { display: false }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 633 |         tooltip: { callbacks: { label: ctx =&gt; ` ${ctx.parsed.x} treino${ctx.parsed.x!==1?'s':''} Â· ${periodos[ordem[ctx.dataIndex]].range}` } }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 634 |         datalabels: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 635 |           anchor: 'end', align: 'right', offset: 6, clamp: true, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 636 |           color: ctx =&gt; cores[ctx.dataIndex], | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 637 |           font: { size: 12, family:'DM Mono', weight:'700' }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 638 |           formatter: v =&gt; v &gt; 0 ? v : null, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 639 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 640 |       }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 641 |       scales: { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 642 |         x: { grid: { color:'#2a2e2c' }, ticks: { color:'#6b7570', font:{ size:10 }, stepSize:1 }, beginAtZero:true }, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 643 |         y: { grid: { display:false }, ticks: { color:'#9aa39d', font:{ size:13 } } } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 644 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 645 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 646 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 647 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 648 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 649 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 650 | function renderExHistory(filtrados) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 651 |   const tbody = document.getElementById('ex-history-body') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 652 |   const count = document.getElementById('ex-history-count') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 653 |   if (!tbody) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 654 |   if (count) count.textContent = `${filtrados.length} registro${filtrados.length!==1?'s':''}` | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 655 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 656 |   tbody.innerHTML = [...filtrados].reverse().map(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 657 |     const hora      = e.hora ? e.hora.substring(0,5) : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 658 |     const dur       = e.duracao != null ? `${e.duracao}min` : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 659 |     const esf       = e.esforco != null ? `${e.esforco}/10` : 'â€”' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 660 |     const esf_class = e.esforco &gt;= 8 ? 'delta-neg' : e.esforco &gt;= 5 ? 'delta-neu' : 'delta-pos' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 661 |     return `&lt;tr&gt; | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 662 |       &lt;td&gt;${formatExDate(e.data)}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 663 |       &lt;td&gt;${hora}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 664 |       &lt;td&gt;${e.exercicio_nome\|\|'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 665 |       &lt;td class="ex-history-muted"&gt;${e.grupo_nome\|\|'â€”'}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 666 |       &lt;td&gt;${dur}&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 667 |       &lt;td&gt;&lt;span class="${esf_class}"&gt;${esf}&lt;/span&gt;&lt;/td&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 668 |     &lt;/tr&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 669 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 670 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
