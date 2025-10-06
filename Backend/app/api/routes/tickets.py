from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ...core.database import get_db
from ...models.ticket import Ticket, TicketStatus
from ...models.flight import Flight
from ...schemas.ticket import TicketOut
from ...core.deps import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/me", response_model=list[TicketOut])
def my_tickets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).all()
    return tickets

@router.post("/{ticket_id}/cancel", response_model=TicketOut)
def cancel_ticket(ticket_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == current_user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    flight = db.query(Flight).filter(Flight.id == ticket.flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    now = datetime.utcnow()
    if flight.departure_time - now >= timedelta(hours=24):
        ticket.status = TicketStatus.REFUNDED
    else:
        ticket.status = TicketStatus.CANCELED
    ticket.canceled_at = now
    flight.seats_available += 1
    db.commit()
    db.refresh(ticket)
    return ticket
