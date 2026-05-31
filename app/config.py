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
    # Fallback controls
    ALLOW_DB_FALLBACK: bool = False
    ALLOW_REDIS_FALLBACK: bool = False
    # DB SSL verification: set to false to accept self-signed certs (local/dev)
    DB_SSL_VERIFY: bool = False
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_FOLDER: str = "naijalex/risk-cards"
    
    # App Paths
    # Use writable locations by default so containerized deploys can start even
    # when the app filesystem is read-only or `.env` is not present.
    CHROMA_PERSIST_DIR: str = "/tmp/chroma_db"
    UPLOAD_DIR: str = "/tmp/uploads"
    APP_BASE_URL: str = "http://localhost:8000"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# reload-trigger: no-op comment to prompt dev reloads
