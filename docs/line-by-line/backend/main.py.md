# Linha a linha - backend/main.py

Arquivo fonte: backend/main.py

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 | from contextlib import contextmanager | Importa simbolos especificos de outro modulo para uso local. |
| 2 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 3 | from collections import defaultdict | Importa simbolos especificos de outro modulo para uso local. |
| 4 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 5 | from fastapi import FastAPI, HTTPException | Importa simbolos especificos de outro modulo para uso local. |
| 6 | from fastapi.middleware.cors import CORSMiddleware | Importa simbolos especificos de outro modulo para uso local. |
| 7 | from pydantic import BaseModel, field_validator | Importa simbolos especificos de outro modulo para uso local. |
| 8 | from typing import Optional | Importa simbolos especificos de outro modulo para uso local. |
| 9 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 10 | from database import Session, engine | Importa simbolos especificos de outro modulo para uso local. |
| 11 | from models import Base, Checkin, CodigoMedida, UnidadeMedida, CodigoExercicio, EntradaExercicio, CodigoGoal, EntradaGoal, Meta, CodigoFinanca, LancamentoFinanceiro, OrcamentoFinanceiro, SnapshotInvestimento, RelacionamentoLancamentoViagem | Importa simbolos especificos de outro modulo para uso local. |
| 12 | import datetime | Importa modulo para disponibilizar funcoes, classes ou constantes. |
| 13 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 14 | app = FastAPI() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | app.add_middleware( | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 17 |     CORSMiddleware, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 18 |     allow_origins=["*"], | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 19 |     allow_methods=["*"], | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 20 |     allow_headers=["*"] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 21 | ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 22 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 23 | Base.metadata.create_all(engine) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 24 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 25 | # MigraÃ§Ãµes incrementais (adiciona colunas sem recriar tabelas existentes) | Comentario: registra contexto, decisao ou instrucao para manutencao. |
| 26 | with engine.connect() as _conn: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 27 |     from sqlalchemy import text as _text | Importa simbolos especificos de outro modulo para uso local. |
| 28 |     _conn.execute(_text("ALTER TABLE lancamento_financeiro ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR DEFAULT 'debito'")) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 29 |     _conn.execute(_text("ALTER TABLE orcamento_financeiro  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR")) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |     _conn.execute(_text("ALTER TABLE codigo_financa        DROP COLUMN IF EXISTS dono")) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 31 |     _conn.commit() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 32 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 33 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 34 | @contextmanager | Decorator: aplica comportamento adicional sem alterar assinatura da funcao. |
| 35 | def get_db(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 36 |     db = Session() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 37 |     try: | Inicia bloco protegido para tratamento de erros em runtime. |
| 38 |         yield db | Entrega valor de gerador/contexto mantendo estado para retomada. |
| 39 |     finally: | Bloco sempre executado, com erro ou sem erro. |
| 40 |         db.close() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 41 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 42 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 43 | def seed(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 44 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 45 |         unidades_data = [ | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 46 |             ("kg",        "quilograma"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 47 |             ("cm",        "centÃ­metro"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |             ("mm",        "milÃ­metro"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 49 |             ("kcal",      "quilocaloria"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 50 |             ("mL/kg/min", "mililitro por quilo por minuto"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 51 |             ("hrs",       "horas"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 52 |             ("min",       "minutos"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 53 |             ("",          "sem unidade"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 54 |         ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 55 |         siglas_existentes = {u.sigla for u in db.query(UnidadeMedida).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 56 |         for sigla, nome in unidades_data: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 57 |             if sigla not in siglas_existentes: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 58 |                 db.add(UnidadeMedida(sigla=sigla, nome=nome)) | Enfileira novo objeto para insercao na transacao atual. |
| 59 |         db.flush() | Envia pendencias ao banco para obter ids antes do commit. |
| 60 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 61 |         unidade_map = {u.sigla: u.id for u in db.query(UnidadeMedida).all()} | Compreensao de dicionario: cria mapa sigla -> id. u e cada UnidadeMedida retornada, e u.id e a chave primaria numerica da linha no banco. |
| 62 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 63 |         seed_data = [ | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 64 |             ("BioimpedÃ¢ncia",    None,               ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 65 |             ("Dobras CutÃ¢neas",  None,               ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 66 |             ("CircunferÃªncias",  None,               ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 67 |             ("Bem-estar",        None,               ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 68 |             ("agua",             "BioimpedÃ¢ncia",    "kg"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 69 |             ("massa_muscular",   "BioimpedÃ¢ncia",    "kg"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 70 |             ("peso",             "BioimpedÃ¢ncia",    "kg"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 71 |             ("gordura",          "BioimpedÃ¢ncia",    "kg"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 72 |             ("gordura_visceral", "BioimpedÃ¢ncia",    ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 73 |             ("altura",           "BioimpedÃ¢ncia",    "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 74 |             ("dobra_triceps",       "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 75 |             ("dobra_supra",         "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 76 |             ("dobra_panturrilha",   "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 77 |             ("dobra_biceps",        "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 78 |             ("dobra_coxa",          "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 79 |             ("dobra_supra_iliaca",  "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 80 |             ("dobra_axilar_medial", "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 81 |             ("dobra_abdome",        "Dobras CutÃ¢neas", "mm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 82 |             ("circ_punho",       "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 83 |             ("circ_coxa",        "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 84 |             ("circ_braco",       "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 85 |             ("circ_abdominal",   "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 86 |             ("circ_panturrilha", "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 87 |             ("cintura",          "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 88 |             ("circ_torax",       "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 89 |             ("circ_tornozelo",   "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 90 |             ("quadril",          "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 91 |             ("circ_antebraco",   "CircunferÃªncias",  "cm"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 92 |             ("rmr",              "Bem-estar",        "kcal"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |             ("vo2",              "Bem-estar",        "mL/kg/min"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 94 |             ("sono",             "Bem-estar",        "hrs"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 95 |             ("movimento",        "Bem-estar",        "kcal"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 96 |             ("exercicio",        "Bem-estar",        "min"), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 97 |         ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 98 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 99 |         existentes = {c.descricao for c in db.query(CodigoMedida).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 100 |         for descricao, pai_descricao, sigla in seed_data: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 101 |             if descricao not in existentes and pai_descricao is None: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 102 |                 db.add(CodigoMedida(descricao=descricao, cd_pai=None, id_unidade=unidade_map.get(sigla))) | Enfileira novo objeto para insercao na transacao atual. |
| 103 |         db.flush() | Envia pendencias ao banco para obter ids antes do commit. |
| 104 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 105 |         medida_map = {c.descricao: c.id for c in db.query(CodigoMedida).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 106 |         for descricao, pai_descricao, sigla in seed_data: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 107 |             if descricao not in existentes and pai_descricao is not None: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 108 |                 db.add(CodigoMedida(descricao=descricao, cd_pai=medida_map.get(pai_descricao), id_unidade=unidade_map.get(sigla))) | Enfileira novo objeto para insercao na transacao atual. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 111 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 112 | seed() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 113 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 114 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 115 | class CheckinInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 116 |     date: str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 117 |     medidas: dict | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 118 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 119 | @app.get("/api/medidas") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 120 | def get_medidas(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 121 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 122 |         grupos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai == None).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 123 |         resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 124 |         for grupo in grupos: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 125 |             filhos = [{"id": f.id, "descricao": f.descricao, "unidade": f.unidade.sigla if f.unidade else ""} for f in (grupo.filhos or [])] | Compreensao de lista: cria nova lista a partir de iteracao e transformacao. |
| 126 |             resultado.append({"id": grupo.id, "descricao": grupo.descricao, "filhos": filhos}) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 127 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 128 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 129 | @app.get("/api/checkins") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 130 | def get_checkins(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 131 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 132 |         rows = ( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 133 |             db.query(Checkin, CodigoMedida) | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 134 |             .join(CodigoMedida, Checkin.cd_medida == CodigoMedida.id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 135 |             .filter(CodigoMedida.cd_pai != None) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 136 |             .order_by(Checkin.date) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 137 |             .all() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 138 |         ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 139 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 140 |         por_data = {} | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 141 |         for checkin, medida in rows: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 142 |             d = str(checkin.date) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 143 |             if d not in por_data: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 144 |                 por_data[d] = {"date": d} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 145 |             por_data[d][medida.descricao] = checkin.valor | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 146 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 147 |     altura_atual = None | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 148 |     resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 149 |     for data in sorted(por_data.keys()): | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 150 |         registro = por_data[data] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 151 |         if registro.get("altura") is not None: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 152 |             altura_atual = registro["altura"] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 153 |         elif altura_atual is not None: | Ramo alternativo da condicional, testado quando if anterior falha. |
| 154 |             registro["altura"] = altura_atual | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 155 |         resultado.append(registro) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 156 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 157 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 158 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 159 | @app.post("/api/checkins") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 160 | def post_checkin(body: CheckinInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 161 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 162 |         codigos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai != None).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 163 |         mapa = {c.descricao: c.id for c in codigos} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 164 |         for campo, valor in body.medidas.items(): | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 165 |             if valor is None or campo not in mapa: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 166 |                 continue | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 167 |             db.add(Checkin(date=body.date, cd_medida=mapa[campo], valor=float(valor))) | Enfileira novo objeto para insercao na transacao atual. |
| 168 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 169 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 170 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 171 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 172 | class ExercicioInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 173 |     date:         str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 174 |     hora:         str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 175 |     cd_exercicio: int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 176 |     duracao:      Optional[int] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 177 |     esforco:      Optional[int] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 178 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 179 | @app.get("/api/exercicios/codigos") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 180 | def get_codigos_exercicio(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 181 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 182 |         grupos = db.query(CodigoExercicio).filter(CodigoExercicio.cd_pai == None).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 183 |         todos  = db.query(CodigoExercicio).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 184 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 185 |     resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 186 |     for g in grupos: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 187 |         filhos = [ | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 188 |             {"id": f.id, "descricao": f.descricao} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 189 |             for f in todos if f.cd_pai == g.id | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 190 |         ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 191 |         resultado.append({"id": g.id, "descricao": g.descricao, "filhos": filhos}) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 192 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 193 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 194 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 195 | @app.get("/api/exercicios") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 196 | def get_exercicios(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 197 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 198 |         rows = ( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 199 |             db.query(EntradaExercicio, CodigoExercicio) | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 200 |             .join(CodigoExercicio, EntradaExercicio.cd_exercicio == CodigoExercicio.id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 201 |             .order_by(EntradaExercicio.data, EntradaExercicio.hora) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 202 |             .all() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 203 |         ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 204 |         todos = {c.id: c for c in db.query(CodigoExercicio).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 205 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 206 |     resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 207 |     for entrada, exercicio in rows: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 208 |         pai = todos.get(exercicio.cd_pai) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 209 |         resultado.append({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 210 |             "id":             entrada.id, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 211 |             "data":           str(entrada.data), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 212 |             "hora":           str(entrada.hora), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 213 |             "cd_exercicio":   entrada.cd_exercicio, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 214 |             "exercicio_nome": exercicio.descricao, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 215 |             "grupo_nome":     pai.descricao if pai else None, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 216 |             "duracao":        entrada.duracao, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 217 |             "esforco":        entrada.esforco, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 218 |         }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 219 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 220 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 221 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 222 | @app.post("/api/exercicios") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 223 | def post_exercicio(body: ExercicioInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 224 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 225 |         db.add(EntradaExercicio( | Enfileira novo objeto para insercao na transacao atual. |
| 226 |             data         = datetime.date.fromisoformat(body.date), | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 227 |             hora         = datetime.time.fromisoformat(body.hora), | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 228 |             cd_exercicio = body.cd_exercicio, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 229 |             duracao      = body.duracao, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 230 |             esforco      = body.esforco, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 231 |         )) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 232 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 233 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 234 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 235 | @app.get("/health") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 236 | def health(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 237 |     return {"status": "ok"} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 238 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 239 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 240 | class EntradaGoalInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 241 |     date:      str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 242 |     cd_goal:   int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 243 |     progresso: float | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 244 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 245 | @app.get("/api/goals/codigos") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 246 | def get_goals_codigos(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 247 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 248 |         todos = db.query(CodigoGoal).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 249 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 250 |     grupos = [x for x in todos if x.cd_pai is None] | Compreensao de lista: cria nova lista a partir de iteracao e transformacao. |
| 251 |     resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 252 |     for g in grupos: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 253 |         filhos = [{"id": f.id, "nome": f.nome, "descricao": f.descricao} | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 254 |                   for f in todos if f.cd_pai == g.id] | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 255 |         resultado.append({"id": g.id, "nome": g.nome, "descricao": g.descricao, "filhos": filhos}) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 256 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 257 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 258 | @app.get("/api/goals/metas") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 259 | def get_goals_metas(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 260 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 261 |         metas       = db.query(Meta).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 262 |         todos_goals = {g.id: g.nome for g in db.query(CodigoGoal).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 263 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 264 |         resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 265 |         for m in metas: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 266 |             valor_medido = None | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 267 |             data_medido  = None | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 268 |             if m.cd_medida and m.data: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 269 |                 checkin = ( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 270 |                     db.query(Checkin) | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 271 |                     .filter(Checkin.cd_medida == m.cd_medida, Checkin.date &gt;= m.data) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 272 |                     .order_by(Checkin.date.asc()) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 273 |                     .first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 274 |                 ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 275 |                 if checkin: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 276 |                     valor_medido = checkin.valor | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 277 |                     data_medido  = str(checkin.date) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 278 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 279 |             resultado.append({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 280 |                 "id":           m.id, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 281 |                 "data":         str(m.data) if m.data else None, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 282 |                 "tp_metrica":   m.tp_metrica, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 283 |                 "cd_goal":      m.cd_goal, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 284 |                 "goal_nome":    todos_goals.get(m.cd_goal, ""), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 285 |                 "valor_alvo":   m.valor_alvo, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 286 |                 "pts":          m.pts, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 287 |                 "cd_medida":    m.cd_medida, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 288 |                 "valor_medido": valor_medido, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 289 |                 "data_medido":  data_medido, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 290 |             }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 291 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 292 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 293 | @app.get("/api/goals/entradas") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 294 | def get_goals_entradas(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 295 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 296 |         rows = db.query(EntradaGoal).order_by(EntradaGoal.data).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 297 |         return [ | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 298 |             {"id": r.id, "data": str(r.data), "cd_goal": r.cd_goal, "progresso": 1.0 if r.realizado_no_dia else 0.0} | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 299 |             for r in rows | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 300 |         ] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 301 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 302 | @app.post("/api/goals/entradas") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 303 | def post_goal_entrada(body: EntradaGoalInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 304 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 305 |         existing = db.query(EntradaGoal).filter( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 306 |             EntradaGoal.data    == datetime.date.fromisoformat(body.date), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 307 |             EntradaGoal.cd_goal == body.cd_goal, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 308 |         ).first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 309 |         realizado = body.progresso &gt;= 1 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 310 |         if existing: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 311 |             existing.realizado_no_dia = realizado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 312 |         else: | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 313 |             db.add(EntradaGoal( | Enfileira novo objeto para insercao na transacao atual. |
| 314 |                 data             = datetime.date.fromisoformat(body.date), | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 315 |                 cd_goal          = body.cd_goal, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 316 |                 realizado_no_dia = realizado, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 317 |             )) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 318 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 319 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 320 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 321 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 322 | class CodigoFinancaInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 323 |     nome:   str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 324 |     tipo:   Optional[str] = None   # ignorado - tipo Ã© derivado da hierarquia | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 325 |     cd_pai: Optional[int] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 326 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 327 | _FORMAS_VALIDAS = {'debito', 'credito', None} | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 328 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 329 | class LancamentoInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 330 |     data:            str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 331 |     cd_financa:      int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 332 |     valor:           float | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 333 |     descricao:       Optional[str] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 334 |     forma_pagamento: Optional[str] = 'debito' | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 335 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 336 |     @field_validator('forma_pagamento') | Decorator: aplica comportamento adicional sem alterar assinatura da funcao. |
| 337 |     @classmethod | Decorator: aplica comportamento adicional sem alterar assinatura da funcao. |
| 338 |     def validar_forma_pagamento(cls, v): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 339 |         if v == '': | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 340 |             return None | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 341 |         if v not in _FORMAS_VALIDAS: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 342 |             raise ValueError(f"forma_pagamento deve ser 'debito', 'credito' ou null, recebido: {v!r}") | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 343 |         return v | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 344 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 345 | class OrcamentoInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 346 |     ano:             int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 347 |     mes:             Optional[int] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 348 |     cd_financa:      int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 349 |     valor_orcado:    float | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 350 |     forma_pagamento: Optional[str] = None | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 351 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 352 |     @field_validator('forma_pagamento') | Decorator: aplica comportamento adicional sem alterar assinatura da funcao. |
| 353 |     @classmethod | Decorator: aplica comportamento adicional sem alterar assinatura da funcao. |
| 354 |     def validar_forma_pagamento(cls, v): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 355 |         if v == '': | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 356 |             return None | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 357 |         if v not in _FORMAS_VALIDAS: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 358 |             raise ValueError(f"forma_pagamento deve ser 'debito', 'credito' ou null, recebido: {v!r}") | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 359 |         return v | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 360 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 361 | class SnapshotInvestimentoInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 362 |     data:       str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 363 |     cd_financa: int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 364 |     saldo:      float | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 365 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 366 | def _derive_tipo(c_id: int, lookup: dict) -&gt; str: | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 367 |     """Sobe a Ã¡rvore atÃ© o nÃ³ raiz (cd_pai=NULL) e devolve o nome em minÃºsculas.""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 368 |     c = lookup.get(c_id) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 369 |     if not c: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 370 |         return "" | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 371 |     if c.cd_pai is None: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 372 |         return c.nome.lower()   # 'receita' \| 'despesa' \| 'investimento' | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 373 |     return _derive_tipo(c.cd_pai, lookup) | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 374 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 375 | @app.get("/api/financas/codigos") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 376 | def get_financas_codigos(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 377 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 378 |         todos = db.query(CodigoFinanca).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 379 |         lookup = {c.id: c for c in todos} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 380 |         return [{"id": c.id, "nome": c.nome, "tipo": _derive_tipo(c.id, lookup), "cd_pai": c.cd_pai} for c in todos] | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 381 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 382 | @app.post("/api/financas/codigos") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 383 | def post_financa_codigo(body: CodigoFinancaInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 384 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 385 |         novo = CodigoFinanca(nome=body.nome, cd_pai=body.cd_pai) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 386 |         db.add(novo) | Enfileira novo objeto para insercao na transacao atual. |
| 387 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 388 |         db.refresh(novo) | Recarrega objeto com estado atual vindo do banco. |
| 389 |         lookup = {c.id: c for c in db.query(CodigoFinanca).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 390 |         return {"id": novo.id, "nome": novo.nome, "tipo": _derive_tipo(novo.id, lookup), "cd_pai": novo.cd_pai} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 391 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 392 | @app.delete("/api/financas/codigos/{id}") | Decorator FastAPI: registra endpoint HTTP DELETE para esta funcao. |
| 393 | def delete_financa_codigo(id: int): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 394 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 395 |         db.query(CodigoFinanca).filter(CodigoFinanca.id == id).delete() | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 396 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 397 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 398 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 399 | @app.get("/api/financas/lancamentos") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 400 | def get_lancamentos(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 401 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 402 |         todos = {c.id: c for c in db.query(CodigoFinanca).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 403 |         rows = (db.query(LancamentoFinanceiro, CodigoFinanca) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 404 |                 .join(CodigoFinanca, LancamentoFinanceiro.cd_financa == CodigoFinanca.id) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 405 |                 .order_by(LancamentoFinanceiro.data.desc()) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 406 |                 .all()) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 407 |         resultado = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 408 |         for l, cat in rows: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 409 |             pai = todos.get(cat.cd_pai) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 410 |             resultado.append({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 411 |                 "id": l.id, "data": str(l.data), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 412 |                 "cd_financa": l.cd_financa, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 413 |                 "categoria_nome": cat.nome, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 414 |                 "grupo_nome": pai.nome if pai else cat.nome, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 415 |                 "tipo": _derive_tipo(cat.id, todos), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 416 |                 "valor": l.valor, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 417 |                 "descricao": l.descricao, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 418 |                 "forma_pagamento": l.forma_pagamento, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 419 |             }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 420 |     return resultado | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 421 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 422 | @app.post("/api/financas/lancamentos") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 423 | def post_lancamento(body: LancamentoInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 424 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 425 |         db.add(LancamentoFinanceiro( | Enfileira novo objeto para insercao na transacao atual. |
| 426 |             data=datetime.date.fromisoformat(body.data), | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 427 |             cd_financa=body.cd_financa, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 428 |             valor=body.valor, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 429 |             descricao=body.descricao, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 430 |             forma_pagamento=body.forma_pagamento, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 431 |         )) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 432 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 433 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 434 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 435 | @app.delete("/api/financas/lancamentos/{id}") | Decorator FastAPI: registra endpoint HTTP DELETE para esta funcao. |
| 436 | def delete_lancamento(id: int): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 437 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 438 |         db.query(LancamentoFinanceiro).filter(LancamentoFinanceiro.id == id).delete() | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 439 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 440 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 441 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 442 | @app.get("/api/financas/orcamento") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 443 | def get_orcamento(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 444 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 445 |         rows = db.query(OrcamentoFinanceiro).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 446 |         codigos = {c.id: c for c in db.query(CodigoFinanca).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 447 |         return [{ | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 448 |             "id": r.id, "ano": r.ano, "mes": r.mes, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 449 |             "cd_financa": r.cd_financa, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 450 |             "categoria_nome": codigos[r.cd_financa].nome if r.cd_financa in codigos else "", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 451 |             "tipo": _derive_tipo(r.cd_financa, codigos) if r.cd_financa in codigos else "", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 452 |             "valor_orcado": r.valor_orcado, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 453 |             "forma_pagamento": r.forma_pagamento, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 454 |         } for r in rows] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 455 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 456 | @app.post("/api/financas/orcamento") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 457 | def post_orcamento(body: OrcamentoInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 458 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 459 |         existing = db.query(OrcamentoFinanceiro).filter( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 460 |             OrcamentoFinanceiro.ano == body.ano, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 461 |             OrcamentoFinanceiro.mes == body.mes, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 462 |             OrcamentoFinanceiro.cd_financa == body.cd_financa, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 463 |         ).first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 464 |         if existing: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 465 |             existing.valor_orcado    = body.valor_orcado | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 466 |             existing.forma_pagamento = body.forma_pagamento | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 467 |         else: | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 468 |             db.add(OrcamentoFinanceiro( | Enfileira novo objeto para insercao na transacao atual. |
| 469 |                 ano=body.ano, mes=body.mes, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 470 |                 cd_financa=body.cd_financa, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 471 |                 valor_orcado=body.valor_orcado, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 472 |                 forma_pagamento=body.forma_pagamento, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 473 |             )) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 474 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 475 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 476 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 477 | @app.delete("/api/financas/orcamento/{id}") | Decorator FastAPI: registra endpoint HTTP DELETE para esta funcao. |
| 478 | def delete_orcamento(id: int): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 479 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 480 |         db.query(OrcamentoFinanceiro).filter(OrcamentoFinanceiro.id == id).delete() | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 481 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 482 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 483 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 484 | @app.get("/api/financas/investimentos") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 485 | def get_investimentos(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 486 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 487 |         rows = db.query(SnapshotInvestimento).order_by(SnapshotInvestimento.data).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 488 |         codigos = {c.id: c for c in db.query(CodigoFinanca).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 489 |         return [{ | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 490 |             "id": r.id, "data": str(r.data), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 491 |             "cd_financa": r.cd_financa, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 492 |             "nome": codigos[r.cd_financa].nome if r.cd_financa in codigos else "", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 493 |             "saldo": r.saldo, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 494 |         } for r in rows] | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 495 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 496 | @app.post("/api/financas/investimentos") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 497 | def post_investimento(body: SnapshotInvestimentoInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 498 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 499 |         db.add(SnapshotInvestimento( | Enfileira novo objeto para insercao na transacao atual. |
| 500 |             data=datetime.date.fromisoformat(body.data), | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 501 |             cd_financa=body.cd_financa, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 502 |             saldo=body.saldo, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 503 |         )) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 504 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 505 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 506 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 507 | @app.delete("/api/financas/investimentos/{id}") | Decorator FastAPI: registra endpoint HTTP DELETE para esta funcao. |
| 508 | def delete_investimento(id: int): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 509 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 510 |         db.query(SnapshotInvestimento).filter(SnapshotInvestimento.id == id).delete() | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 511 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 512 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 513 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 514 | class ViagemRenameInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 515 |     nome_viagem: str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 516 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 517 | @app.get("/api/financas/viagens") | Decorator FastAPI: registra endpoint HTTP GET para esta funcao. |
| 518 | def get_viagens(): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 519 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 520 |         todos_cod = {c.id: c for c in db.query(CodigoFinanca).all()} | Compreensao de dicionario: transforma colecao em mapa para acesso rapido por chave. |
| 521 |         rels = db.query(RelacionamentoLancamentoViagem).all() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 522 |         ids_rel = [r.cd_lancamento for r in rels] | Compreensao de lista: cria nova lista a partir de iteracao e transformacao. |
| 523 |         if not ids_rel: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 524 |             return [] | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 525 |         lancs = { | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 526 |             l.id: l for l in db.query(LancamentoFinanceiro) | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 527 |             .filter(LancamentoFinanceiro.id.in_(ids_rel)).all() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 528 |         } | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 529 |         grupos = defaultdict(list) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 530 |         for r in rels: | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 531 |             l = lancs.get(r.cd_lancamento) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 532 |             if not l: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 533 |                 continue | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 534 |             cat = todos_cod.get(l.cd_financa) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 535 |             grupos[r.nome_viagem].append({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 536 |                 "id": l.id, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 537 |                 "data": str(l.data), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 538 |                 "cd_financa": l.cd_financa, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 539 |                 "categoria_nome": cat.nome if cat else "", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 540 |                 "tipo": _derive_tipo(l.cd_financa, todos_cod), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 541 |                 "valor": l.valor, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 542 |                 "descricao": l.descricao, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 543 |                 "forma_pagamento": l.forma_pagamento, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 544 |             }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 545 |         viagens = [] | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 546 |         for nome, items in grupos.items(): | Loop: percorre elementos de uma colecao ou faixa de valores. |
| 547 |             lancs_sorted = sorted(items, key=lambda x: x["data"]) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 548 |             viagens.append({ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 549 |                 "nome_viagem": nome, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 550 |                 "total": sum(l["valor"] for l in items), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 551 |                 "num_lancamentos": len(items), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 552 |                 "ultima_data": (lancs_sorted[-1]["data"] if lancs_sorted else None), | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 553 |                 "lancamentos": lancs_sorted, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 554 |             }) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 555 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 556 |         # Mais recentes primeiro (desempate por nome) | Comentario: registra contexto, decisao ou instrucao para manutencao. |
| 557 |         viagens.sort(key=lambda v: v["nome_viagem"]) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 558 |         viagens.sort(key=lambda v: v.get("ultima_data") or "", reverse=True) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 559 |         return viagens | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 560 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 561 | @app.patch("/api/financas/viagens/{cd_lancamento}") | Decorator FastAPI: registra endpoint HTTP PATCH para esta funcao. |
| 562 | def rename_viagem(cd_lancamento: int, body: ViagemRenameInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 563 |     """Renomeia todos os lanÃ§amentos que compartilham o mesmo nome_viagem do lanÃ§amento informado.""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 564 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 565 |         rel = db.query(RelacionamentoLancamentoViagem)\ | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 566 |             .filter(RelacionamentoLancamentoViagem.cd_lancamento == cd_lancamento).first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 567 |         if not rel: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 568 |             raise HTTPException(404, "LanÃ§amento nÃ£o vinculado a viagem") | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 569 |         old_nome = rel.nome_viagem | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 570 |         db.query(RelacionamentoLancamentoViagem)\ | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 571 |             .filter(RelacionamentoLancamentoViagem.nome_viagem == old_nome)\ | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 572 |             .update({"nome_viagem": body.nome_viagem}) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 573 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 574 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 575 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 576 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 577 | class IndicadorInput(BaseModel): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 578 |     ano:   int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 579 |     mes:   int | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 580 |     nome:  str | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 581 |     valor: float | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 582 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 583 | @app.post("/api/financas/indicadores") | Decorator FastAPI: registra endpoint HTTP POST para esta funcao. |
| 584 | def post_indicador(body: IndicadorInput): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 585 |     """Cria ou atualiza o snapshot mensal de um indicador (filho do nÃ³ 78). | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 586 |     Cria a categoria automaticamente caso ela nÃ£o exista ainda.""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 587 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 588 |         cat = db.query(CodigoFinanca).filter( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 589 |             CodigoFinanca.cd_pai == 78, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 590 |             CodigoFinanca.nome   == body.nome, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 591 |         ).first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 592 |         if not cat: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 593 |             cat = CodigoFinanca(nome=body.nome, cd_pai=78) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 594 |             db.add(cat) | Enfileira novo objeto para insercao na transacao atual. |
| 595 |             db.flush() | Envia pendencias ao banco para obter ids antes do commit. |
| 596 |         data = datetime.date(body.ano, body.mes, 1) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 597 |         existing = db.query(SnapshotInvestimento).filter( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 598 |             SnapshotInvestimento.cd_financa == cat.id, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 599 |             SnapshotInvestimento.data       == data, | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 600 |         ).first() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 601 |         if existing: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 602 |             existing.saldo = body.valor | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 603 |         else: | Ramo padrao executado quando nenhuma condicao anterior foi atendida. |
| 604 |             db.add(SnapshotInvestimento(data=data, cd_financa=cat.id, saldo=body.valor)) | Enfileira novo objeto para insercao na transacao atual. |
| 605 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 606 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 607 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 608 | @app.delete("/api/financas/viagens/{cd_lancamento}") | Decorator FastAPI: registra endpoint HTTP DELETE para esta funcao. |
| 609 | def unlink_viagem(cd_lancamento: int): | Declara funcao Python com responsabilidade definida no bloco abaixo. |
| 610 |     """Remove o lanÃ§amento da viagem (desvincula).""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 611 |     with get_db() as db: | Context manager: abre recurso e garante fechamento/limpeza automatica. |
| 612 |         db.query(RelacionamentoLancamentoViagem)\ | Executa consulta ORM no banco de dados usando SQLAlchemy. |
| 613 |             .filter(RelacionamentoLancamentoViagem.cd_lancamento == cd_lancamento).delete() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 614 |         db.commit() | Confirma transacao atual e persiste alteracoes no banco. |
| 615 |     return {"ok": True} | Retorna valor da funcao para o chamador e encerra o fluxo local. |
| 616 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
