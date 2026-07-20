# 15. MAINTENANCE.md - Guia de Manutencao do Sistema

## Objetivo
Ajudar a manter o BodyLog estavel no dia a dia: monitorar, depurar e prevenir incidentes. Sem backend proprio, boa parte da manutencao operacional (logs de servidor, restart de processo, atualizacao de dependencias Python) deixou de existir — o que sobra e sobretudo sobre o Supabase e o frontend estatico.

---

## 1) Checklist de saude
- Supabase responde: testar uma query simples no Console do navegador (`await sb.from('checkins').select('id').limit(1)`).
- Frontend sem erros criticos: revisar Console e Network no navegador.
- RLS ainda liberando o esperado: se uma tela ficar vazia sem erro, suspeitar de policy de RLS antes de suspeitar do frontend.

```javascript
// Console do navegador, com o BodyLog aberto:
await sb.from('checkins').select('id').limit(1)
await sb.from('lancamento_financeiro').select('id').limit(1)
```

---

## 2) Monitoramento e observabilidade

### Supabase
- Dashboard do projeto → **Database → Logs** mostra queries e erros do Postgres/PostgREST.
- Dashboard → **Reports** mostra uso de API, banda e storage (relevante nos planos gratuitos, que têm limites).

### Frontend
- Sem servidor de logs — o que acontece no navegador do usuário fica só lá (Console/Network do F12). Não há telemetria central configurada.

### Banco de dados
```sql
SELECT COUNT(*) FROM checkins;
SELECT COUNT(*) FROM entrada_exercicio;
SELECT COUNT(*) FROM lancamento_financeiro;

EXPLAIN ANALYZE
SELECT * FROM checkins
WHERE date BETWEEN DATE '2026-01-01' AND DATE '2026-12-31'
ORDER BY date DESC;
```

---

## 3) Depuracao (debug)

### Frontend
- Console (F12): erros em vermelho e stack trace.
- Network: toda chamada de dado aparece como `GET/POST .../rest/v1/<tabela>` — confira status HTTP e o corpo da resposta (o PostgREST devolve mensagens de erro razoavelmente claras, inclusive de violação de RLS/constraint).
- **401/403** costuma ser RLS bloqueando; **404** normalmente é nome de tabela/coluna errado; **409** é violação de constraint (ex.: FK inexistente).

### Lógica de negócio
Como não há mais backend, toda regra (agregações, hierarquia de categorias, cálculo de rendimento) mora em `FrontEnd/shared/js/api.js` — é lá que se depura, não em nenhum servidor.

---

## 4) Atualizacao de dependencias

### JavaScript
- O projeto e vanilla; a unica dependencia externa relevante e `supabase-js` e o Chart.js, ambos via CDN.
- Ao trocar a versao do CDN de `supabase-js` (ex.: de `@2` pra `@3`, se um dia existir), validar todas as chamadas de `api.js` — mudanças de major version de client libraries costumam alterar a assinatura de métodos.

### Supabase
Não há "dependência" pra atualizar no sentido tradicional — o Supabase gerencia a versão do Postgres/PostgREST. Fique de olho em changelogs do Supabase se notar comportamento diferente após deploys deles.

---

## 5) Performance tuning

### Indices recomendados
```sql
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_entrada_exercicio_data ON entrada_exercicio(data);
CREATE INDEX IF NOT EXISTS idx_lancamento_data ON lancamento_financeiro(data);
```
(já existem no schema atual — ver [`supabase/schema.sql`](../supabase/schema.sql); útil só se criar uma tabela nova).

### Limite de 1000 linhas do PostgREST
Se uma tela mostrar dados "cortados" sem nenhum erro (ex.: contagem menor do que o esperado), o primeiro suspeito é uma tabela que passou de 1000 linhas e não está usando `_fetchAllPaginated()` em `api.js`. Ver [04-BACKEND.md](04-BACKEND.md).

### Sinais de alerta
- Tela demorando muito pra carregar → normalmente é volume de dados + falta de paginação, não "servidor lento" (não há servidor).
- Consultas com `Seq Scan` frequente (visível no Logs do Supabase) em tabela grande → considerar índice novo.

---

## 6) Limpeza e arquivamento
Antes de qualquer limpeza, faca backup.

```bash
pg_dump "postgresql://postgres:SENHA@db.<projeto>.supabase.co:5432/postgres" > backup_before_cleanup.sql
```

---

## 7) Seguranca operacional
- A chave anon/publishable em `supabase-client.js` é pública por design — não é segredo pra proteger.
- A chave `service_role` (secret) **nunca** deve ir pro frontend nem ser commitada — só usar em scripts locais/administrativos.
- Revisar periodicamente as policies de RLS — são elas que de fato protegem os dados.
- `FINANCES_PIN` em `nav.js` é só UI, não conta como controle de acesso real.

---

## 8) Erros comuns e resposta rapida
| Sintoma | Causa provavel | Acao inicial |
|---|---|---|
| Tela vazia, sem erro no console | RLS bloqueando o `select` | Conferir policy da tabela no Supabase |
| `401`/`403` no Network | Chave errada ou RLS restritiva | Conferir `supabase-client.js` e a policy |
| Contagem de itens menor que o esperado | Tabela passou de 1000 linhas sem paginação | Adicionar `_fetchAllPaginated()` na query em `api.js` |
| `409` ao inserir | Violação de FK/constraint | Conferir se o ID referenciado existe |
| Grafico vazio | Sem dados ou filtro invalido | Validar retorno da função de `api.js` no Console |

---

## 9) Rotina sugerida de manutencao
- Semanal: checar Logs do Supabase por erros recorrentes + testar 2-3 telas manualmente.
- Mensal: revisar uso/limites do plano Supabase (Reports do dashboard).
- Backup antes de qualquer alteração de schema.

Se ocorrer incidente:
1. Reproduzir no navegador (Console + Network).
2. Isolar: é RLS, é dado, ou é lógica de `api.js`?
3. Corrigir com rollback possivel (Git pro frontend, backup SQL pro dado).
4. Registrar causa raiz.
