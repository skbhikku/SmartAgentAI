import React, { useState, useEffect } from 'react';
import {  Ticket, Bot, Clock, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';

export function AnalyticsPage() {
  const [stats, setStats] = useState({
    tickets: { total: 0, open: 0, inProgress: 0, closed: 0, urgent: 0 },
    users: { total: 0, active: 0, agents: 0 },
    byCategory: {},
    byPriority: {},
    aiPerformance: { totalAnalyzed: 0, autoResolved: 0, avgConfidence: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminStats();
      setStats({
        ...response.stats,
        aiPerformance: {
          totalAnalyzed: response.stats.tickets.total,
          autoResolved: Math.floor(response.stats.tickets.closed * 0.6), // Mock AI resolution rate
          avgConfidence: 0.78, // Mock average confidence
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolutionRate = stats.tickets.total > 0 
    ? ((stats.tickets.closed / stats.tickets.total) * 100).toFixed(1)
    : '0';

  const aiResolutionRate = stats.aiPerformance.totalAnalyzed > 0
    ? ((stats.aiPerformance.autoResolved / stats.aiPerformance.totalAnalyzed) * 100).toFixed(1)
    : '0';

  const kpiCards = [
    {
      title: 'Total Tickets',
      value: stats.tickets.total,
      change: '+12%',
      changeType: 'positive',
      icon: Ticket,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'AI Resolution Rate',
      value: `${aiResolutionRate}%`,
      change: '+8.1%',
      changeType: 'positive',
      icon: Bot,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      change: '-15%',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor system performance and track key metrics
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div key={index} className={`${kpi.bgColor} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${kpi.color} rounded-lg p-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${kpi.textColor} opacity-80`}>
                  {kpi.title}
                </p>
                <p className={`text-3xl font-bold ${kpi.textColor} mt-1`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ticket Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Open</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{stats.tickets.open}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tickets.open / stats.tickets.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{stats.tickets.inProgress}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tickets.inProgress / stats.tickets.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Closed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{stats.tickets.closed}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.tickets.closed / stats.tickets.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Auto-Resolution Rate</span>
                <span className="text-sm font-medium text-gray-900">{aiResolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${aiResolutionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Confidence</span>
                <span className="text-sm font-medium text-gray-900">
                  {(stats.aiPerformance.avgConfidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.aiPerformance.avgConfidence * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Analyzed</span>
                <span className="font-medium text-gray-900">{stats.aiPerformance.totalAnalyzed}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Auto-Resolved</span>
                <span className="font-medium text-gray-900">{stats.aiPerformance.autoResolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category and Priority Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tickets by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tickets by Category</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(Number(count) / stats.tickets.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tickets by Priority</h3>
          <div className="space-y-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const priorityColors = {
                urgent: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              };
              return (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{priority}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${priorityColors[priority as keyof typeof priorityColors]} h-2 rounded-full`}
                        style={{ width: `${(Number(count) / stats.tickets.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}