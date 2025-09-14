# backend/auth/jwt_handler.py
from datetime import datetime, timedelta
from jose import JWTError, ExpiredSignatureError, jwt
import os

# ===== Config =====
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable must be set for JWT.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


# ===== Create Token =====
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.
    - `data` must contain at least {"sub": user_id}
    - Default expiry = 60 minutes unless overridden
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ===== Decode Token =====
def decode_access_token(token: str) -> dict | None:
    """
    Decode and verify a JWT access token.
    Returns payload dict if valid, None if invalid/expired.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        return None  # Expired
    except JWTError:
        return None  # Invalid
