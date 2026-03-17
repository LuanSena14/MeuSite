# 4. Documentação Detalhada do Backend - BodyLog

## 🚀 Visão Geral do Backend

O backend do BodyLog é construído com **FastAPI** (framework Python web moderno) e fornece uma API REST que o frontend consome via fetch().

### Stack Backend
- **Linguagem:** Python 3.x
- **Framework Web:** FastAPI (minimalista, rápido, moderno)
- **Server:** Uvicorn (ASGI server)
- **ORM:** SQLAlchemy 2.0 (object-relational mapping para PostgreSQL)
- **Validação:** Pydantic (type hints e validação de dados)
- **Database:** PostgreSQL

---

## 📁 Arquivos do Backend

```
backend/
├── main.py           ← Rotas HTTP (FastAPI)
├── database.py       ← Conexão com PostgreSQL
├── models.py         ← Modelos ORM (SQLAlchemy)
├── requirements.txt  ← Dependências Python
└── Docs/             ← Documentação adicional
```

---

## 📄 database.py - Conexão com Banco de Dados

### Código Completo
```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Carrega variáveis de .env
load_dotenv()

# Lê a URL do banco de dados do ambiente
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

# Conversão para driver correto do PostgreSQL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Cria engine (pool de conexões)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True  # Testa conexão antes de usar
)

# Factory para criar sessões
Session = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

### O que cada parte faz

| Parte | Explicação |
|-------|-----------|
| `load_dotenv()` | Carrega arquivo `.env` com variáveis de ambiente |
| `DATABASE_URL = os.getenv()` | Lê URL do banco: `postgresql://user:pass@host:5432/db` |
| `create_engine()` | Cria pool de conexões reutilizáveis |
| `pool_pre_ping=True` | Valida conexão antes de usar (evita conexões mortas) |
| `sessionmaker` | Factory que cria novo `Session()` a cada requisição |

### Variáveis de Ambiente

Em **desenvolvimento local** (arquivo `.env`):
```
DATABASE_URL=postgresql://postgres:senha@localhost:5432/bodylog
API_PORT=8001
```

Em **produção** (Render.com - variável de ambiente):
```
DATABASE_URL=postgresql://user:pass@render-host:5432/bodylog_prod
```

---

## 📋 models.py - Modelos ORM (SQLAlchemy)

### O que é ORM?

ORM (Object-Relational Mapping) mapeia tabelas SQL para classes Python. Em vez de escrever SQL raw, você trabalha com objetos Python.

### Exemplo Comparativo

**Com SQL Raw:**
```python
db.execute("INSERT INTO checkins (date, cd_medida, valor) VALUES (%s, %s, %s)", 
           ('2026-03-15', 1, 78.5))
```

**Com ORM (SQLAlchemy):**
```python
checkin = Checkin(date='2026-03-15', cd_medida=1, valor=78.5)
db.add(checkin)
db.commit()
```

### Estrutura de um Modelo

```python
from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UnidadeMedida(Base):
    __tablename__ = "unidade_medida"
    
    # Colunas da tabela
    id    = Column(Integer, primary_key=True, autoincrement=True)
    sigla = Column(String, nullable=False)          # "kg", "cm", "%"
    nome  = Column(String, nullable=True)           # "quilograma"

# Uso:
unidade = UnidadeMedida(sigla="kg", nome="quilograma")
db.add(unidade)
db.commit()
print(unidade.id)  # Agora tem ID gerado pelo banco
```

### Modelo Complexo com Relacionamentos

```python
class CodigoMedida(Base):
    __tablename__ = "codigo_medida"
    
    id            = Column(Integer, primary_key=True)
    descricao     = Column(String, nullable=False)
    cd_pai        = Column(Integer, ForeignKey("codigo_medida.id"))
    id_unidade    = Column(Integer, ForeignKey("unidade_medida.id"))
    
    # Relacionamento com UnidadeMedida (1:1)
    unidade = relationship("UnidadeMedida")
    
    # Auto-referência (hierarquia pai-filho)
    pai = relationship(
        "CodigoMedida",
        remote_side=[id],           # Define qual é a coluna local
        backref="filhos"            # Acesso reverso from pai.filhos
    )
```

