import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { clientApi } from '../../api/clientApi';
import toast from 'react-hot-toast';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Field = ({ label, value, mono }) => value ? (
  <div>
    <p className="text-xs text-forest-400 mb-0.5">{label}</p>
    <p className={`text-sm font-medium text-forest ${mono ? 'font-mono' : ''}`}>{value}</p>
  </div>
) : null;

const ClientDetailModal = ({ client: initialClient, onClose, onUpdated }) => {
  const [client, setClient] = useState(initialClient);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return toast.error('Only JPG, PNG or WebP images are allowed');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return toast.error('Image must be 5 MB or smaller');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await clientApi.uploadPhoto(client._id, formData);
      setClient((prev) => ({ ...prev, photo: data.data?.photo }));
      toast.success('Photo updated');
      onUpdated?.();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Client Details" size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-forest-50 rounded-xl">
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-forest flex items-center justify-center text-parchment text-2xl font-bold font-display overflow-hidden">
              {client.photo ? (
                <img src={client.photo} alt={client.clientName} className="w-full h-full object-cover" />
              ) : (
                client.clientName?.[0]?.toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={handlePickPhoto}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white border border-forest-200 text-forest-500 hover:text-forest hover:border-forest-400 shadow-sm transition-colors disabled:opacity-60"
              title={client.photo ? 'Change photo' : 'Upload photo'}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
};

export default ClientDetailModal;
