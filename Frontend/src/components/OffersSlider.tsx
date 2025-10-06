import { useEffect, useState } from "react";
const defaultOffers: any[] = [];
import api from "../services/api";
type Banner = {
  id: number;
  title: string;
  image?: string;
  subtitle?: string;
  is_active?: boolean;
  link_url?: string;
};

export default function OffersSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/content/banners", {
          params: { is_active: true },
        });
        const mapped = (data || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.description,
          image: b.image_url,
          link_url: b.link_url,
        }));
        setBanners(mapped.length ? mapped : (defaultOffers as any));
      } catch {
        setBanners(defaultOffers as any);
      }
    })();
  }, []);
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {banners.map((o) => {
        const Card = (
          <div className="min-w-[260px] relative overflow-hidden rounded-xl shadow">
            <img
              src={o.image}
              alt={o.title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 p-3 text-white">
              <div className="text-base font-semibold">{o.title}</div>
              <div className="text-xs opacity-90">{o.subtitle}</div>
            </div>
          </div>
        );
        return o.link_url ? (
          <a key={o.id} href={o.link_url} target="_blank" rel="noreferrer">
            {Card}
          </a>
        ) : (
          <div key={o.id}>{Card}</div>
        );
      })}
    </div>
  );
}
