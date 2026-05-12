import { z } from 'zod';

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  INTERVIEW = 'INTERVIEW',
}

export const applicationCreateSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  resume: z.string().url('Invalid resume URL'),
  coverLetter: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.SUBMITTED),
});

export const applicationUpdateSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export type ApplicationCreateRequest = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateRequest = z.infer<typeof applicationUpdateSchema>;

export interface Application extends ApplicationCreateRequest {
  id: string;
  appliedAt: string;
  updatedAt: string;
  employeeName?: string;
  jobTitle?: string;
  notes?: string;
}

export interface ApplicationResponse {
  data: Application;
  message: string;
  success: boolean;
}

export interface ApplicationListResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
}
