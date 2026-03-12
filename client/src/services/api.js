import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  const expoHostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    null;

  if (expoHostUri) {
    const host = expoHostUri.split(':')[0];
    if (host) {
      return `http://${host}:3000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API methods
export const taskAPI = {
  // Get tasks by status
  getAllTasks: async (status = 'active') => {
    try {
      const response = await api.get('/tasks', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get history tasks
  getTaskHistory: async () => {
    try {
      const response = await api.get('/tasks/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }
  },

  // Get history report
  getHistoryReport: async () => {
    try {
      const response = await api.get('/tasks/history/report');
      return response.data;
    } catch (error) {
      console.error('Error fetching history report:', error);
      throw error;
    }
  },

  // Get single task by ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Mark task as completed
  completeTask: async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  // Reopen completed task
  reopenTask: async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/reopen`);
      return response.data;
    } catch (error) {
      console.error('Error reopening task:', error);
      throw error;
    }
  },
};

export default api;
