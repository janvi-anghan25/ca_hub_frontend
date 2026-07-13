import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange, total, limit }) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const mid = Math.min(Math.max(page, 3), totalPages - 2);
    return mid - 2 + i;
  }).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}</span>–
        <span className="font-medium text-gray-700">{end}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && (
          <>
            <PageBtn num={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map((p) => <PageBtn key={p} num={p} current={page} onClick={onPageChange} />)}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <PageBtn num={totalPages} current={page} onClick={onPageChange} />
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const PageBtn = ({ num, current, onClick }) => (
  <button
    onClick={() => onClick(num)}
    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
      num === current
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {num}
  </button>
);

export default Pagination;
