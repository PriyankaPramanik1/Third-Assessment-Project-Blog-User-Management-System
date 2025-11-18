const User = require('../models/User');

const authController = {
  // Register new user
  async register(req, res){
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
      }

      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/register');
      }

      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters');
        return res.redirect('/register');
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.flash('error', 'Email already registered');
        return res.redirect('/register');
      }

      // Create user
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      req.flash('success', 'Registration successful! Please login');
      res.redirect('/login');
    } catch (error) {
      console.error('Registration error:', error);
      req.flash('error', 'Registration failed');
      res.redirect('/register');
    }
  },

  // Login user
  async login(req, res){
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'Email and password are required');
        return res.redirect('/login');
      }

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      if (!user.isActive) {
        req.flash('error', 'Account is deactivated');
        return res.redirect('/login');
      }

      // Set session
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      };

      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Login failed');
      res.redirect('/login');
    }
  },

  // Logout user
  async logout(req, res){
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/login');
    });
  },

  // Show registration form
  async showRegister(req, res){
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/register');
  },

  // Show login form
  async showLogin(req, res){
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login');
  },

  // Show dashboard
  async showDashboard(req, res){
    try {
      const Blog = require('../models/Blog');
      const userBlogs = await Blog.find({ 
        author: req.session.user.id,
        isDeleted: false 
      }).sort({ createdAt: -1 }).populate('author', 'name');

      res.render('dashboard', { blogs: userBlogs });
    } catch (error) {
      console.error('Dashboard error:', error);
      req.flash('error', 'Error loading dashboard');
      res.redirect('/blogs');
    }
  }
};

module.exports = authController;