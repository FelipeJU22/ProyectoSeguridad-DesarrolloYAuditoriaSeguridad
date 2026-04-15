from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        extra="ignore"
    )

settings = Settings()