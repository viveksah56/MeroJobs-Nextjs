import api from '@/lib/api';
import {
  Job,
  JobCreateRequest,
  JobUpdateRequest,
  JobFilterParams,
  JobResponse,
  JobListResponse,
  JobDeleteResponse,
  jobCreateSchema,
  jobUpdateSchema,
  jobFilterSchema,
} from '@/models/job/job.model';
import { AxiosError } from 'axios';

export const jobService = {
  /**
   * Get all jobs with optional filtering
   */
  getAll: async (params?: Partial<JobFilterParams>): Promise<Job[]> => {
    try {
      const validatedParams = jobFilterSchema.partial().parse(params || {});
      const response = await api.get<JobListResponse>('/jobs', {
        params: validatedParams,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('[JobService] Error fetching jobs:', axiosError.response?.data?.message || error);
      throw error;
    }
  },

  /**
   * Get paginated jobs
   */
  getPaginated: async (page: number = 1, limit: number = 10): Promise<JobListResponse> => {
    try {
      const response = await api.get<JobListResponse>('/jobs', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[JobService] Error fetching paginated jobs:', error);
      throw error;
    }
  },

  /**
   * Get a single job by ID
   */
  getById: async (id: string): Promise<Job> => {
    try {
      if (!id) throw new Error('Job ID is required');
      const response = await api.get<JobResponse>(`/jobs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`[JobService] Error fetching job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new job
   */
  create: async (data: JobCreateRequest): Promise<Job> => {
    try {
      const validatedData = jobCreateSchema.parse(data);
      const response = await api.post<JobResponse>('/jobs', validatedData);
      return response.data.data;
    } catch (error) {
      console.error('[JobService] Error creating job:', error);
      throw error;
    }
  },

  /**
   * Update a job
   */
  update: async (id: string, data: JobUpdateRequest): Promise<Job> => {
    try {
      if (!id) throw new Error('Job ID is required');
      const validatedData = jobUpdateSchema.parse(data);
      const response = await api.put<JobResponse>(`/jobs/${id}`, validatedData);
      return response.data.data;
    } catch (error) {
      console.error(`[JobService] Error updating job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a job
   */
  delete: async (id: string): Promise<string> => {
    try {
      if (!id) throw new Error('Job ID is required');
      const response = await api.delete<JobDeleteResponse>(`/jobs/${id}`);
      return response.data.deletedId;
    } catch (error) {
      console.error(`[JobService] Error deleting job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search jobs by query
   */
  search: async (query: string, page: number = 1, limit: number = 10): Promise<JobListResponse> => {
    try {
      if (!query) throw new Error('Search query is required');
      const response = await api.get<JobListResponse>('/jobs/search', {
        params: { q: query, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[JobService] Error searching jobs:', error);
      throw error;
    }
  },

  /**
   * Get jobs by company
   */
  getByCompany: async (companyName: string, page: number = 1, limit: number = 10): Promise<JobListResponse> => {
    try {
      if (!companyName) throw new Error('Company name is required');
      const response = await api.get<JobListResponse>('/jobs/company', {
        params: { company: companyName, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[JobService] Error fetching jobs by company:', error);
      throw error;
    }
  },

  /**
   * Get jobs by employment type
   */
  getByEmploymentType: async (
    employmentType: string,
    page: number = 1,
    limit: number = 10
  ): Promise<JobListResponse> => {
    try {
      if (!employmentType) throw new Error('Employment type is required');
      const response = await api.get<JobListResponse>('/jobs/type', {
        params: { type: employmentType, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('[JobService] Error fetching jobs by employment type:', error);
      throw error;
    }
  },

  /**
   * Get job statistics
   */
  getStats: async (): Promise<any> => {
    try {
      const response = await api.get('/jobs/stats');
      return response.data.data;
    } catch (error) {
      console.error('[JobService] Error fetching job statistics:', error);
      throw error;
    }
  },

  /**
   * Close a job posting
   */
  close: async (id: string): Promise<Job> => {
    try {
      if (!id) throw new Error('Job ID is required');
      const response = await api.put<JobResponse>(`/jobs/${id}/close`);
      return response.data.data;
    } catch (error) {
      console.error(`[JobService] Error closing job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reopen a closed job
   */
  reopen: async (id: string): Promise<Job> => {
    try {
      if (!id) throw new Error('Job ID is required');
      const response = await api.put<JobResponse>(`/jobs/${id}/reopen`);
      return response.data.data;
    } catch (error) {
      console.error(`[JobService] Error reopening job ${id}:`, error);
      throw error;
    }
  },
};
