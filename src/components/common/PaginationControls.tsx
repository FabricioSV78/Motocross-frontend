interface PaginationControlsProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, page + 2)
  );

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-700/80 bg-gray-800/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-400">
        Showing <span className="font-semibold text-white">{start}</span> to{' '}
        <span className="font-semibold text-white">{end}</span> of{' '}
        <span className="font-semibold text-white">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              pageNumber === page
                ? 'bg-orange-500 text-white'
                : 'border border-gray-700 bg-gray-900/70 text-gray-300 hover:border-gray-600 hover:text-white'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          className="rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </div>
  );
}
