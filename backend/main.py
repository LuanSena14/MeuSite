from contextlib import contextmanager

from collections import defaultdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional

from database import Session, engine
from models import Base, Checkin, CodigoMedida, UnidadeMedida, CodigoExercicio, EntradaExercicio, CodigoGoal, EntradaGoal, Meta, CodigoFinanca, LancamentoFinanceiro, OrcamentoFinanceiro, SnapshotInvestimento, RelacionamentoLancamentoViagem
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(engine)

# Migrações incrementais (adiciona colunas sem recriar tabelas existentes)
with engine.connect() as _conn:
    from sqlalchemy import text as _text
    _conn.execute(_text("ALTER TABLE lancamento_financeiro ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR DEFAULT 'debito'"))
    _conn.execute(_text("ALTER TABLE orcamento_financeiro  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR"))
    _conn.execute(_text("ALTER TABLE codigo_financa        DROP COLUMN IF EXISTS dono"))
    _conn.commit()

# ── UTILITÁRIO DE BANCO ───────────────────────────────────────────────────────

@contextmanager
def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

# ── SEED ─────────────────────────────────────────────────────────────────────

def seed():
    with get_db() as db:
        # 1. Unidades de medida
        unidades_data = [
            ("kg",        "quilograma"),
            ("cm",        "centímetro"),
            ("mm",        "milímetro"),
            ("kcal",      "quilocaloria"),
            ("mL/kg/min", "mililitro por quilo por minuto"),
            ("hrs",       "horas"),
            ("min",       "minutos"),
            ("",          "sem unidade"),
        ]
        siglas_existentes = {u.sigla for u in db.query(UnidadeMedida).all()}
        for sigla, nome in unidades_data:
            if sigla not in siglas_existentes:
                db.add(UnidadeMedida(sigla=sigla, nome=nome))
        db.flush()

        unidade_map = {u.sigla: u.id for u in db.query(UnidadeMedida).all()}

        # 2. Grupos e medidas corporais
        seed_data = [
            ("Bioimpedância",    None,               ""),
            ("Dobras Cutâneas",  None,               ""),
            ("Circunferências",  None,               ""),
            ("Bem-estar",        None,               ""),
            ("agua",             "Bioimpedância",    "kg"),
            ("massa_muscular",   "Bioimpedância",    "kg"),
            ("peso",             "Bioimpedância",    "kg"),
            ("gordura",          "Bioimpedância",    "kg"),
            ("gordura_visceral", "Bioimpedância",    ""),
            ("altura",           "Bioimpedância",    "cm"),
            ("dobra_triceps",       "Dobras Cutâneas", "mm"),
            ("dobra_supra",         "Dobras Cutâneas", "mm"),
            ("dobra_panturrilha",   "Dobras Cutâneas", "mm"),
            ("dobra_biceps",        "Dobras Cutâneas", "mm"),
            ("dobra_coxa",          "Dobras Cutâneas", "mm"),
            ("dobra_supra_iliaca",  "Dobras Cutâneas", "mm"),
            ("dobra_axilar_medial", "Dobras Cutâneas", "mm"),
            ("dobra_abdome",        "Dobras Cutâneas", "mm"),
            ("circ_punho",       "Circunferências",  "cm"),
            ("circ_coxa",        "Circunferências",  "cm"),
            ("circ_braco",       "Circunferências",  "cm"),
            ("circ_abdominal",   "Circunferências",  "cm"),
            ("circ_panturrilha", "Circunferências",  "cm"),
            ("cintura",          "Circunferências",  "cm"),
            ("circ_torax",       "Circunferências",  "cm"),
            ("circ_tornozelo",   "Circunferências",  "cm"),
            ("quadril",          "Circunferências",  "cm"),
            ("circ_antebraco",   "Circunferências",  "cm"),
            ("rmr",              "Bem-estar",        "kcal"),
            ("vo2",              "Bem-estar",        "mL/kg/min"),
            ("sono",             "Bem-estar",        "hrs"),
            ("movimento",        "Bem-estar",        "kcal"),
            ("exercicio",        "Bem-estar",        "min"),
        ]

        existentes = {c.descricao for c in db.query(CodigoMedida).all()}
        for descricao, pai_descricao, sigla in seed_data:
            if descricao not in existentes and pai_descricao is None:
                db.add(CodigoMedida(descricao=descricao, cd_pai=None, id_unidade=unidade_map.get(sigla)))
        db.flush()

        medida_map = {c.descricao: c.id for c in db.query(CodigoMedida).all()}
        for descricao, pai_descricao, sigla in seed_data:
            if descricao not in existentes and pai_descricao is not None:
                db.add(CodigoMedida(descricao=descricao, cd_pai=medida_map.get(pai_descricao), id_unidade=unidade_map.get(sigla)))

        db.commit()

