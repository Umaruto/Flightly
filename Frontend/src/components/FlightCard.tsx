type Flight = {
  id: number;
  company_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops: number;
  price: number;
  seats_available: number;
};

import { Link } from "react-router-dom";

export default function FlightCard({ flight }: { flight: Flight }) {
  const dep = new Date(flight.departure_time);
  const arr = new Date(flight.arrival_time);
  const time = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">
          {flight.company_name} • {flight.flight_number}
        </div>
        <div className="text-lg font-semibold text-slate-900">
          {flight.origin} → {flight.destination}
        </div>
        <div className="text-sm text-slate-600">
          {time(dep)} - {time(arr)} • {flight.duration_minutes}m •{" "}
          {flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Seats available: {flight.seats_available}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-900">
          ${flight.price.toFixed(2)}
        </div>
        <Link
          to={`/flights/${flight.id}`}
          className="inline-block mt-2 px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
}
