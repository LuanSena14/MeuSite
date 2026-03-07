from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
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