from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from database import Session, engine
from models import Base, Checkin, CodigoMedida, UnidadeMedida, CodigoExercicio, EntradaExercicio
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(engine)

# ── SEED ─────────────────────────────────────────────────────────────────────

def seed():
    db = Session()

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
    db.close()

seed()

# ── ROTAS — BODY ──────────────────────────────────────────────────────────────

class CheckinInput(BaseModel):
    date: str
    medidas: dict


@app.get("/api/medidas")
def get_medidas():
    db = Session()
    grupos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai == None).all()
    resultado = []
    for grupo in grupos:
        filhos = [{"id": f.id, "descricao": f.descricao, "unidade": f.unidade.sigla if f.unidade else ""} for f in (grupo.filhos or [])]
        resultado.append({"id": grupo.id, "descricao": grupo.descricao, "filhos": filhos})
    db.close()
    return resultado


@app.get("/api/checkins")
def get_checkins():
    db = Session()
    rows = (
        db.query(Checkin, CodigoMedida)
        .join(CodigoMedida, Checkin.cd_medida == CodigoMedida.id)
        .filter(CodigoMedida.cd_pai != None)
        .order_by(Checkin.date)
        .all()
    )
    db.close()

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
    db = Session()
    codigos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai != None).all()
    mapa = {c.descricao: c.id for c in codigos}
    for campo, valor in body.medidas.items():
        if valor is None or campo not in mapa:
            continue
        db.add(Checkin(date=body.date, cd_medida=mapa[campo], valor=float(valor)))
    db.commit()
    db.close()
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
    db = Session()

    grupos = db.query(CodigoExercicio).filter(CodigoExercicio.cd_pai == None).all()
    todos  = db.query(CodigoExercicio).all()

    resultado = []

    for g in grupos:
        filhos = [
            {"id": f.id, "descricao": f.descricao}
            for f in todos if f.cd_pai == g.id
        ]

        resultado.append({
            "id": g.id,
            "descricao": g.descricao,
            "filhos": filhos
        })

    db.close()
    return resultado

@app.get("/api/exercicios")
def get_exercicios():
    db = Session()
    rows = (
        db.query(EntradaExercicio, CodigoExercicio)
        .join(CodigoExercicio, EntradaExercicio.cd_exercicio == CodigoExercicio.id)
        .order_by(EntradaExercicio.data, EntradaExercicio.hora)
        .all()
    )

    # Monta mapa id → nome do pai (grupo) em uma só query
    todos = {c.id: c for c in db.query(CodigoExercicio).all()}
    db.close()

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
    db = Session()
    db.add(EntradaExercicio(
        data         = datetime.date.fromisoformat(body.date),
        hora         = datetime.time.fromisoformat(body.hora),
        cd_exercicio = body.cd_exercicio,
        duracao      = body.duracao,
        esforco      = body.esforco,
    ))
    db.commit()
    db.close()
    return {"ok": True}


# ── STATIC ────────────────────────────────────────────────────────────────────

app.mount("/app", StaticFiles(directory="../frontend", html=True))