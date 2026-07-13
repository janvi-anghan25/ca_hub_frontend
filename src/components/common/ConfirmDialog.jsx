import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, loading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className="flex-shrink-0 p-2 rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{message || 'Are you sure? This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
