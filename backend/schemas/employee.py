# backend/schemas/employee.py
from pydantic import BaseModel, Field, StringConstraints
from typing import Optional, Literal, Annotated
from enum import Enum


# ====== ENUM ======
class EmployeeRole(str, Enum):
    employer = "employer"
    manager = "manager"
    employee = "employee"


# ====== TYPE ALIASES ======
NameType = Annotated[str, StringConstraints(min_length=2, max_length=150)]
PhoneType = Annotated[str, StringConstraints(pattern=r"^\+?\d{7,20}$")]


# ====== BASE ======
class EmployeeBase(BaseModel):
    name: NameType
    role: EmployeeRole
    phone: PhoneType
    status: Literal["active", "inactive"] = Field("active", description="Employee status")


# ====== CREATE ======
class EmployeeCreate(EmployeeBase):
    password: Annotated[str, StringConstraints(min_length=6)] = Field(
        ..., description="Plain password (will be hashed)"
    )


# ====== UPDATE ======
class EmployeeUpdate(BaseModel):
    name: Optional[NameType]
    role: Optional[EmployeeRole]
    phone: Optional[PhoneType]
    status: Optional[Literal["active", "inactive"]]
    password: Optional[Annotated[str, StringConstraints(min_length=6)]]


# ====== OUT ======
class EmployeeOut(BaseModel):
    id: int
    name: str
    role: EmployeeRole
    phone: str
    status: str

    class Config:
        from_attributes = True
