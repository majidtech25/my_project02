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


# ---------- For OAuth2PasswordRequestForm (Frontend compatibility) ----------
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login using OAuth2PasswordRequestForm.
    - Username field maps to employee.phone.
    """
    user = db.query(models.Employee).filter(models.Employee.phone == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


# ---------- For JSON Body Login (Swagger/Postman friendly) ----------
class LoginJSON(BaseModel):
    phone: str
    password: str


@router.post("/login-json", response_model=Token)
def login_json(data: LoginJSON, db: Session = Depends(get_db)):
    """
    Login using JSON body.
    - Accepts phone & password.
    """
    user = db.query(models.Employee).filter(models.Employee.phone == data.phone).first()

    if not user or not verify_password(data.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}
