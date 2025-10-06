import { Link } from "react-router-dom";

export default function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (p: number) => string;
}) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  return (
    <div className="flex items-center justify-between mt-6">
      {prevDisabled ? (
        <span className="px-3 py-1.5 rounded border text-slate-400">Prev</span>
      ) : (
        <Link
          to={makeHref(page - 1)}
          className="px-3 py-1.5 rounded border hover:bg-slate-50"
        >
          Prev
        </Link>
      )}
      <div className="text-sm text-slate-600">
        Page {page} of {totalPages || 1}
      </div>
      {nextDisabled ? (
        <span className="px-3 py-1.5 rounded border text-slate-400">Next</span>
      ) : (
        <Link
          to={makeHref(page + 1)}
          className="px-3 py-1.5 rounded border hover:bg-slate-50"
        >
          Next
        </Link>
      )}
    </div>
  );
}
