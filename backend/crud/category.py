# backend/crud/category.py
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from schemas.category import CategoryCreate, CategoryUpdate


# ===== READ =====
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all categories with pagination."""
    return db.query(models.Category).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int):
    """Fetch a single category by ID."""
    return db.query(models.Category).filter(models.Category.id == category_id).first()


# ===== CREATE =====
def create_category(db: Session, category: CategoryCreate):
    """Create a new category (case-insensitive uniqueness enforced)."""
    normalized_name = category.name.strip().title()

    existing = db.query(models.Category).filter(
        func.lower(models.Category.name) == normalized_name.lower()
    ).first()
    if existing:
        raise ValueError(f"Category '{normalized_name}' already exists")

    db_category = models.Category(name=normalized_name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


# ===== UPDATE =====
def update_category(db: Session, category_id: int, category: CategoryUpdate):
    """Update an existing category, ensuring unique name."""
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    if category.name:
        normalized_name = category.name.strip().title()
        existing = db.query(models.Category).filter(
            func.lower(models.Category.name) == normalized_name.lower(),
            models.Category.id != category_id,
        ).first()
        if existing:
            raise ValueError(f"Category '{normalized_name}' already exists")
        db_category.name = normalized_name

    db.commit()
    db.refresh(db_category)
    return db_category


# ===== DELETE =====
def delete_category(db: Session, category_id: int):
    """
    Delete a category by ID.
    Prevent deletion if the category has linked products.
    """
    db_category = get_category(db, category_id)
    if not db_category:
        return False

    if db_category.products:
        raise ValueError("Cannot delete category with existing products")

    db.delete(db_category)
    db.commit()
    return True