seed()

# ── ROTAS — BODY ──────────────────────────────────────────────────────────────

class CheckinInput(BaseModel):
    date: str
    medidas: dict


@app.get("/api/medidas")
def get_medidas():
    with get_db() as db:
        grupos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai == None).all()
        resultado = []
        for grupo in grupos:
            filhos = [{"id": f.id, "descricao": f.descricao, "unidade": f.unidade.sigla if f.unidade else ""} for f in (grupo.filhos or [])]
            resultado.append({"id": grupo.id, "descricao": grupo.descricao, "filhos": filhos})
    return resultado


@app.get("/api/checkins")
def get_checkins():
    with get_db() as db:
        rows = (
            db.query(Checkin, CodigoMedida)
            .join(CodigoMedida, Checkin.cd_medida == CodigoMedida.id)
            .filter(CodigoMedida.cd_pai != None)
            .order_by(Checkin.date)
            .all()
        )

        por_data = {}
        for checkin, medida in rows:
            d = str(checkin.date)
            if d not in por_data:
                por_data[d] = {"date": d}
            por_data[d][medida.descricao] = checkin.valor

    altura_atual = None
    resultado = []
    for data in sorted(por_data.keys()):
        registro = por_data[data]
        if registro.get("altura") is not None:
            altura_atual = registro["altura"]
        elif altura_atual is not None:
            registro["altura"] = altura_atual
        resultado.append(registro)

    return resultado


@app.post("/api/checkins")
def post_checkin(body: CheckinInput):
    with get_db() as db:
        codigos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai != None).all()
        mapa = {c.descricao: c.id for c in codigos}
        for campo, valor in body.medidas.items():
            if valor is None or campo not in mapa:
                continue
            db.add(Checkin(date=body.date, cd_medida=mapa[campo], valor=float(valor)))
        db.commit()
    return {"ok": True}


# ── ROTAS — EXERCISES ─────────────────────────────────────────────────────────

class ExercicioInput(BaseModel):
    date:         str
    hora:         str
    cd_exercicio: int
    duracao:      Optional[int] = None
    esforco:      Optional[int] = None


@app.get("/api/exercicios/codigos")
def get_codigos_exercicio():
    with get_db() as db:
        grupos = db.query(CodigoExercicio).filter(CodigoExercicio.cd_pai == None).all()
        todos  = db.query(CodigoExercicio).all()

    resultado = []
    for g in grupos:
        filhos = [
            {"id": f.id, "descricao": f.descricao}
            for f in todos if f.cd_pai == g.id
        ]
        resultado.append({"id": g.id, "descricao": g.descricao, "filhos": filhos})

    return resultado

