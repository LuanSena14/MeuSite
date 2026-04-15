from contextlib import asynccontextmanager, contextmanager

from collections import defaultdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional

from database import Session, engine
from models import Base, Checkin, CodigoMedida, UnidadeMedida, CodigoExercicio, EntradaExercicio, CodigoGoal, EntradaGoal, Meta, CodigoFinanca, LancamentoFinanceiro, OrcamentoFinanceiro, SnapshotInvestimento, RelacionamentoDebitoInvestimento, RelacionamentoLancamentoViagem
from sqlalchemy import text as _text
import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with engine.connect() as _conn:
        _conn.execute(_text("ALTER TABLE lancamento_financeiro ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR DEFAULT 'debito'"))
        _conn.execute(_text("ALTER TABLE orcamento_financeiro  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR"))
        _conn.execute(_text("ALTER TABLE codigo_financa        DROP COLUMN IF EXISTS dono"))
        _conn.commit()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


@contextmanager
def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


def seed():
    with get_db() as db:
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

    resultado = []
    for data in sorted(por_data.keys()):
        resultado.append(por_data[data])

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


class CheckinDatePatchInput(BaseModel):
    old_date: str
    new_date: str

@app.patch("/api/checkins/date")
def patch_checkin_date(body: CheckinDatePatchInput):
    try:
        old = datetime.date.fromisoformat(body.old_date)
        new = datetime.date.fromisoformat(body.new_date)
    except ValueError:
        raise HTTPException(400, "Datas inválidas")
    with get_db() as db:
        rows = db.query(Checkin).filter(Checkin.date == old).all()
        if not rows:
            raise HTTPException(404, "Nenhum check-in encontrado para essa data")
        existing_new = db.query(Checkin).filter(Checkin.date == new).first()
        if existing_new:
            raise HTTPException(409, "Já existe um check-in para a data de destino")
        for row in rows:
            row.date = new
        db.commit()
    return {"ok": True, "updated": len(rows)}


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


class ExercicioDatePatchInput(BaseModel):
    data: str

@app.patch("/api/exercicios/{id}")
def patch_exercicio_date(id: int, body: ExercicioDatePatchInput):
    try:
        nova_data = datetime.date.fromisoformat(body.data)
    except ValueError:
        raise HTTPException(400, "Data inválida")
    with get_db() as db:
        row = db.query(EntradaExercicio).filter(EntradaExercicio.id == id).first()
        if not row:
            raise HTTPException(404, "Exercício não encontrado")
        row.data = nova_data
        db.commit()
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}


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


class GoalDatePatchInput(BaseModel):
    data: str

@app.patch("/api/goals/entradas/{id}")
def patch_goal_entrada_date(id: int, body: GoalDatePatchInput):
    try:
        nova_data = datetime.date.fromisoformat(body.data)
    except ValueError:
        raise HTTPException(400, "Data inválida")
    with get_db() as db:
        row = db.query(EntradaGoal).filter(EntradaGoal.id == id).first()
        if not row:
            raise HTTPException(404, "Entrada de goal não encontrada")
        row.data = nova_data
        db.commit()
    return {"ok": True}


class CodigoFinancaInput(BaseModel):
    nome:   str
    tipo:   Optional[str] = None   # ignorado - tipo é derivado da hierarquia
    cd_pai: Optional[int] = None

_FORMAS_VALIDAS = {'debito', 'credito', None}
ID_DESPESA_RECORRENTE = 6
ID_INVEST_DEFAULT_YEAR_BILLS = 57

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

class DebitoInvestimentoInput(BaseModel):
    cd_financa_origem: int
    cd_financa_investimento: int

def _derive_tipo(c_id: int, lookup: dict) -> str:
    """Sobe a árvore até o nó raiz (cd_pai=NULL) e devolve o nome em minúsculas."""
    c = lookup.get(c_id)
    if not c:
        return ""
    if c.cd_pai is None:
        return c.nome.lower()   # 'receita' | 'despesa' | 'investimento'
    return _derive_tipo(c.cd_pai, lookup)

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

class LancamentoDatePatchInput(BaseModel):
    data: str

@app.patch("/api/financas/lancamentos/{id}")
def patch_lancamento_date(id: int, body: LancamentoDatePatchInput):
    try:
        nova_data = datetime.date.fromisoformat(body.data)
    except ValueError:
        raise HTTPException(400, "Data inválida")
    with get_db() as db:
        row = db.query(LancamentoFinanceiro).filter(LancamentoFinanceiro.id == id).first()
        if not row:
            raise HTTPException(404, "Lançamento não encontrado")
        row.data = nova_data
        db.commit()
    return {"ok": True}

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