**Como usar o relacionamento:**
```python
# Carregar medida com sua unidade
medida = db.query(CodigoMedida).filter(CodigoMedida.id == 1).first()
print(medida.unidade.sigla)  # "kg" - acessa relacionamento

# Carregar medida com seu pai
if medida.cd_pai:
    medida_pai = db.query(CodigoMedida).filter(
        CodigoMedida.id == medida.cd_pai
    ).first()
    # Ou via relacionamento:
    print(medida.pai.descricao)  # "Bioimpedância"
```

### Todos os Modelos Principais

```python
# 1. Unidade de Medida
class UnidadeMedida(Base):
    __tablename__ = "unidade_medida"
    id = Column(Integer, primary_key=True)
    sigla = Column(String, nullable=False)
    nome = Column(String)

# 2. Código de Medida (hierarquia)
class CodigoMedida(Base):
    __tablename__ = "codigo_medida"
    id = Column(Integer, primary_key=True)
    descricao = Column(String, nullable=False)
    cd_pai = Column(Integer, ForeignKey("codigo_medida.id"))
    id_unidade = Column(Integer, ForeignKey("unidade_medida.id"))
    unidade = relationship("UnidadeMedida")
    pai = relationship("CodigoMedida", remote_side=[id], backref="filhos")

# 3. Checkin (registro de métricas)
class Checkin(Base):
    __tablename__ = "checkins"
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    cd_medida = Column(Integer, ForeignKey("codigo_medida.id"), nullable=False)
    valor = Column(Float, nullable=False)

# 4. Código Exercício (hierarquia)
class CodigoExercicio(Base):
    __tablename__ = "codigo_exercicio"
    id = Column(Integer, primary_key=True)
    descricao = Column(String, nullable=False)
    cd_pai = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=True)
    filhos = relationship("CodigoExercicio", remote_side=[cd_pai], backref="pai")

# 5. Entrada Exercício (registro de treino)
class EntradaExercicio(Base):
    __tablename__ = "entrada_exercicio"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    cd_exercicio = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=False)
    duracao = Column(Integer)         # minutos
    esforco = Column(Integer)         # 1-10

# 6. Código Goal (hierarquia de metas)
class CodigoGoal(Base):
    __tablename__ = "codigo_goals"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    cd_pai = Column(Integer, ForeignKey("codigo_goals.id"), nullable=True)
    descricao = Column(String)

# 7. Entrada Goal (registro diário de meta)
class EntradaGoal(Base):
    __tablename__ = "entrada_goals"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    cd_goal = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False)
    realizado_no_dia = Column(Boolean, nullable=False)

# 8. Pontuação Goal (Meta mensal)
class Meta(Base):
    __tablename__ = "pontuacao_goal"
    id = Column(Integer, primary_key=True)
    data = Column(Date)
    tp_metrica = Column(String, nullable=False)
    cd_goal = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False)
    valor = Column(Float)
    pts = Column(Integer)
    cd_medida = Column(Integer, ForeignKey("codigo_medida.id"))

# 9. Código Finança (hierarquia de categorias)
class CodigoFinanca(Base):
    __tablename__ = "codigo_financa"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    cd_pai = Column(Integer, ForeignKey("codigo_financa.id"), nullable=True)
    filhos = relationship("CodigoFinanca", remote_side=[cd_pai], backref="pai")

# 10. Lançamento Financeiro (transação)
class LancamentoFinanceiro(Base):
    __tablename__ = "lancamento_financeiro"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    cd_financa = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    valor = Column(Float, nullable=False)
    descricao = Column(String)
    forma_pagamento = Column(String, default='debito')
    categoria = relationship("CodigoFinanca")

# 11. Orçamento Financeiro
class OrcamentoFinanceiro(Base):
    __tablename__ = "orcamento_financeiro"
    id = Column(Integer, primary_key=True)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer)
    cd_financa = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    valor_orcado = Column(Float, nullable=False)
    forma_pagamento = Column(String)
    categoria = relationship("CodigoFinanca")

# 12. Snapshot Investimento
class SnapshotInvestimento(Base):
    __tablename__ = "snapshot_investimento"
    id = Column(Integer, primary_key=True)
    data = Column(Date, nullable=False)
    cd_financa = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    saldo = Column(Float, nullable=False)
    categoria = relationship("CodigoFinanca")

# 13. Relacionamento Lançamento-Viagem
class RelacionamentoLancamentoViagem(Base):
    __tablename__ = "relacionamento_lancamento_viagem"
    cd_lancamento = Column(Integer, ForeignKey("lancamento_financeiro.id"), 
                          primary_key=True)
    nome_viagem = Column(String, nullable=False)
    lancamento = relationship("LancamentoFinanceiro", backref="viagem")
```

