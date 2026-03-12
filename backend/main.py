from contextlib import contextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from database import Session, engine
from models import Base, Checkin, CodigoMedida, UnidadeMedida, CodigoExercicio, EntradaExercicio, CodigoGoal, EntradaGoal, Meta
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(engine)

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