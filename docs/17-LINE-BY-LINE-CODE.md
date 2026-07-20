# 17. LINE-BY-LINE-CODE.md - Guia completo linha a linha

## Objetivo
Este guia funciona como indice. A explicacao linha a linha detalhada foi separada em arquivos menores.

## ⚠️ Aviso de desatualização
Os arquivos de `backend/` (`database.py`, `main.py`, `models.py`) foram **removidos** deste índice e do disco — o backend Python não existe mais no projeto (ver [02-ARCHITECTURE.md](02-ARCHITECTURE.md)).

Os arquivos de frontend abaixo que mudaram bastante na migração pra Supabase (**`api.js`**, e em menor grau `goals.js`, `fin-core.js`, `fin-overview.js`, `fin-modals.js`) **não foram re-explicados linha a linha ainda** — as versões linkadas descrevem uma versão anterior do código. Se for estudar algum desses arquivos, prefira ler o código atual direto (ele é razoavelmente comentado) e usar [04-BACKEND.md](04-BACKEND.md)/[10-PAGE-FINANCES.md](10-PAGE-FINANCES.md) como guia de alto nível, em vez de confiar nas explicações linha a linha desatualizadas.

## Como usar
1. Abra o arquivo do modulo que voce quer estudar.
2. Leia no formato: numero da linha + codigo + explicacao.
3. Siga na ordem do arquivo para entender o fluxo real de execucao.
4. Se o arquivo estiver marcado como desatualizado abaixo, confira contra o código atual antes de confiar nos números de linha.

## Arquivos de explicacao linha a linha

| Arquivo | Status |
|---|---|
| [FrontEnd/shared/js/api.js](line-by-line/FrontEnd/shared/js/api.js.md) | ⚠️ desatualizado — arquivo foi reescrito por completo (agora fala com Supabase, não com um backend HTTP) |
| [FrontEnd/shared/js/app.js](line-by-line/FrontEnd/shared/js/app.js.md) | ok |
| [FrontEnd/shared/js/nav.js](line-by-line/FrontEnd/shared/js/nav.js.md) | ⚠️ Goals perdeu o botão de ação rápida na sidebar |
| [FrontEnd/pages/home/home.js](line-by-line/FrontEnd/pages/home/home.js.md) | ok |
| [FrontEnd/pages/body/body.js](line-by-line/FrontEnd/pages/body/body.js.md) | ok |
| [FrontEnd/pages/body/checkin.js](line-by-line/FrontEnd/pages/body/checkin.js.md) | ok |
| [FrontEnd/pages/exercises/exercises.js](line-by-line/FrontEnd/pages/exercises/exercises.js.md) | ok |
| [FrontEnd/pages/goals/goals.js](line-by-line/FrontEnd/pages/goals/goals.js.md) | ⚠️ desatualizado — a página inteira virou um iframe mask, esse código está inerte (ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md)) |
| [FrontEnd/pages/finances/fin-core.js](line-by-line/FrontEnd/pages/finances/fin-core.js.md) | ⚠️ desatualizado — ganhou helpers novos de validador orçado×realizado compartilhado |
| [FrontEnd/pages/finances/fin-overview.js](line-by-line/FrontEnd/pages/finances/fin-overview.js.md) | ⚠️ desatualizado — ganhou o resumo anual (Entradas/Saídas lado a lado + Year Bills) |
| [FrontEnd/pages/finances/fin-lancamentos.js](line-by-line/FrontEnd/pages/finances/fin-lancamentos.js.md) | ok |
| [FrontEnd/pages/finances/fin-investimentos.js](line-by-line/FrontEnd/pages/finances/fin-investimentos.js.md) | ok |
| [FrontEnd/pages/finances/fin-modals.js](line-by-line/FrontEnd/pages/finances/fin-modals.js.md) | ⚠️ desatualizado — dropdowns de categoria mudaram (só folhas + caminho completo) |
| [FrontEnd/pages/finances/fin-viagens.js](line-by-line/FrontEnd/pages/finances/fin-viagens.js.md) | ok |

## Nota importante
As explicacoes foram escritas para uso didatico e podem ser refinadas em pontos de negocio mais especificos. Se voce quiser, o proximo passo e regenerar as marcadas como desatualizadas contra o código atual.
