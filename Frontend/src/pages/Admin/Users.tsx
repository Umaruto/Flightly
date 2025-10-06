import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
type Role = "USER" | "COMPANY_MANAGER" | "ADMIN";
type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
};

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

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
      const { data } = await api.get("/api/admin/users");
      setUsers(data);
    })();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Admin • Users</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-left text-sm text-slate-700">
            <tr>
              <th className="px-3 py-2 border-b">ID</th>
              <th className="px-3 py-2 border-b">Name</th>
              <th className="px-3 py-2 border-b">Email</th>
              <th className="px-3 py-2 border-b">Role</th>
              <th className="px-3 py-2 border-b">Status</th>
              <th className="px-3 py-2 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={u.role}
                    onChange={async (e) => {
                      const role = e.target.value as Role;
                      const { data } = await api.patch(
                        `/api/admin/users/${u.id}`,
                        { role }
                      );
                      setUsers((prev) =>
                        prev.map((x) => (x.id === u.id ? data : x))
                      );
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="COMPANY_MANAGER">COMPANY_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      u.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.is_active ? "active" : "blocked"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {u.is_active === false ? (
                    <button
                      className="px-3 py-1.5 rounded border hover:bg-slate-50"
                      onClick={async () => {
                        const { data } = await api.patch(
                          `/api/admin/users/${u.id}`,
                          { is_active: true }
                        );
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? data : x))
                        );
                      }}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={async () => {
                        if (u.email === "admin@example.com") return;
                        const { data } = await api.patch(
                          `/api/admin/users/${u.id}`,
                          { is_active: false }
                        );
                        setUsers((prev) =>
                          prev.map((x) => (x.id === u.id ? data : x))
                        );
                      }}
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
