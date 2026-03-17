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
5. renderiza aba ativa

## 7. Módulo Overview (fin-overview.js)

Entregas principais:

- KPIs: saldo do mês, total investido, cartão de crédito, saldo acumulado no ano
- donut de despesas por grupo
- gráfico de evolução mensal (receitas, despesas, net)
- validador orçado vs realizado
- painel de cartão de crédito
- drill de lançamentos por categoria selecionada

Interações:

- clique na linha mensal filtra a tela por mês
- clique no donut filtra por categoria
- filtros ativos aparecem em barras dedicadas com botão de limpar

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

- cards por ativo de investimento com saldo atual e delta mensal
- cards de indicadores não financeiros
- gráficos de linha temporal para investimentos e indicadores
- filtro por mês e por card selecionado

Regras:

- separa investimentos financeiros de indicadores (ramo id 78 e descendentes)
- usa "último snapshot até o mês" para compor cards

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

## 12. Endpoints usados

Leitura:

- `GET /api/financas/codigos`
- `GET /api/financas/lancamentos`
- `GET /api/financas/orcamento`
- `GET /api/financas/investimentos`
- `GET /api/financas/viagens`

Escrita:

- `POST /api/financas/codigos`
- `POST /api/financas/lancamentos`
- `POST /api/financas/orcamento`
- `POST /api/financas/investimentos`
- `POST /api/financas/indicadores`

Remoção:

- `DELETE /api/financas/codigos/:id`
- `DELETE /api/financas/lancamentos/:id`
- `DELETE /api/financas/orcamento/:id`
- `DELETE /api/financas/investimentos/:id`
- `DELETE /api/financas/viagens/:cd_lancamento` (desvincular)

Atualização:

- `PATCH /api/financas/viagens/:cd_lancamento` (renomear)

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
