# 3. Documentação do Banco de Dados - BodyLog

## 📊 Visão Geral do PostgreSQL

O BodyLog utiliza **PostgreSQL 12+** como banco de dados relacional para armazenar:
- Métricas corporais (peso, gordura, músculo, etc)
- Registro de exercícios e treinos
- Metas e progresso diário
- Transações financeiras e orçamentos
- Snapshots de investimentos

### Características Principais
- ✅ **Open Source** e gratuito
- ✅ **ACID Compliant** (Atomicity, Consistency, Isolation, Durability)
- ✅ **Relacional** (suporta Foreign Keys, Constraints)
- ✅ **Estruturado** via SQLAlchemy ORM no Python
- ✅ **Hospedado no Render.com** (managed service)

---

## 🏗️ Estrutura Geral do Banco

### Tabelas por Módulo

| Módulo | Tabelas |
|--------|---------|
| **Body (Métricas)** | `unidade_medida`, `codigo_medida`, `checkins` |
| **Exercises (Treinos)** | `codigo_exercicio`, `entrada_exercicio` |
| **Goals (Metas)** | `codigo_goals`, `entrada_goals`, `pontuacao_goal` (Meta) |
| **Finances (Finanças)** | `codigo_financa`, `lancamento_financeiro`, `orcamento_financeiro`, `snapshot_investimento`, `relacionamento_lancamento_viagem` |

**Total:** 11 tabelas principais

---

## 📋 Dicionário Completo de Tabelas

### 1️⃣ UNIDADE_MEDIDA (Unidades de Medição)

Armazena unidades padrão usadas nas métricas.

```sql
CREATE TABLE unidade_medida (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla VARCHAR NOT NULL,           -- "kg", "cm", "mm", "%"
  nome  VARCHAR                     -- "quilograma", "centímetro"
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

**Propósito:** Reutilizar definições de unidade em vez de duplicar strings.

---

### 2️⃣ CODIGO_MEDIDA (Hierarquia de Métricas)

Estrutura hierárquica (árvore) de medidas corporais.

```sql
CREATE TABLE codigo_medida (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao     VARCHAR NOT NULL,        -- "Peso", "Gordura", "Altura"
  cd_pai        INTEGER FOREIGN KEY,     -- null se é categoria raiz
  id_unidade    INTEGER FOREIGN KEY,     -- referencia unidade_medida
  nome_exibicao VARCHAR                  -- nome amigável para UI
);
```

**Exemplo de Hierarquia:**
```
├── Bioimpedância (cd_pai=NULL)
│   ├── peso (cd_pai=1)           → unidade: kg
│   ├── gordura (cd_pai=1)        → unidade: kg
│   ├── massa_muscular (cd_pai=1) → unidade: kg
│   └── altura (cd_pai=1)         → unidade: cm
│
├── Dobras Cutâneas (cd_pai=NULL)
│   ├── dobra_triceps (cd_pai=2)      → unidade: mm
│   ├── dobra_supra (cd_pai=2)        → unidade: mm
│   └── ... (mais dobras)
│
└── Bem-estar (cd_pai=NULL)
    ├── sono (cd_pai=7)          → unidade: hrs
    ├── movimento (cd_pai=7)     → unidade: kcal
    └── exercicio (cd_pai=7)     → unidade: min
```

**Propósito:** Permitir organização em grupos e fácil agregação.

---

### 3️⃣ CHECKINS (Histórico de Métricas)

Registra cada medição feita pelo usuário (cada check-in).

```sql
CREATE TABLE checkins (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  date      DATE NOT NULL,                    -- "2026-03-15"
  cd_medida INTEGER NOT NULL FOREIGN KEY,    -- qual métrica
  valor     FLOAT NOT NULL                   -- valor da métrica
);
```

**Exemplo de Dados:**
```
| id | date | cd_medida | valor |
|----|----- |-----------|-------|
| 1 | 2026-03-15 | 1 (peso) | 78.5 |
| 2 | 2026-03-15 | 3 (gordura) | 18.2 |
| 3 | 2026-03-15 | 5 (altura) | 1.78 |
| 4 | 2026-03-14 | 1 (peso) | 78.8 |
```

**Queries Típicas:**
```sql
-- Últimas 10 medições de peso
SELECT * FROM checkins
WHERE cd_medida = 1  -- peso
ORDER BY date DESC
LIMIT 10;