---

## 🔧 main.py - Rotas da API

### Estrutura Geral

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import Session, engine
from models import Base, Checkin, CodigoMedida, UnidadeMedida

# Criar aplicação FastAPI
app = FastAPI()

# CORS: Permitir requisições de qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Permite https://meusite-3.onrender.com
    allow_methods=["*"],      # Permite GET, POST, DELETE, etc
    allow_headers=["*"]       # Permite qualquer header
)

# Criar tabelas se não existirem
Base.metadata.create_all(engine)

# Context manager para gerenciar sessão
from contextlib import contextmanager

@contextmanager
def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

# Rotas HTTP
@app.get("/api/checkins")
async def get_checkins():
    with get_db() as db:
        checkins = db.query(Checkin).all()
        return checkins
```

### Padrão de Rota GET (Listar)

```python
@app.get("/api/checkins")
async def get_checkins():
    """
    GET /api/checkins
    Retorna: List[{id, date, cd_medida, valor}]
    """
    with get_db() as db:
        checkins = db.query(Checkin).all()
        # SQLAlchemy converte automaticamente para JSON
        return checkins
```

**Request:**
```bash
GET https://meusite-3.onrender.com/api/checkins
```

**Response (200 OK):**
```json
[
  {"id": 1, "date": "2026-03-15", "cd_medida": 1, "valor": 78.5},
  {"id": 2, "date": "2026-03-15", "cd_medida": 3, "valor": 18.2}
]
```

### Padrão de Rota POST (Criar)

```python
@app.post("/api/checkins")
async def create_checkin(request: dict):
    """
    POST /api/checkins
    Body: {"date": "2026-03-15", "medidas": {"peso": 78.5, "gordura": 18.2}}
    Retorna: {"status": "success"}
    """
    with get_db() as db:
        # Extrair dados
        date = request.get("date")
        medidas = request.get("medidas", {})
        
        # Validar
        if not date:
            raise HTTPException(status_code=400, detail="Data é obrigatória")
        if not medidas:
            raise HTTPException(status_code=400, detail="Medidas são obrigatórias")
        
        # Inserir dados
        for descricao_medida, valor in medidas.items():
            # Buscar código da medida
            medida = db.query(CodigoMedida).filter(
                CodigoMedida.descricao == descricao_medida
            ).first()
            
            if not medida:
                # Log e continua (validação leniente)
                continue
            
            # Criar checkin
            checkin = Checkin(
                date=date,
                cd_medida=medida.id,
                valor=valor
            )
            db.add(checkin)
        
        # Commit à database
        db.commit()
        
        return {"status": "success"}
```

**Request:**
```bash
POST https://meusite-3.onrender.com/api/checkins
Content-Type: application/json

{
  "date": "2026-03-15",
  "medidas": {
    "peso": 78.5,
    "gordura": 18.2,
    "altura": 1.78
  }
}
```

**Response (200 OK):**
```json
{"status": "success"}
```

**Resposta de Erro (400 Bad Request):**
```json
{"detail": "Data é obrigatória"}
```

### Padrão de Rota DELETE (Deletar)

```python
@app.delete("/api/checkins/{id}")
async def delete_checkin(id: int):
    """
    DELETE /api/checkins/1
    Deleta checkin com id=1
    """
    with get_db() as db:
        checkin = db.query(Checkin).filter(Checkin.id == id).first()
        
        if not checkin:
            raise HTTPException(status_code=404, detail="Checkin não encontrado")
        
        db.delete(checkin)
        db.commit()
        
        return {"status": "success"}
