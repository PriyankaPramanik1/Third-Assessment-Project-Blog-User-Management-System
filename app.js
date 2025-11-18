require('dotenv').config();
const connectDB=require('./app/config/database')
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');



const app=express()
connectDB()

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Flash middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.use('/api/auth', require('./app/router/auth'));
app.use('/api/users', require('./app/router/users'));
app.use('/api/blogs', require('./app/router/blogs'));

// EJS Routes
app.use('/', require('./app/router/auth')); // For login/register pages
app.use( require('./app/router/blogs')); // For blog pages
app.use( require('./app/router/users')); // For user management page

// Home route
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});