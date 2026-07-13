import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import api from '../../api/axiosInstance';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmployeeFormModal from './EmployeeFormModal';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees', { params: { page, limit: LIMIT } });
      setEmployees(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteId}`);
      toast.success('Employee removed');
      setDeleteId(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn-primary" onClick={() => { setEditEmp(null); setShowForm(true); }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : employees.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Add your first team member" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Clients</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                          {emp.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-medium text-sm text-gray-900">{emp.name}</p>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{emp.mobile}</td>
                    <td className="text-sm text-gray-600">{emp.email || '—'}</td>
                    <td className="text-sm text-gray-600">{emp.designation || '—'}</td>
                    <td className="text-sm text-gray-600">{emp.assignedClients?.length || 0}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditEmp(emp); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteId(emp._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && employees.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>

      {showForm && <EmployeeFormModal employee={editEmp} onSuccess={() => { setShowForm(false); setEditEmp(null); load(); }} onClose={() => { setShowForm(false); setEditEmp(null); }} />}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} message="Deactivate this employee?" />
    </div>
  );
};

export default EmployeesPage;