```

---

## 🔄 Seed de Dados

O backend inclui função `seed()` que popula dados iniciais:

```python
def seed():
    with get_db() as db:
        # Criar unidades de medida
        unidades_data = [
            ("kg", "quilograma"),
            ("cm", "centímetro"),
            ("%", "percentual"),
        ]
        
        siglas_existentes = {u.sigla for u in db.query(UnidadeMedida).all()}
        
        for sigla, nome in unidades_data:
            if sigla not in siglas_existentes:
                db.add(UnidadeMedida(sigla=sigla, nome=nome))
        
        db.flush()  # Executa INSERT mas não faz commit
        
        # Criar códigos de medida hierarquicamente
        seed_data = [
            ("Bioimpedância", None, "kg"),
            ("Peso", "Bioimpedância", "kg"),
            ("Gordura", "Bioimpedância", "kg"),
            ("Altura", "Bioimpedância", "cm"),
        ]
        
        unidade_map = {u.sigla: u.id for u in db.query(UnidadeMedida).all()}
        
        for descricao, pai_descricao, sigla in seed_data:
            # Buscar se já existe
            existente = db.query(CodigoMedida).filter(
                CodigoMedida.descricao == descricao
            ).first()
            
            if not existente:
                pai_id = None
                if pai_descricao:
                    pai = db.query(CodigoMedida).filter(
                        CodigoMedida.descricao == pai_descricao
                    ).first()
                    pai_id = pai.id if pai else None
                
                db.add(CodigoMedida(
                    descricao=descricao,
                    cd_pai=pai_id,
                    id_unidade=unidade_map.get(sigla)
                ))
        
        db.commit()
```

---

## 🚀 Rodando o Backend Localmente

### Instalação de Dependências
```bash
cd backend
pip install -r requirements.txt
```

### Criar Arquivo .env
```
DATABASE_URL=postgresql://postgres:senha@localhost:5432/bodylog
API_PORT=8001
```

### Rodar o Servidor
```bash
uvicorn main:app --reload --port 8001

# Saída:
# INFO:     Uvicorn running on http://127.0.0.1:8001
# INFO:     Application startup complete
```

### Testar a API
```bash
# GET checkins
curl http://127.0.0.1:8001/api/checkins

# POST novo checkin
curl -X POST http://127.0.0.1:8001/api/checkins \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-03-15", "medidas": {"peso": 78.5}}'
```

---

## 📚 Endpoints Principais

### Body (Métricas)
| Método | Endpoint | O que faz |
|--------|----------|-----------|
| GET | `/api/checkins` | Lista todos check-ins |
| POST | `/api/checkins` | Cria novo check-in |
| GET | `/api/medidas` | Lista códigos de medida |

### Exercises (Treinos)
| Método | Endpoint | O que faz |
|--------|----------|-----------|
| GET | `/api/exercicios/codigos` | Lista exercícios disponíveis |
| GET | `/api/exercicios` | Lista treinos registrados |
| POST | `/api/exercicios` | Registra novo treino |

### Goals (Metas)
| Método | Endpoint | O que faz |
|--------|----------|-----------|
| GET | `/api/goals/codigos` | Lista metas disponíveis |
| GET | `/api/goals/metas` | Lista metas mensais |
| GET | `/api/goals/entradas` | Lista progresso diário |
| POST | `/api/goals/entradas` | Registra progresso |

### Finances (Finanças)
| Método | Endpoint | O que faz |
|--------|----------|-----------|
| GET | `/api/financas/codigos` | Lista categorias |
| GET | `/api/financas/lancamentos` | Lista transações |
| POST | `/api/financas/lancamentos` | Cria transação |
| GET | `/api/financas/orcamento` | Lista orçamentos |
| GET | `/api/financas/investimentos` | Lista snapshots |

---

✅ **Próximo:** Veja [05-FRONTEND.md](05-FRONTEND.md) para entender JavaScript.

✅ **Depois:** Explore [18-API-REFERENCE.md](18-API-REFERENCE.md) para referência completa de endpoints.
