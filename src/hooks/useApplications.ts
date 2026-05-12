'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/service/application.service';
import { ApplicationCreateRequest, ApplicationUpdateRequest } from '@/models/application/application.model';

const QUERY_KEYS = {
  all: ['applications'],
  lists: () => [...QUERY_KEYS.all, 'list'],
  list: (page?: number) => [...QUERY_KEYS.lists(), page],
  details: () => [...QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...QUERY_KEYS.details(), id],
  byJob: (jobId: string) => [...QUERY_KEYS.all, 'byJob', jobId],
  byEmployee: (employeeId: string) => [...QUERY_KEYS.all, 'byEmployee', employeeId],
  myApplications: () => [...QUERY_KEYS.all, 'myApplications'],
  stats: () => [...QUERY_KEYS.all, 'stats'],
};

export const useApplications = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(page),
    queryFn: () => applicationService.getAll(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useApplication = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => applicationService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplicationCreateRequest) => applicationService.create(data),
    onSuccess: (newApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(newApplication.id), newApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(newApplication.jobId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byEmployee(newApplication.employeeId) });
    },
    onError: (error) => {
      console.error('[useCreateApplication] Error:', error);
    },
  });
};

export const useUpdateApplication = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplicationUpdateRequest) => applicationService.update(id, data),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(id), updatedApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(updatedApplication.jobId) });
    },
    onError: (error) => {
      console.error('[useUpdateApplication] Error:', error);
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('[useDeleteApplication] Error:', error);
    },
  });
};

export const useApplicationsByJobId = (jobId: string, page: number = 1, limit: number = 10, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.byJob(jobId),
    queryFn: () => applicationService.getByJobId(jobId, page, limit),
    enabled: !!jobId && enabled,
  });
};

export const useApplicationsByEmployeeId = (employeeId: string, page: number = 1, limit: number = 10, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.byEmployee(employeeId),
    queryFn: () => applicationService.getByEmployeeId(employeeId, page, limit),
    enabled: !!employeeId && enabled,
  });
};

export const useMyApplications = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.myApplications(),
    queryFn: () => applicationService.getEmployerApplications(page, limit),
  });
};

export const useAcceptApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => applicationService.accept(id, notes),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedApplication.id), updatedApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(updatedApplication.jobId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => applicationService.reject(id, notes),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedApplication.id), updatedApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(updatedApplication.jobId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};

export const useShortlistApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => applicationService.shortlist(id, notes),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedApplication.id), updatedApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(updatedApplication.jobId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, interviewDate, interviewTime, notes }: { id: string; interviewDate: string; interviewTime: string; notes?: string }) =>
      applicationService.scheduleInterview(id, interviewDate, interviewTime, notes),
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedApplication.id), updatedApplication);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.byJob(updatedApplication.jobId) });
    },
  });
};

export const useApplicationStats = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: () => applicationService.getStats(),
    enabled,
    staleTime: 1000 * 60 * 15,
  });
};
