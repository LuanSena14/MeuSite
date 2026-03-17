# 08. PAGE-EXERCISES.md - Página Exercises

## 1. Objetivo da página

A página Exercises registra treinos e apresenta análises de frequência, distribuição por grupo/exercício e comportamento por período do dia.

## 2. Arquivos envolvidos

- `FrontEnd/pages/exercises/exercises.html`
- `FrontEnd/pages/exercises/exercises.js`
- `FrontEnd/pages/exercises/exercise-modal.html`
- `FrontEnd/pages/exercises/exercises.css`
- `FrontEnd/shared/js/app.js`
- `FrontEnd/shared/js/api.js`

## 3. Estrutura visual da página

`exercises.html` contém:

- chips de filtros ativos (`ex-active-chips`)
- estado vazio (`ex-empty`)
- conteúdo principal (`ex-content`) com:
  - KPIs (total, duração média, tempo total, esforço médio)
  - gráfico de barras com drill-down mês -> dia (`ex-chart-freq`)
  - gráfico rosca grupo -> exercício (`ex-chart-tipo`)
  - gráfico por período do dia (`ex-chart-periodo`)
  - tabela de histórico (`ex-history-body`)

## 4. Inicialização e dados

`app.js` chama `initExSection(forceRefresh)` ao entrar na seção.

Fluxo:

1. Injeta `exercise-modal.html` se ainda não carregado.
2. Carrega catálogos e histórico quando necessário:
   - `fetchCodigosExercicio()`
   - `fetchExercicios()`
3. Popula selects de grupo/exercício.
4. Renderiza dashboard (`renderExDash()`).

## 5. Estados e filtros

`exercises.js` mantém três blocos de estado:

- `exFiltros`: filtros explícitos (data, mês, grupo, exercício).
- `exCross`: cross-filter entre gráficos (mês e grupo).
- `exDrill`: drill-down ativo em barras e rosca.

Esse desenho permite interações combinadas sem recarregar dados do backend.

## 6. Interações dos gráficos

## 6.1 Barras (mês -> dia)

- 1 clique em barra de mês: ativa cross-filter de mês.
- 2 clique no mesmo mês: entra no drill por dia.
- Botão "voltar aos meses" retorna para nível mensal.

## 6.2 Rosca (grupo -> exercício)

- 1 clique em grupo: ativa cross-filter por grupo.
- 2 clique no mesmo grupo: drill para exercícios do grupo.
- Botão "grupos" retorna ao nível de grupo.

## 6.3 Período do dia

Classificação por hora (`getHoraPeriodo`):

- `manha`: 05h-12h
- `tarde`: 12h-18h
- `noite`: 18h-23h
- `madrugada`: 00h-05h

## 7. KPI e histórico

KPIs calculados com os dados filtrados:

- total de treinos
- duração média (min)
- tempo total (min)
- esforço médio (/10)

Tabela de histórico mostra:

- data
- hora
- exercício
- grupo
- duração
- esforço

## 8. Modal de novo treino

`exercise-modal.html` + funções de `exercises.js`.

Fluxo:

1. `openExModal()` preenche automaticamente o campo de data (`ex-data`) com a data de hoje (`new Date().toISOString().split('T')[0]`).
2. Usuário escolhe grupo.
3. `onGrupoChange()` habilita e preenche lista de exercícios filhos.
4. `saveExercise()` valida obrigatórios:
   - exercício
   - hora
   - data
4. Envia `postExercise()`.
5. Recarrega lista (`fetchExercicios`) e re-renderiza dashboard.

Payload esperado:

```json
{
  "date": "2026-03-16",
  "hora": "14:30:00",
  "cd_exercicio": 12,
  "duracao": 45,
  "esforco": 8
}
```

## 9. Endpoint usados

- `GET /api/exercicios/codigos`
- `GET /api/exercicios`
- `POST /api/exercicios`

## 10. Performance e limpeza

- Render é agendado com `requestAnimationFrame` (`renderExDash`).
- Existe controle de timer para auto-scroll do gráfico de barras.
- `destroyExerciseCharts()` limpa todas as instâncias Chart.js ao sair da seção.

## 11. Checklist de manutenção

1. Validar drill e cross-filter após qualquer mudança de gráfico.
2. Garantir que `clearExFilters()` reseta filtros, cross e drill.
3. Evitar recriação sem destruir charts antigos.
4. Verificar consistência de nomes de grupo/exercício vindos da API.
5. Testar com base vazia e com base grande.

## 12. Testes manuais recomendados

1. Cadastrar treino e validar atualização imediata dos KPIs.
2. Filtrar por mês e conferir total/histórico.
3. Fazer drill no gráfico de barras e voltar.
4. Fazer drill na rosca e voltar.
5. Testar com e sem `esforco`/`duracao` para KPIs opcionais.
