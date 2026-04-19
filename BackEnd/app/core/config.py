from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = ["*"]

    # JWT / sesiones
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 2

    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()