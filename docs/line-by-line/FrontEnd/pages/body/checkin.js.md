# Linha a linha - FrontEnd/pages/body/checkin.js

Arquivo fonte: FrontEnd/pages/body/checkin.js

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 2 | function val(id) { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 3 |   const v = document.getElementById(id)?.value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 4 |   return v !== '' && v != null ? parseFloat(v) : null | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 5 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 6 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 7 | // As chaves precisam bater com os nomes em codigo_medida.descricao no banco | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 8 | function readForm() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 9 |   return { | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 10 |     agua:                val('f-agua'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 11 |     massa_muscular:      val('f-massa-muscular'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 |     peso:                val('f-peso'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 13 |     gordura:             val('f-gordura'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 14 |     gordura_visceral:    val('f-gordura-visceral'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 15 |     dobra_triceps:       val('db-trip'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 16 |     dobra_supra:         val('db-supra'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 17 |     dobra_panturrilha:   val('db-pant'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 18 |     dobra_biceps:        val('db-biceps'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 19 |     dobra_coxa:          val('db-coxa'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 20 |     dobra_supra_iliaca:  val('db-supra-iliaca'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 21 |     dobra_axilar_medial: val('db-axilar-medial'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 |     dobra_abdome:        val('db-abdome'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 23 |     circ_punho:          val('f-punho'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |     circ_coxa:           val('f-coxa'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 25 |     circ_braco:          val('f-braco'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 26 |     circ_abdominal:      val('f-abdominal'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |     circ_panturrilha:    val('f-panturrilha'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 28 |     cintura:             val('f-cintura'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |     circ_torax:          val('f-torax'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |     circ_tornozelo:      val('f-tornozelo'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |     quadril:             val('f-quadril'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 32 |     circ_antebraco:      val('f-antebraco'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 33 |     rmr:                 val('f-rmr'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 34 |     vo2:                 val('f-vo2'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 35 |     sono:                val('f-sono'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 36 |     movimento:           val('f-movimento'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 37 |     exercicio:           val('f-exercicio'), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 38 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 39 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 40 | function clearForm() { | Declara funcao JavaScript nomeada para encapsular logica reutilizavel. |
| 41 |   document.querySelectorAll('input[type=number]').forEach(i =&gt; i.value = '') | Interage com DOM para ler ou atualizar elementos da interface. |
| 42 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 43 | async function saveEntry() { | Declara funcao JavaScript assincrona para operacoes com await. |
| 44 |   const medidas = readForm() | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 45 |   if (!Object.values(medidas).some(v =&gt; v !== null)) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 46 |     if (typeof showAppToast === 'function') showAppToast('Preencha pelo menos um campo antes de salvar.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 47 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 48 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 49 |   const date = document.getElementById('f-data').value | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 50 |   if (!date) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 51 |     if (typeof showAppToast === 'function') showAppToast('Selecione uma data antes de salvar.', 'error') | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 52 |     return | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 53 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |   const btn = document.getElementById('btn-salvar') | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 55 |   btn.disabled = true | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 56 |   btn.innerHTML = '&lt;span&gt;â³&lt;/span&gt; Salvando...' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 57 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 58 |   try { | Inicia bloco protegido para tratamento de erros em runtime. |
| 59 |     const result = await postCheckin(date, medidas) | Declara constante no escopo atual; referencia nao deve ser reatribuida. |
| 60 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 61 |     if (result.ok) { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 62 |       clearForm() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 63 |       showToast('toast') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 64 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 65 |       console.error('Erro do servidor:', result.erro) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 66 |       showToast('toast-erro') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 68 |   } catch (err) { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 69 |     console.error('Erro de conexÃ£o:', err) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |     if (typeof showAppToast === 'function') { | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 71 |       showAppToast('NÃ£o foi possÃ­vel conectar ao servidor. Verifique se o backend estÃ¡ ativo.', 'error') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |     } else { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |       showToast('toast-erro') | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 74 |     } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 75 |   } finally { | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |     btn.disabled = false | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |     btn.innerHTML = '&lt;span&gt;ðŸ’¾&lt;/span&gt; Salvar check-in' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |   } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 | } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
