# backend/crud/day.py
from sqlalchemy.orm import Session
from datetime import date, datetime
import models


# ========= HELPERS =========
def get_today() -> date:
    """Utility to get today's date without time part."""
    return date.today()


def validate_employee_active(db: Session, employee_id: int) -> models.Employee:
    """Ensure employee exists and is active."""
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise ValueError("Employee not found")
    if emp.status != "active":
        raise ValueError("Employee is not active")
    return emp


# ========= CRUD =========
def get_days(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all day records with pagination."""
    return db.query(models.Day).offset(skip).limit(limit).all()


def get_day(db: Session, day_id: int):
    """Retrieve a single day by ID."""
    return db.query(models.Day).filter(models.Day.id == day_id).first()


def open_day(db: Session, employee_id: int) -> models.Day:
    """Open a new business day."""
    today = get_today()

    # Ensure no open day already exists for today
    existing_open = db.query(models.Day).filter(
        models.Day.date == today, models.Day.is_open == 1
    ).first()
    if existing_open:
        raise ValueError("Day is already open")

    # Ensure no duplicate date record
    existing_day = db.query(models.Day).filter(models.Day.date == today).first()
    if existing_day:
        raise ValueError("Day already exists for today")

    employee = validate_employee_active(db, employee_id)

    db_day = models.Day(
        date=today,
        is_open=1,
        opened_by_id=employee.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_day)
    db.commit()
    db.refresh(db_day)
    return db_day


def close_day(db: Session, employee_id: int) -> models.Day:
    """Close the currently open business day."""
    today = get_today()
    db_day = db.query(models.Day).filter(
        models.Day.date == today, models.Day.is_open == 1
    ).first()
    if not db_day:
        raise ValueError("No open day to close")

    employee = validate_employee_active(db, employee_id)

    # Ensure no uncleared credits for today’s sales
    credits = (
        db.query(models.Credit)
        .join(models.Sale)
        .filter(models.Sale.date == today, models.Credit.status == "open")
        .all()
    )
    if credits:
        raise ValueError("Cannot close day with uncleared credits")

    db_day.is_open = 0
    db_day.closed_by_id = employee.id
    db_day.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_day)
    return db_day


def delete_day(db: Session, day_id: int) -> bool:
    """
    Delete a day record.
    ⚠️ Only safe if no sales or credits exist for that day.
    """
    db_day = get_day(db, day_id)
    if not db_day:
        return False

    # Prevent deleting days with sales
    sales = db.query(models.Sale).filter(models.Sale.date == db_day.date).all()
    if sales:
        raise ValueError("Cannot delete day with sales records")

    # Prevent deleting days with credits
    credits = (
        db.query(models.Credit)
        .join(models.Sale)
        .filter(models.Sale.date == db_day.date)
        .all()
    )
    if credits:
        raise ValueError("Cannot delete day with credit records")

    db.delete(db_day)
    db.commit()
    return True
