/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Clock, CheckCircle,  Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIES } from '../../types/category';
import { CreateTicketModal } from '../Tickets/CreateTicketModal';
import { TicketList } from '../Tickets/TicketList';
import apiService from '../../services/api';

export function UserDashboard() {
  const { user } = useAuth();
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyTickets();
      setTickets(response.tickets);
      
      // Calculate stats
      const newStats = response.tickets.reduce(
        (acc: { [x: string]: any; total: number; }, ticket: { status: string | number; }) => {
          acc.total += 1;
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        },
        { total: 0, open: 0, 'in-progress': 0, closed: 0 }
      );
      
      setStats({
        total: newStats.total,
        open: newStats.open || 0,
        inProgress: newStats['in-progress'] || 0,
        closed: newStats.closed || 0,
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    setShowCreateTicket(false);
    fetchTickets();
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: Ticket,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Open Tickets',
      value: stats.open,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Activity,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Resolved',
      value: stats.closed,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 mb-6">
              Manage your support tickets and track their progress in real-time.
            </p>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Ticket</span>
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Ticket className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor} opacity-80`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tickets</h2>
        </div>
        <TicketList tickets={tickets} loading={loading} onTicketUpdate={fetchTickets} />
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <CreateTicketModal
          onClose={() => setShowCreateTicket(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
}