# 09. PAGE-GOALS.md - Página Goals

## 1. Objetivo da página

A página Goals calcula e exibe o desempenho mensal de metas diárias, semanais e mensais, com visão executiva e detalhamento por mês.

## 2. Arquivos envolvidos

- `FrontEnd/pages/goals/goals.html`
- `FrontEnd/pages/goals/goals.js`
- `FrontEnd/pages/goals/goals-modal.html`
- `FrontEnd/pages/goals/goals.css`
- `FrontEnd/shared/js/app.js`
- `FrontEnd/shared/js/api.js`

## 3. Estrutura de interface

`goals.html` possui dois estados de tela:

- Overview (`goals-overview`): KPIs gerais e grid de meses.
- Detail (`goals-detail`): score detalhado de um mês.

No detalhe, a tela mostra:

- nota e score mensal
- card de metas mensais
- breakdown por meta
- calendário com heatmap diário

## 4. Fontes de dados

A seção consome três coleções:

- `goalsCodigos` (estrutura de goals)
- `goalsMetas` (regras, alvo e pontos)
- `goalsEntradas` (progresso diário)

Endpoints:

- `GET /api/goals/codigos`
- `GET /api/goals/metas`
- `GET /api/goals/entradas`
- `POST /api/goals/entradas`

## 5. Inicialização resiliente

`initGoalsSection(forceRefresh)` implementa:

- cache local com TTL de 45s
- tentativa de carregamento com retry (até 5 tentativas)
- espera de 15s entre tentativas
- feedback de carregamento/erro na própria seção

Esse comportamento protege contra latência de cold start do backend.

## 6. Algoritmo de score mensal

Função principal: `_gMonthScore(mesKey)`.

## 6.1 Regras por tipo de meta

- `diario`:
  - conta dias concluídos no mês
  - ganho proporcional ao total de dias
- `semanal`:
  - calcula esperado no mês com base em frequência semanal
  - aplica crédito parcial (rate limitado a 100%)
- `mensal`:
  - score binário (cumpriu ou não)
  - pode usar valor medido automático (`valor_medido`) ou entrada manual

## 6.2 Nota (grade)

Faixas:

- A: >= 80%
- B: >= 65%
- C: >= 50%
- D: < 50%

## 7. Overview mensal

`goalsRenderOverview()` monta:

- score médio de meses com dados
- melhor e pior indicador semanal
- próxima meta de peso pendente
- cards de meses com nota, percentual e pontos

Ao clicar em um card mensal, abre detalhe com `goalsShowDetail(mk)`.

## 8. Tela de detalhe

`_gRenderDetail(mk)` renderiza:

1. Cabeçalho do mês e nota.
2. Ring de score mensal.
3. Card de metas mensais (`_gRenderWeightCard`).
4. Breakdown por tipo de meta (`_gRenderBreakdown`).
5. Calendário (`_gRenderCalendar`).

## 9. Calendário e filtros

O calendário permite:

- visão geral com intensidade por dia
- filtro por meta semanal específica (`_goalsCalFilter`)
- legenda dinâmica conforme modo atual

Também destaca dia atual e dias futuros no mês corrente.

## 10. Modal de registro diário

`goals-modal.html` exibe lista de metas semanais com toggle feito/não feito.

Fluxo:

1. `openGoalsModal()` define data e popula lista de metas.
2. `goalsModalToggle()` alterna estado local do botão.
3. `saveGoalEntradas()` persiste todas metas semanais da data selecionada.
4. Recarrega entradas e atualiza overview ou detalhe aberto.

## 11. Funções-chave para manutenção

- `_gMonthScore`: regra de negócio principal.
- `_gRenderCalendar`: visualização de progresso diário.
- `goalsRenderOverview`: resumo executivo.
- `saveGoalEntradas`: persistência de progresso semanal.

## 12. Checklist de manutenção

1. Alterou regra de pontuação? Atualize `_gMonthScore` e documentação.
2. Alterou tipos de meta? Validar normalização `meta -> mensal`.
3. Alterou layout de detalhe? Revalidar `goalsShowDetail/goalsShowOverview`.
4. Alterou modal? Garantir coerência entre toggles e payload final.
5. Revalidar retries para cenários de backend lento.

## 13. Testes manuais recomendados

1. Criar entradas em 3 dias e validar score diário.
2. Verificar meta semanal com crédito parcial.
3. Validar meta mensal com valor medido e sem valor medido.
4. Abrir detalhe de mês e alternar filtro do calendário.
5. Simular erro de API e validar mensagens de feedback.
