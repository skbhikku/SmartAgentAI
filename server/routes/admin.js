import express from 'express';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error fetching users'
    });
  }
});

// Update user role or status (admin only)
router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account'
      });
    }

    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error updating user'
    });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      closedTickets,
      totalUsers,
      activeUsers,
      totalAgents,
      urgentTickets
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in-progress' }),
      Ticket.countDocuments({ status: 'closed' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: { $in: ['agent'] } }),
      Ticket.countDocuments({ priority: 'urgent', status: { $ne: 'closed' } })
    ]);

    // Get tickets by category
    const ticketsByCategory = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent tickets
    const recentTickets = await Ticket.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        tickets: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          closed: closedTickets,
          urgent: urgentTickets
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          agents: totalAgents
        },
        byCategory: ticketsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: ticketsByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      recentTickets
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error fetching statistics'
    });
  }
});

// Create a new agent (admin only)
router.post('/users/agent', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const agent = new User({
      name,
      email,
      password,
      role: 'agent',   // 👈 Force role = agent
      isActive: true,
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error creating agent' });
  }
});


export default router;
