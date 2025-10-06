import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PassengerForm, { type Passenger } from "../components/PassengerForm";
import BookingSummary from "../components/BookingSummary";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addBooking } = useAuth();
  const flightId = params.get("flight") || "";
  const [passenger, setPassenger] = useState<Passenger>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [price, setPrice] = useState<number>(0);
  const total = useMemo(() => price, [price]);

  useEffect(() => {
    if (!flightId) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/flights/${flightId}`);
        setPrice(data?.price || 0);
      } catch {
        setPrice(0);
      }
    })();
  }, [flightId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/flights/${flightId}/book`, {
        passengers: [
          { name: `${passenger.firstName} ${passenger.lastName}`.trim() },
        ],
      });
      const { confirmation_id, tickets } = res.data || {};
      const booking = {
        id: confirmation_id,
        flightId: Number(flightId),
        total,
        tickets: tickets || [],
        passenger,
        createdAt: new Date().toISOString(),
      };
      addBooking(booking);
      navigate(`/confirmation?id=${confirmation_id}`);
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Checkout</h2>
      <p className="text-slate-600 mt-1">Flight: {flightId}</p>
      <form onSubmit={onSubmit} className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <PassengerForm onChange={setPassenger} />
        </div>
        <div className="md:col-span-1 space-y-4">
          <BookingSummary total={total} />
          <button
            type="submit"
            className="w-full px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm & Pay
          </button>
        </div>
      </form>
    </div>
  );
}
