from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from ..models.user import UserRole


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserListOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyCreate(BaseModel):
    name: str
    manager_id: Optional[int] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None


class CompanyOut(BaseModel):
    id: int
    name: str
    is_active: bool
    manager_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class BannerCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_active: bool = True


class BannerOut(BaseModel):
    id: int
    title: str
    description: str
    image_url: Optional[str]
    link_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    is_active: Optional[bool] = None


class PlatformStatsOut(BaseModel):
    total_users: int
    total_companies: int
    total_flights: int
    active_flights: int
    completed_flights: int
    total_passengers: int
    total_revenue: float


class BookingAggregateOut(BaseModel):
    confirmation_id: str
    company_id: int | None
    total_amount: float
    purchased_at: datetime
