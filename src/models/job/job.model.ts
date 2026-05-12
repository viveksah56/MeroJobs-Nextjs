import { z } from 'zod';

// Enums
export enum EmploymentType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
  INTERNSHIP = 'Internship',
  REMOTE = 'Remote',
}

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

// Zod Schemas
export const jobCreateSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name is required'),
  companyLogo: z.string().url('Invalid company logo URL').optional(),
  companyVerified: z.boolean().optional().default(false),
  employmentType: z.nativeEnum(EmploymentType),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  salaryMin: z.number().positive('Minimum salary must be greater than 0'),
  salaryMax: z.number().positive('Maximum salary must be greater than 0'),
  currency: z.string().optional().default('USD'),
  salaryPeriod: z.string().optional().default('month'),
  skills: z.array(z.string()).optional().default([]),
  applyUrl: z.string().url('Invalid apply URL').optional(),
  status: z.nativeEnum(JobStatus).optional().default(JobStatus.ACTIVE),
  postedAgo: z.string().optional(),
});

export const jobUpdateSchema = jobCreateSchema.partial();

export const jobFilterSchema = z.object({
  jobTypes: z.array(z.string()).optional().default([]),
  searchQuery: z.string().optional().default(''),
  sortBy: z.enum(['recent', 'salary', 'relevance']).optional().default('recent'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
});

// TypeScript Types
export type JobCreateRequest = z.infer<typeof jobCreateSchema>;
export type JobUpdateRequest = z.infer<typeof jobUpdateSchema>;
export type JobFilterParams = z.infer<typeof jobFilterSchema>;

export interface Job extends JobCreateRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  applicants?: number;
  views?: number;
}

export interface JobResponse {
  data: Job;
  message: string;
  success: boolean;
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
}

export interface JobDeleteResponse {
  message: string;
  success: boolean;
  deletedId: string;
}
