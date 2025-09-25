# backend/schemas/product.py
from pydantic import BaseModel, Field, StringConstraints, field_validator
from typing import Optional, Annotated

# ====== TYPE ALIASES ======
NameType = Annotated[str, StringConstraints(min_length=2, max_length=150)]
SkuType = Annotated[str, StringConstraints(min_length=2, max_length=50)]


# ====== BASE ======
class ProductBase(BaseModel):
    name: NameType
    sku: SkuType = Field(..., description="Unique Stock Keeping Unit (SKU)")
    price: float = Field(..., gt=0, le=1_000_000, description="Product price must be > 0")
    stock: int = Field(default=0, ge=0, description="Available stock quantity")
    category_id: Optional[int] = Field(None, description="Category this product belongs to")
    supplier_id: Optional[int] = Field(None, description="Supplier who provides this product")

    # --- Normalization ---
    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().title()

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, v: str) -> str:
        return v.strip().upper()


# ====== CREATE ======
class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


# ====== UPDATE ======
class ProductUpdate(BaseModel):
    name: Optional[NameType]
    sku: Optional[SkuType]
    price: Optional[float] = Field(None, gt=0, le=1_000_000)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int]
    supplier_id: Optional[int]

    # --- Normalization for optional fields ---
    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().title() if v else v

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else v


# ====== OUT ======
class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True
