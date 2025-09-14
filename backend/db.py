# backend/db.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ===== Database URL =====
# SQLite for development; replace with PostgreSQL/MySQL in production
SQLALCHEMY_DATABASE_URL = "sqlite:///./ims.db"
# Example PostgreSQL: "postgresql+psycopg2://user:password@localhost/ims"

# ===== Engine =====
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

# ===== SessionLocal =====
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ===== Base Class =====
Base = declarative_base()


# ===== Dependency =====
def get_db():
    """
    Dependency to provide a database session.
    Ensures session is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()