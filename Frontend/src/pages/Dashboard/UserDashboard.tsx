import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import TicketCard from "../../components/TicketCard";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMyBookings,
  cancelTicket as apiCancelTicket,
} from "../../services/queries";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me", "bookings"],
    queryFn: fetchMyBookings,
    enabled: Boolean(user),
    staleTime: 1000 * 30,
  });

  const tickets = bookings.flatMap((b: any) =>
    (b.tickets || []).map((t: any) => ({ ticket: t, booking: b }))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">My Bookings</h2>
      {isLoading ? (
        <div className="mt-6 text-slate-600">Loading bookings...</div>
      ) : isError ? (
        <div className="mt-6 text-red-600">Failed to load bookings.</div>
      ) : tickets.length === 0 ? (
        <div className="mt-6 text-slate-600">You have no bookings yet.</div>
      ) : (
        <div className="mt-6 grid gap-4">
          {tickets.map(({ ticket, booking }) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              booking={booking}
              onCancel={async (id: number) => {
                await apiCancelTicket(id);
                // trigger refetch
                window.dispatchEvent(new Event("focus"));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
