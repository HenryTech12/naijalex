from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: str = "true"
    LANGCHAIN_PROJECT: str = "naijalex"
    
    # Database
    DATABASE_URL: str
    REDIS_URL: str
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    
    # App Paths
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    UPLOAD_DIR: str = "./uploads"
    APP_BASE_URL: str = "http://localhost:8000"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
