// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import moment from 'moment'
// import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react'

// // Format file size for display
// const formatFileSize = (bytes) => {
//     if (!bytes) return 'N/A';
//     const units = ['B', 'KB', 'MB', 'GB', 'TB'];
//     let size = bytes;
//     let unitIndex = 0;
//     while (size >= 1024 && unitIndex < units.length - 1) {
//         size /= 1024;
//         unitIndex++;
//     }
//     return `${size.toFixed(1)} ${units[unitIndex]}`;
// };

// const DocumentCard = ({ document, onDelete }) => {
//     const navigate = useNavigate();

//     const handleNavigate = () => navigate(`/documents/${document._id}`);

//     const handleDelete = (e) => {
//         e.stopPropagation();
//         onDelete?.(document);
//     };

//     return (
//         <article
//             onClick={handleNavigate}
//             className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
//         >
//             {/* Header */}
//             <div className="flex items-start justify-between gap-3">
//                 <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
//                     <FileText className="h-6 w-6" strokeWidth={2} />
//                 </div>
//                 <button
//                     onClick={handleDelete}
//                     className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
//                     aria-label="Delete document"
//                 >
//                     <Trash2 className="h-4 w-4" strokeWidth={2} />
//                 </button>
//             </div>

//             {/* Title */}
//             <h3 className="mt-3 text-lg font-semibold text-slate-900 truncate">{document.title}</h3>

//             {/* Meta */}
//             <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
//                 <span>{formatFileSize(document.filesize)}</span>
//             </div>

//             {/* Status */}
//             <div className="mt-3 space-y-2 text-sm text-slate-600">
//                 {document.flashcardsCount !== undefined && (
//                     <div className="flex items-center gap-2">
//                         <BookOpen className="h-4 w-4 text-slate-400" />
//                         <span>{document.flashcardsCount} Flashcards</span>
//                     </div>
//                 )}
//                 {document.quizzesCount !== undefined && (
//                     <div className="flex items-center gap-2">
//                         <BrainCircuit className="h-4 w-4 text-slate-400" />
//                         <span>{document.quizzesCount} Quizzes</span>
//                     </div>
//                 )}
//             </div>

//             {/* Footer */}
//             <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
//                 <Clock className="h-4 w-4" />
//                 <span>
//                     Uploaded {document.uploadDate || document.createdAt ? moment(document.uploadDate || document.createdAt).fromNow() : 'N/A'}
//                 </span>
//             </div>
//         </article>
//     )
// }

// export default DocumentCard

// sahil
import React from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react'
import FileTypeIcon, { resolveFileType } from './FileTypeIcon'

// Format file size for display
const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const TYPE_LABELS = { pdf: 'PDF', docx: 'Word', pptx: 'PowerPoint', txt: 'Text' };

const DocumentCard = ({ document, onDelete }) => {
    const navigate = useNavigate();

    const fileType = resolveFileType(document);

    // the backend sends flashcardCount / quizCount (singular)
    const flashcardCount = document.flashcardCount ?? document.flashcardsCount;
    const quizCount = document.quizCount ?? document.quizzesCount;

    const handleNavigate = () => navigate(`/documents/${document._id}`);

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(document);
    };

    return (
        <article
            onClick={handleNavigate}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <FileTypeIcon type={fileType} size="md" />
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                    aria-label="Delete document"
                >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
            </div>

            {/* Title */}
            <h3 className="mt-3 text-lg font-semibold text-slate-900 truncate">{document.title}</h3>

            {/* Meta */}
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-600">{TYPE_LABELS[fileType]}</span>
                <span>·</span>
                <span>{formatFileSize(document.filesize)}</span>

                {document.status === 'processing' && (
                    <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Processing...
                    </span>
                )}
                {document.status === 'failed' && (
                    <span
                        className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                        title={document.error || 'Processing failed'}
                    >
                        Failed
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="mt-3 space-y-2 text-sm text-slate-600">
                {flashcardCount !== undefined && (
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>{flashcardCount} Flashcards</span>
                    </div>
                )}
                {quizCount !== undefined && (
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-slate-400" />
                        <span>{quizCount} Quizzes</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                <span>
                    Uploaded {document.uploadDate || document.createdAt ? moment(document.uploadDate || document.createdAt).fromNow() : 'N/A'}
                </span>
            </div>
        </article>
    )
}

export default DocumentCard