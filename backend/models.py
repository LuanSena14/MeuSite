from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Time, Boolean
from sqlalchemy.orm import declarative_base, relationship, backref

Base = declarative_base()

class UnidadeMedida(Base):
    __tablename__ = "unidade_medida"

    id    = Column(Integer, primary_key=True, autoincrement=True)
    sigla = Column(String, nullable=False)
    nome  = Column(String, nullable=True)


class CodigoMedida(Base):
    __tablename__ = "codigo_medida"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    descricao     = Column(String, nullable=False)
    cd_pai        = Column(Integer, ForeignKey("codigo_medida.id"))
    id_unidade    = Column(Integer, ForeignKey("unidade_medida.id"))
    nome_exibicao = Column(String)

    unidade = relationship("UnidadeMedida")

    # RELAÇÃO CORRETA
    pai = relationship(
        "CodigoMedida",
        remote_side=[id],
        backref="filhos"
    )


class Checkin(Base):
    __tablename__ = "checkins"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    date      = Column(Date, nullable=False)
    cd_medida = Column(Integer, ForeignKey("codigo_medida.id"), nullable=False)
    valor     = Column(Float, nullable=False)

class CodigoExercicio(Base):
    __tablename__ = "codigo_exercicio"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    descricao = Column(String, nullable=False)
    cd_pai    = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=True)

    filhos    = relationship(
        "CodigoExercicio",
        backref="pai",
        foreign_keys=[cd_pai],
        remote_side="CodigoExercicio.id"
    )


class EntradaExercicio(Base):
    __tablename__ = "entrada_exercicio"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    data         = Column(Date,    nullable=False)
    hora         = Column(Time,    nullable=False)
    cd_exercicio = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=False)
    duracao      = Column(Integer, nullable=True)
    esforco      = Column(Integer, nullable=True)   # 1–10

class CodigoGoal(Base):
    __tablename__ = "codigo_goals"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    nome      = Column(String, nullable=False)
    cd_pai    = Column(Integer, ForeignKey("codigo_goals.id"), nullable=True)
    descricao = Column(String, nullable=True)

class EntradaGoal(Base):
    __tablename__ = "entrada_goals"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    data             = Column(Date, nullable=False)
    cd_goal          = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False)
    realizado_no_dia = Column(Boolean, nullable=False)

class Meta(Base):
    __tablename__ = "pontuacao_goal"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    data       = Column(Date, nullable=True)
    tp_metrica = Column(String, nullable=False)
    cd_goal    = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False)
    valor_alvo = Column('valor', Float, nullable=True)
    pts        = Column(Integer, nullable=True)
    cd_medida  = Column(Integer, ForeignKey("codigo_medida.id"), nullable=True)


# ── FINANÇAS ──────────────────────────────────────────────────────────────────

class CodigoFinanca(Base):
    """Categorias hierárquicas (pai/filho). receita | despesa | investimento são nós raiz (cd_pai=NULL)."""
    __tablename__ = "codigo_financa"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    nome      = Column(String, nullable=False)
    cd_pai    = Column(Integer, ForeignKey("codigo_financa.id"), nullable=True)

    filhos = relationship(
        "CodigoFinanca",
        backref="pai",
        foreign_keys=[cd_pai],
        remote_side="CodigoFinanca.id"
    )


class LancamentoFinanceiro(Base):
    """Receitas e despesas diárias."""
    __tablename__ = "lancamento_financeiro"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    data            = Column(Date,    nullable=False)
    cd_financa      = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    valor           = Column(Float,   nullable=False)
    descricao       = Column(String,  nullable=True)
    forma_pagamento = Column(String,  nullable=True, default='debito')

    categoria = relationship("CodigoFinanca")


class OrcamentoFinanceiro(Base):
    """Orçamento mensal por grupo (categoria pai)."""
    __tablename__ = "orcamento_financeiro"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    ano             = Column(Integer, nullable=False)
    mes             = Column(Integer, nullable=True)   # None = anual
    cd_financa      = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    valor_orcado    = Column(Float,   nullable=False)
    forma_pagamento = Column(String,  nullable=True)

    categoria = relationship("CodigoFinanca")


class SnapshotInvestimento(Base):
    """Saldo periódico de cada caixinha de investimento."""
    __tablename__ = "snapshot_investimento"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    data        = Column(Date,    nullable=False)
    cd_financa  = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False)
    saldo       = Column(Float,   nullable=False)

    categoria = relationship("CodigoFinanca")


class IndicadorMensal(Base):
    """Indicadores não financeiros: Livelo, crédito, Serasa, etc."""
    __tablename__ = "indicador_mensal"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    ano     = Column(Integer, nullable=False)
    mes     = Column(Integer, nullable=False)
    tipo    = Column(String,  nullable=False)   # livelo | serasa | credito_celular | custom
    nome    = Column(String,  nullable=True)    # label customizado
    valor   = Column(Float,   nullable=False)