import { useRef, useState } from 'react';
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ['.xlsx', '.xls', '.csv'];

const escapeCsv = (value) => {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Generic spreadsheet import modal.
 *
 * @param {string} title - modal title
 * @param {Array<{key:string,label:string,required?:boolean,example?:string}>} columns
 * @param {string} templateName - downloaded template filename (without extension)
 * @param {(formData: FormData) => Promise<{data:{data:object}}>} onImport
 * @param {() => void} [onImported] - called after a successful import (for refresh)
 * @param {() => void} onClose
 */
const ImportModal = ({ title, columns, templateName, onImport, onImported, onClose }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    const header = columns.map((c) => c.key).join(',');
    const sample = columns.map((c) => escapeCsv(c.example ?? '')).join(',');
    const csv = `${header}\n${sample}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelect = (selected) => {
    if (!selected) return;
    const ext = selected.name.slice(selected.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return toast.error('Only .xlsx, .xls or .csv files are allowed');
    }
    if (selected.size > MAX_BYTES) {
      return toast.error('File must be 5 MB or smaller');
    }
    setResult(null);
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return toast.error('Choose a file first');
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await onImport(formData);
      const summary = data.data;
      if (summary.imported > 0) {
        toast.success(`Imported ${summary.imported} record${summary.imported === 1 ? '' : 's'}`);
        onImported?.();
        // Clean import (nothing skipped) — close right away; otherwise keep the
        // modal open so the user can review the per-row error report.
        if (!summary.errors?.length) {
          onClose();
          return;
        }
        setResult(summary);
      } else {
        setResult(summary);
        toast.error('No records were imported — check the errors below');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={importing}>Close</button>
          <button className="btn-primary" onClick={handleImport} disabled={!file || importing}>
            {importing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {importing ? 'Importing…' : 'Import'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-forest-50">
          <div className="text-sm text-forest-500">
            <p className="font-medium text-forest">How it works</p>
            <p className="mt-0.5">Upload an Excel/CSV file. If a client doesn't exist yet, it will be created automatically, then the return is added. Invalid rows are skipped and reported.</p>
          </div>
          <button className="btn-secondary whitespace-nowrap" onClick={handleDownloadTemplate}>
            <Download size={15} /> Template
          </button>
        </div>

        {/* Dropzone / picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleSelect(e.dataTransfer.files?.[0]); }}
          className="border-2 border-dashed border-forest-200 rounded-xl p-6 text-center cursor-pointer hover:border-forest-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { handleSelect(e.target.files?.[0]); e.target.value = ''; }}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-forest">
              <FileSpreadsheet size={18} />
              <span className="text-sm font-medium">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                className="p-1 rounded-md text-forest-400 hover:bg-forest-100"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud size={26} className="mx-auto text-forest-300" />
              <p className="mt-2 text-sm text-forest-500">Click to choose or drag a file here</p>
              <p className="text-xs text-forest-400">.xlsx, .xls or .csv · up to 5 MB</p>
            </>
          )}
        </div>

        {/* Expected columns */}
        <div>
          <p className="text-xs font-medium text-forest-400 mb-1.5">Expected columns</p>
          <div className="flex flex-wrap gap-1.5">
            {columns.map((c) => (
              <span key={c.key} className={`badge ${c.required ? 'badge-blue' : 'badge-gray'}`}>
                {c.key}{c.required ? ' *' : ''}
              </span>
            ))}
          </div>
          <p className="text-xs text-forest-400 mt-1.5">* required</p>
        </div>

        {/* Result summary */}
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-green-50 text-center">
                <p className="text-xl font-bold text-green-600">{result.imported}</p>
                <p className="text-xs text-green-700">Imported</p>
              </div>
              <div className="p-3 rounded-lg bg-forest-50 text-center">
                <p className="text-xl font-bold text-forest">{result.clientsCreated}</p>
                <p className="text-xs text-forest-500">Clients created</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-center">
                <p className="text-xl font-bold text-red-600">{result.skipped}</p>
                <p className="text-xs text-red-700">Skipped</p>
              </div>
            </div>

            {result.imported > 0 && result.errors?.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={16} /> All {result.totalRows} rows imported successfully.
              </div>
            )}

            {result.errors?.length > 0 && (
              <div className="border border-red-100 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-sm font-medium text-red-700">
                  <AlertTriangle size={15} /> {result.errors.length} row{result.errors.length === 1 ? '' : 's'} skipped
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-red-50">
                  {result.errors.map((err) => (
                    <div key={err.row} className="flex gap-3 px-3 py-1.5 text-xs">
                      <span className="font-mono text-forest-400 shrink-0">Row {err.row}</span>
                      <span className="text-forest-600">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;
