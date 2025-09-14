# backend/routes/categories.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from crud import category as crud_category
from schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from auth.dependencies import require_role

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=list[CategoryOut])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View all categories.
    Roles: Employer, Manager, Employee (view-only).
    """
    return crud_category.get_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryOut)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager", "employee"]))
):
    """
    ✅ View category by ID.
    Roles: Employer, Manager, Employee.
    """
    category = crud_category.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ➕ Create new category.
    Roles: Employer, Manager only.
    """
    try:
        return crud_category.create_category(db, category)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ✏️ Update a category.
    Roles: Employer, Manager only.
    """
    try:
        updated = crud_category.update_category(db, category_id, category)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """
    ❌ Delete a category.
    Roles: Employer, Manager only.
    Prevent deletion if category has products.
    """
    try:
        deleted = crud_category.delete_category(db, category_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return {"ok": True, "message": "Category deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
