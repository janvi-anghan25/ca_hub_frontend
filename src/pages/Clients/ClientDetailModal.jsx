import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Phone, Mail, MapPin, CreditCard, Building } from 'lucide-react';

const Field = ({ label, value, mono }) => value ? (
  <div>
    <p className="text-xs text-forest-400 mb-0.5">{label}</p>
    <p className={`text-sm font-medium text-forest ${mono ? 'font-mono' : ''}`}>{value}</p>
  </div>
) : null;

const ClientDetailModal = ({ client, onClose }) => (
  <Modal isOpen onClose={onClose} title="Client Details" size="lg">
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-forest-50 rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-forest flex items-center justify-center text-parchment text-2xl font-bold font-display">
          {client.clientName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-forest">{client.clientName}</h2>
          {client.firmName && <p className="text-sm text-forest-400">{client.firmName}</p>}
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={client.status} />
            {client.category?.map((c) => <span key={c} className="badge badge-blue">{c}</span>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mobile" value={client.mobile} />
        <Field label="Email" value={client.email} />
        <Field label="GST Number" value={client.gstNumber} mono />
        <Field label="PAN Number" value={client.panNumber} mono />
        <Field label="Business Type" value={client.businessType} />
        <Field label="State" value={client.state} />
        {client.address?.city && <Field label="City" value={`${client.address.city}${client.address.pincode ? ' - ' + client.address.pincode : ''}`} />}
        {client.assignedEmployee && <Field label="Assigned To" value={client.assignedEmployee?.name} />}
      </div>

      {client.notes && (
        <div className="p-3 bg-forest-50 rounded-lg">
          <p className="text-xs text-forest-400 mb-1">Notes</p>
          <p className="text-sm text-forest-500">{client.notes}</p>
        </div>
      )}

      {client.tags?.length > 0 && (
        <div>
          <p className="text-xs text-forest-400 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {client.tags.map((tag) => <span key={tag} className="badge badge-gray">{tag}</span>)}
          </div>
        </div>
      )}
    </div>
  </Modal>
);

export default ClientDetailModal;
