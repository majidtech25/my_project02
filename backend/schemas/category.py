# backend/schemas/category.py
from pydantic import BaseModel, StringConstraints, field_validator
from typing import Optional, Annotated

# ====== TYPE ALIAS ======
NameType = Annotated[str, StringConstraints(min_length=2, max_length=100)]


# ====== BASE ======
class CategoryBase(BaseModel):
    name: NameType

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        """Normalize category name (trim + title case)."""
        return v.strip().title()


# ====== CREATE ======
class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


# ====== UPDATE ======
class CategoryUpdate(BaseModel):
    name: Optional[NameType] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().title() if v else v


# ====== OUT ======
class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True
