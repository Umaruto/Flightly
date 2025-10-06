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
  seats_total?: number;
  seats_available: number;
};

export default function FlightInfo({ flight }: { flight: Flight }) {
  const dep = new Date(flight.departure_time);
  const arr = new Date(flight.arrival_time);
  const fmt = (d: Date) =>
    d.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "2-digit",
    });

  return (
    <div className="rounded-xl border bg-white shadow p-4 grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-slate-500">
          {flight.company_name} • {flight.flight_number}
        </div>
        <div className="mt-1 text-xl font-semibold text-slate-900">
          {flight.origin} → {flight.destination}
        </div>
        <div className="mt-1 text-slate-700">
          <div>
            Departure: <span className="font-medium">{fmt(dep)}</span>
          </div>
          <div>
            Arrival: <span className="font-medium">{fmt(arr)}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Duration: {flight.duration_minutes} minutes •{" "}
          {flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`}
        </div>
      </div>
      <div className="md:text-right">
        <div className="text-3xl font-bold text-slate-900">
          ${flight.price.toFixed(2)}
        </div>
        <div className="text-sm text-slate-600 mt-1">
          Seats available: {flight.seats_available} / {flight.seats_total}
        </div>
      </div>
    </div>
  );
}
