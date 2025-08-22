import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs for a ticket
router.get('/ticket/:ticketId', auth, async (req, res) => {
  try {
    const auditLogs = await AuditLog.find({ ticketId: req.params.ticketId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ auditLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      message: 'Server error fetching audit logs'
    });
  }
});

// Get all audit logs (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, action, performedByType } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (action && action !== 'all') query.action = action;
    if (performedByType && performedByType !== 'all') query.performedByType = performedByType;

    const auditLogs = await AuditLog.find(query)
      .populate('ticketId', 'title category priority status')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      auditLogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      message: 'Server error fetching audit logs'
    });
  }
});

export default router;
