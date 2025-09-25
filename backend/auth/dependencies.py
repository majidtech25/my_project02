# backend/auth/dependencies.py
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional

import models
from db import get_db
from auth.jwt_handler import decode_access_token

# OAuth2 scheme → expects "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ===== Strict: Require a valid token =====
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Employee:
    """Extract and validate the current user from a JWT access token."""
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("sub") if payload else None
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(models.Employee).filter(models.Employee.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Block inactive users
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    return user


# ===== Optional: Return None if no/invalid token =====
def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[models.Employee]:
    """
    Return user if token is valid, else None (used for bootstrap employer).
    Unlike get_current_user, this does NOT force 401 when missing.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        return None

    return db.query(models.Employee).filter(models.Employee.id == user_id).first()


# ===== Require Role =====
def require_role(required_roles: List[str]):
    """
    Dependency to restrict access based on employee role.
    Example: current_user=Depends(require_role(["employer", "manager"]))
    """
    def role_checker(current_user: models.Employee = Depends(get_current_user)):
        if current_user.role.value not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Requires one of: {required_roles}",
            )
        return current_user

    return role_checker
