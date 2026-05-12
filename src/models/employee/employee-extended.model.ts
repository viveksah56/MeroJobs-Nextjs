import { z } from 'zod';

export enum EmployeeRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

// Zod Schemas
export const employeeProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  profilePicture: z.string().url('Invalid profile picture URL').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  role: z.nativeEnum(EmployeeRole).default(EmployeeRole.JOB_SEEKER),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
});

export const employerProfileSchema = employeeProfileSchema.extend({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  workLocation: z.string().optional(),
  salary: z.number().positive('Salary must be greater than 0').optional(),
  companyWebsite: z.string().url('Invalid company website URL').optional(),
  companyDescription: z.string().optional(),
});

export const employeeUpdateSchema = employeeProfileSchema.partial();
export const employerUpdateSchema = employerProfileSchema.partial();

// TypeScript Types
export type EmployeeProfile = z.infer<typeof employeeProfileSchema>;
export type EmployerProfile = z.infer<typeof employerProfileSchema>;

export interface Employee extends EmployeeProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLogin?: string;
}

export interface Employer extends EmployerProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLogin?: string;
  jobsPosted?: number;
  applicantsManaged?: number;
}

export interface EmployeeResponse {
  data: Employee;
  message: string;
  success: boolean;
}

export interface EmployerResponse {
  data: Employer;
  message: string;
  success: boolean;
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
}