@app.get("/api/exercicios")
def get_exercicios():
    with get_db() as db:
        rows = (
            db.query(EntradaExercicio, CodigoExercicio)
            .join(CodigoExercicio, EntradaExercicio.cd_exercicio == CodigoExercicio.id)
            .order_by(EntradaExercicio.data, EntradaExercicio.hora)
            .all()
        )
        todos = {c.id: c for c in db.query(CodigoExercicio).all()}

    resultado = []
    for entrada, exercicio in rows:
        pai = todos.get(exercicio.cd_pai)
        resultado.append({
            "id":             entrada.id,
            "data":           str(entrada.data),
            "hora":           str(entrada.hora),
            "cd_exercicio":   entrada.cd_exercicio,
            "exercicio_nome": exercicio.descricao,
            "grupo_nome":     pai.descricao if pai else None,
            "duracao":        entrada.duracao,
            "esforco":        entrada.esforco,
        })

    return resultado


@app.post("/api/exercicios")
def post_exercicio(body: ExercicioInput):
    with get_db() as db:
        db.add(EntradaExercicio(
            data         = datetime.date.fromisoformat(body.date),
            hora         = datetime.time.fromisoformat(body.hora),
            cd_exercicio = body.cd_exercicio,
            duracao      = body.duracao,
            esforco      = body.esforco,
        ))
        db.commit()
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}

# ── ROTAS — GOALS ─────────────────────────────────────────────────────────────

class EntradaGoalInput(BaseModel):
    date:      str
    cd_goal:   int
    progresso: float


@app.get("/api/goals/codigos")
def get_goals_codigos():
    with get_db() as db:
        todos = db.query(CodigoGoal).all()

    grupos = [x for x in todos if x.cd_pai is None]
    resultado = []
    for g in grupos:
        filhos = [{"id": f.id, "nome": f.nome, "descricao": f.descricao}
                  for f in todos if f.cd_pai == g.id]
        resultado.append({"id": g.id, "nome": g.nome, "descricao": g.descricao, "filhos": filhos})
    return resultado


@app.get("/api/goals/metas")
def get_goals_metas():
    with get_db() as db:
        metas       = db.query(Meta).all()
        todos_goals = {g.id: g.nome for g in db.query(CodigoGoal).all()}

        resultado = []
        for m in metas:
            valor_medido = None
            data_medido  = None
            if m.cd_medida and m.data:
                checkin = (
                    db.query(Checkin)
                    .filter(Checkin.cd_medida == m.cd_medida, Checkin.date >= m.data)
                    .order_by(Checkin.date.asc())
                    .first()
                )
                if checkin:
                    valor_medido = checkin.valor
                    data_medido  = str(checkin.date)

            resultado.append({
                "id":           m.id,
                "data":         str(m.data) if m.data else None,
                "tp_metrica":   m.tp_metrica,
                "cd_goal":      m.cd_goal,
                "goal_nome":    todos_goals.get(m.cd_goal, ""),
                "valor_alvo":   m.valor_alvo,
                "pts":          m.pts,
                "cd_medida":    m.cd_medida,
                "valor_medido": valor_medido,
                "data_medido":  data_medido,
            })
    return resultado


@app.get("/api/goals/entradas")
def get_goals_entradas():
    with get_db() as db:
        rows = db.query(EntradaGoal).order_by(EntradaGoal.data).all()
        return [
            {"id": r.id, "data": str(r.data), "cd_goal": r.cd_goal, "progresso": 1.0 if r.realizado_no_dia else 0.0}
            for r in rows
        ]



@app.post("/api/goals/entradas")
def post_goal_entrada(body: EntradaGoalInput):
    with get_db() as db:
        existing = db.query(EntradaGoal).filter(
            EntradaGoal.data    == datetime.date.fromisoformat(body.date),
            EntradaGoal.cd_goal == body.cd_goal,
        ).first()
        realizado = body.progresso >= 1
        if existing:
            existing.realizado_no_dia = realizado
        else:
            db.add(EntradaGoal(
                data             = datetime.date.fromisoformat(body.date),
                cd_goal          = body.cd_goal,
                realizado_no_dia = realizado,
            ))
        db.commit()
    return {"ok": True}

