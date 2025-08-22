/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE = import.meta.env.VITE_API_BASE;
class APIService {
  [x: string]: any;
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  // Auth endpoints
async login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password update failed');
    }

    return response.json();
  }

  // Ticket endpoints
  async createTicket(ticketData: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }) {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ticket');
    }

    return response.json();
  }

  async getMyTickets(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE}/tickets/my-tickets?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tickets');
    }

    return response.json();
  }

  async getTickets(filters: {
    status?: string;
    priority?: string;
    category?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const response = await fetch(`${API_BASE}/tickets?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tickets');
    }

    return response.json();
  }

  async updateTicket(ticketId: string, updates: {
    status?: string;
    resolution?: string;
    assignedTo?: string;
  }) {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update ticket');
    }

    return response.json();
  }

  async getTicketDetails(ticketId: string) {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ticket details');
    }

    return response.json();
  }

  // Knowledge Base endpoints
  async getKnowledgeBase(filters: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const response = await fetch(`${API_BASE}/knowledge-base?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch knowledge base');
    }

    return response.json();
  }

  async createKnowledgeBase(data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) {
    const response = await fetch(`${API_BASE}/knowledge-base`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create knowledge base article');
    }

    return response.json();
  }

  async updateKnowledgeBase(id: string, data: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    isActive?: boolean;
  }) {
    const response = await fetch(`${API_BASE}/knowledge-base/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update knowledge base article');
    }

    return response.json();
  }

  async deleteKnowledgeBase(id: string) {
    const response = await fetch(`${API_BASE}/knowledge-base/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete knowledge base article');
    }

    return response.json();
  }

  // Admin endpoints
  async getUsers(filters: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const response = await fetch(`${API_BASE}/admin/users?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  }

  async updateUser(userId: string, updates: {
    role?: string;
    isActive?: boolean;
  }) {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  async getAdminStats() {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }

    return response.json();
  }

  // Audit endpoints
  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    action?: string;
    performedByType?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const response = await fetch(`${API_BASE}/audit?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch audit logs');
    }

    return response.json();
  }
  
  async createAgent(agentData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(`${API_BASE}/admin/users/agent`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create agent');
  }

  return response.json();
}


  async getTicketAuditLogs(ticketId: string) {
    const response = await fetch(`${API_BASE}/audit/ticket/${ticketId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ticket audit logs');
    }

    return response.json();
  }
}

export default new APIService();