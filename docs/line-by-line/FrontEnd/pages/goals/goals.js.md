# Linha a linha - FrontEnd/pages/goals/goals.js

Arquivo fonte: FrontEnd/pages/goals/goals.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | // | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 3 | // Tabelas consumidas (via API): | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 4 | //   codigo_goals  â†’ cadastro de metas (Ã¡rvore: grupos + metas folha) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 5 | //   pontuacao_goalâ†’ regras de pontuaÃ§Ã£o: | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 6 | //                     tp_metrica  = 'diario' \| 'semanal' \| 'mensal' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 | //                     valor       = frequÃªncia alvo (diario=1, semanal=Nxsemana, mensal=1) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 8 | //                     pts         = pontos que vale se cumprir | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 9 | //                     data        = NULL para sempre \| 'YYYY-MM-01' para meta mensal de peso | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 10 | //                     cd_medida   = FK para codigo_medida (mediÃ§Ã£o automÃ¡tica, ex: peso) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 | //   entrada_goals â†’ check diÃ¡rio: data, cd_goal, realizado_no_dia (Boolean) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 | // | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 | // Algoritmo de score mensal: | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 | //   diario  â†’ (dias com realizado_no_dia no mÃªs) / lastDay  Ã— pts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 | //   semanal â†’ feitos / (lastDay Ã— valor_alvo/7)  Ã— pts   [crÃ©dito parcial] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 16 | //   mensal  â†’ pts inteiros se hÃ¡ mediÃ§Ã£o &lt;= valor_alvo (ou entrada manual) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 17 | // | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 18 | // CalendÃ¡rio: usa TODAS as metas (diario + semanal), colore por % de goals feitos no dia | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 19 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 20 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 21 | window.goalsCodigos  = []   // Ã¡rvore [{id, nome, filhos:[...]}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 | window.goalsMetas    = []   // [{id, data, tp_metrica, cd_goal, goal_nome, valor_alvo, pts}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 23 | window.goalsEntradas = []   // [{id, data, cd_goal, progresso}] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 25 | let _goalsMesDetalhe  = null   // 'YYYY-MM' â€” mÃªs aberto no detalhe | Declara variavel mutavel no escopo de bloco. |
| 26 | let _goalsCalFilter   = null   // null = todos \| cd_goal = filtrado por 1 goal | Declara variavel mutavel no escopo de bloco. |
| 27 | let _goalsDataLoadedAt = 0 | Declara variavel mutavel no escopo de bloco. |
| 28 | const _GOALS_CACHE_TTL_MS = 45000 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 29 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 30 | function _goalsHasFreshCache() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 31 |   return _goalsDataLoadedAt &gt; 0 | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 32 |     && (Date.now() - _goalsDataLoadedAt) &lt; _GOALS_CACHE_TTL_MS | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |     && Array.isArray(window.goalsMetas) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 34 |     && Array.isArray(window.goalsEntradas) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 37 | // Retorna a data da segunda-feira da semana que contÃ©m dateStr | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 | function _gWeekKey(dateStr) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 39 |   const d   = new Date(dateStr + 'T00:00:00') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 40 |   const dow = d.getDay() \|\| 7       // Dom=0 â†’ 7 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 41 |   d.setDate(d.getDate() - (dow - 1)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 42 |   return d.toISOString().slice(0, 10) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 43 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 44 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 45 | function _gFmtMes(mk, long = true) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 46 |   const [y, m] = mk.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 47 |   const d = new Date(y, m - 1, 1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 48 |   return long | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 49 |     ? d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |     : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 52 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 53 | function _gGrade(pct) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 54 |   if (pct &gt;= 80) return { label: 'A', color: 'var(--accent)',  fg: '#0d0f0e' } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 55 |   if (pct &gt;= 65) return { label: 'B', color: 'var(--accent2)', fg: '#0d0f0e' } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 56 |   if (pct &gt;= 50) return { label: 'C', color: '#f5d742',        fg: '#0d0f0e' } | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 57 |   return           { label: 'D', color: 'var(--danger)',    fg: '#fff'     } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 58 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 59 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 60 | function _gMonthScore(mesKey) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 61 |   const [y, m]      = mesKey.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 62 |   const daysInMonth = new Date(y, m, 0).getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 63 |   const today       = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 64 |   const isCurrent   = y === today.getFullYear() && m === today.getMonth() + 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 65 |   const lastDay     = isCurrent ? today.getDate() : daysInMonth | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 66 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 67 |   // Entradas deste mÃªs, indexadas por cd_goal | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 68 |   const entradasMes = window.goalsEntradas.filter(e =&gt; e.data.startsWith(mesKey)) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 69 |   const entrByGoal  = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 70 |   entradasMes.forEach(e =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 |     ;(entrByGoal[e.cd_goal] = entrByGoal[e.cd_goal] \|\| []).push(e) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 74 |   // Metas aplicÃ¡veis ao mÃªs: | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 75 |   //   data=null  â†’ sempre vÃ¡lida | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |   //   data set   â†’ sÃ³ vale se data.startsWith(mesKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |   const metas = window.goalsMetas.filter(mm =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 78 |     mm.data === null \|\| mm.data === undefined \|\| mm.data.startsWith(mesKey) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 81 |   if (metas.length === 0 && entradasMes.length === 0) return null | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 82 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 83 |   let totalPossivel = 0 | Declara variavel mutavel no escopo de bloco. |
| 84 |   let totalGanho    = 0 | Declara variavel mutavel no escopo de bloco. |
| 85 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 86 |   // PontuaÃ§Ã£o por meta e por perÃ­odo para o breakdown | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 |   const metaScores = [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 88 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 89 |   for (const meta of metas) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 90 |     const entradas = entrByGoal[meta.cd_goal] \|\| [] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 91 |     const pts      = meta.pts ?? 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 92 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 93 |     if (meta.tp_metrica === 'diario') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 94 |       // Cada dia do mÃªs conta como 1 oportunidade | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |       const feitos   = entradas.filter(e =&gt; e.progresso &gt;= 1).length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 96 |       const possivel = lastDay * pts | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 97 |       const ganho    = feitos * pts | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 98 |       totalPossivel += possivel | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 99 |       totalGanho    += ganho | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 100 |       metaScores.push({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |         meta, feitos, total: lastDay, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 102 |         ganho, possivel, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 103 |         pct: lastDay &gt; 0 ? Math.round((feitos / lastDay) * 100) : 0, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 104 |         label: `${feitos}/${lastDay} dias`, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 106 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 107 |     } else if (meta.tp_metrica === 'semanal') { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 108 |       // Esperado no mÃªs = lastDay Ã— (valor_alvo / 7) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 109 |       // Exemplo: valor_alvo=5, 28 dias â†’ esperado = 20 dias (71,4%/dia) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 110 |       // Score = min(feitos / esperado, 1) â†’ pontos = score Ã— pts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 111 |       const esperado = lastDay * (meta.valor_alvo / 7) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 112 |       const feitos   = entradas.filter(e =&gt; e.progresso &gt;= 1).length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 113 |       const rate     = esperado &gt; 0 ? Math.min(feitos / esperado, 1) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 114 |       const ganho    = rate * pts | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 115 |       totalPossivel += pts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 116 |       totalGanho    += ganho | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |       metaScores.push({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 118 |         meta, feitos, total: Math.round(esperado), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 119 |         ganho, possivel: pts, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 120 |         pct: Math.round(rate * 100), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 121 |         label: `${feitos}/${Math.round(esperado)} dias esperados (${meta.valor_alvo}Ã—/sem)`, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 122 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 123 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 124 |     } else if (meta.tp_metrica === 'mensal') { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 125 |       // Se tem mediÃ§Ã£o real (via cd_medida), usa ela; senÃ£o cai no check manual de entrada | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 126 |       let feito = 0 | Declara variavel mutavel no escopo de bloco. |
| 127 |       let label = 'NÃ£o atingida ainda' | Declara variavel mutavel no escopo de bloco. |
| 128 |       if (meta.valor_medido !== null && meta.valor_medido !== undefined) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 129 |         // Meta de reduÃ§Ã£o: valor medido &lt;= valor_alvo | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 130 |         feito = meta.valor_medido &lt;= meta.valor_alvo ? 1 : 0 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 131 |         const diff = (meta.valor_medido - meta.valor_alvo).toFixed(1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 132 |         label = feito | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 133 |           ? `âœ“ ${meta.valor_medido} (meta: ${meta.valor_alvo})` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 134 |           : `${meta.valor_medido} â†’ faltam ${diff &gt; 0 ? '+' : ''}${diff} para ${meta.valor_alvo}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 |       } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |         feito = entradas.some(e =&gt; e.progresso &gt;= 1) ? 1 : 0 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 137 |         label = feito ? 'Meta atingida' : 'NÃ£o atingida ainda' | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 138 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 |       totalPossivel += pts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 140 |       totalGanho    += feito * pts | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 141 |       metaScores.push({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 142 |         meta, feitos: feito, total: 1, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 143 |         ganho: feito * pts, possivel: pts, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 144 |         pct: feito * 100, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 145 |         label, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 147 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 148 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 149 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 150 |   const pct = totalPossivel &gt; 0 ? Math.round((totalGanho / totalPossivel) * 100) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 151 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 152 |   // Score diÃ¡rio (para o calendÃ¡rio) â€” considera TODAS as metas com entrada no dia | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 153 |   const dailyScores = {} | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 154 |   for (let d = 1; d &lt;= lastDay; d++) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 155 |     const ds = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 156 |     let done = 0 | Declara variavel mutavel no escopo de bloco. |
| 157 |     for (const md of metas) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 158 |       const e = (entrByGoal[md.cd_goal] \|\| []).find(x =&gt; x.data === ds) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 159 |       if (e && e.progresso &gt;= 1) done++ | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 160 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 161 |     if (done &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 162 |       dailyScores[d] = { score: done / metas.length, done, total: metas.length } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 163 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 164 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 165 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 166 |   const daysWithData = Object.keys(dailyScores).length | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 167 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 168 |   return { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 169 |     mesKey, pct, grade: _gGrade(pct), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 170 |     totalGanho, totalPossivel, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 171 |     metaScores, dailyScores, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 172 |     daysWithData, lastDay, isCurrent, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 173 |     hasMetas: metas.length &gt; 0, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 174 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 175 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 176 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 177 | function _gGetMeses() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 178 |   const s = new Set() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 179 |   // SÃ³ meses que tÃªm entradas reais registradas | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 180 |   window.goalsEntradas.forEach(e =&gt; e.data && s.add(e.data.slice(0, 7))) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 181 |   // + mÃªs atual sempre aparece | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 182 |   const now = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 183 |   s.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 184 |   return [...s].sort().reverse() | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 185 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 186 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 187 | function goalsRenderOverview() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 188 |   const meses  = _gGetMeses() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 189 |   const scores = meses.map(mk =&gt; ({ mk, data: _gMonthScore(mk) })).filter(x =&gt; x.data) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 190 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 191 |   if (window.goalsMetas.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 192 |     _gSetOverviewFeedback('â—Ž', 'Nenhuma meta configurada', 'Cadastre metas em codigo_goal e meta no banco para comeÃ§ar.') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 193 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 194 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 195 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 196 |   if (scores.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 197 |     _gSetOverviewFeedback('â—‡', 'Nenhum registro ainda', 'Registre entradas de goals para ver seu score.') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 198 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 199 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 200 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 201 |   const all = scores.map(x =&gt; x.data.pct) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 202 |   const avg  = Math.round(all.reduce((s, v) =&gt; s + v, 0) / all.length) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 203 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 204 |   document.getElementById('goals-kpi-avg').innerHTML       = `${avg}&lt;span class="kpi-unit"&gt;%&lt;/span&gt;` | Interage com DOM para ler ou atualizar elementos da interface. |
| 205 |   document.getElementById('goals-kpi-avg-sub').textContent = `${scores.length} meses` | Interage com DOM para ler ou atualizar elementos da interface. |
| 206 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 207 |   const semanais = window.goalsMetas.filter(m =&gt; m.tp_metrica === 'semanal') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 208 |   const indMedia = semanais.map(meta =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 209 |     const pcts = scores.map(({ data }) =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 210 |       const ms = data.metaScores.find(x =&gt; x.meta.cd_goal === meta.cd_goal) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 211 |       return ms ? ms.pct : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 212 |     }).filter(v =&gt; v !== null) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |     const med = pcts.length ? Math.round(pcts.reduce((a, b) =&gt; a + b, 0) / pcts.length) : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 214 |     return { nome: meta.goal_nome, med } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 215 |   }).sort((a, b) =&gt; b.med - a.med) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 217 |   if (indMedia.length &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 218 |     const best = indMedia[0] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 219 |     const worst = indMedia[indMedia.length - 1] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 220 |     document.getElementById('goals-kpi-best-ind').innerHTML      = `${best.med}&lt;span class="kpi-unit"&gt;%&lt;/span&gt;` | Interage com DOM para ler ou atualizar elementos da interface. |
| 221 |     document.getElementById('goals-kpi-best-ind-sub').textContent = best.nome | Interage com DOM para ler ou atualizar elementos da interface. |
| 222 |     document.getElementById('goals-kpi-worst-ind').innerHTML      = `${worst.med}&lt;span class="kpi-unit"&gt;%&lt;/span&gt;` | Interage com DOM para ler ou atualizar elementos da interface. |
| 223 |     document.getElementById('goals-kpi-worst-ind-sub').textContent = worst.nome | Interage com DOM para ler ou atualizar elementos da interface. |
| 224 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 225 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 226 |   const mensaisNaoAtingidas = window.goalsMetas | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 227 |     .filter(m =&gt; m.tp_metrica === 'mensal' && m.cd_medida) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 228 |     .filter(m =&gt; m.valor_medido === null \|\| m.valor_medido === undefined \|\| m.valor_medido &gt; m.valor_alvo) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 229 |     .sort((a, b) =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 230 |       if (!a.data && !b.data) return 0 | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 231 |       if (!a.data) return 1 | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 232 |       if (!b.data) return -1 | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 233 |       return a.data.localeCompare(b.data) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 234 |     }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 235 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 236 |   const proxPeso = mensaisNaoAtingidas[0] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 237 |   if (proxPeso) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 238 |     const diff = proxPeso.valor_medido != null | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 239 |       ? ` (faltam ${(proxPeso.valor_medido - proxPeso.valor_alvo).toFixed(1)})` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 240 |       : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 241 |     document.getElementById('goals-kpi-next-weight').innerHTML      = `${proxPeso.valor_alvo}&lt;span class="kpi-unit"&gt;kg&lt;/span&gt;` | Interage com DOM para ler ou atualizar elementos da interface. |
| 242 |     document.getElementById('goals-kpi-next-weight-sub').textContent = | Interage com DOM para ler ou atualizar elementos da interface. |
| 243 |       (proxPeso.data ? proxPeso.data.slice(0, 7) : '') + diff | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 245 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 246 |   document.getElementById('goals-months-grid').innerHTML = | Interage com DOM para ler ou atualizar elementos da interface. |
| 247 |     scores.map(({ mk, data }) =&gt; _gMonthCard(mk, data)).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 248 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 249 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 250 | function _gMonthCard(mk, data) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 251 |   const g     = data.grade | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 252 |   const label = _gFmtMes(mk) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 253 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 254 |   const dots = data.metaScores.map(ms =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 255 |     const p   = ms.possivel &gt; 0 ? ms.ganho / ms.possivel : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 256 |     const cls = p &gt;= 0.8 ? 'g-dot-ok' : p &gt;= 0.5 ? 'g-dot-warn' : 'g-dot-miss' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 257 |     return `&lt;span class="g-dot ${cls}" title="${ms.meta.goal_nome}: ${Math.round(p * 100)}%"&gt;&lt;/span&gt;` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 258 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 259 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 260 |   return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 261 |     &lt;div class="g-month-card${data.isCurrent ? ' g-month-current' : ''}" onclick="goalsShowDetail('${mk}')"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 262 |       &lt;div class="g-month-top"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 263 |         &lt;span class="g-month-name"&gt;${label}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 264 |         ${data.isCurrent ? '&lt;span class="g-badge-cur"&gt;atual&lt;/span&gt;' : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 265 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 266 |       &lt;div class="g-month-body"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 267 |         &lt;div class="g-ring-sm" style="--sp:${data.pct};--sc:${g.color}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 268 |           &lt;div class="g-ring-sm-inner"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 269 |             &lt;span class="g-ring-sm-num"&gt;${data.pct}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 270 |             &lt;span class="g-ring-sm-unit"&gt;%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 271 |           &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |         &lt;div class="g-month-info"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |           &lt;div class="g-grade-big" style="color:${g.color}"&gt;${g.label}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |           &lt;div class="g-days-info"&gt;${Math.round(data.totalGanho)}/${Math.round(data.totalPossivel)} pts&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 276 |           &lt;div class="g-dots-row"&gt;${dots}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 277 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 278 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 279 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 282 | function goalsShowDetail(mk) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 283 |   _goalsMesDetalhe = mk | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 284 |   _goalsCalFilter   = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 285 |   document.getElementById('goals-overview').style.display = 'none' | Interage com DOM para ler ou atualizar elementos da interface. |
| 286 |   const detail = document.getElementById('goals-detail') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 287 |   if (detail) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 288 |     detail.classList.remove('fin-hidden') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 289 |     detail.style.display = '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 290 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 291 |   _gRenderDetail(mk) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 292 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 293 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 294 | function goalsShowOverview() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 295 |   _goalsMesDetalhe = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 296 |   document.getElementById('goals-overview').style.display = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 297 |   const detail = document.getElementById('goals-detail') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 298 |   if (detail) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 299 |     detail.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 300 |     detail.classList.add('fin-hidden') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 301 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 302 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 303 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 304 | function _gRenderDetail(mk) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 305 |   const data = _gMonthScore(mk) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 306 |   if (!data) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 307 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 308 |   const g = data.grade | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 309 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 310 |   document.getElementById('goals-det-title').textContent = _gFmtMes(mk) | Interage com DOM para ler ou atualizar elementos da interface. |
| 311 |   const badge = document.getElementById('goals-det-grade') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 312 |   Object.assign(badge.style, { background: g.color, color: g.fg }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 313 |   badge.textContent = `Nota ${g.label}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 314 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 315 |   const ring = document.getElementById('goals-det-ring') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 316 |   ring.style.setProperty('--sp', data.pct) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 317 |   ring.style.setProperty('--sc', g.color) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 |   document.getElementById('goals-det-pct').textContent = data.pct + '%' | Interage com DOM para ler ou atualizar elementos da interface. |
| 319 |   document.getElementById('goals-det-days').textContent = | Interage com DOM para ler ou atualizar elementos da interface. |
| 320 |     `${Math.round(data.totalGanho)} de ${Math.round(data.totalPossivel)} pts possÃ­veis` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 321 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 322 |   _gRenderWeightCard(mk, data) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 323 |   _gRenderBreakdown(data) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |   _gRenderCalendar(mk, data) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 325 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 326 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 327 | function _gRenderWeightCard(mk, data) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 328 |   const el      = document.getElementById('goals-weight-card') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 329 |   const mensais = data.metaScores.filter(ms =&gt; ms.meta.tp_metrica === 'mensal') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 330 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 331 |   if (mensais.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 332 |     el.style.display = 'none' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 333 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 334 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 335 |   el.style.display = '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 336 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 337 |   const rows = mensais.map(ms =&gt; { | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 338 |     const m   = ms.meta | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 339 |     const col = ms.pct &gt;= 100 ? 'var(--accent)' : 'var(--danger)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 340 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 341 |     let valorHtml = '' | Declara variavel mutavel no escopo de bloco. |
| 342 |     if (m.valor_medido !== null && m.valor_medido !== undefined) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 343 |       const diff    = (m.valor_medido - m.valor_alvo).toFixed(1) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 344 |       const diffCol = diff &lt;= 0 ? 'var(--accent)' : 'var(--danger)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 345 |       const unidade = m.cd_medida ? '' : '' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 346 |       valorHtml = ` | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 347 |         &lt;div class="g-w-vals"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 348 |           &lt;span class="g-w-val-actual" style="color:${col}"&gt;${m.valor_medido}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 |           &lt;span class="g-w-val-sep"&gt;â†’&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |           &lt;span class="g-w-val-target"&gt;alvo: ${m.valor_alvo}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 351 |           &lt;span style="color:${diffCol};font-size:0.72rem"&gt;(${diff &gt; 0 ? '+' : ''}${diff})&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 352 |         &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 353 |         ${m.data_medido ? `&lt;div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:6px"&gt;medido em ${m.data_medido}&lt;/div&gt;` : ''}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 354 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 355 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 356 |     const btnHtml = (m.valor_medido === null \|\| m.valor_medido === undefined) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 357 |       ? `&lt;div style="margin-bottom:10px"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 358 |            &lt;button class="g-w-save-btn" style="font-size:0.7rem;padding:4px 12px" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 359 |              onclick="goalsMensalToggle('${mk}',${m.cd_goal},${ms.feitos === 1 ? 0 : 1})"&gt; | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 360 |              ${ms.feitos === 1 ? 'Marcar como nÃ£o atingida' : '+ Marcar como atingida'} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 361 |            &lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 362 |          &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 363 |       : '' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 365 |     return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 366 |       &lt;div class="g-w-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 367 |         &lt;span class="g-w-lbl"&gt;${m.goal_nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 368 |         &lt;strong style="color:${col}"&gt;${ms.pct &gt;= 100 ? 'âœ“' : 'âœ—'}&lt;/strong&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 369 |       &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 370 |       ${valorHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 371 |       ${btnHtml}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 372 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 373 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 374 |   el.innerHTML = ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 375 |     &lt;div class="g-w-title"&gt;â—Ž Metas mensais&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 376 |     ${rows}` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 377 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 378 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 379 | async function goalsMensalToggle(mk, cd_goal, progresso) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 380 |   const today = `${mk}-01`   // usa dia 1 como representante do mÃªs | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 381 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 382 |     await postGoalEntrada(today, cd_goal, progresso) | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 383 |     window.goalsEntradas = await fetchGoalsEntradas() | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 384 |     _gRenderDetail(mk) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 385 |   } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 386 |     console.error('Erro ao salvar entrada mensal:', err) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 387 |     if (typeof showAppToast === 'function') showAppToast('NÃ£o foi possÃ­vel salvar meta mensal.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 388 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 389 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 390 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 391 | function _gRenderBreakdown(data) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 392 |   const el = document.getElementById('goals-breakdown') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 393 |   if (data.metaScores.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 394 |     el.innerHTML = '&lt;div class="inline-empty-note"&gt;Nenhuma meta ativa para este mÃªs.&lt;/div&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 395 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 396 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 397 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 398 |   const porTipo = { diario: [], semanal: [], mensal: [] } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 399 |   data.metaScores.forEach(ms =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 400 |     const t = ms.meta.tp_metrica | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 401 |     ;(porTipo[t] = porTipo[t] \|\| []).push(ms) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 402 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 403 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 404 |   const tipoLabel = { diario: 'DiÃ¡rias', semanal: 'Semanais', mensal: 'Mensais' } | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 405 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 406 |   let html = '' | Declara variavel mutavel no escopo de bloco. |
| 407 |   for (const tipo of ['diario', 'semanal', 'mensal']) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 408 |     const lista = porTipo[tipo] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 409 |     if (!lista \|\| lista.length === 0) continue | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 410 |     html += `&lt;div class="g-ind-group-label"&gt;${tipoLabel[tipo]}&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 411 |     html += lista.map(ms =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 412 |       const col      = ms.pct &gt;= 80 ? 'var(--accent)' : ms.pct &gt;= 50 ? 'var(--accent3)' : 'var(--danger)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 413 |       const ptsLabel = `${Math.round(ms.ganho)}/${ms.possivel} pts` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 414 |       return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 415 |         &lt;div class="g-ind-row"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 416 |           &lt;div class="g-ind-top"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |             &lt;span class="g-ind-name"&gt;${ms.meta.goal_nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 418 |             &lt;div class="g-ind-bar-wrap"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |               &lt;div class="g-ind-bar" style="width:${ms.pct}%;background:${col}"&gt;&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 420 |             &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 421 |           &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 422 |           &lt;div class="g-ind-bottom"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 423 |             &lt;span class="g-ind-pct" style="color:${col}"&gt;${ms.pct}%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 424 |             &lt;span class="g-ind-days"&gt;${ms.label}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 425 |             &lt;span class="g-ind-pts" style="color:${col}"&gt;${ptsLabel}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 426 |           &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 427 |         &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 428 |     }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 429 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 430 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 431 |   el.innerHTML = html | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 433 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 434 | function _gRenderCalendar(mk, data) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 435 |   const [y, m]      = mk.split('-').map(Number) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 436 |   const daysInMonth = new Date(y, m, 0).getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 437 |   const firstDow    = new Date(y, m - 1, 1).getDay() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 438 |   const offset      = firstDow === 0 ? 6 : firstDow - 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 439 |   const today       = new Date() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 440 |   const isCurMonth  = y === today.getFullYear() && m === today.getMonth() + 1 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 441 |   const headers     = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b', 'Dom'] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 442 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 443 |   const metasSemanal = window.goalsMetas.filter(mm =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 444 |     mm.tp_metrica === 'semanal' && | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 445 |     (mm.data === null \|\| mm.data === undefined \|\| mm.data.startsWith(mk)) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 446 |   ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 447 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 448 |   const doneOn = (cd, ds) =&gt; | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 449 |     (window.goalsEntradas \|\| []).some(e =&gt; e.data === ds && e.cd_goal === cd && e.progresso &gt;= 1) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 450 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 451 |   let filtersHtml = `&lt;div class="g-cal-filters"&gt; | Declara variavel mutavel no escopo de bloco. |
| 452 |     &lt;button class="g-cal-chip${_goalsCalFilter === null ? ' active' : ''}" onclick="_goalsCalFilter=null;_gRenderCalendar('${mk}',_gMonthScore('${mk}'))"&gt;Todos&lt;/button&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 453 |   metasSemanal.forEach(mm =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 454 |     const a = _goalsCalFilter === mm.cd_goal | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 455 |     filtersHtml += `&lt;button class="g-cal-chip${a ? ' active' : ''}" onclick="_goalsCalFilter=${mm.cd_goal};_gRenderCalendar('${mk}',_gMonthScore('${mk}'))"&gt;${mm.goal_nome}&lt;/button&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 456 |   }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 457 |   filtersHtml += `&lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 458 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 459 |   let html = filtersHtml + '&lt;div class="g-cal-grid"&gt;' | Declara variavel mutavel no escopo de bloco. |
| 460 |   headers.forEach(h =&gt; { html += `&lt;div class="g-cal-hdr"&gt;${h}&lt;/div&gt;` }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 461 |   for (let i = 0; i &lt; offset; i++) html += '&lt;div&gt;&lt;/div&gt;' | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 462 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 463 |   for (let d = 1; d &lt;= daysInMonth; d++) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 464 |     const ds       = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 465 |     const isFuture = isCurMonth && d &gt; today.getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 466 |     const isToday  = isCurMonth && d === today.getDate() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 467 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 468 |     let cls      = 'g-cal-day' | Declara variavel mutavel no escopo de bloco. |
| 469 |     let style    = '' | Declara variavel mutavel no escopo de bloco. |
| 470 |     let dotsHtml = '' | Declara variavel mutavel no escopo de bloco. |
| 471 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 472 |     if (isFuture) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 473 |       cls += ' g-cal-future' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 474 |     } else if (_goalsCalFilter !== null) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 475 |       if (doneOn(_goalsCalFilter, ds)) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 476 |         cls   += ' g-cal-has' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 477 |         style  = '--dc:var(--accent)' | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 478 |       } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 479 |         cls += ' g-cal-nodata' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 480 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 481 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 482 |       const dd = data.dailyScores[d] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 483 |       if (!dd) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 484 |         cls += ' g-cal-nodata' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 485 |       } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 486 |         cls  += ' g-cal-has' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 487 |         const dc = dd.score &gt;= 0.8 ? 'var(--accent)' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 488 |                  : dd.score &gt;= 0.6 ? 'var(--accent3)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 489 |                  : dd.score &gt;= 0.4 ? '#f5d742' : 'var(--danger)' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 490 |         style = `--dc:${dc}` | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 491 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 492 |       if (!isFuture && metasSemanal.length &gt; 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 493 |         dotsHtml = `&lt;span class="g-cal-dots"&gt;${ | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 494 |           metasSemanal.map(mm =&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 495 |             `&lt;span class="g-cal-dot${doneOn(mm.cd_goal, ds) ? ' ok' : ''}" title="${mm.goal_nome}"&gt;&lt;/span&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 496 |           ).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 497 |         }&lt;/span&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 498 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 499 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 500 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 501 |     if (isToday) cls += ' g-cal-today' | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 502 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 503 |     html += `&lt;div class="${cls}" style="${style}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 504 |       &lt;span class="g-cal-num"&gt;${d}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 505 |       ${dotsHtml} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 506 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 507 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 508 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 509 |   html += '&lt;/div&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 510 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 511 |   if (_goalsCalFilter !== null) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 512 |     html += `&lt;div class="g-cal-legend"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 513 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--accent)"&gt;&lt;/span&gt;feito&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 514 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--surface2);border:1px solid var(--border)"&gt;&lt;/span&gt;nÃ£o feito&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 515 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 516 |   } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 517 |     html += `&lt;div class="g-cal-legend"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 518 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--accent)"&gt;&lt;/span&gt;â‰¥ 80%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 519 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--accent3)"&gt;&lt;/span&gt;60â€“79%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 520 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:#f5d742"&gt;&lt;/span&gt;40â€“59%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 521 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--danger)"&gt;&lt;/span&gt;&lt; 40%&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 522 |       &lt;span class="g-cal-leg"&gt;&lt;span class="g-cal-leg-dot" style="background:var(--surface2);border:1px solid var(--border)"&gt;&lt;/span&gt;sem dados&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 523 |     &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 524 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 525 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 526 |   document.getElementById('goals-calendar').innerHTML = html | Interage com DOM para ler ou atualizar elementos da interface. |
| 527 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 528 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 529 | function _gEscHtml(v) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 530 |   return String(v ?? '') | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 531 |     .replaceAll('&', '&amp;') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 532 |     .replaceAll('&lt;', '&lt;') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 533 |     .replaceAll('&gt;', '&gt;') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 534 |     .replaceAll('"', '&quot;') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 535 |     .replaceAll("'", '&#39;') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 536 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 537 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 538 | function _gFeedbackHtml(icon, title, sub = '', details = '', isError = false) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 539 |   return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 540 |     &lt;div class="section-feedback${isError ? ' error' : ''}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 541 |       &lt;div class="section-feedback-icon"&gt;${icon}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 542 |       &lt;div class="section-feedback-title"&gt;${title}&lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 543 |       ${sub ? `&lt;div class="section-feedback-sub"&gt;${sub}&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 544 |       ${details ? `&lt;div class="section-feedback-details"&gt;${_gEscHtml(details)}&lt;/div&gt;` : ''} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 545 |     &lt;/div&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 546 |   ` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 547 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 548 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 549 | function _gSetOverviewFeedback(icon, title, sub = '', details = '', isError = false) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 550 |   const el = document.getElementById('goals-months-grid') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 551 |   if (!el) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 552 |   el.innerHTML = _gFeedbackHtml(icon, title, sub, details, isError) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 553 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 554 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 555 | async function initGoalsSection(forceRefresh = false) { | Declara funcao JavaScript assincrona para operacoes com await. |
| 556 |   if (!forceRefresh && _goalsHasFreshCache()) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 557 |     goalsShowOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 558 |     goalsRenderOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 559 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 560 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 561 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 562 |   let erroApi = null | Declara variavel mutavel no escopo de bloco. |
| 563 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 564 |   goalsShowOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 565 |   _gSetOverviewFeedback('â³', 'Carregando Goals', 'Buscando metas e entradas...') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 566 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 567 |   const grid = document.getElementById('goals-months-grid') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 568 |   for (let tentativa = 1; tentativa &lt;= 5; tentativa++) { | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 569 |     try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 570 |       if (tentativa &gt; 1 && grid) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 571 |         _gSetOverviewFeedback('â³', `Acordando o servidor (${tentativa}/5)`, 'Render free tier pode demorar atÃ© 60s') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 572 |       } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 573 |       const [codigos, metas, entradas] = await Promise.all([ | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 574 |         fetchGoalsCodigos(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 575 |         fetchGoalsMetas(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 576 |         fetchGoalsEntradas(), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 577 |       ]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 578 |       window.goalsCodigos  = codigos | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 579 |       window.goalsMetas    = metas.map(m =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 580 |         const tp = (m.tp_metrica \|\| '').toLowerCase() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 581 |         return { ...m, tp_metrica: tp === 'meta' ? 'mensal' : tp } | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 582 |       }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 583 |       window.goalsEntradas = entradas | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 584 |       _goalsDataLoadedAt = Date.now() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 585 |       erroApi = null | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 586 |       break | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 587 |     } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 588 |       erroApi = err.message \|\| String(err) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 589 |       console.warn(`[Goals] Tentativa ${tentativa}/5 falhou:`, erroApi) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 590 |       if (tentativa &lt; 5) await new Promise(r =&gt; setTimeout(r, 15000)) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 591 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 592 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 593 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 594 |   if (erroApi) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 595 |     _gSetOverviewFeedback('âš ', 'Erro ao carregar dados da API', 'Verifique conexÃ£o e disponibilidade do backend.', erroApi, true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 596 |     if (typeof showAppToast === 'function') showAppToast('Goals indisponÃ­vel no momento.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 597 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 598 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 599 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 600 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 601 |     goalsRenderOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 602 |   } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 603 |     console.error('[Goals] Erro em goalsRenderOverview:', err) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 604 |     _gSetOverviewFeedback('âš ', 'Erro ao renderizar Goals', 'Houve uma falha ao montar a visualizaÃ§Ã£o.', err?.message \|\| String(err), true) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 605 |     if (typeof showAppToast === 'function') showAppToast('Falha ao renderizar Goals.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 606 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 607 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 608 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 609 | async function openGoalsModal() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 610 |   if (!document.getElementById('goals-modal-overlay')) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 611 |     await loadHTML('pages/goals/goals-modal.html', 'modal-container-goals') | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 612 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 613 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 614 |   const today = new Date().toISOString().split('T')[0] | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 615 |   document.getElementById('goals-modal-data').value = today | Interage com DOM para ler ou atualizar elementos da interface. |
| 616 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 617 |   _goalsModalPopulate(today) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 618 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 619 |   document.getElementById('goals-modal-overlay').classList.add('open') | Interage com DOM para ler ou atualizar elementos da interface. |
| 620 |   document.body.style.overflow = 'hidden' | Interage com DOM para ler ou atualizar elementos da interface. |
| 621 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 622 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 623 | function closeGoalsModal() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 624 |   const el = document.getElementById('goals-modal-overlay') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 625 |   if (el) el.classList.remove('open') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 626 |   document.body.style.overflow = '' | Interage com DOM para ler ou atualizar elementos da interface. |
| 627 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 628 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 629 | function closeGoalsModalOutside(event) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 630 |   if (event.target === document.getElementById('goals-modal-overlay')) closeGoalsModal() | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 631 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 632 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 633 | function goalsModalOnDateChange() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 634 |   const data = document.getElementById('goals-modal-data').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 635 |   if (data) _goalsModalPopulate(data) | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 636 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 637 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 638 | function _goalsModalPopulate(dateStr) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 639 |   const metas = window.goalsMetas.filter(m =&gt; m.tp_metrica === 'semanal') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 640 |   const list  = document.getElementById('goals-modal-list') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 641 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 642 |   if (metas.length === 0) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 643 |     list.innerHTML = '&lt;div class="inline-empty-note"&gt;Nenhuma meta semanal cadastrada.&lt;/div&gt;' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 644 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 645 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 646 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 647 |   list.innerHTML = metas.map(m =&gt; { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 648 |     const done = (window.goalsEntradas \|\| []).some( | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 649 |       e =&gt; e.data === dateStr && e.cd_goal === m.cd_goal && e.progresso &gt;= 1 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 650 |     ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 651 |     return ` | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 652 |       &lt;div class="gm-row" id="gm-row-${m.cd_goal}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 653 |         &lt;span class="gm-name"&gt;${m.goal_nome}&lt;/span&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 654 |         &lt;button class="gm-toggle${done ? ' done' : ''}" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 655 |           onclick="goalsModalToggle(${m.cd_goal}, this)" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 656 |           data-state="${done ? '1' : '0'}"&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 657 |           ${done ? 'âœ“ Feito' : 'NÃ£o feito'} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 658 |         &lt;/button&gt; | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 659 |       &lt;/div&gt;` | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 660 |   }).join('') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 661 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 662 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 663 | function goalsModalToggle(cd_goal, btn) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 664 |   const isDone = btn.dataset.state === '1' | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 665 |   btn.dataset.state = isDone ? '0' : '1' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 666 |   btn.textContent   = isDone ? 'NÃ£o feito' : 'âœ“ Feito' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 667 |   btn.classList.toggle('done', !isDone) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 668 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 669 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 670 | async function saveGoalEntradas() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 671 |   const dateStr = document.getElementById('goals-modal-data').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 672 |   if (!dateStr) return | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 673 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 674 |   const saveBtn = document.getElementById('goals-modal-save-btn') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 675 |   saveBtn.disabled    = true | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 676 |   saveBtn.textContent = 'Salvandoâ€¦' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 677 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 678 |   const metas = window.goalsMetas.filter(m =&gt; m.tp_metrica === 'semanal') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 679 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 680 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 681 |     await Promise.all(metas.map(m =&gt; { | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 682 |       const btn      = document.querySelector(`#gm-row-${m.cd_goal} .gm-toggle`) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 683 |       const progresso = btn && btn.dataset.state === '1' ? 1 : 0 | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 684 |       return postGoalEntrada(dateStr, m.cd_goal, progresso) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 685 |     })) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 686 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 687 |     window.goalsEntradas = await fetchGoalsEntradas() | Espera operacao assincrona terminar sem bloquear todo o event loop. |
| 688 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 689 |     saveBtn.disabled    = false | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 690 |     saveBtn.textContent = 'Salvar' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 691 |     closeGoalsModal() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 692 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 693 |     if (_goalsMesDetalhe) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 694 |       _gRenderDetail(_goalsMesDetalhe) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 695 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 696 |       goalsRenderOverview() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 697 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 698 |   } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 699 |     console.error('Erro ao salvar goals:', err) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 700 |     if (typeof showAppToast === 'function') showAppToast('Erro ao salvar progresso de Goals.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 701 |     saveBtn.textContent = 'Erro!' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 702 |     setTimeout(() =&gt; { saveBtn.disabled = false; saveBtn.textContent = 'Salvar' }, 2000) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 703 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 704 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
