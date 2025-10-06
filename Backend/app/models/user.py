from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, Integer, String
from sqlalchemy.orm import validates

from ..core.database import Base


class UserRole(str, Enum):
    USER = "USER"
    COMPANY_MANAGER = "COMPANY_MANAGER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.USER)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    @validates("email")
    def validate_email(self, key, value):  # simple guard; full validation in schema
        assert "@" in value, "invalid email"
        return value
