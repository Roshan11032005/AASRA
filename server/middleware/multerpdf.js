// middleware/multerConfig.js
const multer = require('multer');

// Use memory storage to get files as buffers
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG files are allowed"));
  }
};

// Exporting multer configuration with memory storage and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // limit file size to 5MB
}).array('prescription', 10);

module.exports = upload;

