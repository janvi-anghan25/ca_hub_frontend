import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { clientApi } from '../../api/clientApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ClientFormModal from './ClientFormModal';
import ClientDetailModal from './ClientDetailModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['GST', 'ITR', 'Company', 'LLP', 'Partnership', 'Audit', 'Other'];

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 10;

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientApi.getClients({
        q: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit: LIMIT,
      });
      setClients(data.data);
      setTotal(data.meta.total);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await clientApi.deleteClient(deleteId);
      toast.success('Client deleted');
      setDeleteId(null);
      loadClients();
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditClient(null);
    loadClients();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-forest-400 mt-0.5">{total} clients registered</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditClient(null); setShowForm(true); }}>
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, GST, PAN, mobile..."
              className="input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input w-auto min-w-32" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="input w-auto min-w-36" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All Category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        {loading ? (
          <SectionLoader />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients found"
            description="Start by adding your first client"
            action={
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={15} /> Add Client
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Mobile</th>
                  <th>GST / PAN</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest font-semibold text-sm flex-shrink-0">
                          {client.clientName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-forest text-sm">{client.clientName}</p>
                          {client.firmName && <p className="text-xs text-forest-400">{client.firmName}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-forest-400">
                        <Phone size={13} />
                        <span className="text-sm">{client.mobile}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs space-y-1">
                        {client.gstNumber && <p className="font-mono text-forest">{client.gstNumber}</p>}
                        {client.panNumber && <p className="font-mono text-forest-400">{client.panNumber}</p>}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {client.category?.slice(0, 2).map((c) => (
                          <span key={c} className="badge badge-blue">{c}</span>
                        ))}
                        {(client.category?.length || 0) > 2 && (
                          <span className="badge badge-gray">+{client.category.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={client.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewClient(client)}
                          className="p-1.5 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => { setEditClient(client); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(client._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && clients.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ClientFormModal
          client={editClient}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditClient(null); }}
        />
      )}
      {viewClient && (
        <ClientDetailModal client={viewClient} onClose={() => setViewClient(null)} />
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="Are you sure you want to delete this client? All associated data will also be deleted."
      />
    </div>
  );
};

export default ClientsPage;
