import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import OffersSlider from "../components/OffersSlider";

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-blue-200">
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Find your next flight with{" "}
            <span className="text-blue-700">Flightly</span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-prose">
            Search, compare, and book flights in seconds. Simple checkout, clear
            pricing, and real-time seat availability.
          </p>
          <div className="mt-6 bg-white rounded-xl shadow p-4">
            <SearchBar />
            <Link
              to="/login"
              className="mt-4 inline-block px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <OffersSlider />
        </div>
      </section>
    </div>
  );
}
