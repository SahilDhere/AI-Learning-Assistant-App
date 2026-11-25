import React, { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'

import documentService from '../../services/documentService'
import Spinner from '../../Components/common/Spinner'
import Button from '../../Components/common/Button'
import DocumentCard from '../../Components/documents/DocumentCard'

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt', 'md'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, same as the backend limit
const MAX_FILES = 10;

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  // state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async (silent = false) => {
    try {
      const data = await documentService.getDocuments()
      setDocuments(data?.data || data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      if (!silent) toast.error(error.message || "Failed to load documents")
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // while any document is still processing, refresh the list every 3 seconds
  useEffect(() => {
    const hasProcessing =
      Array.isArray(documents) && documents.some((d) => d.status === 'processing');
    if (!hasProcessing) return;

    const timer = setInterval(() => fetchDocuments(true), 3000);
    return () => clearInterval(timer);
  }, [documents]);

  // validate and store the chosen files
  const selectFiles = (fileList) => {
    const picked = Array.from(fileList || []);
    if (!picked.length) return;

    const valid = [];
    for (const file of picked) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: larger than 10 MB`);
        continue;
      }
      valid.push(file);
    }

    if (!valid.length) return;

    if (valid.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} files at once`);
    }

    const limited = valid.slice(0, MAX_FILES);
    setUploadFiles(limited);
    // the title field is only used for a single file
    setUploadTitle(limited.length === 1 ? limited[0].name.replace(/\.[^/.]+$/, '') : '');
  };

  const handleFileChange = (e) => {
    selectFiles(e.target.files);
    e.target.value = ''; // lets the user pick the same file again
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    selectFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFiles([]);
    setUploadTitle('');
    setDragActive(false);
  };

  const singleFile = uploadFiles.length === 1;
  const canSubmit =
    uploadFiles.length > 0 && (!singleFile || uploadTitle.trim().length > 0);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFiles.length) {
      toast.error("Please choose at least one file");
      return;
    }
    if (singleFile && !uploadTitle.trim()) {
      toast.error("Please provide a title");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append("files", file)); // field name must be "files"
    if (singleFile) formData.append("title", uploadTitle.trim());

    try {
      await documentService.uploadDocument(formData);
      toast.success(
        uploadFiles.length > 1
          ? `${uploadFiles.length} documents uploaded`
          : "Document uploaded successfully"
      );
      closeUploadModal();
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  }

  const handleComfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`Document "${selectedDoc.title}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((doc) => doc._id !== selectedDoc._id));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(error.message || "Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )
    }

    const docs = Array.isArray(documents) ? documents : [];

    if (docs.length === 0) {
      return (
        <div className='flex items-center justify-center py-16'>
          <div className='text-center max-w-md space-y-3'>
            <div className='mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center'>
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className='text-lg font-semibold text-slate-900'>No documents yet</h3>
            <p className='text-sm text-slate-600'>Upload your first document to start generating flashcards and quizzes.</p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /><span>Upload Document</span>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900'>My documents</h1>
          <p className='text-sm text-slate-600'>Manage and organize your learning materials.</p>
        </div>
        {Array.isArray(documents) && documents.length > 0 && (
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        )}
      </div>

      {renderContent()}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 relative">
            <button
              type="button"
              onClick={closeUploadModal}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close upload modal"
            >
              <X strokeWidth={2} className="h-5 w-5" />
            </button>

            <div className="space-y-1 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Upload New Documents</h2>
              <p className="text-sm text-slate-600">
                Add PDF, Word, PowerPoint or text files (up to {MAX_FILES} files, 10 MB each).
              </p>
            </div>

            <form onSubmit={handleUpload} className='space-y-5'>
              {/* title is only needed when uploading a single file */}
              {singleFile && (
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-slate-800'>Document Title</label>
                  <input
                    type="text"
                    className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'
                    placeholder='Enter document title'
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-slate-800'>Upload files</label>
                <div
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragActive ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Upload className="h-6 w-6 text-emerald-500" />
                    <p className="text-sm">Drag & drop your files here, or</p>
                    <label className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Browse files</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.pptx,.txt,.md"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadFiles.length > 0 && (
                      <ul className="mt-2 w-full max-h-32 overflow-y-auto text-left text-xs text-slate-600 space-y-1">
                        {uploadFiles.map((f) => (
                          <li key={f.name + f.size} className="flex justify-between gap-2">
                            <span className="truncate">{f.name}</span>
                            <span className="shrink-0 text-slate-400">
                              {(f.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button type="button" variant="outline" onClick={closeUploadModal} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !canSubmit}>
                  {uploading
                    ? 'Uploading...'
                    : uploadFiles.length > 1
                      ? `Upload ${uploadFiles.length} files`
                      : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 relative">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close delete modal"
            >
              <X strokeWidth={2} className="h-5 w-5" />
            </button>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-semibold text-slate-900">Delete document</h2>
              </div>
              <p className="text-sm text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">"{selectedDoc?.title}"</span>? This action cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
              <Button onClick={handleComfirmDelete} disabled={deleting} className="bg-red-500 hover:bg-red-400 focus:ring-red-500/50">
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentListPage