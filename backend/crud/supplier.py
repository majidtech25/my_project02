# backend/crud/supplier.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import models
from schemas.supplier import SupplierCreate, SupplierUpdate


# ===== READ =====
def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all suppliers with pagination."""
    return db.query(models.Supplier).offset(skip).limit(limit).all()


def get_supplier(db: Session, supplier_id: int):
    """Fetch a single supplier by ID."""
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()


# ===== CREATE =====
def create_supplier(db: Session, supplier: SupplierCreate):
    """Create a new supplier with case-insensitive unique name."""
    normalized_name = supplier.name.strip().title()

    existing = db.query(models.Supplier).filter(
        func.lower(models.Supplier.name) == normalized_name.lower()
    ).first()
    if existing:
        raise ValueError(f"Supplier '{normalized_name}' already exists")

    db_supplier = models.Supplier(
        name=normalized_name,
        contact=supplier.contact.strip() if supplier.contact else None,
        email=supplier.email.strip() if supplier.email else None,
        balance=supplier.balance,
        # created_at and updated_at handled by model defaults
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


# ===== UPDATE =====
def update_supplier(db: Session, supplier_id: int, supplier: SupplierUpdate):
    """Update supplier details with uniqueness + normalization checks."""
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return None

    update_data = supplier.dict(exclude_unset=True)

    # Check for duplicate name
    if "name" in update_data and update_data["name"]:
        normalized_name = update_data["name"].strip().title()
        existing = db.query(models.Supplier).filter(
            func.lower(models.Supplier.name) == normalized_name.lower(),
            models.Supplier.id != supplier_id,
        ).first()
        if existing:
            raise ValueError(f"Supplier '{normalized_name}' already exists")
        db_supplier.name = normalized_name
        update_data.pop("name")

    # Normalize optional fields
    if "contact" in update_data and update_data["contact"]:
        update_data["contact"] = update_data["contact"].strip()
    if "email" in update_data and update_data["email"]:
        update_data["email"] = update_data["email"].strip()

    # Apply remaining updates
    for key, value in update_data.items():
        setattr(db_supplier, key, value)

    db_supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


# ===== DELETE =====
def delete_supplier(db: Session, supplier_id: int):
    """
    Delete supplier by ID.
    Prevent deletion if supplier has linked products.
    """
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return False

    if db_supplier.products:
        raise ValueError("Cannot delete supplier with existing products")

    db.delete(db_supplier)
    db.commit()
    return True
