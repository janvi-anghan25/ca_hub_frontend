import { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, FileText, Image, File, Search } from 'lucide-react';
import { documentApi } from '../../api/documentApi';
import { clientApi } from '../../api/clientApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['PAN', 'GST', 'Aadhaar', 'Bank', 'Rent Agreement', 'Balance Sheet', 'ITR', 'Invoice', 'Other'];

const FILE_ICON = {
  'application/pdf': <FileText size={20} className="text-red-500" />,
  'image/jpeg': <Image size={20} className="text-forest-500" />,
  'image/png': <Image size={20} className="text-forest-500" />,
};

const DocumentsPage = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', category: 'Other' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!selectedClient) return;
    setLoading(true);
    try {
      const { data } = await documentApi.getDocuments(selectedClient, { q: search || undefined, category: category || undefined });
      setDocuments(data.data);
    } finally {
      setLoading(false);
    }
  }, [selectedClient, search, category]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async () => {
    const nextErrors = {};
    if (!selectedClient) nextErrors.client = 'Select a client first';
    if (!uploadFile) nextErrors.file = 'Please choose a file to upload';
    setUploadErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadData.title || uploadFile.name);
      formData.append('category', uploadData.category);
      await documentApi.uploadDocument(selectedClient, formData);
      toast.success('Document uploaded');
      setShowUpload(false);
      setUploadFile(null);
      setUploadData({ title: '', category: 'Other' });
      setUploadErrors({});
      loadDocuments();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentApi.deleteDocument(deleteId);
      toast.success('Document deleted');
      setDeleteId(null);
      loadDocuments();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        {selectedClient && (
          <button className="btn-primary" onClick={() => setShowUpload(true)}>
            <Upload size={16} /> Upload Document
          </button>
        )}
      </div>

      <div className="card mb-4">
        <div className="filter-bar">
          <select className="input w-full sm:flex-1 min-w-0" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            <option value="">Select a client</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName} {c.firmName ? `(${c.firmName})` : ''}</option>)}
          </select>
          {selectedClient && (
            <>
              <div className="relative flex-1 min-w-0 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input className="input pl-9 w-full" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="input sm:min-w-36" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {!selectedClient ? (
        <div className="card">
          <EmptyState title="Select a client" description="Choose a client to view and manage their documents" />
        </div>
      ) : (
        <div className="card p-0">
          {loading ? <SectionLoader /> : documents.length === 0 ? (
            <EmptyState title="No documents" description="Upload documents for this client" />
          ) : (
            <div className="divide-y divide-forest-100">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-forest-50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                    {FILE_ICON[doc.fileType] || <File size={20} className="text-forest-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-forest truncate">{doc.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="badge badge-blue">{doc.category}</span>
                      <span className="text-xs text-forest-400">{format(new Date(doc.createdAt), 'dd MMM yyyy')}</span>
                      {doc.fileSize && <span className="text-xs text-forest-400 font-mono">{(doc.fileSize / 1024).toFixed(1)} KB</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.fileName}
                      className="p-1.5 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest transition-colors"
                    >
                      <Download size={15} />
                    </a>
                    <button onClick={() => setDeleteId(doc._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); setUploadErrors({}); }}
        title="Upload Document"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setShowUpload(false); setUploadErrors({}); }} disabled={uploading}>Cancel</button>
            <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {uploadErrors.client && <p className="error-text">{uploadErrors.client}</p>}
          <div className="form-group">
            <label className="label">Document Title</label>
            <input
              className="input"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              placeholder="Leave blank to use file name"
            />
          </div>
          <div className="form-group">
            <label className="label">Category</label>
            <select className="input" value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">File *</label>
            <input
              type="file"
              className={`input ${uploadErrors.file ? 'input-error' : ''}`}
              onChange={(e) => {
                setUploadFile(e.target.files[0]);
                setUploadErrors((prev) => ({ ...prev, file: undefined }));
              }}
            />
            {uploadErrors.file && <p className="error-text">{uploadErrors.file}</p>}
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default DocumentsPage;
