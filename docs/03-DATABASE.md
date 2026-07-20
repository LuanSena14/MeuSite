# 3. Documentação do Banco de Dados - BodyLog

## 📊 Visão Geral

O BodyLog usa **PostgreSQL**, hospedado como um projeto **Supabase** (não mais Render/Neon com backend próprio). O Supabase expõe automaticamente cada tabela como um endpoint REST via **PostgREST** — o frontend fala com o banco através do cliente `supabase-js`, sem nenhum servidor de aplicação no meio.

Armazena:
- Métricas corporais (peso, gordura, músculo, etc.)
- Registro de exercícios e treinos
- Transações, orçamento e investimentos financeiros

> **Goals não tem mais tabelas no Supabase.** As tabelas `codigo_goals`, `entrada_goals`
> e `pontuacao_goal` existiam no schema antigo (Render/Neon) mas foram deixadas de fora
> de propósito na migração — a seção Goals hoje é um iframe que embute um app externo
> (veja [09-PAGE-GOALS.md](09-PAGE-GOALS.md)). Se um dia quiser um sistema de metas nativo
> de novo, terá que desenhar o schema do zero.

### Características Principais
- ✅ **Fonte da verdade do schema:** [`supabase/schema.sql`](../supabase/schema.sql) na raiz do repo
- ✅ **ACID Compliant** (Postgres)
- ✅ **Relacional** (Foreign Keys, Constraints)
- ✅ **Row Level Security (RLS)** faz o papel que a validação de backend fazia antes
- ✅ **Sem ORM** — todo acesso é via `supabase-js` em `FrontEnd/shared/js/api.js`

---

## 🏗️ Estrutura Geral do Banco

### Tabelas por Módulo

| Módulo | Tabelas |
|--------|---------|
| **Body (Métricas)** | `unidade_medida`, `codigo_medida`, `checkins` |
| **Exercises (Treinos)** | `codigo_exercicio`, `entrada_exercicio` |
| **Finances (Finanças)** | `codigo_financa`, `lancamento_financeiro`, `orcamento_financeiro`, `snapshot_investimento`, `relacionamento_debito_investimento`, `relacionamento_lancamento_viagem` |

**Total:** 11 tabelas (Goals fica de fora, ver acima).

---

## 🔐 Row Level Security (RLS)

Toda tabela tem RLS habilitado com uma única policy aberta, já que é um app pessoal sem login:

```sql
alter table checkins enable row level security;

create policy "public_full_access" on checkins
  for all to anon, authenticated
  using (true)
  with check (true);
```

Isso libera `select`/`insert`/`update`/`delete` pra qualquer requisição autenticada com a chave `anon`/`publishable` — que é a mesma chave exposta no frontend (`FrontEnd/shared/js/supabase-client.js`). Não há verificação de usuário porque não existe conceito de usuário/login no app. Se algum dia precisar de multiusuário, as policies precisam ser reescritas para checar `auth.uid()`.

---

## 📋 Dicionário Completo de Tabelas

### 1️⃣ UNIDADE_MEDIDA (Unidades de Medição)

```sql
create table unidade_medida (
  id    integer generated always as identity primary key,
  sigla varchar not null,           -- "kg", "cm", "mm", "%"
  nome  varchar                     -- "quilograma", "centímetro"
);
```

| id | sigla | nome |
|----|----- |------|
| 1 | kg | quilograma |
| 2 | cm | centímetro |
| 3 | mm | milímetro |
| 4 | % | percentual |
| 5 | hrs | horas |
| 6 | min | minutos |

**Propósito:** reutilizar definições de unidade em vez de duplicar strings.

---

### 2️⃣ CODIGO_MEDIDA (Hierarquia de Métricas)

```sql
create table codigo_medida (
  id            integer generated always as identity primary key,
  descricao     varchar not null,        -- "Peso", "Gordura", "Altura"
  cd_pai        integer references codigo_medida(id),     -- null se é categoria raiz
  id_unidade    integer references unidade_medida(id),
  nome_exibicao varchar
);
```

**Exemplo de Hierarquia:**
```
├── Bioimpedância (cd_pai=NULL)
│   ├── peso, gordura, massa_muscular, altura, agua, gordura_visceral
├── Dobras Cutâneas (cd_pai=NULL)
│   └── dobra_triceps, dobra_supra, dobra_panturrilha, ...
├── Circunferências (cd_pai=NULL)
│   └── circ_punho, circ_coxa, cintura, quadril, ...
└── Bem-estar (cd_pai=NULL)
    └── sono, movimento, exercicio, rmr, vo2
```

