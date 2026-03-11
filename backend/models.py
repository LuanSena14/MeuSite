from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Time
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.orm import backref

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
    __tablename__ = "codigo_goal"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String, nullable=False)
    cd_pai    = Column(Integer, ForeignKey("codigo_goal.id"), nullable=True)
    descricao = Column(String, nullable=True)

    filhos    = relationship(
        "CodigoGoal",
        backref="pai",
        foreign_keys=[cd_pai],
        remote_side="CodigoGoal.id"
    )

class EntradaGoal(Base):
    __tablename__ = "entrada_goal"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    data      = Column(Date, nullable=False)
    cd_goal   = Column(Integer, ForeignKey("codigo_goal.id"), nullable=False)
    progresso = Column(Float, nullable=False)

class Meta(Base):
    __tablename__ = "meta"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    data     = Column(Date, nullable=True)
    tp_metrica      = Column(String, nullable=False)
    cd_goal   = Column(Integer, ForeignKey("codigo_goal.id"), nullable=False)
    valor_alvo = Column(Float, nullable=False)
    pts       = Column(Integer, nullable=True)