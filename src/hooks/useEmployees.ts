'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService, employerService } from '@/service/employee.service';
import { Employee, Employer, EmployeeProfile, EmployerProfile } from '@/models/employee/employee-extended.model';

const QUERY_KEYS = {
  employees: {
    all: ['employees'],
    list: (page?: number) => [...QUERY_KEYS.employees.all, 'list', page],
    detail: (id: string) => [...QUERY_KEYS.employees.all, 'detail', id],
    me: () => [...QUERY_KEYS.employees.all, 'me'],
    search: (query: string) => [...QUERY_KEYS.employees.all, 'search', query],
  },
  employers: {
    all: ['employers'],
    list: (page?: number) => [...QUERY_KEYS.employers.all, 'list', page],
    detail: (id: string) => [...QUERY_KEYS.employers.all, 'detail', id],
    me: () => [...QUERY_KEYS.employers.all, 'me'],
    jobs: (id: string) => [...QUERY_KEYS.employers.detail(id), 'jobs'],
    applications: (id: string) => [...QUERY_KEYS.employers.detail(id), 'applications'],
  },
};

// ========== EMPLOYEE HOOKS ==========

export const useEmployeeProfile = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.employees.detail(id),
    queryFn: () => employeeService.getProfile(id),
    enabled: !!id && enabled,
  });
};

export const useCurrentEmployee = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.employees.me(),
    queryFn: () => employeeService.getMe(),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useEmployees = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.employees.list(page),
    queryFn: () => employeeService.getAll(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateEmployeeProfile = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmployeeProfile>) => employeeService.updateProfile(id, data),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(QUERY_KEYS.employees.detail(id), updatedEmployee);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.list() });
    },
  });
};

export const useUpdateCurrentEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmployeeProfile>) => employeeService.updateMe(data),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(QUERY_KEYS.employees.me(), updatedEmployee);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.list() });
    },
  });
};

export const useSearchEmployees = (query: string, page: number = 1, limit: number = 10, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.employees.search(query),
    queryFn: () => employeeService.search(query, page, limit),
    enabled: !!query && enabled,
  });
};

export const useVerifyEmployeeEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => employeeService.verifyEmail(token),
    onSuccess: (verifiedEmployee) => {
      queryClient.setQueryData(QUERY_KEYS.employees.detail(verifiedEmployee.id), verifiedEmployee);
    },
  });
};

export const useUpdateEmployeeProfilePicture = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => employeeService.updateProfilePicture(id, formData),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(QUERY_KEYS.employees.detail(id), updatedEmployee);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employees.me() });
    },
  });
};

// ========== EMPLOYER HOOKS ==========

export const useEmployerProfile = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.employers.detail(id),
    queryFn: () => employerService.getProfile(id),
    enabled: !!id && enabled,
  });
};

export const useCurrentEmployer = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.employers.me(),
    queryFn: () => employerService.getMe(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export const useEmployers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.employers.list(page),
    queryFn: () => employerService.getAll(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateEmployerProfile = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmployerProfile>) => employerService.updateProfile(id, data),
    onSuccess: (updatedEmployer) => {
      queryClient.setQueryData(QUERY_KEYS.employers.detail(id), updatedEmployer);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employers.list() });
    },
  });
};

export const useUpdateCurrentEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmployerProfile>) => employerService.updateMe(data),
    onSuccess: (updatedEmployer) => {
      queryClient.setQueryData(QUERY_KEYS.employers.me(), updatedEmployer);
    },
  });
};

export const useDeleteEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.employers.list() });
    },
  });
};

export const useEmployerPostedJobs = (id: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.employers.jobs(id),
    queryFn: () => employerService.getPostedJobs(id, page, limit),
    enabled: !!id,
  });
};

export const useEmployerApplications = (id: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.employers.applications(id),
    queryFn: () => employerService.getApplications(id, page, limit),
    enabled: !!id,
  });
};

export const useVerifyEmployerCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employerService.verifyCompany(id),
    onSuccess: (verifiedEmployer) => {
      queryClient.setQueryData(QUERY_KEYS.employers.detail(verifiedEmployer.id), verifiedEmployer);
    },
  });
};