-- Tendência de peso no mês
SELECT DATE, valor FROM checkins
WHERE cd_medida = 1 AND date >= '2026-03-01'
ORDER BY date;
```

---

### 4️⃣ CODIGO_EXERCICIO (Hierarquia de Exercícios)

Estrutura de grupos musculares e exercícios.

```sql
CREATE TABLE codigo_exercicio (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao VARCHAR NOT NULL,
  cd_pai    INTEGER FOREIGN KEY            -- null para grupos raiz
);
```

**Exemplo de Hierarquia:**
```
├── Peito (cd_pai=NULL)
│   ├── Supino (cd_pai=1)
│   ├── Supino Inclinado (cd_pai=1)
│   └── Pec Fly (cd_pai=1)
│
├── Costas (cd_pai=NULL)
│   ├── Puxada Frontal (cd_pai=2)
│   ├── Puxada Lateral (cd_pai=2)
│   └── Remada (cd_pai=2)
│
├── Pernas (cd_pai=NULL)
│   ├── Agachamento (cd_pai=3)
│   ├── Leg Press (cd_pai=3)
│   └── Extensora (cd_pai=3)
```

**Propósito:** Organizar exercícios em categorias para filtros.

---

### 5️⃣ ENTRADA_EXERCICIO (Histórico de Treinos)

Registra cada treino executado.

```sql
CREATE TABLE entrada_exercicio (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  data         DATE NOT NULL,
  hora         TIME NOT NULL,                     -- "14:30:00"
  cd_exercicio INTEGER NOT NULL FOREIGN KEY,
  duracao      INTEGER,                           -- em minutos
  esforco      INTEGER                            -- 1-10 escala
);
```

**Exemplo de Dados:**
```
| id | data | hora | cd_exercicio | duracao | esforco |
|----|------|------|--------------|---------|---------|
| 1 | 2026-03-15 | 14:30:00 | 2 (Supino) | 45 | 8 |
| 2 | 2026-03-15 | 15:20:00 | 5 (Puxada) | 40 | 7 |
| 3 | 2026-03-14 | 14:00:00 | 15 (Agachamento) | 50 | 9 |
```

---

### 6️⃣ CODIGO_GOALS (Hierarquia de Metas)

Define metas disponíveis para rastreamento diário.

```sql
CREATE TABLE codigo_goals (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      VARCHAR NOT NULL,          -- "Beber 3L água", "10k passos"
  cd_pai    INTEGER FOREIGN KEY,       -- null para categoria raiz
  descricao VARCHAR                    -- descricação opcional
);
```

**Exemplo:**
```
├── Saúde (cd_pai=NULL)
│   ├── Beber 3L de água (cd_pai=1)
│   ├── Dormir 8h (cd_pai=1)
│   └── 10k passos (cd_pai=1)
│
├── Produtividade (cd_pai=NULL)
│   ├── Estudar 2h (cd_pai=2)
│   └── Completar tarefa X (cd_pai=2)
```

---

### 7️⃣ ENTRADA_GOALS (Histórico de Metas Diárias)

Registra se cada meta foi atingida a cada dia.

```sql
CREATE TABLE entrada_goals (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  data             DATE NOT NULL,
  cd_goal          INTEGER NOT NULL FOREIGN KEY,
  realizado_no_dia BOOLEAN NOT NULL                -- true/false
);
```

**Exemplo:**
```
| id | data | cd_goal | realizado_no_dia |
|----|------|---------|------------------|
| 1 | 2026-03-15 | 2 (Beber água) | true |
| 2 | 2026-03-15 | 3 (Dormir 8h) | false |
| 3 | 2026-03-14 | 2 (Beber água) | true |
```

---

### 8️⃣ PONTUACAO_GOAL (Meta - Metas Mensais)

Define metas mensais com valores alvo e pontuação.

```sql
CREATE TABLE pontuacao_goal (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  data       DATE,                          -- mês da meta
  tp_metrica VARCHAR NOT NULL,              -- "aderencia", "valor", etc
  cd_goal    INTEGER NOT NULL FOREIGN KEY,
  valor      FLOAT,                         -- valor alvo
  pts        INTEGER,                       -- pontos se atingir
  cd_medida  INTEGER FOREIGN KEY            -- métrica associada (opt)
);
```

**Exemplo:**
```
| id | data | tp_metrica | cd_goal | valor | pts | cd_medida |
|----|------|-----------|---------|-------|-----|-----------|
| 1 | 2026-03 | aderencia | 2 | 95 | 50 | NULL |
| 2 | 2026-03 | aderencia | 3 | 80 | 30 | NULL |
```

---

### 9️⃣ CODIGO_FINANCA (Hierarquia de Categorias Financeiras)

Estrutura em árvore de categorias de receita/despesa/investimento.

```sql
CREATE TABLE codigo_financa (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nome   VARCHAR NOT NULL,            -- "Salário", "Recorrente", etc
  cd_pai INTEGER FOREIGN KEY          -- null para raízes
);
```

**Exemplo de Hierarquia Completa:**
```
├── Receita (id=1, cd_pai=NULL)
│   ├── Salario (id=4, cd_pai=1)
│   └── Bonus (id=5, cd_pai=1)
│
├── Despesa (id=2, cd_pai=NULL)
│   ├── Recorrente (id=6, cd_pai=2)
│   │   ├── Energy (id=11, cd_pai=6)
│   │   ├── Internet (id=12, cd_pai=6)
│   │   └── ...
│   ├── Variavel (id=7, cd_pai=2)
│   │   ├── Market (id=27, cd_pai=7)
│   │   ├── Gas (id=29, cd_pai=7)
│   │   └── Home (id=33, cd_pai=7)
│   │       ├── Compras Casa (id=34, cd_pai=33)
│   │       ├── Taxas Encargos (id=35, cd_pai=33)
│   │       └── Amortizacao (id=36, cd_pai=33)
│   ├── Pontual (id=8, cd_pai=2)
│   │   ├── Wanted (id=37, cd_pai=8)
│   │   └── ...
│   └── Caixinha (id=9, cd_pai=2)
│       ├── Unforeseen (id=45, cd_pai=9)
│       └── Emergency (id=46, cd_pai=9)
│
└── Investimento (id=3, cd_pai=NULL)
    ├── Emergency CDB (id=55, cd_pai=10)
    ├── Nu Invest (id=56, cd_pai=10)
    └── ...