# ── STATIC ────────────────────────────────────────────────────────────────────

# app.mount("/app", StaticFiles(directory="../frontend", html=True))

# ── ROTAS — FINANÇAS ──────────────────────────────────────────────────────────

class CodigoFinancaInput(BaseModel):
    nome:   str
    tipo:   Optional[str] = None   # ignorado — tipo é derivado da hierarquia
    cd_pai: Optional[int] = None

_FORMAS_VALIDAS = {'debito', 'credito', None}

class LancamentoInput(BaseModel):
    data:            str
    cd_financa:      int
    valor:           float
    descricao:       Optional[str] = None
    forma_pagamento: Optional[str] = 'debito'

    @field_validator('forma_pagamento')
    @classmethod
    def validar_forma_pagamento(cls, v):
        if v == '':
            return None
        if v not in _FORMAS_VALIDAS:
            raise ValueError(f"forma_pagamento deve ser 'debito', 'credito' ou null, recebido: {v!r}")
        return v

class OrcamentoInput(BaseModel):
    ano:             int
    mes:             Optional[int] = None
    cd_financa:      int
    valor_orcado:    float
    forma_pagamento: Optional[str] = None

    @field_validator('forma_pagamento')
    @classmethod
    def validar_forma_pagamento(cls, v):
        if v == '':
            return None
        if v not in _FORMAS_VALIDAS:
            raise ValueError(f"forma_pagamento deve ser 'debito', 'credito' ou null, recebido: {v!r}")
        return v

class SnapshotInvestimentoInput(BaseModel):
    data:       str
    cd_financa: int
    saldo:      float

# ── helper: deriva tipo subindo até o nó raiz ────────────────────────────────
def _derive_tipo(c_id: int, lookup: dict) -> str:
    """Sobe a árvore até o nó raiz (cd_pai=NULL) e devolve o nome em minúsculas."""
    c = lookup.get(c_id)
    if not c:
        return ""
    if c.cd_pai is None:
        return c.nome.lower()   # 'receita' | 'despesa' | 'investimento'
    return _derive_tipo(c.cd_pai, lookup)

# Categorias
@app.get("/api/financas/codigos")
def get_financas_codigos():
    with get_db() as db:
        todos = db.query(CodigoFinanca).all()
        lookup = {c.id: c for c in todos}
        return [{"id": c.id, "nome": c.nome, "tipo": _derive_tipo(c.id, lookup), "cd_pai": c.cd_pai} for c in todos]

@app.post("/api/financas/codigos")
def post_financa_codigo(body: CodigoFinancaInput):
    with get_db() as db:
        novo = CodigoFinanca(nome=body.nome, cd_pai=body.cd_pai)
        db.add(novo)
        db.commit()
        db.refresh(novo)
        lookup = {c.id: c for c in db.query(CodigoFinanca).all()}
        return {"id": novo.id, "nome": novo.nome, "tipo": _derive_tipo(novo.id, lookup), "cd_pai": novo.cd_pai}

@app.delete("/api/financas/codigos/{id}")
def delete_financa_codigo(id: int):
    with get_db() as db:
        db.query(CodigoFinanca).filter(CodigoFinanca.id == id).delete()
        db.commit()
    return {"ok": True}


# Lançamentos
@app.get("/api/financas/lancamentos")
def get_lancamentos():
    with get_db() as db:
        todos = {c.id: c for c in db.query(CodigoFinanca).all()}
        rows = (db.query(LancamentoFinanceiro, CodigoFinanca)
                .join(CodigoFinanca, LancamentoFinanceiro.cd_financa == CodigoFinanca.id)
                .order_by(LancamentoFinanceiro.data.desc())
                .all())
        resultado = []
        for l, cat in rows:
            pai = todos.get(cat.cd_pai)
            resultado.append({
                "id": l.id, "data": str(l.data),
                "cd_financa": l.cd_financa,
                "categoria_nome": cat.nome,
                "grupo_nome": pai.nome if pai else cat.nome,
                "tipo": _derive_tipo(cat.id, todos),
                "valor": l.valor,
                "descricao": l.descricao,
                "forma_pagamento": l.forma_pagamento,
            })
    return resultado

