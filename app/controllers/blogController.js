const Blog = require('../models/Blog');
const { deleteOldImage } = require('../middleware/uploadMiddleware');

const blogController = {
  // Create blog
  async createBlog(req, res){
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        req.flash('error', 'Title and content are required');
        return res.redirect('/blogs/create');
      }

      const blogData = {
        title,
        content,
        author: req.session.user.id
      };

      // Add image if uploaded
      if (req.file) {
        blogData.image = `/uploads/blogs/${req.file.filename}`;
      }

      const blog = new Blog(blogData);
      await blog.save();

      await blog.populate('author', 'name profileImage');

      req.flash('success', 'Blog created successfully!');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Create blog error:', error);
      req.flash('error', 'Failed to create blog');
      res.redirect('/blogs/create');
    }
  },

  // Get all blogs
   async getAllBlogs(req, res){
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const blogs = await Blog.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name profileImage');

      const totalBlogs = await Blog.countDocuments({ isDeleted: false });
      const totalPages = Math.ceil(totalBlogs / limit);

      res.json({
        blogs,
        currentPage: page,
        totalPages,
        totalBlogs
      });
    } catch (error) {
      console.error('Get blogs error:', error);
      res.status(500).json({ error: 'Failed to fetch blogs' });
    }
  },

  // Get single blog
  async getBlog(req, res){
    try {
      const blog = await Blog.findOne({ 
        _id: req.params.id, 
        isDeleted: false 
      }).populate('author', 'name profileImage');

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json(blog);
    } catch (error) {
      console.error('Get blog error:', error);
      res.status(500).json({ error: 'Failed to fetch blog' });
    }
  },

  // Update blog
  async updateBlog(req, res){
    try {
      const { title, content } = req.body;
      const blogId = req.params.id;

      if (!title || !content) {
        req.flash('error', 'Title and content are required');
        return res.redirect(`/blogs/edit/${blogId}`);
      }

      const blog = await Blog.findById(blogId);
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/blogs');
      }

      blog.title = title;
      blog.content = content;

      // Handle image update
      if (req.file) {
        // Delete old image if exists
        if (blog.image) {
          deleteOldImage(blog.image);
        }
        blog.image = `/uploads/blogs/${req.file.filename}`;
      }

      await blog.save();
      await blog.populate('author', 'name profileImage');

      req.flash('success', 'Blog updated successfully!');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Update blog error:', error);
      req.flash('error', 'Failed to update blog');
      res.redirect(`/blogs/edit/${req.params.id}`);
    }
  },

  // Delete blog
  async deleteBlog(req, res){
    try {
      const blogId = req.params.id;
      const blog = await Blog.findById(blogId);

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      // Admin hard delete, user soft delete
      if (req.session.user.role === 'admin') {
        // Hard delete - remove image and document
        if (blog.image) {
          deleteOldImage(blog.image);
        }
        await Blog.findByIdAndDelete(blogId);
      } else {
        // Soft delete
        await blog.softDelete();
      }

      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  },

  // Show blog list page
 async showBlogs(req, res){
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const blogs = await Blog.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name profileImage');

      const totalBlogs = await Blog.countDocuments({ isDeleted: false });
      const totalPages = Math.ceil(totalBlogs / limit);

      res.render('blogs/index', {
        blogs,
        currentPage: page,
        totalPages,
        totalBlogs
      });
    } catch (error) {
      console.error('Show blogs error:', error);
      req.flash('error', 'Error loading blogs');
      res.redirect('/');
    }
  },

  // Show create blog form
 async getCreateBlog(req, res){
    res.render('blogs/create');
  },

  // Show edit blog form
  async showEditForm(req, res){
    try {
      const blog = await Blog.findOne({ 
        _id: req.params.id, 
        isDeleted: false 
      }).populate('author', 'name profileImage');

      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/blogs');
      }

      // Check ownership (unless admin)
      if (req.session.user.role !== 'admin' && blog.author._id.toString() !== req.session.user.id) {
        req.flash('error', 'You can only edit your own blogs');
        return res.redirect('/blogs');
      }

      res.render('blogs/edit', { blog });
    } catch (error) {
      console.error('Show edit form error:', error);
      req.flash('error', 'Error loading edit form');
      res.redirect('/blogs');
    }
  },

  // Show single blog page
  async showBlog(req, res){
    try {
      const blog = await Blog.findOne({ 
        _id: req.params.id, 
        isDeleted: false 
      }).populate('author', 'name profileImage');

      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/blogs');
      }

      res.render('blogs/show', { blog });
    } catch (error) {
      console.error('Show blog error:', error);
      req.flash('error', 'Error loading blog');
      res.redirect('/blogs');
    }
  }
};

module.exports = blogController;