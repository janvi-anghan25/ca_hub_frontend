import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Phone, Mail, MapPin, CreditCard, Building } from 'lucide-react';

const Field = ({ label, value }) => value ? (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
) : null;

const ClientDetailModal = ({ client, onClose }) => (
  <Modal isOpen onClose={onClose} title="Client Details" size="lg">
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {client.clientName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{client.clientName}</h2>
          {client.firmName && <p className="text-sm text-gray-500">{client.firmName}</p>}
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={client.status} />
            {client.category?.map((c) => <span key={c} className="badge badge-blue">{c}</span>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mobile" value={client.mobile} />
        <Field label="Email" value={client.email} />
        <Field label="GST Number" value={client.gstNumber} />
        <Field label="PAN Number" value={client.panNumber} />
        <Field label="Business Type" value={client.businessType} />
        <Field label="State" value={client.state} />
        {client.address?.city && <Field label="City" value={`${client.address.city}${client.address.pincode ? ' - ' + client.address.pincode : ''}`} />}
        {client.assignedEmployee && <Field label="Assigned To" value={client.assignedEmployee?.name} />}
      </div>

      {client.notes && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{client.notes}</p>
        </div>
      )}

      {client.tags?.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {client.tags.map((tag) => <span key={tag} className="badge badge-gray">{tag}</span>)}
          </div>
        </div>
      )}
    </div>
  </Modal>
);

export default ClientDetailModal;
