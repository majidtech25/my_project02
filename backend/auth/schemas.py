# backend/auth/schemas.py
from pydantic import BaseModel


class Token(BaseModel):
    """Response schema for access tokens."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded JWT payload (used internally)."""
    sub: str  # JWT "sub" claim (user id) is stored as a string