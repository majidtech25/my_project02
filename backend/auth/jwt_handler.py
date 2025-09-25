import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# ===== JWT CONFIG =====
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not SECRET_KEY:
    raise RuntimeError(
        "❌ SECRET_KEY not set. Please add it to your environment or backend/.env"
    )

# ===== CREATE TOKEN =====
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ===== DECODE TOKEN =====
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")
