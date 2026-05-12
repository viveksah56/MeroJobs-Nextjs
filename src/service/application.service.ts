import api from '@/lib/api';
import {
  Application,
  ApplicationCreateRequest,
  ApplicationUpdateRequest,
  ApplicationResponse,
  ApplicationListResponse,
  applicationCreateSchema,
  applicationUpdateSchema,
} from '@/models/application/application.model';

export const applicationService = {
  /**
   * Get all applications with pagination
   */
  getAll: async (page: number = 1, limit: number = 10): Promise<ApplicationListResponse> => {
    try {
      const response = await api.get<ApplicationListResponse>('/applications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[ApplicationService] Error fetching applications:', error);
      throw error;
    }
  },

  /**
   * Get a single application by ID
   */
  getById: async (id: string): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.get<ApplicationResponse>(`/applications/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error fetching application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new application
   */
  create: async (data: ApplicationCreateRequest): Promise<Application> => {
    try {
      const validatedData = applicationCreateSchema.parse(data);
      const response = await api.post<ApplicationResponse>('/applications', validatedData);
      return response.data.data;
    } catch (error) {
      console.error('[ApplicationService] Error creating application:', error);
      throw error;
    }
  },

  /**
   * Update application status
   */
  update: async (id: string, data: ApplicationUpdateRequest): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const validatedData = applicationUpdateSchema.parse(data);
      const response = await api.put<ApplicationResponse>(`/applications/${id}`, validatedData);
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error updating application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an application
   */
  delete: async (id: string): Promise<string> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.delete<{ success: boolean; deletedId: string }>(`/applications/${id}`);
      return response.data.deletedId;
    } catch (error) {
      console.error(`[ApplicationService] Error deleting application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get applications for a specific job
   */
  getByJobId: async (jobId: string, page: number = 1, limit: number = 10): Promise<ApplicationListResponse> => {
    try {
      if (!jobId) throw new Error('Job ID is required');
      const response = await api.get<ApplicationListResponse>(`/applications/job/${jobId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[ApplicationService] Error fetching applications for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Get applications submitted by an employee
   */
  getByEmployeeId: async (employeeId: string, page: number = 1, limit: number = 10): Promise<ApplicationListResponse> => {
    try {
      if (!employeeId) throw new Error('Employee ID is required');
      const response = await api.get<ApplicationListResponse>(`/applications/employee/${employeeId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`[ApplicationService] Error fetching applications for employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Get applications for employer's jobs
   */
  getEmployerApplications: async (page: number = 1, limit: number = 10): Promise<ApplicationListResponse> => {
    try {
      const response = await api.get<ApplicationListResponse>('/applications/my-applications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[ApplicationService] Error fetching employer applications:', error);
      throw error;
    }
  },

  /**
   * Accept an application
   */
  accept: async (id: string, notes?: string): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.put<ApplicationResponse>(`/applications/${id}/accept`, { notes });
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error accepting application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject an application
   */
  reject: async (id: string, notes?: string): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.put<ApplicationResponse>(`/applications/${id}/reject`, { notes });
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error rejecting application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Move to shortlist
   */
  shortlist: async (id: string, notes?: string): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.put<ApplicationResponse>(`/applications/${id}/shortlist`, { notes });
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error shortlisting application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Schedule interview
   */
  scheduleInterview: async (
    id: string,
    interviewDate: string,
    interviewTime: string,
    notes?: string
  ): Promise<Application> => {
    try {
      if (!id) throw new Error('Application ID is required');
      const response = await api.put<ApplicationResponse>(`/applications/${id}/schedule-interview`, {
        interviewDate,
        interviewTime,
        notes,
      });
      return response.data.data;
    } catch (error) {
      console.error(`[ApplicationService] Error scheduling interview for application ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get application statistics
   */
  getStats: async (): Promise<any> => {
    try {
      const response = await api.get('/applications/stats');
      return response.data.data;
    } catch (error) {
      console.error('[ApplicationService] Error fetching application statistics:', error);
      throw error;
    }
  },
};
