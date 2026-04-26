from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Who's Hot Right Now API"
    database_url: str = "sqlite:///./whos_hot.db"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
