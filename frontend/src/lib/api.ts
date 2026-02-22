const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Events API
export const eventsApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/events`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/events/${id}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return res.json();
  }
};

// Courses API
export const coursesApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/courses`);
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/courses/${id}`);
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update course');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete course');
    return res.json();
  }
};

// Users API
export const usersApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  updateRole: async (id: string, role: string) => {
    const res = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
  }
};


// Registrations API
export const registrationsApi = {
  getAll: async (params?: { type?: string; status?: string; eventId?: string; courseId?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/registrations?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch registrations');
    return res.json();
  },

  getMy: async () => {
    const res = await fetch(`${API_URL}/registrations/my`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch my registrations');
    return res.json();
  },

  create: async (data: { eventId?: string; courseId?: string; type: 'event' | 'course' }) => {
    const res = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to register');
    }
    return res.json();
  },

  cancel: async (id: string) => {
    const res = await fetch(`${API_URL}/registrations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to cancel registration');
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/registrations/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  }
};
