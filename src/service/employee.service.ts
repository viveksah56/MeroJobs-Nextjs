import api from '@/lib/api';
import {
  Employee,
  Employer,
  EmployeeProfile,
  EmployerProfile,
  EmployeeResponse,
  EmployerResponse,
  EmployeeListResponse,
  employeeProfileSchema,
  employeeUpdateSchema,
  employerProfileSchema,
  employerUpdateSchema,
} from '@/models/employee/employee-extended.model';
import { AxiosError } from 'axios';

export const employeeService = {
  /**
   * Get employee profile
   */
  getProfile: async (id: string): Promise<Employee> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const response = await api.get<EmployeeResponse>(`/employees/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployeeService] Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get current logged-in employee profile
   */
  getMe: async (): Promise<Employee> => {
    try {
      const response = await api.get<EmployeeResponse>('/employees/me');
      return response.data.data;
    } catch (error) {
      console.error('[EmployeeService] Error fetching current employee:', error);
      throw error;
    }
  },

  /**
   * Get all employees with pagination
   */
  getAll: async (page: number = 1, limit: number = 10): Promise<EmployeeListResponse> => {
    try {
      const response = await api.get<EmployeeListResponse>('/employees', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[EmployeeService] Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Update employee profile
   */
  updateProfile: async (id: string, data: Partial<EmployeeProfile>): Promise<Employee> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const validatedData = employeeUpdateSchema.parse(data);
      const response = await api.put<EmployeeResponse>(`/employees/${id}`, validatedData);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployeeService] Error updating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update current employee profile
   */
  updateMe: async (data: Partial<EmployeeProfile>): Promise<Employee> => {
    try {
      const validatedData = employeeUpdateSchema.parse(data);
      const response = await api.put<EmployeeResponse>('/employees/me', validatedData);
      return response.data.data;
    } catch (error) {
      console.error('[EmployeeService] Error updating current employee:', error);
      throw error;
    }
  },

  /**
   * Delete employee account
   */
  delete: async (id: string): Promise<string> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const response = await api.delete<{ success: boolean; deletedId: string }>(`/employees/${id}`);
      return response.data.deletedId;
    } catch (error) {
      console.error(`[EmployeeService] Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search employees by name or email
   */
  search: async (query: string, page: number = 1, limit: number = 10): Promise<EmployeeListResponse> => {
    try {
      if (!query) throw new Error('Search query is required');
      const response = await api.get<EmployeeListResponse>('/employees/search', {
        params: { q: query, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[EmployeeService] Error searching employees:', error);
      throw error;
    }
  },

  /**
   * Verify employee email
   */
  verifyEmail: async (token: string): Promise<Employee> => {
    try {
      if (!token) throw new Error('Verification token is required');
      const response = await api.post<EmployeeResponse>('/employees/verify-email', { token });
      return response.data.data;
    } catch (error) {
      console.error('[EmployeeService] Error verifying email:', error);
      throw error;
    }
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    try {
      if (!email) throw new Error('Email is required');
      const response = await api.post('/employees/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('[EmployeeService] Error resending verification email:', error);
      throw error;
    }
  },

  /**
   * Deactivate employee account
   */
  deactivate: async (id: string): Promise<Employee> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const response = await api.put<EmployeeResponse>(`/employees/${id}/deactivate`);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployeeService] Error deactivating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reactivate employee account
   */
  reactivate: async (id: string): Promise<Employee> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const response = await api.put<EmployeeResponse>(`/employees/${id}/reactivate`);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployeeService] Error reactivating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update profile picture
   */
  updateProfilePicture: async (id: string, formData: FormData): Promise<Employee> => {
    try {
      if (!id) throw new Error('Employee ID is required');
      const response = await api.put<EmployeeResponse>(`/employees/${id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(`[EmployeeService] Error updating profile picture for ${id}:`, error);
      throw error;
    }
  },
};

export const employerService = {
  /**
   * Get employer profile
   */
  getProfile: async (id: string): Promise<Employer> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const response = await api.get<EmployerResponse>(`/employers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployerService] Error fetching employer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get current logged-in employer profile
   */
  getMe: async (): Promise<Employer> => {
    try {
      const response = await api.get<EmployerResponse>('/employers/me');
      return response.data.data;
    } catch (error) {
      console.error('[EmployerService] Error fetching current employer:', error);
      throw error;
    }
  },

  /**
   * Get all employers with pagination
   */
  getAll: async (page: number = 1, limit: number = 10): Promise<any> => {
    try {
      const response = await api.get('/employers', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[EmployerService] Error fetching employers:', error);
      throw error;
    }
  },

  /**
   * Update employer profile
   */
  updateProfile: async (id: string, data: Partial<EmployerProfile>): Promise<Employer> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const validatedData = employerUpdateSchema.parse(data);
      const response = await api.put<EmployerResponse>(`/employers/${id}`, validatedData);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployerService] Error updating employer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update current employer profile
   */
  updateMe: async (data: Partial<EmployerProfile>): Promise<Employer> => {
    try {
      const validatedData = employerUpdateSchema.parse(data);
      const response = await api.put<EmployerResponse>('/employers/me', validatedData);
      return response.data.data;
    } catch (error) {
      console.error('[EmployerService] Error updating current employer:', error);
      throw error;
    }
  },

  /**
   * Verify employer company
   */
  verifyCompany: async (id: string): Promise<Employer> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const response = await api.post<EmployerResponse>(`/employers/${id}/verify`);
      return response.data.data;
    } catch (error) {
      console.error(`[EmployerService] Error verifying employer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get posted jobs by employer
   */
  getPostedJobs: async (id: string, page: number = 1, limit: number = 10): Promise<any> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const response = await api.get(`/employers/${id}/jobs`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[EmployerService] Error fetching employer jobs for ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get job applications for employer
   */
  getApplications: async (id: string, page: number = 1, limit: number = 10): Promise<any> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const response = await api.get(`/employers/${id}/applications`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[EmployerService] Error fetching employer applications for ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete employer account
   */
  delete: async (id: string): Promise<string> => {
    try {
      if (!id) throw new Error('Employer ID is required');
      const response = await api.delete<{ success: boolean; deletedId: string }>(`/employers/${id}`);
      return response.data.deletedId;
    } catch (error) {
      console.error(`[EmployerService] Error deleting employer ${id}:`, error);
      throw error;
    }
  },
};
