import { useNavigate, useParams } from "react-router-dom";
import FlightInfo from "../components/FlightInfo";
import { useQuery } from "@tanstack/react-query";
import { fetchFlight } from "../services/queries";
import Button from "../components/ui/Button";

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: flight,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["flight", id],
    queryFn: () => fetchFlight(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });

  const onBook = () => {
    if (!id) return;
    navigate(`/checkout?flight=${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900">Flight Details</h2>
      {isLoading ? (
        <div className="mt-6 text-slate-600">Loading...</div>
      ) : isError ? (
        <div className="mt-6 text-red-600">Failed to load flight.</div>
      ) : flight ? (
        <div className="mt-6 space-y-4">
          <FlightInfo flight={flight} />
          <Button onClick={onBook}>Book</Button>
        </div>
      ) : (
        <div className="mt-6 text-slate-600">Flight not found.</div>
      )}
    </div>
  );
}
