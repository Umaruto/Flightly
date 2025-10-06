import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightCard from "../components/FlightCard";
import Pagination from "../components/Pagination";
import { useQuery } from "@tanstack/react-query";
import { fetchFlights, type Flight } from "../services/queries";

export default function SearchResults() {
  const [params] = useSearchParams();
  const origin = (params.get("origin") || "").toLowerCase();
  const destination = (params.get("destination") || "").toLowerCase();
  const date = params.get("date"); // YYYY-MM-DD
  const passengers = Math.max(1, Number(params.get("passengers") || "1"));
  const page = Math.max(1, Number(params.get("page") || "1"));
  const pageSize = 5;
  // extra filters (optional)
  const [minPrice, setMinPrice] = useState<string>(
    params.get("min_price") || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    params.get("max_price") || ""
  );
  const [stops, setStops] = useState<string>(params.get("stops") || "");
  const [airline, setAirline] = useState<string>(params.get("airline") || "");
  const [sort, setSort] = useState<string>(params.get("sort") || "");
  const {
    data: flights = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "flights",
      {
        origin,
        destination,
        date,
        passengers,
        minPrice,
        maxPrice,
        stops,
        airline,
        sort,
      },
    ],
    queryFn: () =>
      fetchFlights({
        origin,
        destination,
        date: date || undefined,
        passengers,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        stops: stops ? Number(stops) : undefined,
        airline: airline || undefined,
        sort: sort || undefined,
      }),
    staleTime: 1000 * 60, // 1 minute
  });

  const matches = useMemo(() => {
    return (flights as Flight[]).filter((f: Flight) => {
      const okActive = f.active !== false;
      const okOrigin = origin ? f.origin.toLowerCase().includes(origin) : true;
      const okDest = destination
        ? f.destination.toLowerCase().includes(destination)
        : true;
      const okPax = passengers ? (f.seats_available ?? 0) >= passengers : true;
      const depDate = (f.departure_time || "").slice(0, 10);
      const okDate = date ? depDate === date : true;
      return okActive && okOrigin && okDest && okPax && okDate;
    });
  }, [flights, origin, destination, passengers, date]);

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = matches.slice(start, start + pageSize);

  const makeHref = (p: number) => {
    const q = new URLSearchParams(params);
    q.set("page", String(Math.min(Math.max(1, p), totalPages)));
    return `/search?${q.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
      {/* Filters Bar */}
      <div className="mt-4 grid md:grid-cols-6 gap-2">
        <input
          type="number"
          placeholder="Min $"
          className="border rounded px-2 py-1"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max $"
          className="border rounded px-2 py-1"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={stops}
          onChange={(e) => setStops(e.target.value)}
        >
          <option value="">Stops</option>
          <option value="0">Nonstop</option>
          <option value="1">1 stop</option>
          <option value="2">2 stops</option>
        </select>
        <input
          placeholder="Airline"
          className="border rounded px-2 py-1"
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="price">Price</option>
          <option value="departure_time">Departure</option>
        </select>
        <button
          className="border rounded px-3 py-1 hover:bg-slate-50"
          onClick={() => {
            const q = new URLSearchParams(params);
            if (minPrice) q.set("min_price", minPrice);
            else q.delete("min_price");
            if (maxPrice) q.set("max_price", maxPrice);
            else q.delete("max_price");
            if (stops) q.set("stops", stops);
            else q.delete("stops");
            if (airline) q.set("airline", airline);
            else q.delete("airline");
            if (sort) q.set("sort", sort);
            else q.delete("sort");
            // page back to 1
            q.set("page", "1");
            window.history.replaceState({}, "", `/search?${q.toString()}`);
          }}
        >
          Apply
        </button>
      </div>
      {isLoading && (
        <div className="mt-4 text-slate-600">Loading flights...</div>
      )}
      {isError && (
        <div className="mt-4 text-red-600">Failed to load flights.</div>
      )}
      <p className="text-sm text-slate-600 mt-1">
        Origin: {origin || "any"} • Destination: {destination || "any"} • Date:{" "}
        {date || "any"} • Passengers: {passengers}
      </p>
      <div className="mt-6 grid gap-4">
        {!isLoading && pageItems.length ? (
          pageItems.map((f: Flight) => (
            <FlightCard key={f.id} flight={f as any} />
          ))
        ) : (
          <div className="text-slate-600">
            No flights found. Try adjusting your filters.
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
