import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Search, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { superAdminApi } from '../../api/superAdminApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile')
    .optional()
    .or(z.literal('')),
  officeName: z.string().min(2, 'Office name required'),
});

const StatusBadge = ({ isActive }) => (
  <span className={isActive ? 'badge-green' : 'badge-red'}>
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const limit = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createAdminSchema) });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await superAdminApi.getAdmins({ page, limit, search });
      setAdmins(data.data);
      setTotal(data.meta.total);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setToggling(id);
    try {
      await superAdminApi.toggleAdminStatus(id);
      toast.success(`Admin ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchAdmins();
    } catch {
      // handled
    } finally {
      setToggling(null);
    }
  };

  const onCreateAdmin = async (formData) => {
    setCreating(true);
    try {
      await superAdminApi.createAdmin(formData);
      toast.success('Admin created. Temporary password sent to their email.');
      setShowModal(false);
      reset();
      fetchAdmins();
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admins</h1>
          <div className="page-title-rule" />
          <p className="text-sm text-forest-400 mt-1">{total} CA admins registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Add Admin
        </button>
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
        ) : admins.length === 0 ? (
          <EmptyState icon={Users} title="No admins found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Office</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      <p className="font-medium text-forest text-sm">{admin.name}</p>
                      <p className="text-xs text-forest-400">{admin.email}</p>
                    </td>
                    <td className="text-sm text-forest">
                      {admin.office?.name || <span className="text-forest-300 italic">No office</span>}
                    </td>
                    <td className="text-sm text-forest-400">
                      {admin.lastLogin
                        ? new Date(admin.lastLogin).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td>
                      <StatusBadge isActive={admin.isActive} />
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                        disabled={toggling === admin._id}
                        title={admin.isActive ? 'Suspend admin' : 'Activate admin'}
                        className="p-1.5 rounded-lg text-forest-400 hover:bg-forest-50 hover:text-forest transition-colors disabled:opacity-50"
                      >
                        {admin.isActive
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
        {!loading && admins.length > 0 && (
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

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Invite Admin & Office"
        size="md"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={closeModal} disabled={creating}>
              Cancel
            </button>
            <button
              type="submit"
              form="create-admin-form"
              className="btn-primary"
              disabled={creating}
            >
              {creating ? 'Sending invite...' : 'Invite Admin'}
            </button>
          </>
        }
      >
        <form id="create-admin-form" onSubmit={handleSubmit(onCreateAdmin)} className="space-y-4">
          <p className="text-xs text-forest-400">
            A temporary password will be emailed to them
          </p>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              {...register('name')}
              className="input"
              placeholder="Admin full name"
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              {...register('email')}
              type="email"
              className="input"
              placeholder="admin@example.com"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Mobile (optional)</label>
            <input
              {...register('mobile')}
              className="input"
              placeholder="9876543210"
            />
            {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">CA Firm / Office Name</label>
            <input
              {...register('officeName')}
              className="input"
              placeholder="e.g. Sharma & Associates"
            />
            {errors.officeName && <p className="error-text">{errors.officeName.message}</p>}
          </div>

          <div className="rounded-lg bg-forest-50 border border-forest-100 px-3 py-2.5 text-xs text-forest">
            The admin will receive a temporary password by email and must change it on first login.
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminsPage;
