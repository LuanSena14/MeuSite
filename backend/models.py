from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class CodigoMedida(Base):
    __tablename__ = "codigo_medida"
    id        = Column(Integer, primary_key=True, autoincrement=True)
    descricao = Column(String, nullable=False)
    macro     = Column(String, nullable=False)

class Checkin(Base):
    __tablename__ = "checkins"
    id        = Column(Integer, primary_key=True, autoincrement=True)
    date      = Column(Date, nullable=False)
    cd_medida = Column(Integer, ForeignKey("codigo_medida.id"), nullable=False)
    valor     = Column(Float, nullable=False)