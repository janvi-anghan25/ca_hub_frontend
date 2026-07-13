import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const EmployeeFormModal = ({ employee, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!employee;

  const { register, handleSubmit } = useForm({
    defaultValues: employee ? {
      name: employee.name,
      mobile: employee.mobile,
      email: employee.email || '',
      designation: employee.designation || '',
      department: employee.department || '',
    } : {},
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${employee._id}`, data);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', data);
        toast.success('Employee added');
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Employee' : 'Add Employee'} size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
          </button>
        </>
      }
    >
      <form className="grid grid-cols-2 gap-4">
        <div className="form-group col-span-2">
          <label className="label">Name *</label>
          <input {...register('name')} className="input" placeholder="Full name" />
        </div>
        <div className="form-group">
          <label className="label">Mobile *</label>
          <input {...register('mobile')} className="input" />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input {...register('email')} type="email" className="input" />
        </div>
        <div className="form-group">
          <label className="label">Designation</label>
          <input {...register('designation')} className="input" placeholder="CA, Accountant..." />
        </div>
        <div className="form-group">
          <label className="label">Department</label>
          <input {...register('department')} className="input" />
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
