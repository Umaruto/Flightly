from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Core settings for early phases; more will be added in later phases
    APP_NAME: str = "Flight Ticketing API"
    DEBUG: bool = True

    # Auth (placeholder defaults; override in .env)
    JWT_SECRET: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database (will be used in later phases)
    DATABASE_URL: str | None = None

    # CORS
    CORS_ALLOW_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    # Optional regex to allow dynamic origins (e.g., Vercel previews)
    CORS_ALLOW_ORIGIN_REGEX: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
