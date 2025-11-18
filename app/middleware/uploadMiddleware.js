const multer = require('../config/multer');
const fs = require('fs');
const path = require('path');

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('error', 'File too large. Maximum size is 5MB');
    } else {
      req.flash('error', 'File upload error');
    }
  } else if (err) {
    req.flash('error', err.message);
  }
  next();
};

const deleteOldImage = (filePath) => {
  if (filePath && fs.existsSync(path.join(__dirname, '../public', filePath))) {
    fs.unlinkSync(path.join(__dirname, '../public', filePath));
  }
};

module.exports = {
  uploadProfile: multer.single('profileImage'),
  uploadBlog: multer.single('blogImage'),
  handleUploadError,
  deleteOldImage
};