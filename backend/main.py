from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.database import engine, Session
from backend.models import Base, Checkin, CodigoMedida, UnidadeMedida
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cria as tabelas no banco ao iniciar (se não existirem)
Base.metadata.create_all(engine)

# ── SEED ─────────────────────────────────────────────────────────────────────

def seed():
    db = Session()

    # ── 1. Unidades de medida ─────────────────────────────────────────────────
    unidades_data = [
        ("kg",         "quilograma"),
        ("cm",         "centímetro"),
        ("mm",         "milímetro"),
        ("kcal",       "quilocaloria"),
        ("mL/kg/min",  "mililitro por quilo por minuto"),
        ("hrs",        "horas"),
        ("min",        "minutos"),
        ("",           "sem unidade"),
    ]

    # Cria só as que não existem ainda
    siglas_existentes = {u.sigla for u in db.query(UnidadeMedida).all()}
    for sigla, nome in unidades_data:
        if sigla not in siglas_existentes:
            db.add(UnidadeMedida(sigla=sigla, nome=nome))
    db.flush()  # garante que os IDs estejam disponíveis abaixo

    # Monta mapa sigla → id para usar no seed das medidas
    unidade_map = {u.sigla: u.id for u in db.query(UnidadeMedida).all()}

    # ── 2. Grupos e medidas ───────────────────────────────────────────────────
    # Formato: (descricao, cd_pai_descricao, sigla_unidade)
    # cd_pai_descricao = None → é um grupo raiz
    seed_data = [
        # Grupos (sem pai, sem unidade)
        ("Bioimpedância",    None,               ""),
        ("Dobras Cutâneas",  None,               ""),
        ("Circunferências",  None,               ""),
        ("Bem-estar",        None,               ""),

        # Bioimpedância
        ("agua",             "Bioimpedância",    "kg"),
        ("massa_muscular",   "Bioimpedância",    "kg"),
        ("peso",             "Bioimpedância",    "kg"),
        ("gordura",          "Bioimpedância",    "kg"),
        ("gordura_visceral", "Bioimpedância",    ""),
        ("altura",           "Bioimpedância",    "cm"),

        # Dobras Cutâneas
        ("dobra_triceps",       "Dobras Cutâneas", "mm"),
        ("dobra_supra",         "Dobras Cutâneas", "mm"),
        ("dobra_panturrilha",   "Dobras Cutâneas", "mm"),
        ("dobra_biceps",        "Dobras Cutâneas", "mm"),
        ("dobra_coxa",          "Dobras Cutâneas", "mm"),
        ("dobra_supra_iliaca",  "Dobras Cutâneas", "mm"),
        ("dobra_axilar_medial", "Dobras Cutâneas", "mm"),
        ("dobra_abdome",        "Dobras Cutâneas", "mm"),

        # Circunferências
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

        # Bem-estar
        ("rmr",              "Bem-estar",        "kcal"),
        ("vo2",              "Bem-estar",        "mL/kg/min"),
        ("sono",             "Bem-estar",        "hrs"),
        ("movimento",        "Bem-estar",        "kcal"),
        ("exercicio",        "Bem-estar",        "min"),
    ]

    existentes = {c.descricao for c in db.query(CodigoMedida).all()}

    # Primeira passagem: insere os grupos (cd_pai = None)
    for descricao, pai_descricao, sigla in seed_data:
        if descricao not in existentes and pai_descricao is None:
            db.add(CodigoMedida(
                descricao=descricao,
                cd_pai=None,
                id_unidade=unidade_map.get(sigla)
            ))
    db.flush()

    # Monta mapa descricao → id (agora com os grupos criados)
    medida_map = {c.descricao: c.id for c in db.query(CodigoMedida).all()}

    # Segunda passagem: insere as medidas filhas
    for descricao, pai_descricao, sigla in seed_data:
        if descricao not in existentes and pai_descricao is not None:
            db.add(CodigoMedida(
                descricao=descricao,
                cd_pai=medida_map.get(pai_descricao),
                id_unidade=unidade_map.get(sigla)
            ))

    db.commit()
    db.close()

seed()

# ── ROTAS ─────────────────────────────────────────────────────────────────────

class CheckinInput(BaseModel):
    date: str
    medidas: dict


@app.get("/api/medidas")
def get_medidas():
    """
    Retorna a árvore de medidas pronta pro frontend montar o seletor.
    Formato: lista de grupos, cada grupo com lista de filhos.
    [
      {
        "id": 1,
        "descricao": "Bioimpedância",
        "filhos": [
          { "id": 5, "descricao": "peso", "unidade": "kg" },
          ...
        ]
      },
      ...
    ]
    """
    db = Session()
    grupos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai == None).all()

    resultado = []
    for grupo in grupos:
        filhos = []
        for filho in grupo.filhos:
            filhos.append({
                "id":       filho.id,
                "descricao": filho.descricao,
                "unidade":  filho.unidade.sigla if filho.unidade else "",
            })
        resultado.append({
            "id":       grupo.id,
            "descricao": grupo.descricao,
            "filhos":   filhos,
        })

    db.close()
    return resultado


@app.get("/api/checkins")
def get_checkins():
    db = Session()

    # Só busca medidas que são filhas (cd_pai != None) — grupos não têm valor
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

    # Propaga altura para check-ins que não a informaram
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

    # Só considera medidas filhas (não grupos)
    codigos = db.query(CodigoMedida).filter(CodigoMedida.cd_pai != None).all()
    mapa = {c.descricao: c.id for c in codigos}

    for campo, valor in body.medidas.items():
        if valor is None or campo not in mapa:
            continue
        db.add(Checkin(date=body.date, cd_medida=mapa[campo], valor=float(valor)))

    db.commit()
    db.close()
    return {"ok": True}

app.mount("/app", StaticFiles(directory="../frontend", html=True))