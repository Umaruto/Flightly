from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
import enum

class TicketStatus(str, enum.Enum):
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    CANCELED = "CANCELED"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.PAID)
    confirmation_id = Column(String(64), unique=True, nullable=False)
    price_paid = Column(Numeric(10,2), nullable=False)
    purchased_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    canceled_at = Column(DateTime, nullable=True)

    user = relationship("User", backref="tickets")
    flight = relationship("Flight", backref="tickets")
