import { Link } from "react-router-dom";
import Button from "./ui/Button";

export default function TicketCard({
  ticket,
  booking,
  onCancel,
}: {
  ticket: any;
  booking: any;
  onCancel: (id: number) => void;
}) {
  const isCanceled =
    ticket.status === "CANCELED" || ticket.status === "REFUNDED";
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">
          Confirmation • {booking.id}
        </div>
        <div className="text-lg font-semibold text-slate-900">
          Ticket #{ticket.id} • Flight {booking.flightId}
        </div>
        <div className="text-sm text-slate-600">
          Passenger: {booking.passenger?.firstName}{" "}
          {booking.passenger?.lastName}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Booked: {new Date(booking.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="text-right">
        <div
          className={`inline-block text-xs px-2 py-1 rounded ${
            isCanceled
              ? "bg-slate-200 text-slate-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {ticket.status}
        </div>
        <div className="mt-2 text-slate-900 font-semibold">
          ${(booking.total ?? 0).toFixed(2)}
        </div>
        <div className="mt-2 flex gap-2 justify-end">
          <Link to={`/flights/${booking.flightId}`}>
            <Button variant="outline" size="sm">
              View Flight
            </Button>
          </Link>
          <Button
            size="sm"
            variant={isCanceled ? "outline" : "secondary"}
            disabled={isCanceled}
            onClick={() => onCancel(ticket.id)}
            className={isCanceled ? "cursor-not-allowed" : ""}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
