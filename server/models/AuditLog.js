import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ticket_created',
        'ai_analysis',
        'agent_assigned',
        'status_updated',
        'response_added',
        'ticket_closed',
        'ticket_reopened'
      ]
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByType: {
      type: String,
      required: true,
      enum: ['AI', 'agent', 'admin', 'system']
    },
    details: {
      type: String,
      required: true,
      maxlength: [2000, 'Details cannot exceed 2000 characters']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes
auditLogSchema.index({ ticketId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
