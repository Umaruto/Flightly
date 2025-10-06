import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (passengers) params.set("passengers", String(passengers));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
    >
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          Origin
        </label>
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="NYC"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          Destination
        </label>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="LAX"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600">
          Passengers
        </label>
        <input
          type="number"
          min={1}
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value) || 1)}
          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="col-span-2 md:col-span-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
