import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Confirmation() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  const { user } = useAuth();

  const booking = useMemo(() => {
    const list = (user?.bookings || []) as any[];
    return list.find((b) => b.id === id);
  }, [user, id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">
        Booking Confirmation
      </h2>
      <div className="mt-4 rounded-xl border bg-white shadow p-4">
        <div className="text-slate-700">Confirmation ID:</div>
        <div className="text-xl font-semibold">{id}</div>
        {booking ? (
          <div className="mt-3 text-slate-700 space-y-1">
            <div>
              Total Paid:{" "}
              <span className="font-semibold">
                ${booking.total?.toFixed?.(2) ?? booking.total}
              </span>
            </div>
            <div>Flight ID: {booking.flightId}</div>
            <div>
              Passenger: {booking.passenger?.firstName}{" "}
              {booking.passenger?.lastName}
            </div>
            <div>Email: {booking.passenger?.email}</div>
          </div>
        ) : (
          <div className="mt-3 text-slate-600">
            Your booking details are not available, but your confirmation ID is
            above.
          </div>
        )}
        <div className="mt-6">
          <Link
            to="/"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