```

**Propósito:** Permitir categorização em múltiplos níveis e análise por grupo.

---

### 🔟 LANCAMENTO_FINANCEIRO (Transações Diárias)

Cada receita, despesa ou investimento registrado.

```sql
CREATE TABLE lancamento_financeiro (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  data             DATE NOT NULL,
  cd_financa       INTEGER NOT NULL FOREIGN KEY,   -- qual categoria
  valor            FLOAT NOT NULL,
  descricao        VARCHAR,
  forma_pagamento  VARCHAR (default: 'debito')    -- "debito", "credito"
);
```

**Exemplo:**
```
| id | data | cd_financa | valor | descricao | forma_pagamento |
|----|------|-----------|-------|-----------|-----------------|
| 1 | 2026-03-15 | 4 (Salário) | 5000.00 | Salário set/2026 | debito |
| 2 | 2026-03-15 | 11 (Energy) | 250.00 | Energia março | debito |
| 3 | 2026-03-15 | 27 (Market) | 450.50 | Compras | credito |
| 4 | 2026-03-15 | 56 (Nu Invest) | 1000.00 | Aplicação CDB | debito |
```

**Queries Típicas:**
```sql
-- Receita total no mês
SELECT SUM(valor) FROM lancamento_financeiro
WHERE cd_financa = 4 AND DATE_TRUNC('month', data) = '2026-03-01';

