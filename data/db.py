import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from data.models import Base

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or .env file.")

# Normalize prefix to postgresql+psycopg:// for psycopg v3 driver
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)

# Pooler-friendly configuration for Neon
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables and spatial indices in the database."""
    print("Creating all tables in Neon PostGIS database...")
    Base.metadata.create_all(bind=engine)
    # create_all does not add columns to tables that already exist.
    columns = {column["name"] for column in inspect(engine).get_columns("app_notifications")}
    if "translations" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE app_notifications ADD COLUMN translations JSON"))
    print("Database tables initialized successfully.")

def get_db():
    """Dependency for API database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
