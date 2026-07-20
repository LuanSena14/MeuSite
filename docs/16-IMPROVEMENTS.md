# 16. IMPROVEMENTS.md - Melhorias e Evolucoes Futuras

## Objetivo
Registrar oportunidades de evolucao do BodyLog por horizonte de tempo. Atualizado apos a migracao pra Supabase (sem backend proprio) e a troca de Goals por um iframe mask do MakeIt.

---

## 0) Ja feito (nao e mais sugestao)
- ~~Simplificar a arquitetura tirando o backend~~ — feito: projeto migrou de FastAPI+Postgres (Render/Neon) pra Supabase direto do frontend.
- ~~Repensar a tela de Goals~~ — feito: virou iframe mask do app externo MakeIt em vez de um sistema de pontuacao proprio.

---

## 1) Curto prazo (1-3 meses)
### 1.1 Autenticacao real
- Hoje nao ha login — RLS libera tudo pra chave anon, e o PIN de Finances e so uma cortina de UI.
- Se precisar de protecao de verdade (ex.: compartilhar o app com mais alguem sem expor tudo), o caminho e **Supabase Auth**: login por email/senha, e policies de RLS que checam `auth.uid()` em vez de `using (true)`.
- Impacto: seguranca real, possibilidade de multiplos usuarios com dados separados.

### 1.2 Exportacao de dados
- CSV para check-ins, exercicios e financas.
- Como nao ha mais backend, isso e so JavaScript no navegador (montar CSV a partir do array já carregado por `api.js` e disparar um download) — mais simples que antes.

### 1.3 Melhorias de UX
- Melhor feedback de erro (a mensagem crua do Postgres/PostgREST as vezes vaza pro toast).
- Estados de loading mais claros por secao.

### 1.4 Limpeza do código morto de Goals
- `goals.js`, `goals.css`, `goals-modal.html` e o "+ dia" na Home ainda existem, inertes (ver [09-PAGE-GOALS.md](09-PAGE-GOALS.md)). Vale remover de vez se ninguem pretende reaproveitar esse código.

---

## 2) Medio prazo (3-6 meses)
### 2.1 Tipagem forte no frontend
- Migrar JavaScript para TypeScript nos modulos mais criticos: `shared/js/api.js`, `shared/js/app.js`, `pages/finances/*`.
- Ainda mais relevante agora que `api.js` carrega toda a logica de negocio que antes tinha Pydantic validando no backend.

### 2.2 Testes automatizados
- Frontend: testes de funcoes puras em `api.js` (ex.: `_deriveTipo`, `_buildFinValidadorTree`, calculo de rendimento) — sao funcoes JS isoladas, faceis de testar sem mockar rede.
- Não há mais "testes de rota" (não existe rota) — o equivalente e testar contra o Supabase real (ou um projeto Supabase de staging).

### 2.3 Hardening de RLS
- Revisar se alguma tabela merece uma policy mais restritiva que "libera tudo" — hoje é aceitável por ser app pessoal sem login, mas se ganhar mais usuários isso muda.

---

## 3) Longo prazo (6+ meses)
### 3.1 Insights inteligentes
- Sugestoes baseadas em historico (tendencia de peso, consistencia de treino, projeções de gasto).

### 3.2 Aplicativo mobile
- Reaproveitar `api.js`/Supabase com um cliente mobile (React Native, Flutter, etc. — o Supabase tem SDKs pra ambos).

### 3.3 Sistema de metas nativo (se quiser trocar o iframe mask)
- Desenhar tabelas novas no Supabase pra Goals (o schema antigo removido pode servir de referência histórica).
- Reimplementar `fetchGoalsCodigos`/`fetchGoalsMetas`/`fetchGoalsEntradas`/`postGoalEntrada` em `api.js`.

---

## 4) Refatoracoes recomendadas

### Frontend
- Extrair utilitarios comuns de data/formatacao pra `shared/js`.
- Reduzir acoplamento entre modulos de financas (`fin-*.js` compartilham bastante estado global em `window.fin*`).
- Padronizar nome de funcoes e contratos de retorno em `api.js` (`{ ok: true }` vs retornar o registro criado, por exemplo).

### Banco (Supabase)
- Adotar alguma ferramenta de migration versionada (ex.: Supabase CLI + `supabase migration`) em vez de aplicar SQL manualmente e atualizar `schema.sql` à mão.
- Revisar índices periodicamente conforme volume cresce (`entrada_exercicio` e `lancamento_financeiro` já passam de 1000 linhas).

---

## 5) Priorizacao sugerida
- Alto impacto + baixo esforco: executar primeiro.
- Alto impacto + alto esforco: quebrar em entregas menores.

Primeiros candidatos:
1. Decidir o destino do código morto de Goals (limpar ou documentar como "propositalmente mantido").
2. Testes basicos das funções de `api.js` mais críticas (financas).
3. Exportacao CSV em home/body/financas.

---

## 6) Definicao de pronto para melhorias
Uma melhoria so entra como concluida quando:
- Possui criterio de aceite claro.
- Tem validacao manual minima documentada (idealmente testada no navegador de verdade, não só lida no código).
- Nao quebra fluxos existentes.
- Esta refletida na documentacao do modulo afetado.
