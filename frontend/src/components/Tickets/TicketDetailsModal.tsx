/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertTriangle, Clock, CheckCircle, Bot, MessageSquare, Star, StarHalf, ChevronRight, FileText } from 'lucide-react';
import { Ticket, AuditLog } from '../../types';
import { CATEGORIES } from '../../types/category';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdate: () => void;
}

export function TicketDetailsModal({ ticket, onClose, onTicketUpdate }: TicketDetailsModalProps) {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticket._id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTicketDetails(ticket._id);
      setAuditLogs(response.auditLogs);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (status: string) => {
    try {
      setUpdating(true);
      const updates: any = { status };
      if (resolution && status === 'closed') {
        updates.resolution = resolution;
      }

      await apiService.updateTicket(ticket._id, updates);
      onTicketUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-gray-800';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'closed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ticket_created':
        return <Tag className="w-4 h-4" />;
      case 'ai_analysis':
        return <Bot className="w-4 h-4" />;
      case 'agent_assigned':
        return <User className="w-4 h-4" />;
      case 'status_updated':
        return <AlertTriangle className="w-4 h-4" />;
      case 'response_added':
        return <MessageSquare className="w-4 h-4" />;
      case 'ticket_closed':
        return <CheckCircle className="w-4 h-4" />;
      case 'ticket_reopened':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatAIResponse = (response: string) => {
    const cleanResponse = response.replace(/\*\*/g, '');
    
    const lines = cleanResponse
      .split(/(?:\d+\.|\n-|\n\s*\*|\n\s*•)/)
      .filter(line => line.trim().length > 0)
      .map((line, index) => `${index + 1}. ${line.trim()}`);
    
    return lines.join('\n');
  };

  const formatAuditLogDetails = (log: AuditLog) => {
    if (log.details.includes('{') && log.details.includes('}')) {
      try {
        const jsonStart = log.details.indexOf('{');
        const jsonEnd = log.details.lastIndexOf('}') + 1;
        const jsonString = log.details.substring(jsonStart, jsonEnd);
        const parsedData = JSON.parse(jsonString);

        if (log.action === 'ai_analysis' && parsedData.response) {
          return formatAIResponse(parsedData.response);
        }

        if (log.action === 'status_updated' || log.action === 'ticket_updated') {
          const lines: string[] = [];
          
              if (parsedData.resolution) {
  const points = parsedData.resolution
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) =>
      line.replace(/^\s*(?:\d+\.\s*|\(\d+\)\s*|[a-z]\)\s*|[-*•]\s*)/, '').trim()
    );

  let closingWish = "";

  // detect last line if it's a closing wish (like Thank you, Regards, etc.)
  const lastLine = points[points.length - 1];
  if (/^(thank\s*you\.?|best\s*regards\.?|regards\.?|warm\s*wishes\.?)$/i.test(lastLine)) {
    closingWish = points.pop(); // remove from points so it won't be numbered
  }

  points.forEach((line: any, idx: number) => {
    lines.push(`${idx + 1}. ${line}`);
  });

  if (closingWish) {
    lines.push(`\n🌸 ${closingWish}`);
  }
}


          if (parsedData.status) {
            lines.push(`Status: ${parsedData.status}`);
          }

          if (parsedData.resolvedBy) {
            lines.push(`Resolved by: ${parsedData.resolvedBy}`);
          }

          return lines.join('\n');
        }

        if (log.action === 'response_added' && parsedData.response) {
          return formatAIResponse(parsedData.response);
        }

        return Object.entries(parsedData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } catch (error) {
        return log.details;
      }
    }
    return log.details;
  };

  const renderStarRating = (confidence: number) => {
    const maxStars = 5;
    const starPercentage = confidence * 100;
    const starPercentageRounded = Math.round(starPercentage / 10) * 10;
    const fullStars = Math.floor(starPercentageRounded / 20);
    const hasHalfStar = starPercentageRounded % 20 >= 10;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
        <span className="ml-1 text-xs text-gray-500">({Math.round(confidence * 100)}%)</span>
      </div>
    );
  };

  const canUpdateTicket = user?.role === 'agent' || user?.role === 'admin';
  const showAgentActions = canUpdateTicket && ticket.status !== 'closed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ticket Details
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Title and Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('-', ' ')}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} priority
              </span>
            </div>
          </div>

          <div className={`grid gap-6 ${showAgentActions ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {/* Main Content */}
            <div className={`space-y-6 ${showAgentActions ? 'lg:col-span-2' : ''}`}>
              {/* Basic Information Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 shadow-sm">
                <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Ticket Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Category</p>
                    <p className="text-sm font-medium text-gray-800">{getCategoryName(ticket.category)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Created</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  {ticket.user && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Submitted By</p>
                        <p className="text-sm font-medium text-gray-800">{ticket.user.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm font-medium text-gray-800">{ticket.user.email}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>

              {/* Resolution Section - Only for agents/admins when ticket is not closed */}
              {showAgentActions && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 shadow-sm">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Resolution Notes
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">Add detailed resolution notes before closing the ticket</p>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-y"
                    placeholder="Enter detailed resolution notes. This will be visible to the user and included in the audit log..."
                  />
                  <div className="flex justify-end ">
                    <button
                      onClick={() => setResolution('')}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 mr-2"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Audit Trail Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Ticket History
                </h4>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No history available for this ticket</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log._id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full text-blue-600">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {log.performedByType === 'AI' 
                                ? 'AI Assistant' 
                                : log.performedBy?.name || 'System'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(log.createdAt)}
                            </p>
                          </div>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                            {formatAuditLogDetails(log)}
                          </pre>
                          {log.confidence !== undefined && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded inline-flex items-center">
                                Confidence: {renderStarRating(log.confidence)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Agent Actions */}
            {showAgentActions && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Ticket Actions
                  </h4>
                  
                  <div className="flex flex-col gap-3">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => handleUpdateTicket('in-progress')}
                        disabled={updating}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-all hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        {updating ? 'Updating...' : 'Start Working'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (!resolution) {
                          // Scroll to resolution section
                          setTimeout(() => {
                            const resolutionSection = document.querySelector('[data-resolution-section]');
                            if (resolutionSection) {
                              resolutionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        } else {
                          handleUpdateTicket('closed');
                        }
                      }}
                      disabled={updating}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-all hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {updating ? 'Closing...' : resolution ? 'Close Ticket' : 'Add Resolution to Close'}
                    </button>
                  </div>

                  {!resolution && (
                    <p className="text-xs text-orange-600 mt-3 text-center">
                      Resolution notes are required to close this ticket
                    </p>
                  )}
                </div>

                {/* Ticket Metadata */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Metadata
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Ticket ID:</p>
                      <p className="font-medium text-xs text-gray-800 break-all">{ticket._id}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium text-gray-800">{formatDate(ticket.updatedAt)}</span>
                    </div>
                    {ticket.closedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Closed At:</span>
                        <span className="font-medium text-gray-800">{formatDate(ticket.closedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Activity
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">History Entries:</span>
                      <span className="font-medium text-gray-800">{auditLogs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status Changes:</span>
                      <span className="font-medium text-gray-800">
                        {auditLogs.filter(log => log.action.includes('status')).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">AI Analysis:</span>
                      <span className="font-medium text-gray-800">
                        {auditLogs.filter(log => log.action.includes('ai_analysis')).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
