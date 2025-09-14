# backend/routes/employees.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import employee as crud_employee
from schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut
from auth.dependencies import get_current_user, require_role
import models

router = APIRouter(prefix="/employees", tags=["Employees"])


# ===== GET ALL EMPLOYEES =====
@router.get("/", response_model=list[EmployeeOut])
def read_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    return crud_employee.get_employees(db, skip=skip, limit=limit)


# ===== GET SINGLE EMPLOYEE =====
@router.get("/{employee_id}", response_model=EmployeeOut)
def read_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    emp = crud_employee.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )
    return emp


# ===== CREATE EMPLOYEE =====
@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a new employee.
    - If no employees exist → force role = employer (bootstrap admin).
    - Otherwise → only Employer or Manager can create employees.
    """
    employees_exist = bool(crud_employee.get_employees(db, 0, 1))

    if not employees_exist:
        # First ever user must be Employer
        if employee.role != models.EmployeeRole.employer:
            employee.role = models.EmployeeRole.employer
        # Require password (no defaults in production)
        if not employee.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required for the first employer account."
            )
    else:
        # Require Employer or Manager for further additions
        if current_user.role.value not in ["employer", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employer or manager can create employees."
            )

    return crud_employee.create_employee(db, employee)


# ===== UPDATE EMPLOYEE =====
@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    emp = crud_employee.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )

    # First employer cannot have role changed or be deactivated
    first_emp = db.query(models.Employee).order_by(models.Employee.id.asc()).first()
    if first_emp and first_emp.id == emp.id and emp.role.value == "employer":
        if employee.role and employee.role != "employer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot change the role of the first employer."
            )
        if employee.status and employee.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot deactivate the first employer."
            )

    return crud_employee.update_employee(db, employee_id, employee)


# ===== DELETE EMPLOYEE =====
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    emp = crud_employee.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )

    # Prevent deletion of first employer
    first_emp = db.query(models.Employee).order_by(models.Employee.id.asc()).first()
    if first_emp and first_emp.id == emp.id and emp.role.value == "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete the first employer (bootstrap admin account)."
        )

    crud_employee.delete_employee(db, employee_id)
    return {"ok": True}
