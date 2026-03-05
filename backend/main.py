from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from database import Session, engine
from models import Base, Checkin, CodigoMedida

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cria as tabelas no banco ao iniciar (se não existirem)
Base.metadata.create_all(engine)

# Serve os arquivos do frontend
app.mount("/app", StaticFiles(directory="../frontend"), name="frontend")

# ── SEED ─────────────────────────────────────────────────────────
def seed_medidas():
    db = Session()
    if db.query(CodigoMedida).count() == 0:
        medidas = [
            ("agua",                "bioimpedancia"),
            ("massa_muscular",      "bioimpedancia"),
            ("peso",                "bioimpedancia"),
            ("gordura",             "bioimpedancia"),
            ("gordura_visceral",    "bioimpedancia"),
            ("dobra_triceps",       "dobras"),
            ("dobra_supra",         "dobras"),
            ("dobra_panturrilha",   "dobras"),
            ("dobra_biceps",        "dobras"),
            ("dobra_coxa",          "dobras"),
            ("dobra_supra_iliaca",  "dobras"),
            ("dobra_axilar_medial", "dobras"),
            ("dobra_abdome",        "dobras"),
            ("circ_punho",          "circunferencias"),
            ("circ_coxa",           "circunferencias"),
            ("circ_braco",          "circunferencias"),
            ("circ_abdominal",      "circunferencias"),
            ("circ_panturrilha",    "circunferencias"),
            ("cintura",             "circunferencias"),
            ("circ_torax",          "circunferencias"),
            ("circ_tornozelo",      "circunferencias"),
            ("quadril",             "circunferencias"),
            ("circ_antebraco",      "circunferencias"),
            ("rmr",                 "bem_estar"),
            ("vo2",                 "bem_estar"),
            ("sono",                "bem_estar"),
            ("movimento",           "bem_estar"),
            ("exercicio",           "bem_estar"),
        ]
        for descricao, macro in medidas:
            db.add(CodigoMedida(descricao=descricao, macro=macro))
        db.commit()
    db.close()

seed_medidas()

# ── ROTAS ─────────────────────────────────────────────────────────
class CheckinInput(BaseModel):
    date: str
    medidas: dict

@app.get("/api/checkins")
def get_checkins():
    db = Session()
    rows = (
        db.query(Checkin, CodigoMedida)
        .join(CodigoMedida, Checkin.cd_medida == CodigoMedida.id)
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

    return list(por_data.values())

@app.post("/api/checkins")
def post_checkin(body: CheckinInput):
    db = Session()
    codigos = db.query(CodigoMedida).all()
    mapa = {c.descricao: c.id for c in codigos}

    for campo, valor in body.medidas.items():
        if valor is None or campo not in mapa:
            continue
        db.add(Checkin(date=body.date, cd_medida=mapa[campo], valor=float(valor)))

    db.commit()
    db.close()
    return {"ok": True}