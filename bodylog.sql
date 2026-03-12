-- =============================================================================
-- RESET: zera codigo_financa e tabelas dependentes, reinicia sequences
-- =============================================================================
TRUNCATE TABLE
    lancamento_financeiro,
    orcamento_financeiro,
    snapshot_investimento,
    codigo_financa
RESTART IDENTITY CASCADE;

-- =============================================================================
-- SEED: codigo_financa
-- Hierarquia: tipo-raiz (cd_pai NULL) → grupo → categoria → subcategoria
-- dono: Couple | Luan | Lele | NULL (compartilhado)
-- =============================================================================

-- ── RAÍZES (tipos) ────────────────────────────────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(1, 'Receita',      NULL, NULL),
(2, 'Despesa',      NULL, NULL),
(3, 'Investimento', NULL, NULL);

-- ── GRUPOS NÍVEL 1 ────────────────────────────────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
-- Receita
(4,  'Salario',    1, NULL),   -- salário mensal recorrente
(5,  'Bonus',      1, NULL),   -- entradas anuais/eventuais
-- Despesa
(6,  'Recorrente', 2, NULL),   -- contas fixas mensais
(7,  'Variavel',   2, NULL),   -- gastos variáveis mensais
(8,  'Pontual',    2, NULL),   -- saídas anuais programadas
(9,  'Caixinha',   2, NULL),   -- fluxo de reservas de emergência
-- Investimento
(10, 'Patrimonio', 3, NULL);   -- ativos de patrimônio

-- ── DESPESAS RECORRENTES (cd_pai = 6) ─────────────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(11, 'Energy',         6, 'Couple'),
(12, 'Internet',       6, 'Couple'),
(13, 'Convenio Alice', 6, 'Couple'),
(14, 'Netflix',        6, 'Couple'),
(15, 'Health Plan',    6, 'Couple'),
(16, 'Consorcio',      6, 'Couple'),  -- parcela mensal do consórcio
(17, 'Contabilizei',   6, 'Lele'),
(18, 'INSS',           6, 'Lele'),
(19, 'Phone',          6, 'Lele'),
(20, 'Bilhete Unico',  6, 'Lele'),
(21, 'Fut',            6, 'Luan'),
(22, 'Hair Cut',       6, 'Luan'),
(23, 'Gym',            6, 'Couple'),
(24, 'Subscription',   6, NULL);   -- subcategoria de assinaturas

INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(25, 'Apple',          24, 'Luan'),
(26, 'Seguro Cartao',  24, 'Luan');

-- ── DESPESAS VARIAVEIS (cd_pai = 7) ───────────────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(27, 'Market',    7, 'Couple'),
(28, 'Date',      7, 'Couple'),
(29, 'Gas',       7, 'Luan'),
(30, 'Free Will', 7, 'Luan'),
(31, 'Dryer',     7, 'Luan'),
(32, 'Avanti',    7, 'Luan'),
(33, 'Home',      7, NULL);    -- grupo de gastos com moradia

-- Home tem 3 subcategorias:
--   Compras Casa  → itens que não viram bem imóvel (panela, cortina...)
--   Taxas Encargos → advogado, taxas de cartório, condomínio extra, etc.
--   Amortizacao    → parcela/amortização do pagamento do apartamento
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(34, 'Compras Casa',    33, NULL),   -- gastos avulsos para a casa
(35, 'Taxas Encargos',  33, NULL),   -- serviços e taxas (advogado, cartório...)
(36, 'Amortizacao',    33, NULL);    -- pagamento/amortização do AP

-- ── PONTUAL — saídas anuais programadas (cd_pai = 8) ─────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(37, 'Wanted',        8, NULL),
(38, 'Wardrobe',      8, NULL),
(39, 'Insurance',     8, NULL),
(40, 'IPVA',          8, NULL),
(41, 'Licenciamento', 8, NULL),
(42, 'Present',       8, NULL),
(43, 'Travel',        8, NULL),
(44, 'Moto',          8, NULL);

-- ── CAIXINHA — fluxo de reservas (cd_pai = 9) ────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(45, 'Unforeseen', 9,  NULL),
(46, 'Emergency',  9,  NULL),
(47, 'Lawer',      45, 'Couple');

-- ── BONUS — entradas eventuais (cd_pai = 5) ───────────────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(48, 'PLR 1',    5, NULL),
(49, 'PLR 2',    5, NULL),
(50, '13o 1',    5, NULL),
(51, '13o 2',    5, NULL),
(52, 'Vocation', 5, NULL),
(53, 'IR',       5, NULL),
(54, 'Invest',   5, NULL);

-- ── PATRIMÔNIO — ativos de investimento (cd_pai = 10) ────────────────────────
INSERT INTO codigo_financa (id, nome, cd_pai, dono) VALUES
(55, 'Emergency CDB', 10, NULL),   -- reserva de emergência
(56, 'Nu Invest',     10, NULL),   -- patrimônio de longo prazo
(57, 'Year Bills',    10, NULL),   -- nu caixinha para contas anuais
(58, 'Changing',      10, NULL),   -- nu caixinha para buffer mensal
(59, 'FGTS',          10, NULL),
(60, 'Caminhos',      10, NULL);
