from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from ..core.database import Base

class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("airline_companies.id"), nullable=False)
    flight_number = Column(String(20), nullable=False)
    origin = Column(String(50), nullable=False)
    destination = Column(String(50), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    stops = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10,2), nullable=False)
    seats_total = Column(Integer, nullable=False)
    seats_available = Column(Integer, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company = relationship("AirlineCompany", backref="flights")
