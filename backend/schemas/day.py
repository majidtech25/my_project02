# backend/schemas/day.py
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


# ===== BASE =====
class DayBase(BaseModel):
    day_date: date = Field(..., description="Business day date")


# ===== CREATE =====
class DayCreate(DayBase):
    """Used for opening a business day."""
    pass


# ===== UPDATE =====
class DayUpdate(BaseModel):
    is_open: Optional[int] = Field(None, description="1=open, 0=closed")
    closed_by_id: Optional[int] = Field(None, description="Employee ID who closed the day")


# ===== OUT =====
class DayOut(DayBase):
    id: int
    is_open: int
    opened_by_id: Optional[int]
    closed_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
