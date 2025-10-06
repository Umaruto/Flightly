export default function BookingSummary({ total }: { total: number }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow">
      <div className="text-lg font-semibold text-slate-900">Summary</div>
      <div className="mt-2 text-slate-700">
        Total: <span className="font-bold">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
