import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function AdminStats() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any | null>(null);
  // Filters
  const [preset, setPreset] = useState<"7d" | "30d" | "this-month" | "custom">(
    "7d"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Last seen timestamp
  const [lastSeen, setLastSeen] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    (async () => {
      const [usersRes, companiesRes] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/admin/companies"),
      ]);
      setUsers(usersRes.data);
      setCompanies(companiesRes.data);
      // bookings will be loaded in next effect based on range
    })();
  }, [user]);

  useEffect(() => {
    // load last-seen timestamp
    const ls = localStorage.getItem("admin_stats_last_seen");
    if (ls) {
      const n = Number(ls);
      if (!Number.isNaN(n)) setLastSeen(n);
    }
  }, []);

  const range = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    if (preset === "7d") {
      end = new Date(now);
      start = new Date(now);
      start.setDate(now.getDate() - 6);
    } else if (preset === "30d") {
      end = new Date(now);
      start = new Date(now);
      start.setDate(now.getDate() - 29);
    } else if (preset === "this-month") {
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else {
      // custom
      const s = startDate ? new Date(startDate + "T00:00:00") : new Date(now);
      const e = endDate ? new Date(endDate + "T23:59:59.999") : new Date(now);
      start = s;
      end = e;
    }
    if (start > end) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    return { start, end };
  }, [preset, startDate, endDate]);

  const parseCreatedAt = (b: any) => new Date(b.createdAt || b.created_at || 0);
  useEffect(() => {
    (async () => {
      const params: any = {};
      // inclusive range; backend uses dates without time
      params.start = range.start.toISOString().slice(0, 10);
      params.end = range.end.toISOString().slice(0, 10);
      const { data } = await api.get("/api/admin/bookings", { params });
      setBookings(data || []);
      // also fetch platform stats for flights metrics and revenue
      try {
        const statsRes = await api.get("/api/admin/stats", { params });
        setPlatformStats(statsRes.data);
      } catch {
        setPlatformStats(null);
      }
    })();
  }, [range.start, range.end]);

  const newSinceLast = useMemo(() => {
    if (!lastSeen) return bookings.length;
    return bookings.filter((b) => parseCreatedAt(b).getTime() > lastSeen)
      .length;
  }, [bookings, lastSeen]);

  const markAsSeen = () => {
    const now = Date.now();
    localStorage.setItem("admin_stats_last_seen", String(now));
    setLastSeen(now);
  };

  const metrics = useMemo(() => {
    const byRole: Record<string, number> = {};
    const blocked = users.filter((u) => u.is_active === false).length;
    users.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
    });

    const companiesActive = companies.filter((c) => c.is_active).length;

    // Use platform stats API for flights metrics
    // Fallback compute can be added if needed
    // We'll fetch platform stats inline
    // Note: To keep minimal edits, compute placeholders here and override below after fetch
    let flightsTotal = platformStats?.total_flights ?? 0;
    let flightsActive = platformStats?.active_flights ?? 0;

    const totalRevenue =
      platformStats?.total_revenue ??
      bookings.reduce((sum, b: any) => sum + (Number(b.total_amount) || 0), 0);
    const bookingsCount = bookings.length;

    // Top companies by bookings
    const byCompany: Record<
      string,
      { count: number; revenue: number; name: string }
    > = {};
    const companyName = (id: number | null | undefined) => {
      if (!id && id !== 0) return "Public";
      const c = companies.find((c) => String(c.id) === String(id));
      return c ? c.name : `Company ${id}`;
    };
    bookings.forEach((b: any) => {
      const key = String(b.company_id ?? "public");
      const entry = byCompany[key] || {
        count: 0,
        revenue: 0,
        name: companyName(b.company_id),
      };
      entry.count += 1;
      entry.revenue += Number(b.total_amount) || 0;
      byCompany[key] = entry;
    });
    const topCompanies = Object.values(byCompany)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Bookings by day for selected range (show up to last 14 days of the range)
    const days: { label: string; count: number }[] = [];
    const totalDays =
      Math.floor(
        (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const showDays = Math.min(14, Math.max(1, totalDays));
    for (let i = showDays - 1; i >= 0; i--) {
      const d = new Date(range.end);
      d.setDate(range.end.getDate() - i);
      const label = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const count = bookings.filter((b: any) => {
        const t = new Date(b.purchased_at);
        return (
          t.getFullYear() === d.getFullYear() &&
          t.getMonth() === d.getMonth() &&
          t.getDate() === d.getDate()
        );
      }).length;
      days.push({ label, count });
    }

    const base = {
      byRole,
      blocked,
      companiesActive,
      companiesTotal: companies.length,
      flightsTotal,
      flightsActive,
      totalRevenue,
      bookingsCount,
      topCompanies,
      days,
    };
    return base;
  }, [users, companies, bookings, range, platformStats]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">
        Admin • Platform Stats
      </h2>

      {/* Filters + Last seen */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600">Range:</span>
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1.5 rounded border text-sm"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1.5 rounded border text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-700">
            New since last visit:{" "}
            <span className="font-semibold">{newSinceLast}</span>
          </div>
          <button
            onClick={markAsSeen}
            className="px-3 py-1.5 rounded border text-sm hover:bg-slate-50"
          >
            Mark as seen
          </button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Users"
          value={users.length}
          sub={Object.entries(metrics.byRole)
            .map(([r, c]) => `${r}: ${c}`)
            .join("  •  ")}
        />
        <StatCard label="Blocked Users" value={metrics.blocked} />
        <StatCard
          label="Companies"
          value={`${metrics.companiesActive}/${metrics.companiesTotal}`}
          sub="active/total"
        />
        <StatCard
          label="Flights"
          value={`${metrics.flightsActive}/${metrics.flightsTotal}`}
          sub="active/total"
        />
        <StatCard
          label="Completed Flights"
          value={platformStats?.completed_flights ?? 0}
        />
        <StatCard
          label="Total Passengers"
          value={platformStats?.total_passengers ?? 0}
        />
        <StatCard label="Bookings (range)" value={metrics.bookingsCount} />
        <StatCard
          label="Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Bookings • per day</h3>
            <button
              onClick={() => downloadCSV(bookings, companies)}
              className="px-3 py-1.5 rounded border text-sm hover:bg-slate-50"
            >
              Download CSV
            </button>
          </div>
          <div className="mt-4 flex items-end gap-3 h-40">
            {metrics.days.map((d) => (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-blue-100 rounded"
                  style={{ height: `${(d.count || 0) * 12}px` }}
                />
                <div className="text-xs text-slate-600">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold text-slate-800">Top companies</h3>
          <div className="mt-3 space-y-2">
            {metrics.topCompanies.length ? (
              metrics.topCompanies.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="text-slate-800">{c.name}</div>
                  <div className="text-slate-600">
                    {c.count} • ${c.revenue.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No bookings yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Data sources are now backend APIs */}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function downloadCSV(bookings: any[], companies: any[]) {
  // Shape: confirmation_id, company, total_amount, purchased_at
  const nameById = (id: any) => {
    const c = companies.find((c) => String(c.id) === String(id));
    return c ? c.name : "Public";
  };
  const rows = [
    ["confirmation_id", "company", "total", "purchased_at"],
    ...bookings.map((b: any) => [
      b.confirmation_id ?? "",
      nameById(b.company_id ?? "public"),
      String(b.total_amount ?? ""),
      String(b.purchased_at || ""),
    ]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.download = `bookings-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
