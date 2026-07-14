import { useEffect, useState, useCallback } from 'react';
import { Building2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { superAdminApi } from '../../api/superAdminApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const StatusBadge = ({ isActive }) => (
  <span className={isActive ? 'badge-green' : 'badge-red'}>
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
      <div className="page-header">
        <div>
          <h1 className="page-title">CA Offices</h1>
          <div className="page-title-rule" />
          <p className="text-sm text-forest-400 mt-1">{total} offices registered</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary sm:w-auto">
            Search
          </button>
        </div>
      </form>

      <div className="card p-0">
        {loading ? (
          <SectionLoader />
        ) : offices.length === 0 ? (
          <EmptyState icon={Building2} title="No offices found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Office</th>
                  <th>Admin</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => (
                  <tr key={office._id}>
                    <td>
                      <p className="font-medium text-forest text-sm">{office.name}</p>
                      <p className="text-xs text-forest-400 mt-0.5">
                        {[office.address?.city, office.address?.state].filter(Boolean).join(', ') || '—'}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm text-forest">{office.owner?.name || '—'}</p>
                      <p className="text-xs text-forest-400">{office.owner?.email}</p>
                    </td>
                    <td className="text-sm text-forest-400">{office.mobile || office.email || '—'}</td>
                    <td>
                      <StatusBadge isActive={office.isActive} />
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(office._id, office.isActive)}
                        disabled={toggling === office._id}
                        title={office.isActive ? 'Suspend office' : 'Activate office'}
                        className="p-1.5 rounded-lg text-forest-400 hover:bg-forest-50 hover:text-forest transition-colors disabled:opacity-50"
                      >
                        {office.isActive
                          ? <ToggleRight size={22} className="text-forest-500" />
                          : <ToggleLeft size={22} className="text-forest-400" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && offices.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
              limit={limit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficesPage;
