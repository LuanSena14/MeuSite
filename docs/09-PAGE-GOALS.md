# 09. PAGE-GOALS.md - Página Goals

## 1. O que é hoje

Goals **não é mais uma página própria do BodyLog** — é uma "máscara": um `<iframe>` que embute um app externo chamado **MakeIt** (`https://make-it-nine-delta.vercel.app/app.html`), um goal-tracker separado com seu próprio front-end e seu próprio projeto Supabase.

> O sistema antigo de metas (score mensal, calendário heatmap, pontuação diário/semanal/mensal)
> foi descontinuado junto com a migração pro Supabase — as tabelas `codigo_goals`,
> `entrada_goals` e `pontuacao_goal` não existem mais no banco. O código antigo
> (`goals.js`) ainda está no repositório, mas está inerte (ver seção 4).

## 2. Arquivos envolvidos

- `FrontEnd/pages/goals/goals.html` — hoje é só o `<iframe>`
- `FrontEnd/pages/goals/goals.css` — CSS pro iframe ocupar a área toda + CSS morto do dashboard antigo
- `FrontEnd/pages/goals/goals.js` — código do dashboard antigo, hoje inerte (ver seção 4)
- `FrontEnd/shared/js/nav.js` — meta da seção (sem botão de ação rápida)

## 3. `goals.html`

```html
<div id="goals-mask">
  <iframe
    id="goals-mask-frame"
    src="https://make-it-nine-delta.vercel.app/app.html"
    title="MakeIt"
    loading="lazy"
  ></iframe>
</div>
```

E o CSS correspondente em `goals.css` remove o padding/max-width padrão de `.section` só para essa seção, pra o iframe ocupar toda a área de conteúdo:

```css
#section-goals { padding: 0; max-width: none; height: 100%; }
#goals-mask { height: 100%; min-height: 600px; }
#goals-mask-frame { display: block; width: 100%; height: 100%; border: 0; }
```

O MakeIt não tem `X-Frame-Options`/CSP que bloqueie ser embutido em iframe, então isso funciona sem nenhuma configuração adicional do lado deles.

## 4. Por que `goals.js` não foi deletado

`goals.js` (o dashboard antigo: score mensal, calendário, modal de registro diário) continua no repositório porque:
- `pages/home/home.js` ainda referencia `initGoalsSection()` e `openGoalsModal()` num atalho antigo de "registrar dia" que existia no card de Goals da Home.
- `initGoalsSection()` tem uma guarda no topo que faz ela não fazer nada quando o dashboard antigo não existe mais no DOM:
  ```javascript
  async function initGoalsSection(forceRefresh = false) {
    if (!document.getElementById('goals-overview')) return
    ...
  }
  ```
  Isso evita um erro de `Cannot set properties of null` quando essa função é chamada (ela tentaria manipular elementos como `#goals-overview` que só existiam no HTML antigo).
- `openGoalsModal()`/`goals-modal.html` (modal de "+ registrar dia") ainda tecnicamente funcionam, mas mostram uma lista vazia de metas (porque `fetchGoalsCodigos()` sempre retorna `[]` — ver [04-BACKEND.md](04-BACKEND.md)). Não é usado por nenhum botão visível hoje (o atalho na sidebar/topbar foi removido), mas o card "+ dia" na Home ainda existe.

Se um dia decidir remover esse código morto de vez, os pontos de entrada a limpar são: `home.js` (`_homeOpenGoalsAdd`, referências a `goalsMetas`/`goalsEntradas`), `pages/home/home.html` (botão "+ dia" do card de Goals), e então `goals.js`/`goals.css`/`goals-modal.html` inteiros.

## 5. Dados

Nenhum. A seção não faz nenhuma chamada ao Supabase do BodyLog — todo o estado (login, metas, indicadores, histórico) vive dentro do iframe, que fala com o Supabase **do MakeIt** (projeto diferente, credenciais diferentes).

## 6. Manutenção

- Trocar a URL do app embutido: editar o `src` do iframe em `goals.html`.
- Se o MakeIt um dia adicionar `X-Frame-Options`/CSP restritiva, o iframe para de carregar — não há workaround do lado do BodyLog além de pedir pra tirar essa restrição no MakeIt.
- Se quiser voltar a ter um sistema de metas nativo no BodyLog, o caminho é: desenhar tabelas novas no Supabase (schema antigo em `docs/03-DATABASE.md` de versões anteriores do repo pode servir de referência), reimplementar `fetchGoalsCodigos`/`fetchGoalsMetas`/`fetchGoalsEntradas`/`postGoalEntrada` em `api.js`, e decidir se reaproveita ou reescreve `goals.js`.
