# backend/crud/employee.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
import models
from schemas.employee import EmployeeCreate, EmployeeUpdate
from auth.hashing import get_password_hash


# ===== GET EMPLOYEES =====
def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()


def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def get_employee_by_phone(db: Session, phone: str):
    return db.query(models.Employee).filter(models.Employee.phone == phone.strip()).first()


# ===== CREATE =====
def create_employee(db: Session, employee: EmployeeCreate):
    """
    Create a new employee.
    - Employer: only one allowed in system.
    - Manager: only one allowed in system.
    - Password: must always be provided.
    """
    # Enforce unique employer
    if employee.role == models.EmployeeRole.employer:
        exists = db.query(models.Employee).filter(models.Employee.role == models.EmployeeRole.employer).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only one employer is allowed in the system."
            )

    # Enforce unique manager
    if employee.role == models.EmployeeRole.manager:
        exists = db.query(models.Employee).filter(models.Employee.role == models.EmployeeRole.manager).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only one manager is allowed in the system."
            )

    # Hash password (must be provided)
    if not employee.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for new employees."
        )
    hashed_password = get_password_hash(employee.password.strip())

    db_employee = models.Employee(
        name=employee.name.strip(),
        role=employee.role,
        phone=employee.phone.strip(),
        status=employee.status or "active",
        password_hash=hashed_password,
    )

    try:
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this phone already exists."
        )


# ===== UPDATE =====
def update_employee(db: Session, employee_id: int, employee: EmployeeUpdate, allow_role_change: bool = True):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )

    updates = employee.dict(exclude_unset=True)

    # Secure password update
    if "password" in updates and updates["password"]:
        db_employee.password_hash = get_password_hash(updates.pop("password"))

    # Restrict role updates if not explicitly allowed
    if not allow_role_change and "role" in updates:
        updates.pop("role")

    for key, value in updates.items():
        setattr(db_employee, key, value.strip() if isinstance(value, str) else value)

    try:
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this phone already exists."
        )


# ===== DELETE =====
def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )

    # Prevent deleting employer/manager
    if db_employee.role in {models.EmployeeRole.employer, models.EmployeeRole.manager}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete employer or manager accounts."
        )

    # Prevent deleting employees with linked sales/credits
    if db_employee.sales or db_employee.credits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete employee with existing sales or credits."
        )

    db.delete(db_employee)
    db.commit()
    return True
