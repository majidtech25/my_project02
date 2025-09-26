# backend/crud/product.py
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from schemas.product import ProductCreate, ProductUpdate


# ===== Helpers =====
def validate_category(db: Session, category_id: int | None):
    """Ensure category exists if category_id is provided."""
    if category_id is None:
        return None
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise ValueError(f"Category with id={category_id} not found")
    return category


def validate_supplier(db: Session, supplier_id: int | None):
    """Ensure supplier exists if supplier_id is provided."""
    if supplier_id is None:
        return None
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise ValueError(f"Supplier with id={supplier_id} not found")
    return supplier


# ===== CRUD =====
def get_products(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all products with pagination."""
    return db.query(models.Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int):
    """Fetch a product by ID."""
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, product: ProductCreate):
    """Create a new product, ensuring SKU is unique + valid relations."""
    normalized_sku = product.sku.upper()

    # SKU uniqueness check
    existing = db.query(models.Product).filter(
        func.lower(models.Product.sku) == normalized_sku.lower()
    ).first()
    if existing:
        raise ValueError(f"Product with SKU '{normalized_sku}' already exists")

    # Validate foreign keys only if provided
    validate_category(db, product.category_id)
    validate_supplier(db, product.supplier_id)

    db_product = models.Product(
        name=product.name,  # schema already normalized
        sku=normalized_sku,
        price=product.price,
        stock=product.stock,
        category_id=product.category_id,
        supplier_id=product.supplier_id,
        image_url=product.image_url,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product_id: int, product: ProductUpdate):
    """Update product details with SKU uniqueness + normalization checks."""
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    update_data = product.dict(exclude_unset=True)

    # Handle SKU uniqueness
    if "sku" in update_data and update_data["sku"]:
        normalized_sku = update_data["sku"].upper()
        existing = db.query(models.Product).filter(
            func.lower(models.Product.sku) == normalized_sku.lower(),
            models.Product.id != product_id,
        ).first()
        if existing:
            raise ValueError(f"Product with SKU '{normalized_sku}' already exists")
        db_product.sku = normalized_sku
        update_data.pop("sku")

    # Validate foreign keys if provided
    if "category_id" in update_data:
        validate_category(db, update_data["category_id"])
    if "supplier_id" in update_data:
        validate_supplier(db, update_data["supplier_id"])

    # Apply remaining updates (name/price/stock)
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    """Delete a product by ID. Prevent deletion if product is linked to sales."""
    db_product = get_product(db, product_id)
    if not db_product:
        return False

    if db_product.sale_items:
        raise ValueError("Cannot delete product with existing sales")

    db.delete(db_product)
    db.commit()
    return True
