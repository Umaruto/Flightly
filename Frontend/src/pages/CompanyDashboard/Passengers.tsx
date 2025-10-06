import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function Passengers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [flight, setFlight] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "COMPANY_MANAGER") {
      navigate("/");
      return;
    }
    (async () => {
      try {
        const fRes = await api.get(`/api/flights/${id}`);
        if (!fRes.data) {
          navigate("/company/flights");
          return;
        }
        setFlight(fRes.data);
        const { data } = await api.get(`/api/company/flights/${id}/passengers`);
        // group by confirmation id and attach user info from first ticket
        const byConf: Record<string, any> = {};
        for (const t of data as any[]) {
          if (!byConf[t.confirmation_id])
            byConf[t.confirmation_id] = {
              id: t.confirmation_id,
              user_name: t.user_name || "",
              user_email: t.user_email || "",
              tickets: [],
            };
          byConf[t.confirmation_id].tickets.push(t);
        }
        setBookings(Object.values(byConf));
      } catch (e) {
        setBookings([]);
      }
    })();
  }, [user, id]);

  const passengers = useMemo(() => {
    return bookings.map((b) => ({
      name: b.user_name || "",
      email: b.user_email || "",
      ticketCount: (b.tickets || []).length,
      allCanceled:
        (b.tickets || []).length > 0 &&
        (b.tickets || []).every(
          (t: any) => String(t.status).toUpperCase() !== "PAID"
        ),
      anyCanceled: (b.tickets || []).some(
        (t: any) => String(t.status).toUpperCase() !== "PAID"
      ),
      confirmation: b.id,
    }));
  }, [bookings]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">
        Passengers • Flight {flight?.flight_number}
      </h2>
      <div className="mt-6 grid gap-3">
        {passengers.length === 0 ? (
          <div className="text-slate-600">No passengers yet.</div>
        ) : (
          passengers.map((p) => (
            <div
              key={p.confirmation}
              className="p-4 rounded-lg border bg-white shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {p.name}
                </div>
                <div className="text-sm text-slate-600">{p.email}</div>
              </div>
              <div className="text-right text-slate-700">
                <div>Tickets: {p.ticketCount}</div>
                <div
                  className={`text-xs mt-1 ${
                    p.allCanceled
                      ? "text-red-600"
                      : p.anyCanceled
                      ? "text-amber-600"
                      : "text-green-700"
                  }`}
                >
                  {p.allCanceled
                    ? "Canceled"
                    : p.anyCanceled
                    ? "Partially canceled"
                    : "Active"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
