# backend/routes/sales.py
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import sale as crud_sale
from schemas.sale import SaleCreate, SaleUpdate, SaleOut
from auth.dependencies import require_role

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("/", response_model=list[SaleOut])
def read_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: date | None = None,
    end_date: date | None = None,
    employee_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✅ View all sales with optional filters.
    Roles: Employer, Manager only.
    """
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date cannot be earlier than start_date",
        )

    return crud_sale.get_sales(
        db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        employee_id=employee_id,
    )


@router.get("/my", response_model=list[SaleOut])
def read_my_sales(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employee", "manager", "employer"]))
):
    """
    📄 View sales recorded by the current employee (optional date filter).
    Employees only see their own records. Managers/Employers can check theirs via this endpoint.
    """
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date cannot be earlier than start_date",
        )

    return crud_sale.get_sales_for_employee(
        db,
        employee_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/{sale_id}", response_model=SaleOut)
def read_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View a specific sale.
    Roles: Employer, Manager, Employee.
    """
    sale = crud_sale.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return sale


@router.post("/", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ➕ Create a new sale.
    Roles: Employer, Manager, Employee.
    - Employee must be active.
    - Day must be open.
    - Stock validation applied.
    - If sale is credit → Credit record is auto-created.
    """
    try:
        return crud_sale.create_sale(db, sale)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sale due to server error"
        )


@router.put("/{sale_id}", response_model=SaleOut)
def update_sale(
    sale_id: int,
    sale: SaleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✏️ Update an existing sale.
    Roles: Employer, Manager only.
    - Recalculates total.
    - Restores stock for old items before updating.
    """
    try:
        updated = crud_sale.update_sale(db, sale_id, sale)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update sale"
        )

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return updated


@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ❌ Delete a sale.
    Roles: Employer, Manager only.
    - Restores stock from deleted sale items.
    - Cascades delete credit if linked.
    """
    try:
        deleted = crud_sale.delete_sale(db, sale_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete sale"
        )

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return {"ok": True}
