# 06. PAGE-HOME.md - Página Home

## 1. Objetivo da página

A Home é o dashboard de resumo do sistema. Ela consolida dados de Body, Exercises, Goals e Finances em quatro cards para responder rapidamente:

- Como está a evolução corporal no mês.
- Como está o saldo financeiro no mês.
- Como está a frequência de treinos.
- Como está o score de metas.

## 2. Arquivos envolvidos

- `FrontEnd/pages/home/home.html`
- `FrontEnd/pages/home/home.js`
- `FrontEnd/pages/home/home.css`
- `FrontEnd/shared/js/app.js` (dispara init da seção)
- `FrontEnd/shared/js/api.js` (fontes de dados)

## 3. Estrutura visual (home.html)

A seção renderiza:

- Header com saudação (`home-greeting`) e data (`home-date`).
- Filtro de mês (`home-mes-filter`).
- Área de feedback inline (`home-feedback`) para carga parcial.
- Grid com 4 cards:
  - Body (`home-body-content`)
  - Finances (`home-fin-content`)
  - Exercises (`home-ex-content`)
  - Goals (`home-goals-content`)

Cada card tem ação de clique para navegar para a seção completa e um botão de atalho para criar novo registro.

## 4. Ponto de entrada e ciclo de vida

Em `app.js`, ao trocar para a seção `home`, o app chama:

```javascript
await initHomeSection(forceRefresh)
```

Em `home.js`, `initHomeSection(forceRefresh)` faz:

1. Render da saudação e data (`_homeRenderGreeting`).
2. Preenchimento do seletor de meses (`_homePopulateMonthFilter`).
3. Definição do mês padrão atual (`YYYY-MM`).
4. Uso de cache local (TTL de 45s) quando possível.
5. Fetch paralelo com `Promise.allSettled`.
6. Render final dos 4 cards (`_homeRenderAll`).

## 5. Dados consumidos

A Home usa dados destas APIs:

- `fetchCheckins()`
- `fetchExercicios()`
- `fetchGoalsEntradas()`
- `fetchGoalsMetas()`
- `fetchLancamentos()` (apenas se Finances estiver desbloqueado)
- `fetchFinancasCodigos()` (apenas se Finances estiver desbloqueado)
- `fetchOrcamento()` (apenas se Finances estiver desbloqueado)

### 5.1 Carga parcial resiliente

A carga usa `Promise.allSettled`, então se um módulo falhar, os demais continuam sendo renderizados.

Falhas são sinalizadas em `home-feedback` com a lista de fontes indisponíveis (Body, Exercises, Goals, Finances).

## 6. Regras de cada card

## 6.1 Card Body (`_homeBodyCard`)

Principais regras:

- Usa o histórico de check-ins ordenado por data.
- Considera o período até o fim do mês selecionado.
- Mostra peso atual e variação vs medição anterior.
- Mostra variação anual desde a primeira medição do ano.
- Exibe métricas secundárias quando disponíveis:
  - `% gordura`
  - `massa muscular`
  - `IMC`
  - `cintura`

Detalhe importante: para IMC, se a entrada atual não tiver altura válida, usa a última altura conhecida no histórico.

## 6.2 Card Finances (`_homeFinCard`)

- Se finanças estiver bloqueado por PIN, mostra estado protegido.
- Se liberado, calcula no mês:
  - total de receitas
  - total de despesas
  - saldo
- Faz rollup de tipo (`receita/despesa`) subindo hierarquia de categorias.
- Mostra barras de orçamento por categoria (realizado vs orçado).

## 6.3 Card Exercises (`_homeExCard`)

No mês selecionado:

- total de exercícios
- dias únicos com treino
- média semanal
- esforço médio (quando existe)
- duração média (quando existe)
- ranking por grupo muscular
- informação de último treino (hoje/ontem/há N dias)

## 6.4 Card Goals (`_homeGoalsCard`)

- Normaliza `tp_metrica` (`meta` -> `mensal`).
- Usa `_gMonthScore(mesKey)` da página Goals.
- Exibe:
  - nota (grade)
  - score percentual
  - pontos ganhos vs possíveis
  - progresso por meta em barras

## 7. Interações rápidas

Atalhos dos cards:

- Body: `openModal()` para novo check-in.
- Finances: `_homeOpenFinAdd(event)` para novo lançamento.
- Exercises: `_homeOpenExAdd(event)` para novo treino.
- Goals: `_homeOpenGoalsAdd(event)` para registro diário.

Os atalhos garantem pré-condições, por exemplo:

- Finances pede desbloqueio por PIN.
- Exercises/Goals carregam modal se ainda não foi injetado no DOM.

## 8. Cache e invalidação

Variáveis de cache em `home.js`:

- `_homeData`
- `_homeDataLoadedAt`
- `_HOME_CACHE_TTL_MS = 45000`

A Home só refaz fetch antes do TTL quando `forceRefresh = true`.

## 9. Checklist de manutenção

Quando alterar Home, validar:

1. Mudança de mês atualiza os 4 cards.
2. Falha de uma API não derruba os outros cards.
3. PIN de Finances afeta corretamente o card financeiro.
4. Atalhos dos cards abrem os modais certos.
5. Não há erro no console ao trocar seções rapidamente.

## 10. Pontos de evolução sugeridos

- Adicionar skeleton loading por card durante fetch.
- Exibir timestamp de última atualização por módulo.
- Permitir exportar resumo mensal em CSV/PDF.
- Adicionar comparação com mês anterior em todos os cards.
