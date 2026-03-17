# Linha a linha - backend/database.py

Arquivo fonte: backend/database.py

Formato: cada linha do codigo tem uma explicacao direta.

| Linha | Codigo | Explicacao |
|---:|---|---|
| 1 | import os | Importa modulo para disponibilizar funcoes, classes ou constantes. |
| 2 | from dotenv import load_dotenv | Importa simbolos especificos de outro modulo para uso local. |
| 3 | from sqlalchemy import create_engine | Importa simbolos especificos de outro modulo para uso local. |
| 4 | from sqlalchemy.orm import sessionmaker | Importa simbolos especificos de outro modulo para uso local. |
| 5 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 6 | load_dotenv() | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 7 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 8 | DATABASE_URL = os.getenv("DATABASE_URL") | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 9 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 10 | if not DATABASE_URL: | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 11 |     raise RuntimeError("DATABASE_URL environment variable is not set.") | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
| 12 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 13 | if DATABASE_URL.startswith("postgres://"): | Condicional: executa o bloco apenas quando a condicao for verdadeira. |
| 14 |     DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 15 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 16 | engine = create_engine(DATABASE_URL, pool_pre_ping=True) | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 17 |   | Linha em branco para separar blocos de logica e facilitar leitura. |
| 18 | Session = sessionmaker( | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 19 |     autocommit=False, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 20 |     autoflush=False, | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 21 |     bind=engine | Atribuicao: calcula valor da direita e guarda na variavel da esquerda. |
| 22 | ) | Instrucao de apoio ao fluxo do bloco atual; depende do contexto das linhas vizinhas. |