@app.post("/api/financas/lancamentos")
def post_lancamento(body: LancamentoInput):
    with get_db() as db:
        db.add(LancamentoFinanceiro(
            data=datetime.date.fromisoformat(body.data),
            cd_financa=body.cd_financa,
            valor=body.valor,
            descricao=body.descricao,
            forma_pagamento=body.forma_pagamento,
        ))
        db.commit()
    return {"ok": True}

@app.delete("/api/financas/lancamentos/{id}")
def delete_lancamento(id: int):
    with get_db() as db:
        db.query(LancamentoFinanceiro).filter(LancamentoFinanceiro.id == id).delete()
        db.commit()
    return {"ok": True}


# Orçamento
@app.get("/api/financas/orcamento")
def get_orcamento():
    with get_db() as db:
        rows = db.query(OrcamentoFinanceiro).all()
        codigos = {c.id: c for c in db.query(CodigoFinanca).all()}
        return [{
            "id": r.id, "ano": r.ano, "mes": r.mes,
            "cd_financa": r.cd_financa,
            "categoria_nome": codigos[r.cd_financa].nome if r.cd_financa in codigos else "",
            "tipo": _derive_tipo(r.cd_financa, codigos) if r.cd_financa in codigos else "",
            "valor_orcado": r.valor_orcado,
            "forma_pagamento": r.forma_pagamento,
        } for r in rows]

@app.post("/api/financas/orcamento")
def post_orcamento(body: OrcamentoInput):
    with get_db() as db:
        existing = db.query(OrcamentoFinanceiro).filter(
            OrcamentoFinanceiro.ano == body.ano,
            OrcamentoFinanceiro.mes == body.mes,
            OrcamentoFinanceiro.cd_financa == body.cd_financa,
        ).first()
        if existing:
            existing.valor_orcado    = body.valor_orcado
            existing.forma_pagamento = body.forma_pagamento
        else:
            db.add(OrcamentoFinanceiro(
                ano=body.ano, mes=body.mes,
                cd_financa=body.cd_financa,
                valor_orcado=body.valor_orcado,
                forma_pagamento=body.forma_pagamento,
            ))
        db.commit()
    return {"ok": True}

@app.delete("/api/financas/orcamento/{id}")
def delete_orcamento(id: int):
    with get_db() as db:
        db.query(OrcamentoFinanceiro).filter(OrcamentoFinanceiro.id == id).delete()
        db.commit()
    return {"ok": True}


# Investimentos
@app.get("/api/financas/investimentos")
def get_investimentos():
    with get_db() as db:
        rows = db.query(SnapshotInvestimento).order_by(SnapshotInvestimento.data).all()
        codigos = {c.id: c for c in db.query(CodigoFinanca).all()}
        return [{
            "id": r.id, "data": str(r.data),
            "cd_financa": r.cd_financa,
            "nome": codigos[r.cd_financa].nome if r.cd_financa in codigos else "",
            "saldo": r.saldo,
        } for r in rows]

@app.post("/api/financas/investimentos")
def post_investimento(body: SnapshotInvestimentoInput):
    with get_db() as db:
        db.add(SnapshotInvestimento(
            data=datetime.date.fromisoformat(body.data),
            cd_financa=body.cd_financa,
            saldo=body.saldo,
        ))
        db.commit()
    return {"ok": True}

@app.delete("/api/financas/investimentos/{id}")
def delete_investimento(id: int):
    with get_db() as db:
        db.query(SnapshotInvestimento).filter(SnapshotInvestimento.id == id).delete()
        db.commit()
    return {"ok": True}


