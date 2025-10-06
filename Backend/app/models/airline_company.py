from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class AirlineCompany(Base):
    __tablename__ = "airline_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True)
    is_active = Column(Boolean, nullable=False, default=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    manager = relationship("User", backref="managed_companies")
