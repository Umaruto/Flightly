from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ...core.database import get_db
from ...models.flight import Flight
from ...models.ticket import Ticket, TicketStatus
from ...schemas.ticket import BookingRequest, BookingResponse, TicketOut
from ...core.deps import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/{flight_id}/book", response_model=BookingResponse)
def book_tickets(flight_id: int, payload: BookingRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    flight = db.query(Flight).filter(Flight.id == flight_id).with_for_update().first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    passengers_count = len(payload.passengers)
    if flight.seats_available < passengers_count:
        raise HTTPException(status_code=400, detail="Not enough seats available")
    # Generate confirmation ID
    confirmation_id = f"CONF-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6]}"
    tickets = []
    try:
        flight.seats_available -= passengers_count
        for passenger in payload.passengers:
            ticket = Ticket(
                user_id=current_user.id,
                flight_id=flight.id,
                status=TicketStatus.PAID,
                confirmation_id=confirmation_id,
                price_paid=float(flight.price),
                purchased_at=datetime.utcnow(),
            )
            db.add(ticket)
            tickets.append(ticket)
        db.commit()
        for ticket in tickets:
            db.refresh(ticket)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Booking failed")
    return BookingResponse(confirmation_id=confirmation_id, tickets=tickets)
