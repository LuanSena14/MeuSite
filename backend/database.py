# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from dotenv import load_dotenv
# from urllib.parse import quote_plus
# import os

# load_dotenv(encoding='utf-8')

# password = os.getenv("DB_PASSWORD")

# # quote_plus escapa caracteres especiais como @ % # automaticamente
# DATABASE_URL = f"postgresql://postgres:{quote_plus(password)}@localhost:5432/bodylog"

# engine = create_engine(DATABASE_URL)
# Session = sessionmaker(bind=engine)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

Session = sessionmaker(bind=engine)