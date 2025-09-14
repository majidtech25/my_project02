# backend/schemas/supplier.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re


# ====== BASE ======
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    contact: Optional[str] = Field(None, min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    balance: float = Field(default=0.0, ge=0.0, le=1_000_000)

    # --- Validators ---
    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        """Normalize supplier names (e.g., 'coca cola' → 'Coca Cola')."""
        return v.strip().title()

    @field_validator("contact")
    @classmethod
    def validate_and_format_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate & normalize phone to Kenyan format (+2547XXXXXXXX)."""
        if not v:
            return v
        v = v.strip()

        # If starts with "07" → convert to "+2547..."
        if re.match(r"^07\d{8}$", v):
            return "+254" + v[1:]

        # Already in correct +254 format
        if re.match(r"^\+2547\d{8}$", v):
            return v

        raise ValueError("Phone must be Kenyan format: 07XXXXXXXX or +2547XXXXXXXX")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        """Trim spaces around email if provided."""
        return v.strip() if v else v


# ====== CREATE ======
class SupplierCreate(SupplierBase):
    """Schema for creating a supplier."""
    pass


# ====== UPDATE ======
class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    contact: Optional[str] = Field(None, min_length=7, max_length=20)
    email: Optional[EmailStr] = None
    balance: Optional[float] = Field(None, ge=0.0, le=1_000_000)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().title() if v else v

    @field_validator("contact")
    @classmethod
    def validate_and_format_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        v = v.strip()

        if re.match(r"^07\d{8}$", v):
            return "+254" + v[1:]
        if re.match(r"^\+2547\d{8}$", v):
            return v

        raise ValueError("Phone must be Kenyan format: 07XXXXXXXX or +2547XXXXXXXX")


# ====== OUT ======
class SupplierOut(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
