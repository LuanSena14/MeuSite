import datetime
import sys

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import engine


def get_columns(conn):
    dialect = conn.engine.dialect.name
    if dialect == 'sqlite':
        result = conn.execute(text("PRAGMA table_info('pontuacao_goal')"))
        return [row[1] for row in result.fetchall()]

    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema = 'public' AND table_name = 'pontuacao_goal' "
        "ORDER BY ordinal_position"
    ))
    return [row[0] for row in result.fetchall()]


def add_column(conn, sql):
    try:
        conn.execute(text(sql))
    except SQLAlchemyError as exc:
        print(f"  [WARN] coluna já existe ou não pôde ser criada: {exc}")


def last_day_of_month(value):
    return (value.replace(day=1) + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)


def migrate_existing_rows(conn):
    rows = conn.execute(text(
        "SELECT id, data, tp_metrica FROM pontuacao_goal "
        "WHERE data IS NOT NULL AND (data_inicio IS NULL OR data_fim IS NULL)"
    )).fetchall()

    for row in rows:
        record_id, data_value, tp_metrica = row
        if data_value is None:
            continue

        updates = {"data_inicio": data_value}
        if tp_metrica == 'mensal':
            end_date = last_day_of_month(data_value)
            updates['data_fim'] = end_date

        set_clause = ', '.join(f"{k} = :{k}" for k in updates)
        params = {'id': record_id, **updates}
        conn.execute(text(f"UPDATE pontuacao_goal SET {set_clause} WHERE id = :id"), params)

    conn.commit()
    print(f"  [OK] migradas {len(rows)} linhas legadas de pontuacao_goal")


def main():
    print('Iniciando migração de schema de pontuacao_goal...')
    with engine.begin() as conn:
        cols = get_columns(conn)
        print(f'  colunas existentes: {cols}')

        if 'data_inicio' not in cols:
            add_column(conn, 'ALTER TABLE pontuacao_goal ADD COLUMN data_inicio DATE')
            print('  coluna data_inicio criada')
        else:
            print('  coluna data_inicio já existe')

        if 'data_fim' not in cols:
            add_column(conn, 'ALTER TABLE pontuacao_goal ADD COLUMN data_fim DATE')
            print('  coluna data_fim criada')
        else:
            print('  coluna data_fim já existe')

        migrate_existing_rows(conn)

    print('Migração concluída.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'ERRO: {exc}', file=sys.stderr)
        sys.exit(1)