def _get_descendant_ids(cd_financa: int, codigos: dict) -> list:
    """Retorna IDs de todas as categorias filhas (recursivamente)."""
    cat = codigos.get(cd_financa)
    if not cat:
        return []
    result = [cd_financa]
    for c_id, c_obj in codigos.items():
        if c_obj.cd_pai == cd_financa:
            result.extend(_get_descendant_ids(c_id, codigos))
    return result

def _month_bounds(ano: int, mes: int):
    inicio = datetime.date(ano, mes, 1)
    fim = datetime.date(ano + (1 if mes == 12 else 0), 1 if mes == 12 else mes + 1, 1)
    return inicio, fim

def _is_descendant_of(cd_filho: int, cd_ancestral: int, codigos: dict) -> bool:
    atual = codigos.get(cd_filho)
    visitados = set()
    while atual and atual.id not in visitados:
        if atual.id == cd_ancestral:
            return True
        visitados.add(atual.id)
        if atual.cd_pai is None:
            break
        atual = codigos.get(atual.cd_pai)
    return False

def _find_default_investimento_id(codigos: dict):
    if ID_INVEST_DEFAULT_YEAR_BILLS in codigos:
        return ID_INVEST_DEFAULT_YEAR_BILLS

    for c in codigos.values():
        if _derive_tipo(c.id, codigos) == 'investimento' and c.nome.strip().lower() == 'year bills':
            return c.id
    return None

def _resolve_investimento_debito(cd_financa_despesa: int, rel_map: dict, codigos: dict, default_invest_id):
    atual = codigos.get(cd_financa_despesa)
    visitados = set()

    # Herança de regra: se a categoria filha não tem mapeamento, sobe para o pai.
    while atual and atual.id not in visitados:
        visitados.add(atual.id)
        mapped = rel_map.get(atual.id)
        if mapped is not None and _derive_tipo(mapped, codigos) == 'investimento':
            return mapped
        if atual.cd_pai is None:
            break
        atual = codigos.get(atual.cd_pai)

    return default_invest_id

def _get_investimento_movimentacoes(cd_financa: int, ano: int, mes: int, lancamentos_mes: list, codigos: dict, rel_map: dict, default_invest_id):
    """
    Calcula aportes e resgates de um investimento em um mês específico.

    Estratégia:
    - Aportes: lançamentos diretos na própria caixinha
    - Resgates: despesas não-recorrentes debitadas na caixinha mapeada
      (ou fallback automático para Year Bills)

    Retorna: {"aportes_mes": float, "resgates_mes": float}
    """
    _ = (ano, mes)  # Mantido para semântica da função.
    aportes = 0.0
    resgates = 0.0

    for l in lancamentos_mes:
        tipo = _derive_tipo(l.cd_financa, codigos)

        if tipo == 'investimento' and l.cd_financa == cd_financa:
            aportes += float(l.valor)
            continue

        if tipo != 'despesa':
            continue
        if _is_descendant_of(l.cd_financa, ID_DESPESA_RECORRENTE, codigos):
            continue

        alvo = _resolve_investimento_debito(l.cd_financa, rel_map, codigos, default_invest_id)
        if alvo == cd_financa:
            resgates += float(l.valor)

    return {"aportes_mes": aportes, "resgates_mes": resgates}

@app.get("/api/financas/debito-investimento")
def get_debito_investimento_rel():
    with get_db() as db:
        codigos = {c.id: c for c in db.query(CodigoFinanca).all()}
        rels = db.query(RelacionamentoDebitoInvestimento).all()
        return [{
            "cd_financa_origem": r.cd_financa_origem,
            "origem_nome": codigos[r.cd_financa_origem].nome if r.cd_financa_origem in codigos else "",
            "cd_financa_investimento": r.cd_financa_investimento,
            "investimento_nome": codigos[r.cd_financa_investimento].nome if r.cd_financa_investimento in codigos else "",
        } for r in rels]

