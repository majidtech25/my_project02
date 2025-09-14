# backend/routes/credits.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import credit as crud_credit
from schemas.credit import CreditCreate, CreditUpdate, CreditOut
from auth.dependencies import require_role

router = APIRouter(prefix="/credits", tags=["Credits"])


@router.get("/", response_model=list[CreditOut])
def read_credits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✅ View all credits.
    Roles: Employer, Manager only.
    """
    return crud_credit.get_credits(db, skip=skip, limit=limit)


@router.get("/{credit_id}", response_model=CreditOut)
def read_credit(
    credit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View a specific credit.
    Roles: Employer, Manager, Employee.
    """
    credit = crud_credit.get_credit(db, credit_id)
    if not credit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")
    return credit


@router.post("/", response_model=CreditOut, status_code=status.HTTP_201_CREATED)
def create_credit(
    credit: CreditCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ➕ Create a new credit.
    Roles:
    - Employer, Manager, Employee can create (during sale).
    Business rules:
    - Must be tied to an existing sale.
    - Amount = sale.total_amount (system-calculated).
    - Employee must be active.
    - Prevent duplicate credits for same sale.
    """
    try:
        return crud_credit.create_credit(db, credit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{credit_id}", response_model=CreditOut)
def update_credit(
    credit_id: int,
    credit: CreditUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✏️ Update a credit.
    Roles: Employer, Manager only.
    - Only allowed update: status → 'cleared'.
    """
    try:
        updated = crud_credit.update_credit(db, credit_id, credit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")
    return updated


@router.delete("/{credit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit(
    credit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ❌ Revoke a credit.
    Roles: Employer, Manager only.
    Rules:
    - Can only revoke if the sales day is still open.
    """
    try:
        deleted = crud_credit.delete_credit(db, credit_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")

    return {"ok": True}
