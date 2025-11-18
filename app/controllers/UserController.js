const User = require('../models/User');
const { deleteOldImage } = require('../middleware/uploadMiddleware');

const userController = {
  // Get all users (Admin only)
  async getAllUsers(req, res){
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Delete user (Admin only)
  async deleteUser(req, res){
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.session.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete profile image if exists
      if (user.profileImage) {
        deleteOldImage(user.profileImage);
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  // Show user management page (Admin only)
  async showUserManagement(req, res){
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.render('users/index', { users });
    } catch (error) {
      console.error('User management error:', error);
      req.flash('error', 'Error loading user management');
      res.redirect('/dashboard');
    }
  }
};

module.exports = userController;