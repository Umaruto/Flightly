from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Core settings for early phases; more will be added in later phases
    APP_NAME: str = "Flight Ticketing API"
    DEBUG: bool = True

    # Auth (placeholder defaults; override in .env)
    JWT_SECRET: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database (will be used in later phases)
    DATABASE_URL: str | None = None

    # Optional deployed frontend origin for CORS (e.g., https://your-frontend.pythonanywhere.com)
    DEPLOY_ORIGIN: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
