# 10. PAGE-FINANCES.md - Página Finances

## 1. Objetivo da página

Finances organiza a vida financeira em múltiplos módulos: visão geral, lançamentos, investimentos/indicadores e viagens, com suporte a hierarquia de categorias, orçamento e análise visual.

## 2. Arquivos envolvidos

HTML/CSS:

- `FrontEnd/pages/finances/finances.html`
- `FrontEnd/pages/finances/finances.css`

JavaScript:

- `FrontEnd/pages/finances/fin-core.js`
- `FrontEnd/pages/finances/fin-overview.js`
- `FrontEnd/pages/finances/fin-lancamentos.js`
- `FrontEnd/pages/finances/fin-investimentos.js`
- `FrontEnd/pages/finances/fin-viagens.js`
- `FrontEnd/pages/finances/fin-modals.js`

Infra da seção:

- `FrontEnd/shared/js/nav.js` (PIN de acesso)
- `FrontEnd/shared/js/app.js` (init da seção)
- `FrontEnd/shared/js/api.js` (acesso a endpoints)

## 3. Controle de acesso por PIN

Em `nav.js`, a seção Finances só abre quando `_financesUnlocked()` retorna verdadeiro.

Fluxo:

1. Usuário tenta entrar em Finances.
2. Overlay de PIN é exibido.
3. PIN correto grava `sessionStorage.finances_ok = '1'`.
4. Só então `switchSection('finances')` continua.

## 4. Estrutura da interface

`finances.html` possui abas:

- `overview`
- `lancamentos`
- `investimentos`
- `viagens`

Além disso, contém:

- estado vazio (`fin-empty`)
- container principal (`fin-content`)
- modal único com formulários por tipo (`fin-modal-overlay`)

## 5. Estado global e cache

Em `fin-core.js`:

- `finCodigos`
- `finLancamentos`
- `finOrcamento`
- `finInvestimentos`
- `finViagens`

Cache:

- `_finDataLoadedAt`
- `_FIN_CACHE_TTL_MS = 45000`

Se o cache estiver fresco e houver dados, a seção não refaz fetch completo.

## 6. Inicialização

`initFinancesSection(forceRefresh)`:

1. mostra estado "loading"
2. carrega tudo em paralelo:
   - `fetchFinancasCodigos`
   - `fetchLancamentos`
   - `fetchOrcamento`
   - `fetchInvestimentos`
   - `fetchViagens`
3. define estado:
   - `error` (falha)
   - `empty` (sem dados)
   - `ready` (com dados)
4. aplica filtros padrão de mês
  - overview/lançamentos: mês atual
  - investimentos: último mês com snapshot disponível (até o usuário mudar manualmente)
5. renderiza aba ativa

## 7. Módulo Overview (fin-overview.js)

Entregas principais, de cima pra baixo na tela:

- KPIs: saldo do mês, total investido, cartão de crédito, saldo acumulado no ano
- **Validador (mês)**: orçado × realizado do mês selecionado, em árvore expansível (Entradas/Saídas/Investimentos → grupo → categoria)
- gráfico de evolução mensal (receitas, despesas, net) + donut de despesas por grupo
- painel de cartão de crédito (orçado × realizado por categoria, forma de pagamento crédito)
- **Resumo do ano** (`_renderValidadorAnual` + `_renderAnnualSummaryStrip`), no rodapé — ver seção 7.1

Interações:

- clique na linha mensal filtra a tela por mês
- clique no donut filtra por categoria
- filtros ativos aparecem em barras dedicadas com botão de limpar

### 7.1 Resumo do ano

Pensado pra dar uma visão direta e enxuta do ano inteiro, sem o ruído do detalhe mensal. Fica em duas partes:

**Entradas / Saídas lado a lado** (`#fin-validador-anual-entradas` / `#fin-validador-anual-saidas`)
- Cada uma é uma tabela orçado × realizado, mas **achatada**: mostra os itens (categorias-folha) direto, sem os grupos intermediários (ex.: não mostra "Bonus" ou "Pontual" como uma linha própria — os filhos aparecem soltos).
- Ordenação: realizado desc primeiro; empate (ou realizado zerado) desempata por orçado desc — `_flatFinRowsHtml`.
- Exceção hard-coded: o grupo **"Travel"** não é achatado — fica consolidado numa linha só (soma de Food/Hotel/Transport/etc.), porque tem orçamento próprio. A lista de grupos que ficam "não achatados" é `_ANNUAL_KEEP_GROUPED` no topo de `fin-overview.js` — pra manter mais algum grupo assim, é só adicionar o nome ali.
- **Categoria "Salario" (Entradas) e "Recorrente" (Saídas) são excluídas por completo** da tabela e do total — é ruído previsível que a pessoa não queria ver nesse resumo. Os totais de "Entradas"/"Saídas" mostrados já refletem só o que fica visível (não incluem o que foi escondido).
- Orçado anual usa **só** orçamentos cadastrados como anuais (`orcamento_financeiro.mes = null`) válidos pra aquele ano — **não** projeta orçamento mensal recorrente × 12 (isso inflava o número quando um orçamento mensal antigo de anos anteriores era "carregado pra frente" indefinidamente). Ver `_effectiveOrcamentoAnual(ano)` em `fin-core.js`.

**Saldo do ano + Year Bills** (`#fin-annual-summary-strip`)
- Investimentos foi removido inteiramente dessa visão (a aba Investimentos já cobre isso em detalhe) — o único número de investimento que sobra aqui é o saldo atual da caixinha **Year Bills**, mostrado como um card simples (`_renderAnnualSummaryStrip`).
- Ao lado, um card com o saldo do ano (receita − despesa, já refletindo as exclusões acima).

