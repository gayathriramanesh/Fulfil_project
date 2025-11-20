from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

ENV_FILE_PATH = Path(os.getcwd()) / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fulfil Ingestion"

    # AWS S3
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_S3_BUCKET: str

    # Postgres
    DATABASE_URL: str

    # Redis for Celery
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str


    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