-- Despesas por categoría
SELECT cd_financa, SUM(valor) as total FROM lancamento_financeiro
WHERE cd_financa IN (SELECT id FROM codigo_financa WHERE cd_pai = 2)
GROUP BY cd_financa;
```

---

### 1️⃣1️⃣ ORCAMENTO_FINANCEIRO (Orçamentos Mensais)

Define orçamento esperado por categoria.

```sql
CREATE TABLE orcamento_financeiro (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  ano              INTEGER NOT NULL,
  mes              INTEGER,                         -- NULL = anual
  cd_financa       INTEGER NOT NULL FOREIGN KEY,
  valor_orcado     FLOAT NOT NULL,
  forma_pagamento  VARCHAR
);
```

**Exemplo:**
```
| id | ano | mes | cd_financa | valor_orcado |
|----|-----|-----|-----------|--------------|
| 1 | 2026 | 3 | 11 (Energy) | 250.00 |
| 2 | 2026 | 3 | 27 (Market) | 500.00 |
| 3 | 2026 | NULL | 6 (Recorrente) | 3500.00 |
```

---

### 1️⃣2️⃣ SNAPSHOT_INVESTIMENTO (Histórico de Investimentos)

Saldo periódico de cada investimento.

```sql
CREATE TABLE snapshot_investimento (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  data       DATE NOT NULL,
  cd_financa INTEGER NOT NULL FOREIGN KEY,    -- qual ativo
  saldo      FLOAT NOT NULL                   -- saldo naquela data
);
```

**Exemplo:**
```
| id | data | cd_financa | saldo |
|----|------|-----------|-------|
| 1 | 2026-03-01 | 55 (Emergency CDB) | 50000.00 |
| 2 | 2026-03-15 | 55 (Emergency CDB) | 50250.00 |
| 3 | 2026-03-01 | 56 (Nu Invest) | 150000.00 |
| 4 | 2026-03-15 | 56 (Nu Invest) | 151500.00 |
```

**Propósito:** Rastrear evolução do patrimônio ao longo do tempo.

---

### 1️⃣3️⃣ RELACIONAMENTO_LANCAMENTO_VIAGEM (Viagens)

Associa lançamentos financeiros a uma viagem.

```sql
CREATE TABLE relacionamento_lancamento_viagem (
  cd_lancamento INTEGER PRIMARY KEY FOREIGN KEY,  -- PK = 1:1
  nome_viagem   VARCHAR NOT NULL                  -- nome da viagem
);
```

**Exemplo:**
```
| cd_lancamento | nome_viagem |
|---------------|------------|
| 100 | Praia 2026 |
| 101 | Praia 2026 |
| 102 | Praia 2026 |
| 250 | Esqui Sul |
```

**Propósito:** Agrupar gastos por viagem para análise de custo total.

---

## 🔗 Diagrama Entidade-Relacionamento (ER)

```
┌──────────────────────┐
│  unidade_medida      │
│───────────────────── │
│ id (PK)              │
│ sigla                │
│ nome                 │
└──────────┬───────────┘
           │ 1:N
           │
┌──────────┴───────────┐
│  codigo_medida       │
│───────────────────── │
│ id (PK)              │
│ descricao            │
│ cd_pai (FK) ────┐    │
│ id_unidade (FK) │    │
└──────────┬──────┼────┘
           │      │
           └──────┘ (Auto-referenciada)
           │ 1:N
           │
┌──────────┴───────────┐
│  checkins            │
│───────────────────── │
│ id (PK)              │
│ date                 │
│ cd_medida (FK)       │
│ valor                │
└──────────────────────┘


┌──────────────────────┐
│ codigo_exercicio     │
│───────────────────── │
│ id (PK)              │
│ descricao            │
│ cd_pai (FK) ────┐    │
└──────────┬──────┼────┘
           │      │
           └──────┘ (Auto-referenciada)
           │ 1:N
           │
┌──────────┴──────────────┐
│ entrada_exercicio       │
│────────────────────── │
│ id (PK)                │
│ data                   │
│ hora                   │
│ cd_exercicio (FK)      │
│ duracao                │
│ esforco                │
└────────────────────────┘


┌──────────────────────┐
│ codigo_goals         │
│───────────────────── │
│ id (PK)              │
│ nome                 │
│ cd_pai (FK) ────┐    │
│ descricao       │    │
└──────────┬──────┼────┘
           │      │
           └──────┘ (Auto-referenciada)
           │ 1:N
           ├──────────────────────────┬────────────┐
           │                          │            │
    ┌──────┴──────────┐      ┌────────┴────────┐  │
    │ entrada_goals   │      │ pontuacao_goal  │  │
    │───────────────  │      │──────────────── │  │
    │ id (PK)         │      │ id (PK)         │  │
    │ data            │      │ data            │  │
    │ cd_goal (FK) ───┼──┬───┼ cd_goal (FK) ───┼──┘
    │ realizado_no_dia│  │   │ tp_metrica      │
    └─────────────────┘  │   │ valor           │
                         │   │ pts             │
                         │   │ cd_medida (FK)  │
                         │   └─┬──────────────┘
                         │     │ (opcional FK)
                         │   ┌─┴─────────────┐
                         └───┼→ codigo_medida
                             └───────────────


