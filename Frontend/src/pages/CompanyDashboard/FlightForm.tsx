import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import api from "../../services/api";

export default function FlightForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState<any>({
    company_name: "My Airline",
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    duration_minutes: 0,
    stops: 0,
    price: 0,
    seats_total: 0,
    seats_available: 0,
    active: true,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "COMPANY_MANAGER") {
      navigate("/");
      return;
    }
    if (editing) {
      // fetch single flight details
      (async () => {
        try {
          const { data } = await api.get(`/api/flights/${id}`);
          if (data) {
            const f = data as any;
            setForm((prev: any) => ({
              ...prev,
              company_name: f.company_name ?? prev.company_name ?? "",
              flight_number: f.flight_number ?? "",
              origin: f.origin ?? "",
              destination: f.destination ?? "",
              departure_time: f.departure_time
                ? new Date(f.departure_time).toISOString().slice(0, 16)
                : "",
              arrival_time: f.arrival_time
                ? new Date(f.arrival_time).toISOString().slice(0, 16)
                : "",
              duration_minutes: f.duration_minutes ?? 0,
              stops: f.stops ?? 0,
              price: f.price ?? 0,
              seats_total: f.seats_total ?? 0,
              seats_available: f.seats_available ?? 0,
              active: f.active ?? true,
            }));
          }
        } catch {}
      })();
    }
  }, [user, id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Convert datetime-local strings to ISO if needed
      if (typeof payload.departure_time === "string")
        payload.departure_time = new Date(payload.departure_time).toISOString();
      if (typeof payload.arrival_time === "string")
        payload.arrival_time = new Date(payload.arrival_time).toISOString();
      if (editing) {
        await api.put(`/api/company/flights/${id}`, payload);
      } else {
        await api.post(`/api/company/flights`, payload);
      }
      navigate("/company/flights");
    } catch (e) {
      alert("Failed to save flight");
    }
  };

  const onChange = (k: string, v: any) =>
    setForm((s: any) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">
        {editing ? "Edit Flight" : "New Flight"}
      </h2>
      <form onSubmit={save} className="mt-6 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Airline name
            </label>
            <input
              value={form.company_name}
              onChange={(e) => onChange("company_name", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Flight number
            </label>
            <input
              value={form.flight_number}
              onChange={(e) => onChange("flight_number", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Origin
            </label>
            <input
              value={form.origin}
              onChange={(e) => onChange("origin", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Destination
            </label>
            <input
              value={form.destination}
              onChange={(e) => onChange("destination", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Departure
            </label>
            <input
              type="datetime-local"
              value={form.departure_time || ""}
              onChange={(e) => onChange("departure_time", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Arrival
            </label>
            <input
              type="datetime-local"
              value={form.arrival_time || ""}
              onChange={(e) => onChange("arrival_time", e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Duration (min)
            </label>
            <input
              type="number"
              value={form.duration_minutes ?? 0}
              onChange={(e) =>
                onChange("duration_minutes", Number(e.target.value) || 0)
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Stops
            </label>
            <input
              type="number"
              value={form.stops ?? 0}
              onChange={(e) => onChange("stops", Number(e.target.value) || 0)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price ?? 0}
              onChange={(e) => onChange("price", Number(e.target.value) || 0)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Seats total
            </label>
            <input
              type="number"
              value={form.seats_total ?? 0}
              onChange={(e) =>
                onChange("seats_total", Number(e.target.value) || 0)
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Seats available
            </label>
            <input
              type="number"
              value={form.seats_available ?? 0}
              onChange={(e) =>
                onChange("seats_available", Number(e.target.value) || 0)
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => onChange("active", e.target.checked)}
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Active
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/company/flights")}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
