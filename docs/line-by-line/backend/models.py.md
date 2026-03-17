# Linha a linha - backend/models.py

Arquivo fonte: backend/models.py

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 | from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Time, Boolean | Importa simbolos especificos de outro modulo para uso local. |
| 2 | from sqlalchemy.orm import declarative_base, relationship, backref | Importa simbolos especificos de outro modulo para uso local. |
| 3 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 4 | Base = declarative_base() | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 5 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 6 | class UnidadeMedida(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 7 |     __tablename__ = "unidade_medida" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 8 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 9 |     id    = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 10 |     sigla = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 11 |     nome  = Column(String, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 12 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 13 | class CodigoMedida(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 14 |     __tablename__ = "codigo_medida" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 |     id            = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 17 |     descricao     = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 18 |     cd_pai        = Column(Integer, ForeignKey("codigo_medida.id")) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 19 |     id_unidade    = Column(Integer, ForeignKey("unidade_medida.id")) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 20 |     nome_exibicao = Column(String) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 21 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 22 |     unidade = relationship("UnidadeMedida") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 23 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 24 |     # Relacao auto-referenciada para navegar entre medida pai e medidas filhas. | Comentario: registra contexto, decisao ou instrucao para manutencao. |
| 25 |     pai = relationship( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 26 |         "CodigoMedida", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 27 |         remote_side=[id], | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 28 |         backref="filhos" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 29 |     ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 30 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 31 | class Checkin(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 32 |     __tablename__ = "checkins" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 33 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 34 |     id        = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 35 |     date      = Column(Date, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 36 |     cd_medida = Column(Integer, ForeignKey("codigo_medida.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 37 |     valor     = Column(Float, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 38 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 39 | class CodigoExercicio(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 40 |     __tablename__ = "codigo_exercicio" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 41 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 42 |     id        = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 43 |     descricao = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 44 |     cd_pai    = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 45 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 46 |     filhos    = relationship( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 47 |         "CodigoExercicio", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 48 |         backref="pai", | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 49 |         foreign_keys=[cd_pai], | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 50 |         remote_side="CodigoExercicio.id" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 51 |     ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 52 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 53 | class EntradaExercicio(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 54 |     __tablename__ = "entrada_exercicio" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 55 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 56 |     id           = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 57 |     data         = Column(Date,    nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 58 |     hora         = Column(Time,    nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 59 |     cd_exercicio = Column(Integer, ForeignKey("codigo_exercicio.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 60 |     duracao      = Column(Integer, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 61 |     esforco      = Column(Integer, nullable=True)   # 1-10 | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 62 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 63 | class CodigoGoal(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 64 |     __tablename__ = "codigo_goals" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 65 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 66 |     id        = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 67 |     nome      = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 68 |     cd_pai    = Column(Integer, ForeignKey("codigo_goals.id"), nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 69 |     descricao = Column(String, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 70 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 71 | class EntradaGoal(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 72 |     __tablename__ = "entrada_goals" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 73 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 74 |     id               = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 75 |     data             = Column(Date, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 76 |     cd_goal          = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 77 |     realizado_no_dia = Column(Boolean, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 78 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 79 | class Meta(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 80 |     __tablename__ = "pontuacao_goal" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 81 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 82 |     id         = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 83 |     data       = Column(Date, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 84 |     tp_metrica = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 85 |     cd_goal    = Column(Integer, ForeignKey("codigo_goals.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 86 |     valor_alvo = Column('valor', Float, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 87 |     pts        = Column(Integer, nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 88 |     cd_medida  = Column(Integer, ForeignKey("codigo_medida.id"), nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 89 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 90 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 91 | class CodigoFinanca(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 92 |     """Categorias hierÃ¡rquicas (pai/filho). receita \| despesa \| investimento sÃ£o nÃ³s raiz (cd_pai=NULL).""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 93 |     __tablename__ = "codigo_financa" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 94 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 95 |     id        = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 96 |     nome      = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 97 |     cd_pai    = Column(Integer, ForeignKey("codigo_financa.id"), nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 98 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 99 |     filhos = relationship( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 100 |         "CodigoFinanca", | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 101 |         backref="pai", | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 102 |         foreign_keys=[cd_pai], | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 103 |         remote_side="CodigoFinanca.id" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 104 |     ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 105 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 106 | class LancamentoFinanceiro(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 107 |     """Receitas e despesas diÃ¡rias.""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 108 |     __tablename__ = "lancamento_financeiro" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 109 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 110 |     id              = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 111 |     data            = Column(Date,    nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 112 |     cd_financa      = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 113 |     valor           = Column(Float,   nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 114 |     descricao       = Column(String,  nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 115 |     forma_pagamento = Column(String,  nullable=True, default='debito') | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 116 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 117 |     categoria = relationship("CodigoFinanca") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 118 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 119 | class OrcamentoFinanceiro(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 120 |     """OrÃ§amento mensal por grupo (categoria pai).""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 121 |     __tablename__ = "orcamento_financeiro" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 122 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 123 |     id              = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 124 |     ano             = Column(Integer, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 125 |     mes             = Column(Integer, nullable=True)   # None = anual | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 126 |     cd_financa      = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 127 |     valor_orcado    = Column(Float,   nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 128 |     forma_pagamento = Column(String,  nullable=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 129 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 130 |     categoria = relationship("CodigoFinanca") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 131 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 132 | class SnapshotInvestimento(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 133 |     """Saldo periÃ³dico de cada caixinha de investimento.""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 134 |     __tablename__ = "snapshot_investimento" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 135 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 136 |     id          = Column(Integer, primary_key=True, autoincrement=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 137 |     data        = Column(Date,    nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 138 |     cd_financa  = Column(Integer, ForeignKey("codigo_financa.id"), nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 139 |     saldo       = Column(Float,   nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 140 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 141 |     categoria = relationship("CodigoFinanca") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 142 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 143 | class RelacionamentoLancamentoViagem(Base): | Declara classe que agrupa estrutura e comportamento relacionados. |
| 144 |     """Vincula um lanÃ§amento a uma viagem (1-para-1: cada lanÃ§amento pertence a no mÃ¡ximo uma viagem).""" | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 145 |     __tablename__ = "relacionamento_lancamento_viagem" | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 146 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 147 |     cd_lancamento = Column(Integer, ForeignKey("lancamento_financeiro.id"), primary_key=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 148 |     nome_viagem   = Column(String, nullable=False) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 149 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 150 |     lancamento = relationship("LancamentoFinanceiro", backref="viagem") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 151 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
