const User = require('../models/User');

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please login to access this page');
    return res.redirect('/login');
  }
  next();
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session.user) {
      req.flash('error', 'Please login to access this page');
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user.id);
    if (!user || user.role !== 'admin') {
      req.flash('error', 'Admin access required');
      return res.redirect('/dashboard');
    }

    next();
  } catch (error) {
    req.flash('error', 'Authentication error');
    res.redirect('/login');
  }
};

const checkOwnership = async (req, res, next) => {
  try {
    const Blog = require('../models/Blog');
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/blogs');
    }

    if (req.session.user.role !== 'admin' && blog.author.toString() !== req.session.user.id) {
      req.flash('error', 'You can only edit/delete your own blogs');
      return res.redirect('/blogs');
    }

    next();
  } catch (error) {
    req.flash('error', 'Error verifying ownership');
    res.redirect('/blogs');
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  checkOwnership
};