┌──────────────────────┐
│ codigo_financa       │
│───────────────────── │
│ id (PK)              │
│ nome                 │
│ cd_pai (FK) ────┐    │
└──────────┬──────┼────┘
           │      │
           └──────┘ (Auto-referenciada, árvore)
           │
      ┌────┴─────────────────┬─────────────────┐
      │ 1:N                   │ 1:N             │ 1:N
      │                       │                 │
┌─────┴──────────────────┐  ┌─┴────────────────┐ ┌────────────────┐
│ lancamento_financeiro  │  │ orcamento_fin... │ │ snapshot_inv...│
│───────────────────── │  │──────────────── │ │─────────────── │
│ id (PK)                │  │ id (PK)         │ │ id (PK)        │
│ data                   │  │ ano             │ │ data           │
│ cd_financa (FK) ───────┼──┼ cd_financa (FK).├ │ cd_financa (FK)│
│ valor                  │  │ valor_orcado    │ │ saldo          │
│ descricao              │  │ forma_pagamento │ └────────────────┘
│ forma_pagamento        │  └─────────────────┘
└──────────┬─────────────┘
           │ 1:1 (optional)
           │
    ┌──────┴──────────────────────────────┐
    │ relacionamento_lancamento_viagem    │
    │───────────────────────────────────── │
    │ cd_lancamento (PK, FK)              │
    │ nome_viagem                         │
    └─────────────────────────────────────┘
```

---

## 🔑 Relacionamentos Principais

### Tabelas de Métricas (Body)
```
unidade_medida (1) ──→ (N) codigo_medida ──→ (N) checkins
```
- **1:N** Unidade → Medida (uma unidade pode ter várias medidas)
- **N:N (via ForeignKey)** Medida → Checkin (uma medida tem muitos check-ins)

### Tabelas de Exercícios
```
codigo_exercicio (auto-referenciada) ──→ entrada_exercicio
```
- **Auto-Join** Exercício pai e filho (hierarquia)
- **1:N** Exercício → Entrada (um exercício tem muitos registros)

### Tabelas de Metas (Goals)
```
codigo_goals (auto-ref) ──→ entrada_goals
                        ──→ pontuacao_goal
```
- **Auto-Join** Goal pai e filho
- **1:N** Goal → Entrada (cada dia tem um registro)
- **1:N** Goal → Pontuação (cada mês tem um score)

### Tabelas Financeiras
```
codigo_financa (auto-ref) ──→ lancamento_financeiro ──→ relacionamento_lancamento_viagem
                         ──→ orcamento_financeiro
                         ──→ snapshot_investimento
```
- **Auto-Join** Categoria pai e filho (árvore)
- **1:N** Categoria → Lançamento
- **1:1** Lançamento → Viagem (opcional)

---

## 📊 Constraints & Índices

### Chaves Primárias (PK)
Toda tabela tem um `id` INT como PK AUTOINCREMENT.

### Chaves Estrangeiras (FK)
Garantem integridade referencial:
```sql
ALTER TABLE checkins ADD CONSTRAINT fk_checkin_medida
FOREIGN KEY (cd_medida) REFERENCES codigo_medida(id);

ALTER TABLE entrada_exercicio ADD CONSTRAINT fk_entrada_exercicio
FOREIGN KEY (cd_exercicio) REFERENCES codigo_exercicio(id);
```

### NOT NULL Constraints
Campos obrigatórios:
```sql
-- Body
checkins.date NOT NULL
checkins.cd_medida NOT NULL
checkins.valor NOT NULL

-- Exercises
entrada_exercicio.data NOT NULL
entrada_exercicio.cd_exercicio NOT NULL

-- Goals
entrada_goals.data NOT NULL
entrada_goals.cd_goal NOT NULL
entrada_goals.realizado_no_dia NOT NULL

-- Finances
lancamento_financeiro.data NOT NULL
lancamento_financeiro.cd_financa NOT NULL
lancamento_financeiro.valor NOT NULL
```

### Índices para Performance
```sql
-- Consultas frequentes de data
CREATE INDEX idx_checkins_date ON checkins(date);
CREATE INDEX idx_entrada_exercicio_data ON entrada_exercicio(data);
CREATE INDEX idx_entrada_goals_data ON entrada_goals(data);
CREATE INDEX idx_lancamento_data ON lancamento_financeiro(data);

