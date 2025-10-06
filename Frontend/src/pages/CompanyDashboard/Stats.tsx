import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function Stats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    flights: 0,
    activeFlights: 0,
    completedFlights: 0,
    ticketsSold: 0,
    revenue: 0,
    uniquePassengers: 0,
  });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [preset, setPreset] = useState<
    "all" | "7d" | "30d" | "this-month" | "custom"
  >("all");

  const range = useMemo(() => {
    if (preset === "all") return { start: "", end: "" };
    const now = new Date();
    if (preset === "7d") {
      const s = new Date(now);
      s.setDate(now.getDate() - 6);
      return {
        start: s.toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
      };
    }
    if (preset === "30d") {
      const s = new Date(now);
      s.setDate(now.getDate() - 29);
      return {
        start: s.toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
      };
    }
    if (preset === "this-month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: s.toISOString().slice(0, 10),
        end: e.toISOString().slice(0, 10),
      };
    }
    // custom
    return { start, end };
  }, [preset, start, end]);

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
        const params: any = {};
        if (range.start) params.start = range.start;
        if (range.end) params.end = range.end;
        const { data } = await api.get("/api/company/stats", { params });
        // Map backend fields to UI fields
        setStats({
          flights: data.total_flights,
          activeFlights: data.active_flights,
          completedFlights: data.completed_flights,
          ticketsSold: data.total_passengers,
          revenue: data.total_revenue,
          uniquePassengers: data.total_passengers,
        });
      } catch (e) {
        setStats({
          flights: 0,
          ticketsSold: 0,
          revenue: 0,
          uniquePassengers: 0,
        });
      }
    })();
  }, [user, range.start, range.end]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Company Stats</h2>
      {/* Presets */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Range:</span>
        <button
          onClick={() => setPreset("all")}
          className={`px-3 py-1.5 rounded border text-sm ${
            preset === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-slate-50"
          }`}
        >
          All time
        </button>
        <button
          onClick={() => setPreset("7d")}
          className={`px-3 py-1.5 rounded border text-sm ${
            preset === "7d"
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-slate-50"
          }`}
        >
          Last 7d
        </button>
        <button
          onClick={() => setPreset("30d")}
          className={`px-3 py-1.5 rounded border text-sm ${
            preset === "30d"
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-slate-50"
          }`}
        >
          Last 30d
        </button>
        <button
          onClick={() => setPreset("this-month")}
          className={`px-3 py-1.5 rounded border text-sm ${
            preset === "this-month"
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-slate-50"
          }`}
        >
          This month
        </button>
        <button
          onClick={() => setPreset("custom")}
          className={`px-3 py-1.5 rounded border text-sm ${
            preset === "custom"
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-slate-50"
          }`}
        >
          Custom
        </button>
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-2 py-1.5 rounded border text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-2 py-1.5 rounded border text-sm"
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Flights</div>
          <div className="text-2xl font-bold">{stats.flights}</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Active Flights</div>
          <div className="text-2xl font-bold">{stats.activeFlights}</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Completed Flights</div>
          <div className="text-2xl font-bold">{stats.completedFlights}</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Tickets Sold</div>
          <div className="text-2xl font-bold">{stats.ticketsSold}</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Revenue</div>
          <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="text-xs text-slate-500">Passengers</div>
          <div className="text-2xl font-bold">{stats.uniquePassengers}</div>
        </div>
      </div>
      {/* Custom range inputs are shown above when preset = custom */}
    </div>
  );
}