# Viagens
class ViagemRenameInput(BaseModel):
    nome_viagem: str

@app.get("/api/financas/viagens")
def get_viagens():
    with get_db() as db:
        todos_cod = {c.id: c for c in db.query(CodigoFinanca).all()}
        rels = db.query(RelacionamentoLancamentoViagem).all()
        ids_rel = [r.cd_lancamento for r in rels]
        if not ids_rel:
            return []
        lancs = {
            l.id: l for l in db.query(LancamentoFinanceiro)
            .filter(LancamentoFinanceiro.id.in_(ids_rel)).all()
        }
        # agrupa por nome_viagem
        grupos = defaultdict(list)
        for r in rels:
            l = lancs.get(r.cd_lancamento)
            if not l:
                continue
            cat = todos_cod.get(l.cd_financa)
            grupos[r.nome_viagem].append({
                "id": l.id,
                "data": str(l.data),
                "cd_financa": l.cd_financa,
                "categoria_nome": cat.nome if cat else "",
                "tipo": _derive_tipo(l.cd_financa, todos_cod),
                "valor": l.valor,
                "descricao": l.descricao,
                "forma_pagamento": l.forma_pagamento,
            })
        return [
            {
                "nome_viagem": nome,
                "total": sum(l["valor"] for l in items),
                "num_lancamentos": len(items),
                "lancamentos": sorted(items, key=lambda x: x["data"]),
            }
            for nome, items in sorted(grupos.items())
        ]

@app.patch("/api/financas/viagens/{cd_lancamento}")
def rename_viagem(cd_lancamento: int, body: ViagemRenameInput):
    """Renomeia todos os lançamentos que compartilham o mesmo nome_viagem do lançamento informado."""
    with get_db() as db:
        rel = db.query(RelacionamentoLancamentoViagem)\
            .filter(RelacionamentoLancamentoViagem.cd_lancamento == cd_lancamento).first()
        if not rel:
            raise HTTPException(404, "Lançamento não vinculado a viagem")
        old_nome = rel.nome_viagem
        db.query(RelacionamentoLancamentoViagem)\
            .filter(RelacionamentoLancamentoViagem.nome_viagem == old_nome)\
            .update({"nome_viagem": body.nome_viagem})
        db.commit()
    return {"ok": True}

# ── INDICADORES ──────────────────────────────────────────────────────────────

class IndicadorInput(BaseModel):
    ano:   int
    mes:   int
    nome:  str
    valor: float

@app.post("/api/financas/indicadores")
def post_indicador(body: IndicadorInput):
    """Cria ou atualiza o snapshot mensal de um indicador (filho do nó 78).
    Cria a categoria automaticamente caso ela não exista ainda."""
    with get_db() as db:
        cat = db.query(CodigoFinanca).filter(
            CodigoFinanca.cd_pai == 78,
            CodigoFinanca.nome   == body.nome,
        ).first()
        if not cat:
            cat = CodigoFinanca(nome=body.nome, cd_pai=78, tipo='investimento')
            db.add(cat)
            db.flush()
        data = datetime.date(body.ano, body.mes, 1)
        existing = db.query(SnapshotInvestimento).filter(
            SnapshotInvestimento.cd_financa == cat.id,
            SnapshotInvestimento.data       == data,
        ).first()
        if existing:
            existing.saldo = body.valor
        else:
            db.add(SnapshotInvestimento(data=data, cd_financa=cat.id, saldo=body.valor))
        db.commit()
    return {"ok": True}

@app.delete("/api/financas/viagens/{cd_lancamento}")
def unlink_viagem(cd_lancamento: int):
    """Remove o lançamento da viagem (desvincula)."""
    with get_db() as db:
        db.query(RelacionamentoLancamentoViagem)\
            .filter(RelacionamentoLancamentoViagem.cd_lancamento == cd_lancamento).delete()
        db.commit()
    return {"ok": True}


