# backend/routes/days.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import day as crud_day
from schemas.day import DayOut
from auth.dependencies import require_role, get_current_user
import models

router = APIRouter(prefix="/days", tags=["Days"])


@router.get("/", response_model=list[DayOut])
def read_days(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✅ View all business days.
    Roles: Employer, Manager.
    """
    return crud_day.get_days(db, skip=skip, limit=limit)


@router.get("/{day_id}", response_model=DayOut)
def read_day(
    day_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View a single day by ID.
    Roles: Employer, Manager, Employee.
    """
    day = crud_day.get_day(db, day_id)
    if not day:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
    return day


@router.post("/open", response_model=DayOut, status_code=status.HTTP_201_CREATED)
def open_day(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    🟢 Open a business day.
    Roles: Employer, Manager.
    """
    try:
        return crud_day.open_day(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/close", response_model=DayOut)
def close_day(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    🔴 Close the current business day.
    Roles: Employer, Manager.
    - Prevents closing if uncleared credits exist.
    """
    try:
        return crud_day.close_day(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day(
    day_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer"]))
):
    """
    ❌ Delete a day (dangerous).
    Role: Employer only.
    - Only allowed if no sales or credits exist for that day.
    """
    try:
        deleted = crud_day.delete_day(db, day_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
    return {"ok": True}