## 8. Módulo Lançamentos (fin-lancamentos.js)

Funcionalidades:

- tabela de lançamentos com filtros por:
  - mês
  - categoria
  - tipo
  - forma de pagamento
  - descrição
- resumo filtrado (receitas, despesas, saldo)
- exclusão de lançamento (`deleteLancamentoFin`)

Detalhes:

- o select de categoria é reconstruído por folhas da árvore de categorias
- render considera hierarquia para exibir breadcrumb `Grupo > Categoria`

## 9. Módulo Investimentos e Indicadores (fin-investimentos.js)

Funcionalidades:

- cards por ativo de investimento com visual compacto:
  - saldo atual
  - `Δ M/M` (variação mensal, com cor positiva/negativa)
  - `Líquido` (aportes - resgates no período desde a última entrada de saldo)
  - `Rend.` (rendimento no mesmo período, em estilo neutro)
- cards de indicadores não financeiros
- gráfico de investimentos em painel duplo (linha total + barras de fluxo/rendimento)
- resumo no topo direito do gráfico de investimentos (`Δ Total`, `Líquido`, `Rend.`) atualizado pelos filtros ativos
- gráfico de indicadores ao lado dos cards de indicadores (cards em coluna)
- filtro por mês e por card selecionado

Regras:

- separa investimentos financeiros de indicadores (ramo id 78 e descendentes)
- usa "último snapshot até o mês" para compor cards
- na primeira abertura, força o mês do último snapshot de investimentos (evita abrir em mês sem dados)

## 10. Módulo Viagens (fin-viagens.js)

Funcionalidades:

- lista de viagens em cards accordion
- tabela de lançamentos por viagem
- donut por categoria de gasto em viagens
- barra por viagem
- cross-filter entre donut e barra
- ações:
  - renomear viagem
  - desvincular lançamento da viagem

## 11. Modais e CRUD (fin-modals.js)

`openFinModal(type)` alterna um dos formulários:

- lançamento
- orçamento
- investimento
- indicador
- categoria

Submissões disponíveis:

- `submitLancamento`
- `submitOrcamento`
- `submitInvestimento`
- `submitIndicador`
- `submitCategoria`

Após cada sucesso:

1. fecha modal
2. recarrega dados da seção (`initFinancesSection`)
3. exibe toast de confirmação

### 11.1 Dropdowns de categoria — só folhas, com caminho completo

`populateFinCatSelect()` (lançamento/orçamento/investimento) e `_populateDebitoInvestSelect()` (regras de débito) só listam categorias **folha** (que não são pai de nenhuma outra), rotuladas com o caminho todo (`_finCatPathLabelRel` / `_finCatPathLabel`) — ex.: "Patrimonio › Year Bills" em vez de só "Year Bills" perdido entre nós de grupo como "Investimento"/"Patrimonio". Isso existe porque antes dava pra selecionar sem querer um nó de agrupamento em vez da conta/categoria real.

A **exceção** é `_populateDebitoOrigemSelect()` (despesa de origem, no modal de Regras de débito): ali grupos continuam aparecendo de propósito — uma regra num grupo (ex.: "Home") cobre qualquer despesa nova dentro dele por herança, então restringir a folhas quebraria esse uso.

### 11.2 Transparência do fallback "Year Bills"

O modal de Regras de débito (`_renderDebitoInvestimentoRules`) mostra, além das regras cadastradas, uma segunda lista: despesas não recorrentes que **não têm regra própria nem herdada** de nenhum grupo pai — essas caem automaticamente na caixinha "Year Bills" (ou equivalente) no cálculo de rendimento. Antes disso era preciso abrir o banco pra descobrir por que um valor foi parar lá; agora fica visível na própria tela.

## 12. Fonte de dados (Supabase via `api.js`)

Leitura:

- `fetchFinancasCodigos()`, `fetchLancamentos()`, `fetchOrcamento()`, `fetchInvestimentos()`, `fetchViagens()`, `fetchDebitoInvestimento()`

Escrita:

- `postFinancaCodigo()`, `postLancamento()`, `postOrcamento()`, `postInvestimento()`, `postIndicador()`, `postDebitoInvestimento()`

Remoção:

- `deleteFinancaCodigo(id)`, `deleteLancamento(id)`, `deleteOrcamento(id)`, `deleteInvestimento(id)`, `deleteDebitoInvestimento(cdFinancaOrigem)`, `unlinkViagem(cdLancamento)`

Atualização:

- `patchLancamentoDate(id, novaData)`, `patchCheckinDate`/`patchExercicioDate` (outras páginas), `renameViagem(cdLancamento, novoNome)`

Nenhuma dessas é um endpoint HTTP escrito à mão — são todas funções em `FrontEnd/shared/js/api.js` que chamam `supabase-js` direto (ver [04-BACKEND.md](04-BACKEND.md)).

## 13. Checklist de manutenção

1. Garantir limpeza de charts ao trocar seção (`destroyFinanceCharts`).
2. Validar filtros cruzados overview/viagens após mudanças visuais.
3. Revalidar árvore de categorias ao alterar estrutura de `codigos`.
4. Conferir pin de acesso ao mover lógica de navegação.
5. Testar todos os formulários de modal após qualquer ajuste de campos.

## 14. Testes manuais recomendados

1. Entrar em Finances com PIN incorreto e correto.
2. Criar lançamento, filtrar e excluir.
3. Criar orçamento e validar painel orçado vs realizado.
4. Registrar snapshot de investimento e conferir card + gráfico.
5. Aplicar cross-filter em viagens (categoria <-> viagem).