**Propósito:** permitir organização em grupos. Em `api.js`, `fetchMedidas()` só retorna as folhas (`cd_pai != null`) agrupadas pelo pai.

---

### 3️⃣ CHECKINS (Histórico de Métricas)

```sql
create table checkins (
  id        integer generated always as identity primary key,
  date      date not null,
  cd_medida integer not null references codigo_medida(id),
  valor     float not null
);

create index idx_checkins_date   on checkins(date);
create index idx_checkins_medida on checkins(cd_medida);
```

**Query equivalente ao que `fetchCheckins()` faz** (o agrupamento por data acontece em JS, não em SQL):
```sql
select date, valor, cd_medida
from checkins c
join codigo_medida m on m.id = c.cd_medida
where m.cd_pai is not null
order by date;
```

---

### 4️⃣ CODIGO_EXERCICIO (Hierarquia de Exercícios)

```sql
create table codigo_exercicio (
  id        integer generated always as identity primary key,
  descricao varchar not null,
  cd_pai    integer references codigo_exercicio(id)
);
```

**Exemplo:** Legs, Upper, Full Body, Core, Push, Pull, Back (filhos de "Gym"); Running, Bike, Walking (filhos de "Aerobics"); etc.

---

### 5️⃣ ENTRADA_EXERCICIO (Histórico de Treinos)

```sql
create table entrada_exercicio (
  id           integer generated always as identity primary key,
  data         date not null,
  hora         time not null,
  cd_exercicio integer not null references codigo_exercicio(id),
  duracao      integer,      -- minutos
  esforco      integer       -- 1-10
);

create index idx_entrada_exercicio_data      on entrada_exercicio(data);
create index idx_entrada_exercicio_exercicio on entrada_exercicio(cd_exercicio);
```

> ⚠️ Essa tabela já passou de 1000 linhas em produção. O Supabase/PostgREST
> limita cada `select` a 1000 linhas por padrão — `fetchExercicios()` em `api.js`
> usa `_fetchAllPaginated()` (loop com `.range()`) pra não perder dados. Qualquer
> nova query direta sobre essa tabela precisa considerar isso.

---

### 6️⃣ CODIGO_FINANCA (Hierarquia de Categorias Financeiras)

```sql
create table codigo_financa (
  id     integer generated always as identity primary key,
  nome   varchar not null,
  cd_pai integer references codigo_financa(id)   -- null para raízes (Receita/Despesa/Investimento)
);
```

**Hierarquia (estado atual em produção):**
```
├── Receita (cd_pai=NULL)
│   ├── Salario
│   └── Bonus → PLR 1, PLR 2, 13o 1, 13o 2, Vocation, IR, Invest, Unforeseen
├── Despesa (cd_pai=NULL)
│   ├── Recorrente → Obrigatória (Energy, Internet, Gym, ...), Luxo (Fut, Date, Subscription, ...)
│   ├── Variavel  (hoje sem filhos diretos — legado)
│   ├── Pontual   → Home (Compras Casa, Amortizacao, ...), Travel (Food, Hotel, Transport, ...), Wanted, IPVA, ...
│   └── Caixinha  → Unforeseen, Emergency
└── Investimento (cd_pai=NULL)
    └── Patrimonio → Emergency CDB, Nu Invest, Year Bills, Changing, FGTS, Caminhos

└── Não Financeiros (cd_pai=NULL, raiz separada — usado só pelos "Indicadores": Livelo, Vivo Easy, Serasa, credito_celular)
```

**Regra de derivação de "tipo":** não existe uma coluna `tipo`. `_deriveTipo(id, lookup)` em `api.js` sobe a árvore recursivamente até achar o nó raiz (`cd_pai == null`) e usa o nome dele em minúsculo (`receita`/`despesa`/`investimento`/`não financeiros`).

---

### 7️⃣ LANCAMENTO_FINANCEIRO (Transações Diárias)

```sql
create table lancamento_financeiro (
  id              integer generated always as identity primary key,
  data            date not null,
  cd_financa      integer not null references codigo_financa(id),
  valor           float not null,
  descricao       varchar,
  forma_pagamento varchar default 'debito'
);

create index idx_lancamento_data           on lancamento_financeiro(data);
create index idx_lancamento_financa        on lancamento_financeiro(cd_financa);
create index idx_lancamento_data_categoria on lancamento_financeiro(data, cd_financa);
```

