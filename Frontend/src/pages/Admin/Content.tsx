import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
type Banner = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  is_active?: boolean;
  link_url?: string;
};
const defaultOffers: any[] = [];

export default function AdminContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);

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
      try {
        const { data } = await api.get("/api/admin/content/banners");
        const mapped = (data || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.description,
          image: b.image_url,
          is_active: b.is_active,
        }));
        setBanners(mapped.length ? mapped : (defaultOffers as any));
      } catch {
        setBanners(defaultOffers as any);
      }
    })();
  }, [user]);

  const onChange = (idx: number, key: keyof Banner, val: string) =>
    setBanners((arr) =>
      arr.map((b, i) => (i === idx ? { ...b, [key]: val } : b))
    );
  const onAdd = () =>
    setBanners((arr) => [
      ...arr,
      {
        id: ("temp-" + Date.now()) as unknown as number,
        title: "New Banner",
        subtitle: "Subtitle",
        image: "",
        is_active: true,
      },
    ]);
  const onRemove = async (idx: number) => {
    const b = banners[idx];
    if (!b) return;
    if (!String(b.id).startsWith("temp-")) {
      await api.delete(`/api/admin/content/banners/${b.id}`);
    }
    setBanners((arr) => arr.filter((_, i) => i !== idx));
  };
  const onSave = async () => {
    for (const b of banners) {
      const payload = {
        title: b.title,
        description: b.subtitle || "",
        image_url: b.image || "",
        link_url: b.link_url || "",
        is_active: b.is_active ?? true,
      };
      if (String(b.id).startsWith("temp-")) {
        await api.post("/api/admin/content/banners", payload);
      } else {
        await api.patch(`/api/admin/content/banners/${b.id}`, payload);
      }
    }
    // reload
    const { data } = await api.get("/api/admin/content/banners");
    const mapped = (data || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.description,
      image: b.image_url,
      link_url: b.link_url,
      is_active: b.is_active,
    }));
    setBanners(mapped);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">
        Admin • Content (Banners)
      </h2>
      <div className="mt-6 grid gap-4">
        {banners.map((b, idx) => (
          <div key={b.id} className="p-4 rounded-lg border bg-white shadow-sm">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Title
                </label>
                <input
                  value={b.title}
                  onChange={(e) => onChange(idx, "title", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Link URL
                </label>
                <input
                  value={b.link_url || ""}
                  onChange={(e) => onChange(idx, "link_url", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Subtitle
                </label>
                <input
                  value={b.subtitle}
                  onChange={(e) => onChange(idx, "subtitle", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Image URL
                </label>
                <input
                  value={b.image}
                  onChange={(e) => onChange(idx, "image", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id={`active-${b.id}`}
                  type="checkbox"
                  checked={b.is_active ?? true}
                  onChange={(e) =>
                    setBanners((arr) =>
                      arr.map((x, i) =>
                        i === idx ? { ...x, is_active: e.target.checked } : x
                      )
                    )
                  }
                />
                <label
                  htmlFor={`active-${b.id}`}
                  className="text-sm text-slate-700"
                >
                  Active
                </label>
              </div>
            </div>
            <div className="mt-3 text-right">
              <button
                onClick={() => onRemove(idx)}
                className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="px-4 py-2 rounded border hover:bg-slate-50"
          >
            Add Banner
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
