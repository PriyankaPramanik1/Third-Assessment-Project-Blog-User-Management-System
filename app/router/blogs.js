const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireAuth, checkOwnership } = require('../middleware/authMiddleware');
const { uploadBlog, handleUploadError } = require('../middleware/uploadMiddleware');

// API Routes
router.post('/api/blogs', requireAuth, uploadBlog, handleUploadError, blogController.createBlog);
router.get('/api/blogs', blogController.getAllBlogs);
router.get('/api/blogs/:id', blogController.getBlog);
router.put('/api/blogs/:id', requireAuth, checkOwnership, uploadBlog, handleUploadError, blogController.updateBlog);
router.delete('/api/blogs/:id', requireAuth, checkOwnership, blogController.deleteBlog);

// EJS Routes
router.get('/blogs', blogController.showBlogs);
router.get('/blogs/create', requireAuth, blogController.getCreateBlog);
router.get('/blogs/edit/:id', requireAuth, checkOwnership, blogController.showEditForm);
router.get('/blogs/:id', blogController.showBlog);

module.exports = router;