-- Filtros por métrica/exercício/categoria
CREATE INDEX idx_checkins_medida ON checkins(cd_medida);
CREATE INDEX idx_entrada_exercicio_exercicio ON entrada_exercicio(cd_exercicio);
CREATE INDEX idx_lancamento_financa ON lancamento_financeiro(cd_financa);

-- Buscas por período
CREATE INDEX idx_lancamento_data_categoria ON lancamento_financeiro(data, cd_financa);
```

---

## 💾 Fluxo de Dados no Banco

### Inserindo um Check-in de Peso

**Frontend:**
```javascript
await postCheckin('2026-03-15', {
  'peso': 78.5,
  'gordura': 18.2
})
```

**Backend (main.py):**
```python
@app.post("/api/checkins")
async def create_checkin(request: dict):
    with get_db() as db:
        for nome_medida, valor in request['medidas'].items():
            # Busca o ID da medida por nome
            medida = db.query(CodigoMedida).filter(
                CodigoMedida.descricao == nome_medida
            ).first()
            
            if medida:
                # Cria registro
                checkin = Checkin(
                    date=request['date'],
                    cd_medida=medida.id,
                    valor=valor
                )
                db.add(checkin)
        
        # Executa INSERT
        db.commit()
```

**Database (PostgreSQL):**
```sql
INSERT INTO checkins (date, cd_medida, valor) 
VALUES ('2026-03-15', 1, 78.5);  -- peso

INSERT INTO checkins (date, cd_medida, valor) 
VALUES ('2026-03-15', 3, 18.2);  -- gordura

-- Resultado: 2 novas linhas inseridas
```

---

## 🔍 Queries Importantes

### Body (Métricas)

**Últimas medições:**
```sql
SELECT c.date, r.descricao, c.valor
FROM checkins c
JOIN codigo_medida r ON c.cd_medida = r.id
ORDER BY c.date DESC, r.descricao
LIMIT 30;
```

**Peso ao longo do tempo:**
```sql
SELECT date, valor FROM checkins
WHERE cd_medida = 1  -- peso
ORDER BY date;
```

### Exercises (Treinos)

**Frequência de treinos no mês:**
```sql
SELECT EXTRACT(WEEK FROM data) as semana, COUNT(*) as total
FROM entrada_exercicio
WHERE data >= '2026-03-01' AND data < '2026-04-01'
GROUP BY EXTRACT(WEEK FROM data);
```

**Distribuição por grupo muscular:**
```sql
SELECT e.descricao as grupo, COUNT(*) as total
FROM entrada_exercicio ex
JOIN codigo_exercicio e ON ex.cd_exercicio = e.id
WHERE e.cd_pai IS NULL  -- grupos raiz
GROUP BY e.descricao;
```

### Goals (Metas)

**Taxa de aderência:**
```sql
SELECT 
  cd_goal,
  SUM(CASE WHEN realizado_no_dia THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as taxa
FROM entrada_goals
WHERE data >= '2026-03-01'
GROUP BY cd_goal;
```

### Finances (Finanças)

**Receita vs Despesa no mês:**
```sql
SELECT
  (SELECT SUM(valor) FROM lancamento_financeiro 
   WHERE cd_financa < 5 AND date >= '2026-03-01') as receita,
  (SELECT SUM(valor) FROM lancamento_financeiro 
   WHERE cd_financa IN (6,7,8,9) AND date >= '2026-03-01') as despesa;
```

**Comparar orçado vs realizado:**
```sql
SELECT
  o.cd_financa,
  c.nome as categoria,
  COALESCE(o.valor_orcado, 0) as orcado,
  COALESCE(SUM(l.valor), 0) as realizado,
  COALESCE(SUM(l.valor), 0) - COALESCE(o.valor_orcado, 0) as diferenca
FROM orcamento_financeiro o
FULL OUTER JOIN lancamento_financeiro l ON o.cd_financa = l.cd_financa
JOIN codigo_financa c ON o.cd_financa = c.id
WHERE o.ano = 2026 AND o.mes = 3
GROUP BY o.cd_financa, c.nome;
```

---

✅ **Próximo:** Veja [04-BACKEND.md](04-BACKEND.md) para entender o FastAPI.

✅ **Depois:** Explore [05-FRONTEND.md](05-FRONTEND.md) para entender JavaScript/HTML/CSS.
