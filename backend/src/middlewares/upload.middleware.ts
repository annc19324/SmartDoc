import multer from 'multer';

// Use memory storage for direct streaming to Cloudinary or memory text extraction
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const uploadDocumentMiddleware = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|txt|md|png|jpe?g|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng tệp không được hỗ trợ. Hệ thống chỉ hỗ trợ tài liệu học tập: PDF, Word (DOC, DOCX), TXT, MD và Ảnh.'));
    }
  },
});
