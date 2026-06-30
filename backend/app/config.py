from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
import secrets


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str = "sqlite+aiosqlite:///./engineering.db"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "") or secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    UPLOAD_DIR: str = "uploads"


settings = Settings()


class AGCoreSettings(BaseSettings):
    PROJECT_NAME: str = "Engineering Management System v3"
    SYSTEM_SLOGAN: str = "Engineering Excellence, Digitally Engineered."
    VERSION: str = "1.2.0"

    CHIEF_SYSTEM_ARCHITECT: str = "Ahmed Gaffer"
    ARCHITECT_ROLE: str = "Principal System Architect & Technical Provider"

    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./engineering.db", alias="EMS_DATABASE_URL")
    SECRET_KEY: str = Field(default=os.getenv("SECRET_KEY", ""), alias="EMS_SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"
        extra = "ignore"


ag_settings = AGCoreSettings()
