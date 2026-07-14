import { useEffect, useState, useCallback } from 'react';
import { Building2, Search, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { superAdminApi } from '../../api/superAdminApi';
import toast from 'react-hot-toast';

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
    }`}
  >
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

const OfficesPage = () => {
  const [offices, setOffices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const limit = 10;

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await superAdminApi.getOffices({ page, limit, search });
      setOffices(data.data);
      setTotal(data.meta.total);
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setToggling(id);
    try {
      await superAdminApi.toggleOfficeStatus(id);
      toast.success(`Office ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchOffices();
    } catch {
      // handled by interceptor
    } finally {
      setToggling(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CA Offices</h1>
          <p className="text-sm text-gray-500 mt-1">{total} offices registered</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : offices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Building2 size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No offices found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Office</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offices.map((office) => (
                <tr key={office._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{office.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[office.address?.city, office.address?.state].filter(Boolean).join(', ') || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-700">{office.owner?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{office.owner?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{office.mobile || office.email || '—'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge isActive={office.isActive} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(office._id, office.isActive)}
                      disabled={toggling === office._id}
                      title={office.isActive ? 'Suspend office' : 'Activate office'}
                      className="text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                    >
                      {office.isActive
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-gray-400" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficesPage;
