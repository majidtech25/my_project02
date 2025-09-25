# backend/auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from db import get_db
import models
from auth.hashing import verify_password
from auth.jwt_handler import create_access_token
from auth.schemas import Token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------- OAuth2PasswordRequestForm ----------
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login using OAuth2PasswordRequestForm.
    - Username field maps to employee.name
    """
    user = db.query(models.Employee).filter(models.Employee.name == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


# ---------- JSON Login ----------
class LoginJSON(BaseModel):
    username: str
    password: str


@router.post("/login-json", response_model=Token)
def login_json(data: LoginJSON, db: Session = Depends(get_db)):
    """
    Login using JSON body.
    - Accepts name as username + password.
    """
    user = db.query(models.Employee).filter(models.Employee.name == data.username).first()

    if not user or not verify_password(data.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}
