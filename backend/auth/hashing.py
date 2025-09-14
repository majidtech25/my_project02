# backend/auth/hashing.py
from passlib.context import CryptContext

# Configure bcrypt with explicit rounds
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def get_password_hash(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    - Returns a salted, hashed string safe for DB storage.
    """
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its bcrypt hash.
    - Returns True if match, False otherwise.
    """
    return _pwd_context.verify(plain_password, hashed_password)
