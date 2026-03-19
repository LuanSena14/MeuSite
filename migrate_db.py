"""
migrate_db.py — Migra o banco do Render para o Neon (ou qualquer outro PostgreSQL).

USO:
    1. Preencha SOURCE_URL e DEST_URL abaixo
    2. Execute:  python migrate_db.py

Dependência: psycopg2-binary (já está no requirements.txt)
"""

import sys
import psycopg2
import psycopg2.extras

# ─── CONFIGURE AQUI ───────────────────────────────────────────────────────────

SOURCE_URL = "postgresql://bodylog:w8d1QyT5N7WGL0pTK6gA9z0vWwsdCNHK@dpg-d6muaflm5p6s7382t8u0-a.oregon-postgres.render.com/bodylog"
# Ex: "postgresql://bodylog:xxxxx@dpg-xxx.render.com/bodylog_db"

DEST_URL = "postgresql://neondb_owner:npg_Uz4uMypec6sC@ep-polished-queen-adcdns5d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
# Ex: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ──────────────────────────────────────────────────────────────────────────────

# Ordem de cópia respeitando dependências de FK.
# Tabelas auto-referenciadas (cd_pai) são copiadas com ORDER BY id
# para garantir que o pai sempre precede o filho.
TABLE_ORDER = [
    "unidade_medida",
    "codigo_medida",           # auto-ref: cd_pai → id
    "codigo_exercicio",        # auto-ref: cd_pai → id
    "codigo_goals",            # auto-ref: cd_pai → id
    "codigo_financa",          # auto-ref: cd_pai → id
    "checkins",
    "entrada_exercicio",
    "entrada_goals",
    "pontuacao_goal",
    "lancamento_financeiro",
    "orcamento_financeiro",
    "snapshot_investimento",
    "relacionamento_lancamento_viagem",
]

SELF_REF_TABLES = {
    "codigo_medida",
    "codigo_exercicio",
    "codigo_goals",
    "codigo_financa",
}


def connect(url: str, label: str):
    try:
        conn = psycopg2.connect(url)
        conn.autocommit = False
        print(f"  [{label}] conectado OK")
        return conn
    except Exception as e:
        print(f"  ERRO ao conectar em [{label}]: {e}")
        sys.exit(1)


