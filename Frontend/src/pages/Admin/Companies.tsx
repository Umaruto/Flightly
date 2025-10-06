import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
type Company = {
  id: number;
  name: string;
  is_active: boolean;
  manager_id?: number | null;
  created_at?: string;
  code?: string;
};
type Manager = { id: number; email: string; full_name?: string };

export default function AdminCompanies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [form, setForm] = useState<{
    id?: number;
    name?: string;
    code?: string;
    is_active?: boolean;
  }>({
    id: undefined,
    name: "",
    code: "",
    is_active: true,
  });

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
      const { data } = await api.get("/api/admin/companies");
      setCompanies(data);
      // load eligible managers: filter users by role
      const usersRes = await api.get("/api/admin/users", {
        params: { role: "COMPANY_MANAGER" },
      });
      setManagers(usersRes.data || []);
    })();
  }, [user]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      if (form.id) {
        const { data } = await api.patch(`/api/admin/companies/${form.id}`, {
          name: form.name,
          is_active: form.is_active,
        });
        setCompanies((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      } else {
        const { data } = await api.post(`/api/admin/companies`, {
          name: form.name,
        });
        setCompanies((prev) => [...prev, data]);
      }
    })();
    setForm({ id: undefined, name: "", code: "", is_active: true });
  };

  const onEdit = (c: Company) => setForm({ ...c });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Admin • Companies</h2>
      <form
        onSubmit={onSubmit}
        className="mt-6 grid sm:grid-cols-3 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Name
          </label>
          <input
            value={form.name || ""}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Code
          </label>
          <input
            value={form.code || ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))
            }
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) =>
              setForm((s) => ({ ...s, is_active: e.target.checked }))
            }
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Active
          </label>
        </div>
        <div className="sm:col-span-3 flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {form.id ? "Update" : "Create"}
          </button>
          {form.id && (
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() =>
                setForm({ id: undefined, name: "", code: "", is_active: true })
              }
            >
              Clear
            </button>
          )}
        </div>
      </form>
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-left text-sm text-slate-700">
            <tr>
              <th className="px-3 py-2 border-b">ID</th>
              <th className="px-3 py-2 border-b">Name</th>
              <th className="px-3 py-2 border-b">Code</th>
              <th className="px-3 py-2 border-b">Manager</th>
              <th className="px-3 py-2 border-b">Status</th>
              <th className="px-3 py-2 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {companies.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="px-3 py-2">{c.id}</td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.code}</td>
                <td className="px-3 py-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={c.manager_id ?? 0}
                    onChange={async (e) => {
                      const newId = Number(e.target.value) || 0;
                      const { data } = await api.patch(
                        `/api/admin/companies/${c.id}`,
                        {
                          manager_id: newId === 0 ? 0 : newId,
                        }
                      );
                      setCompanies((prev) =>
                        prev.map((x) => (x.id === c.id ? data : x))
                      );
                    }}
                  >
                    <option value={0}>— None —</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || m.email}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      c.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {c.is_active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    className="px-3 py-1.5 rounded border hover:bg-slate-50"
                    onClick={() => onEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded ${
                      c.is_active
                        ? "bg-slate-800 text-white hover:bg-slate-900"
                        : "bg-slate-200 text-slate-600"
                    }`}
                    onClick={async () => {
                      const { data } = await api.patch(
                        `/api/admin/companies/${c.id}`,
                        { is_active: !c.is_active }
                      );
                      setCompanies((prev) =>
                        prev.map((x) => (x.id === c.id ? data : x))
                      );
                    }}
                  >
                    {c.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
