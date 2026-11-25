import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/documents';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
});

// check the extension, because browsers report Word/PowerPoint MIME types inconsistently
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (['pdf', 'docx', 'pptx', 'txt', 'md'].includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOCX, PPTX, TXT and MD files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB per file
});

export default upload;