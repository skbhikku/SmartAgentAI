import express from 'express';
import Ticket from '../models/Ticket.js';
import AuditLog from '../models/AuditLog.js';
import aiService from '../services/aiService.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// -----------------------
// Create Ticket
// -----------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category || !priority) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ticket = new Ticket({
      userId: req.user._id,
      title,
      description,
      category,
      priority
    });

    await ticket.save();

    // Log ticket creation
    await AuditLog.create({
      ticketId: ticket._id,
      action: 'ticket_created',
      performedBy: req.user._id,
      performedByType: 'agent',
      details: `Ticket created: ${title || 'No title'}`
    });

    // Trigger AI analysis
    try {
      const aiAnalysis = await aiService.analyzeTicket(ticket);

      // Ensure details is always a string
      const aiDetails = aiAnalysis.response || 'AI analysis response unavailable';

      // Log AI analysis
      await AuditLog.create({
        ticketId: ticket._id,
        action: 'ai_analysis',
        performedByType: 'AI',
        details: aiDetails,
        confidence: aiAnalysis.confidence || 0,
        metadata: {
          reasoning: aiAnalysis.reasoning || '',
          suggestedActions: aiAnalysis.suggestedActions || []
        }
      });

      // Auto-resolve if confidence >= 0.8
      if (aiAnalysis.confidence >= 0.8) {
        ticket.status = 'closed';
        ticket.resolution = aiDetails;
        ticket.resolvedBy = 'AI';
        ticket.resolvedAt = new Date();
        ticket.aiConfidence = aiAnalysis.confidence;
        await ticket.save();

        // Log auto-resolution
        await AuditLog.create({
          ticketId: ticket._id,
          action: 'ticket_closed',
          performedByType: 'AI',
          details: `Ticket auto-resolved by AI with ${Math.round(aiAnalysis.confidence * 100)}% confidence`,
          confidence: aiAnalysis.confidence
        });
      } else {
        ticket.status = 'in-progress';
        ticket.aiConfidence = aiAnalysis.confidence || 0;
        await ticket.save();
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      ticket.status = 'in-progress';
      await ticket.save();
    }

    await ticket.populate('userId', 'name email');
    res.status(201).json({ message: 'Ticket created successfully', ticket });

  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ message: 'Server error during ticket creation' });
  }
});

// -----------------------
// Get user's tickets
// -----------------------
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Ticket.countDocuments({ userId: req.user._id });

    res.json({
      tickets,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
});

// -----------------------
// Get tickets for agents/admins
// -----------------------
router.get('/', auth, authorize('agent', 'admin'), async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
});

// -----------------------
// Update ticket (agent/admin only)
// -----------------------
router.put('/:id', auth, authorize('agent', 'admin'), async (req, res) => {
  try {
    const { status, resolution, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const updates = {};
    if (status) updates.status = status;
    if (resolution) updates.resolution = resolution;
    if (assignedTo) updates.assignedTo = assignedTo;

    if (status === 'closed' && !ticket.resolvedAt) {
      updates.resolvedAt = new Date();
      updates.resolvedBy = 'agent';
    }

    Object.assign(ticket, updates);
    await ticket.save();

    await AuditLog.create({
      ticketId: ticket._id,
      action: 'status_updated',
      performedBy: req.user._id,
      performedByType: req.user.role,
      details: `Ticket updated: ${JSON.stringify(updates)}`
    });

    await ticket.populate('userId', 'name email');
    res.json({ message: 'Ticket updated successfully', ticket });

  } catch (error) {
    console.error('Ticket update error:', error);
    res.status(500).json({ message: 'Server error updating ticket' });
  }
});

// -----------------------
// Get ticket details with audit logs
// -----------------------
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // User access check
    if (req.user.role === 'user' && ticket.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const auditLogs = await AuditLog.find({ ticketId: ticket._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ticket, auditLogs });

  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ message: 'Server error fetching ticket details' });
  }
});

export default router;