> ⚠️ Mesma observação de paginação da tabela `entrada_exercicio` — já passa de 1000
> linhas. `fetchLancamentos()` e o cálculo de investimentos em `api.js` usam
> `_fetchAllPaginated()`.

---

### 8️⃣ ORCAMENTO_FINANCEIRO (Orçamentos)

```sql
create table orcamento_financeiro (
  id              integer generated always as identity primary key,
  ano             integer not null,
  mes             integer,          -- NULL = orçamento anual
  cd_financa      integer not null references codigo_financa(id),
  valor_orcado    float not null,
  forma_pagamento varchar
);
```

**Duas semânticas coexistem** (ver `_effectiveOrcamento` vs `_effectiveOrcamentoAnual` em `fin-core.js`):
- `mes` preenchido → orçamento daquele mês específico; "carrega pra frente" se não houver um mais recente (útil pra orçamento recorrente).
- `mes = NULL` → orçamento anual "de verdade", usado isoladamente pelo resumo anual do Overview (não é somado/multiplicado com os orçamentos mensais).

---

### 9️⃣ SNAPSHOT_INVESTIMENTO (Saldo Periódico)

```sql
create table snapshot_investimento (
  id         integer generated always as identity primary key,
  data       date not null,
  cd_financa integer not null references codigo_financa(id),
  saldo      float not null
);
```

**Uso duplo:** guarda tanto saldos de investimento de verdade (categorias sob `Investimento`) quanto valores de "indicadores" não financeiros (categorias sob `Não Financeiros`, id 78 — Livelo, Serasa, etc). O código filtra por `_getDescendantIds(78)` pra separar os dois usos.

---

### 🔟 RELACIONAMENTO_DEBITO_INVESTIMENTO

```sql
create table relacionamento_debito_investimento (
  cd_financa_origem       integer primary key references codigo_financa(id),
  cd_financa_investimento integer not null references codigo_financa(id)
);
```

Define de qual caixinha de investimento uma despesa não recorrente deve ser debitada (usado no cálculo de rendimento, pra separar aporte/resgate de rendimento real). Regras podem apontar tanto pra uma categoria-folha de despesa quanto pra um grupo inteiro (ex.: "Home" ou "Caixinha") — nesse caso a regra vale por herança pra qualquer filho sem regra própria. Se uma despesa elegível não tem regra (própria ou herdada), o sistema assume a caixinha "Year Bills" como fallback.

---

### 1️⃣1️⃣ RELACIONAMENTO_LANCAMENTO_VIAGEM

```sql
create table relacionamento_lancamento_viagem (
  cd_lancamento integer primary key references lancamento_financeiro(id),
  nome_viagem   varchar not null
);
```

Associa um lançamento a uma viagem (1:1). Usado na aba Viagens pra agrupar gastos.

---

## 🔗 Diagrama Entidade-Relacionamento (simplificado)

```
unidade_medida ──1:N──> codigo_medida ──1:N──> checkins

codigo_exercicio (auto-ref, árvore) ──1:N──> entrada_exercicio

codigo_financa (auto-ref, árvore)
   ├──1:N──> lancamento_financeiro ──1:1──> relacionamento_lancamento_viagem
   ├──1:N──> orcamento_financeiro
   ├──1:N──> snapshot_investimento
   └──1:1──> relacionamento_debito_investimento (origem e destino são ambos codigo_financa)
```

---

## 📊 Constraints & Índices

- Toda tabela tem `id integer generated always as identity primary key` (substitui o antigo `SERIAL`/autoincrement do SQLAlchemy).
- Foreign keys garantem integridade referencial entre `codigo_*` e suas tabelas de entrada/lançamento.
- Índices em colunas de data e nas FKs mais consultadas (ver cada tabela acima).

---

## 🛠️ Como alterar o schema

Não existe migration tool (Alembic, etc). O processo manual é:

1. Rodar o `ALTER TABLE`/`CREATE TABLE` direto no projeto Supabase (SQL Editor do dashboard, ou uma conexão Postgres direta com a connection string do projeto).
2. Atualizar [`supabase/schema.sql`](../supabase/schema.sql) pra refletir a mudança (é só um registro histórico, não é aplicado automaticamente).
3. Se a tabela ganhou/perdeu colunas usadas pelo frontend, atualizar as funções correspondentes em `FrontEnd/shared/js/api.js`.

---

✅ **Próximo:** Veja [04-BACKEND.md](04-BACKEND.md) para entender a camada `api.js` que fala com esse banco.

✅ **Depois:** Explore [05-FRONTEND.md](05-FRONTEND.md) para entender o restante do frontend.
