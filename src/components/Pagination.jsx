export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Event pages">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
      >
        Previous
      </button>
      <span className="pagination-label">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </button>
    </nav>
  );
}
