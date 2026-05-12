'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/service/job.service';
import { Job, JobCreateRequest, JobUpdateRequest, JobFilterParams } from '@/models/job/job.model';

const QUERY_KEYS = {
  all: ['jobs'],
  lists: () => [...QUERY_KEYS.all, 'list'],
  list: (filters?: JobFilterParams) => [...QUERY_KEYS.lists(), filters],
  details: () => [...QUERY_KEYS.all, 'detail'],
  detail: (id: string) => [...QUERY_KEYS.details(), id],
  search: (query: string) => [...QUERY_KEYS.all, 'search', query],
  company: (name: string) => [...QUERY_KEYS.all, 'company', name],
  stats: () => [...QUERY_KEYS.all, 'stats'],
};

export const useJobs = (filters?: JobFilterParams, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => jobService.getAll(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useJobsPaginated = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['jobs', 'paginated', page, limit],
    queryFn: () => jobService.getPaginated(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useJob = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => jobService.getById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobCreateRequest) => jobService.create(data),
    onSuccess: (newJob) => {
      queryClient.setQueryData(QUERY_KEYS.detail(newJob.id), newJob);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('[useCreateJob] Error:', error);
    },
  });
};

export const useUpdateJob = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobUpdateRequest) => jobService.update(id, data),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(QUERY_KEYS.detail(id), updatedJob);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('[useUpdateJob] Error:', error);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('[useDeleteJob] Error:', error);
    },
  });
};

export const useSearchJobs = (query: string, page: number = 1, limit: number = 10, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => jobService.search(query, page, limit),
    enabled: !!query && enabled,
  });
};

export const useJobsByCompany = (companyName: string, page: number = 1, limit: number = 10, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.company(companyName),
    queryFn: () => jobService.getByCompany(companyName, page, limit),
    enabled: !!companyName && enabled,
  });
};

export const useJobStats = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: () => jobService.getStats(),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useCloseJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.close(id),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedJob.id), updatedJob);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};

export const useReopenJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.reopen(id),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(QUERY_KEYS.detail(updatedJob.id), updatedJob);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};