def get_columns(cur, table: str) -> list[str]:
    cur.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
        """,
        (table,),
    )
    return [row[0] for row in cur.fetchall()]


def table_exists(cur, table: str) -> bool:
    cur.execute(
        """
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = %s
        """,
        (table,),
    )
    return cur.fetchone() is not None


def create_schema_on_dest(src_conn, dst_conn):
    """Recria as tabelas no destino usando CREATE TABLE ... AS SELECT sem dados (fallback manual)."""
    # Obtém o DDL de cada tabela via pg_dump style (usando pg_get_tabledef quando disponível)
    # Abordagem mais robusta: replicar via SQLAlchemy models
    print("\n[SCHEMA] Criando tabelas no destino via models.py ...")

    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

    from sqlalchemy import create_engine, text
    from models import Base

    dest_url = DEST_URL
    if dest_url.startswith("postgres://"):
        dest_url = dest_url.replace("postgres://", "postgresql://", 1)

    dst_engine = create_engine(dest_url)
    Base.metadata.create_all(dst_engine)
    dst_engine.dispose()
    print("[SCHEMA] Tabelas criadas com sucesso.")


def topo_sort_rows(rows: list, col_names: list) -> list:
    """Ordena linhas de tabela auto-referenciada (cd_pai → id) em ordem topológica."""
    id_idx   = col_names.index("id")
    pai_idx  = col_names.index("cd_pai")
    by_id    = {r[id_idx]: r for r in rows}
    visited  = set()
    result   = []

    def visit(row):
        rid = row[id_idx]
        if rid in visited:
            return
        visited.add(rid)
        pai = row[pai_idx]
        if pai is not None and pai in by_id:
            visit(by_id[pai])
        result.append(row)

    for r in rows:
        visit(r)
    return result


def migrate_table(src_cur, dst_cur, table: str):
    if not table_exists(src_cur, table):
        print(f"  [SKIP] tabela '{table}' não existe na origem")
        return
    if not table_exists(dst_cur, table):
        print(f"  [SKIP] tabela '{table}' não existe no destino")
        return

    src_cols = get_columns(src_cur, table)
    dst_cols = get_columns(dst_cur, table)
    if not src_cols or not dst_cols:
        print(f"  [SKIP] tabela '{table}' sem colunas detectadas")
        return

    # Usa apenas colunas que existem em ambos
    dst_set = set(dst_cols)
    cols = [c for c in src_cols if c in dst_set]

    order_clause = "ORDER BY id" if "id" in cols else ""
    cols_quoted_sel = ", ".join(f'"{c}"' for c in cols)
    src_cur.execute(f'SELECT {cols_quoted_sel} FROM "{table}" {order_clause}')
    rows = src_cur.fetchall()

    if not rows:
        print(f"  [OK]   {table}: 0 linhas (vazia)")
        return

    if table in SELF_REF_TABLES and "cd_pai" in cols:
        rows = topo_sort_rows(list(rows), cols)

    cols_quoted = ", ".join(f'"{c}"' for c in cols)
    placeholders = ", ".join(["%s"] * len(cols))
    insert_sql = f'INSERT INTO "{table}" ({cols_quoted}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'

    psycopg2.extras.execute_batch(dst_cur, insert_sql, rows, page_size=500)
    print(f"  [OK]   {table}: {len(rows)} linhas copiadas")


def reset_sequences(dst_conn):
    """Atualiza todas as sequences para o valor máximo atual das PKs."""
    print("\n[SEQ] Resetando sequences ...")
    with dst_conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                t.table_name,
                c.column_name,
                pg_get_serial_sequence(quote_ident(t.table_name), c.column_name) AS seq
            FROM information_schema.tables t
            JOIN information_schema.columns c
                ON c.table_name = t.table_name AND c.table_schema = t.table_schema
            WHERE t.table_schema = 'public'
              AND t.table_type  = 'BASE TABLE'
              AND c.column_default LIKE 'nextval%'
            """
        )
        seqs = cur.fetchall()
        for table, col, seq in seqs:
            if seq:
                cur.execute(
                    f"SELECT setval(%s, COALESCE((SELECT MAX({col}) FROM \"{table}\"), 1))",
                    (seq,),
                )
                print(f"  [SEQ] {seq} atualizada")
    dst_conn.commit()


def main():
    print("=" * 60)
    print(" MIGRAÇÃO DE BANCO DE DADOS")
    print("=" * 60)

    if "COLE_AQUI" in SOURCE_URL or "COLE_AQUI" in DEST_URL:
        print("\nERRO: Preencha SOURCE_URL e DEST_URL no início do script!")
        sys.exit(1)

    print("\n[1/4] Conectando ...")
    src_conn = connect(SOURCE_URL, "RENDER (origem)")
    dst_conn = connect(DEST_URL,   "NEON   (destino)")

    print("\n[2/4] Criando schema no destino ...")
    create_schema_on_dest(src_conn, dst_conn)

    print("\n[3/4] Copiando dados ...")
    with src_conn.cursor() as src_cur, dst_conn.cursor() as dst_cur:
        for table in TABLE_ORDER:
            migrate_table(src_cur, dst_cur, table)
        dst_conn.commit()

    print("\n[4/4] Atualizando sequences ...")
    reset_sequences(dst_conn)

    src_conn.close()
    dst_conn.close()

    print("\n" + "=" * 60)
    print(" MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print("\nProximo passo: atualize DATABASE_URL no Render para a URL do Neon.")


if __name__ == "__main__":
    main()