@app.post("/api/financas/debito-investimento")
def post_debito_investimento_rel(body: DebitoInvestimentoInput):
    with get_db() as db:
        codigos = {c.id: c for c in db.query(CodigoFinanca).all()}

        if body.cd_financa_origem not in codigos:
            raise HTTPException(400, "cd_financa_origem inexistente")
        if body.cd_financa_investimento not in codigos:
            raise HTTPException(400, "cd_financa_investimento inexistente")
        if _derive_tipo(body.cd_financa_origem, codigos) != 'despesa':
            raise HTTPException(400, "cd_financa_origem deve ser categoria de despesa")
        if _derive_tipo(body.cd_financa_investimento, codigos) != 'investimento':
            raise HTTPException(400, "cd_financa_investimento deve ser categoria de investimento")

        existing = db.query(RelacionamentoDebitoInvestimento).filter(
            RelacionamentoDebitoInvestimento.cd_financa_origem == body.cd_financa_origem
        ).first()

        if existing:
            existing.cd_financa_investimento = body.cd_financa_investimento
        else:
            db.add(RelacionamentoDebitoInvestimento(
                cd_financa_origem=body.cd_financa_origem,
                cd_financa_investimento=body.cd_financa_investimento,
            ))
        db.commit()
    return {"ok": True}

@app.delete("/api/financas/debito-investimento/{cd_financa_origem}")
def delete_debito_investimento_rel(cd_financa_origem: int):
    with get_db() as db:
        db.query(RelacionamentoDebitoInvestimento).filter(
            RelacionamentoDebitoInvestimento.cd_financa_origem == cd_financa_origem
        ).delete()
        db.commit()
    return {"ok": True}

@app.get("/api/financas/investimentos")
def get_investimentos():
    with get_db() as db:
        snapshots = db.query(SnapshotInvestimento).order_by(SnapshotInvestimento.data).all()
        codigos = {c.id: c for c in db.query(CodigoFinanca).all()}
        rel_map = {
            r.cd_financa_origem: r.cd_financa_investimento
            for r in db.query(RelacionamentoDebitoInvestimento).all()
        }

        default_invest_id = _find_default_investimento_id(codigos)

        months_needed = {(s.data.year, s.data.month) for s in snapshots}
        lancamentos_por_mes = defaultdict(list)
        for l in db.query(LancamentoFinanceiro).all():
            key = (l.data.year, l.data.month)
            if key in months_needed:
                lancamentos_por_mes[key].append(l)
        
        # Agrupa snapshots por cd_financa
        snaps_por_cat = defaultdict(list)
        for s in snapshots:
            snaps_por_cat[s.cd_financa].append(s)
        
        resultado = []
        for r in snapshots:
            cat_snaps = snaps_por_cat[r.cd_financa]
            
            # Extrai ano e mês da data do snapshot
            snap_date = r.data
            ano, mes = snap_date.year, snap_date.month
            
            # Encontra snapshot mais recente do mês anterior
            prev_mes = mes - 1 if mes > 1 else 12
            prev_ano = ano if mes > 1 else ano - 1
            prev_snaps = [s for s in cat_snaps if s.data.year == prev_ano and s.data.month == prev_mes]
            saldo_anterior = prev_snaps[-1].saldo if prev_snaps else None
            
            # Calcula aportes e resgates do mês
            mov = _get_investimento_movimentacoes(
                r.cd_financa,
                ano,
                mes,
                lancamentos_por_mes.get((ano, mes), []),
                codigos,
                rel_map,
                default_invest_id,
            )
            
            # Calcula rendimento
            rendimento = None
            if saldo_anterior is not None:
                rendimento = r.saldo - saldo_anterior - (mov["aportes_mes"] - mov["resgates_mes"])
            
            resultado.append({
                "id": r.id,
                "data": str(r.data),
                "cd_financa": r.cd_financa,
                "nome": codigos[r.cd_financa].nome if r.cd_financa in codigos else "",
                "saldo": r.saldo,
                "saldo_anterior": saldo_anterior,
                "aportes_mes": mov["aportes_mes"],
                "resgates_mes": mov["resgates_mes"],
                "rendimento_calculado": rendimento,
            })
        
        return resultado

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
        viagens = []
        for nome, items in grupos.items():
            lancs_sorted = sorted(items, key=lambda x: x["data"])
            viagens.append({
                "nome_viagem": nome,
                "total": sum(l["valor"] for l in items),
                "num_lancamentos": len(items),
                "ultima_data": (lancs_sorted[-1]["data"] if lancs_sorted else None),
                "lancamentos": lancs_sorted,
            })

        # Mais recentes primeiro (desempate por nome)
        viagens.sort(key=lambda v: v["nome_viagem"])
        viagens.sort(key=lambda v: v.get("ultima_data") or "", reverse=True)
        return viagens

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
            cat = CodigoFinanca(nome=body.nome, cd_pai=78)
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

