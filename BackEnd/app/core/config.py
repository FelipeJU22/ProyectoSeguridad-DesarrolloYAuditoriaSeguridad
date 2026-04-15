from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()