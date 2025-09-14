# backend/routes/suppliers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import supplier as crud_supplier
from schemas.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from auth.dependencies import require_role

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("/", response_model=list[SupplierOut])
def read_suppliers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View all suppliers.
    Roles: Employer, Manager, Employee (view-only).
    """
    return crud_supplier.get_suppliers(db, skip=skip, limit=limit)


@router.get("/{supplier_id}", response_model=SupplierOut)
def read_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View supplier by ID.
    Roles: Employer, Manager, Employee (view-only).
    """
    supplier = crud_supplier.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return supplier


@router.post("/", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ➕ Add a new supplier.
    Roles: Employer, Manager only.
    """
    try:
        return crud_supplier.create_supplier(db, supplier)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✏️ Update supplier details.
    Roles: Employer, Manager only.
    """
    try:
        updated = crud_supplier.update_supplier(db, supplier_id, supplier)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{supplier_id}", status_code=status.HTTP_200_OK)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ❌ Delete a supplier.
    Roles: Employer, Manager only.
    Prevent deletion if supplier has products.
    """
    try:
        deleted = crud_supplier.delete_supplier(db, supplier_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
        return {"ok": True, "message": "Supplier deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
