import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend folder
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from the project root directory
env_path = BASE_DIR.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "r_insight")
    
    # URL of the Google Colab server (e.g. ngrok tunnel)
    COLAB_TUNNEL_URL: str = os.getenv("COLAB_TUNNEL_URL", "")
    
    # AI_MODE: 'colab' or 'mock' or 'local_fallback'
    AI_MODE: str = os.getenv("AI_MODE", "mock").lower()

    # Uploads folder inside the workspace
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

    # ChromaDB persistent folder
    CHROMA_DB_DIR: Path = BASE_DIR / "chroma_db"

    @property
    def database_url(self) -> str:
        # Construct SQLAlchemy database URL
        # mysql+mysqlconnector://user:password@host:port/dbname
        passwd = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return f"mysql+mysqlconnector://{self.DB_USER}{passwd}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()

# Ensure necessary directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
