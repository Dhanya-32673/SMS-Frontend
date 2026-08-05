import React, { useState, useEffect } from 'react';
import CertificateStatusBadge from './CertificateStatusBadge';
import { X, Download, FileText, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import api from '../../services/api';

export const CertificatePreviewModal = ({ doc, onClose }) => {
  if (!doc) return null;

  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let active = true;
    let currentBlobUrl = null;

    setLoading(true);
    setError(null);
    setBlobUrl(null);

    api.get(`/documents/${doc.id}/file`, { responseType: 'blob' })
      .then((response) => {
        if (!active) return;

        const serverContentType = response.headers['content-type'] || response.headers['Content-Type'];
        const filename = doc.originalFileName?.toLowerCase() || '';
        const mimeType = (serverContentType || doc.mimeType || '').toLowerCase();

        const pdfDetected = mimeType.includes('pdf') || filename.endsWith('.pdf');
        const imgDetected = mimeType.includes('image') || filename.match(/\.(png|jpg|jpeg|gif|webp)$/);

        setIsPdf(pdfDetected);
        setIsImage(imgDetected && !pdfDetected);

        const rawBlob = response.data;
        const typedBlob = new Blob([rawBlob], {
          type: serverContentType || (pdfDetected ? 'application/pdf' : 'image/png'),
        });

        currentBlobUrl = URL.createObjectURL(typedBlob);
        setBlobUrl(currentBlobUrl);
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 404) {
          setError('Document file was not found in storage. Please upload the document again.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Unauthorized access to this document.');
        } else {
          setError('Could not load document preview. ' + (err.message || ''));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [doc.id]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.originalFileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'} bg-slate-900/80 backdrop-blur-sm transition-all duration-200`}>
      <div
        className={`bg-white w-full border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none max-w-none h-screen max-h-none'
            : 'max-w-5xl rounded-3xl shadow-2xl max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {doc.documentTypeName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Student ID: {doc.studentId} | {doc.originalFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CertificateStatusBadge status={doc.status} />

            {/* Optional Full Screen Toggle Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition flex items-center justify-center"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close Preview"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm">Loading document...</p>
            </div>
          ) : error ? (
            <div className="text-center text-slate-500 space-y-2 p-8 max-w-md">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Preview Unavailable</p>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            </div>
          ) : blobUrl && isPdf ? (
            <iframe
              src={blobUrl}
              title={doc.documentTypeName}
              className="w-full rounded-xl border border-slate-300 bg-white"
              style={{ height: isFullscreen ? 'calc(100vh - 145px)' : '62vh' }}
            />
          ) : blobUrl && isImage ? (
            <img
              src={blobUrl}
              alt={doc.documentTypeName}
              className={`max-w-full object-contain rounded-xl shadow-lg border border-slate-200 ${isFullscreen ? 'max-h-[calc(100vh-145px)]' : 'max-h-[62vh]'}`}
            />
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title={doc.documentTypeName}
              className="w-full rounded-xl border border-slate-300 bg-white"
              style={{ height: isFullscreen ? 'calc(100vh - 145px)' : '62vh' }}
            />
          ) : (
            <div className="text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm">Preview not available for this document type</p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-500">
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold">Uploaded By</span>
              <span className="font-semibold text-slate-800">{doc.uploadedBy || 'Admin'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold">Upload Date</span>
              <span className="font-semibold text-slate-800">
                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold">File Size</span>
              <span className="font-semibold text-slate-800">
                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '-'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-semibold">Verification</span>
              <span className="font-semibold text-slate-800">
                {doc.verifiedBy ? `Verified by ${doc.verifiedBy}` : 'Unverified'}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!blobUrl}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreviewModal;
