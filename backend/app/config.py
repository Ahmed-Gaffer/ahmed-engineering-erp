from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BACKEND_DIR / "engineering.db"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"
    SECRET_KEY: str = Field(default="")
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    UPLOAD_DIR: str = "uploads"

    @field_validator("SECRET_KEY")
    @classmethod
    def require_secret_key(cls, v: str) -> str:
        if not v:
            raise ValueError(
                "SECRET_KEY environment variable is required. "
                "Set SECRET_KEY in your .env file or environment before starting the server."
            )
        return v


settings = Settings()
