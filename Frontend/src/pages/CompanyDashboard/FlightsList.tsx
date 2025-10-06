import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function FlightsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<any[]>([]);
  const loadFlights = async () => {
    try {
      const { data } = await api.get("/api/company/flights");
      setFlights(data);
    } catch (e) {
      setFlights([]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "COMPANY_MANAGER") {
      navigate("/");
      return;
    }
    loadFlights();
  }, [user]);

  const totalActive = useMemo(
    () => flights.filter((f) => f.active).length,
    [flights]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Company Flights</h2>
        <Link
          to="/company/flights/new"
          className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          New Flight
        </Link>
      </div>
      <div className="mt-2 text-sm text-slate-600">
        Active: {totalActive} • Total: {flights.length}
      </div>
      <div className="mt-6 grid gap-3">
        {flights.length === 0 ? (
          <div className="text-slate-600">No flights yet. Create one.</div>
        ) : (
          flights.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-lg border bg-white shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-sm text-slate-500">
                  {f.company_name} • {f.flight_number}
                </div>
                <div className="text-lg font-semibold">
                  {f.origin} → {f.destination}
                </div>
                <div className="text-sm text-slate-600">
                  {new Date(f.departure_time).toLocaleString()} -{" "}
                  {new Date(f.arrival_time).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-700">
                  ${(f.price ?? 0).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                  Seats available: {f.seats_available}
                </div>
                <div className="mt-2 flex gap-2 justify-end">
                  <Link
                    to={`/company/flights/${f.id}/edit`}
                    className="px-3 py-1.5 rounded border hover:bg-slate-50 text-sm"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/company/flights/${f.id}/passengers`}
                    className="px-3 py-1.5 rounded border hover:bg-slate-50 text-sm"
                  >
                    Passengers
                  </Link>
                  <button
                    className="px-3 py-1.5 rounded border hover:bg-red-50 text-sm text-red-700 border-red-300"
                    onClick={async () => {
                      if (
                        !confirm("Delete this flight? This cannot be undone.")
                      )
                        return;
                      try {
                        await api.delete(`/api/company/flights/${f.id}`);
                        loadFlights();
                      } catch (e: any) {
                        const detail = e?.response?.data?.detail;
                        alert(
                          typeof detail === "string"
                            ? detail
                            : "Failed to delete flight. It might have existing tickets or another constraint."
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
