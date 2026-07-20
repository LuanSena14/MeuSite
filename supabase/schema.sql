-- =============================================================================
-- BodyLog — Schema Supabase
-- Módulos: Body, Exercises, Finances (Goals fica de fora por enquanto)
-- =============================================================================

-- ── BODY ──────────────────────────────────────────────────────────────────────

create table if not exists unidade_medida (
  id    integer generated always as identity primary key,
  sigla varchar not null,
  nome  varchar
);

create table if not exists codigo_medida (
  id            integer generated always as identity primary key,
  descricao     varchar not null,
  cd_pai        integer references codigo_medida(id),
  id_unidade    integer references unidade_medida(id),
  nome_exibicao varchar
);

create table if not exists checkins (
  id        integer generated always as identity primary key,
  date      date not null,
  cd_medida integer not null references codigo_medida(id),
  valor     float not null
);

create index if not exists idx_checkins_date   on checkins(date);
create index if not exists idx_checkins_medida on checkins(cd_medida);

-- ── EXERCISES ─────────────────────────────────────────────────────────────────

create table if not exists codigo_exercicio (
  id        integer generated always as identity primary key,
  descricao varchar not null,
  cd_pai    integer references codigo_exercicio(id)
);

create table if not exists entrada_exercicio (
  id           integer generated always as identity primary key,
  data         date not null,
  hora         time not null,
  cd_exercicio integer not null references codigo_exercicio(id),
  duracao      integer,
  esforco      integer
);

create index if not exists idx_entrada_exercicio_data       on entrada_exercicio(data);
create index if not exists idx_entrada_exercicio_exercicio  on entrada_exercicio(cd_exercicio);

-- ── FINANCES ──────────────────────────────────────────────────────────────────

create table if not exists codigo_financa (
  id     integer generated always as identity primary key,
  nome   varchar not null,
  cd_pai integer references codigo_financa(id)
);

create table if not exists lancamento_financeiro (
  id              integer generated always as identity primary key,
  data            date not null,
  cd_financa      integer not null references codigo_financa(id),
  valor           float not null,
  descricao       varchar,
  forma_pagamento varchar default 'debito'
);

create index if not exists idx_lancamento_data           on lancamento_financeiro(data);
create index if not exists idx_lancamento_financa        on lancamento_financeiro(cd_financa);
create index if not exists idx_lancamento_data_categoria on lancamento_financeiro(data, cd_financa);

create table if not exists orcamento_financeiro (
  id              integer generated always as identity primary key,
  ano             integer not null,
  mes             integer,
  cd_financa      integer not null references codigo_financa(id),
  valor_orcado    float not null,
  forma_pagamento varchar
);

create table if not exists snapshot_investimento (
  id         integer generated always as identity primary key,
  data       date not null,
  cd_financa integer not null references codigo_financa(id),
  saldo      float not null
);

create table if not exists relacionamento_debito_investimento (
  cd_financa_origem       integer primary key references codigo_financa(id),
  cd_financa_investimento integer not null references codigo_financa(id)
);

create table if not exists relacionamento_lancamento_viagem (
  cd_lancamento integer primary key references lancamento_financeiro(id),
  nome_viagem   varchar not null
);

-- =============================================================================
-- RLS — uso pessoal, sem login: libera tudo para a chave anon/publishable
-- =============================================================================

alter table unidade_medida                     enable row level security;
alter table codigo_medida                      enable row level security;
alter table checkins                           enable row level security;
alter table codigo_exercicio                   enable row level security;
alter table entrada_exercicio                  enable row level security;
alter table codigo_financa                     enable row level security;
alter table lancamento_financeiro              enable row level security;
alter table orcamento_financeiro               enable row level security;
alter table snapshot_investimento              enable row level security;
alter table relacionamento_debito_investimento enable row level security;
alter table relacionamento_lancamento_viagem   enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'unidade_medida', 'codigo_medida', 'checkins',
      'codigo_exercicio', 'entrada_exercicio',
      'codigo_financa', 'lancamento_financeiro', 'orcamento_financeiro',
      'snapshot_investimento', 'relacionamento_debito_investimento',
      'relacionamento_lancamento_viagem'
    ])
  loop
    execute format('drop policy if exists "public_full_access" on %I', t);
    execute format(
      'create policy "public_full_access" on %I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
