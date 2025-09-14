# backend/routes/sales.py
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
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✅ View all sales.
    Roles: Employer, Manager only.
    """
    return crud_sale.get_sales(db, skip=skip, limit=limit)


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
