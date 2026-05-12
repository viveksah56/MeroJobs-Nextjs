# MVC Architecture Guide - MeroJobs

## Overview

This project follows a **Model-View-Controller (MVC)** pattern with an **enhanced service layer** architecture using Next.js, React Query, and TypeScript.

### Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              COMPONENTS (View)                      │
│  React UI Components using Hooks                    │
└──────────────────┬──────────────────────────────────┘
                   │ imports
┌──────────────────▼──────────────────────────────────┐
│            CUSTOM HOOKS (Controller)                │
│  useJobs, useEmployees, useApplications            │
│  - State management with React Query               │
│  - Mutations (create, update, delete)              │
└──────────────────┬──────────────────────────────────┘
                   │ imports
┌──────────────────▼──────────────────────────────────┐
│          SERVICES (Business Logic)                  │
│  jobService, employeeService, applicationService  │
│  - API call coordination                           │
│  - Data transformation                             │
│  - Validation with Zod                             │
└──────────────────┬──────────────────────────────────┘
                   │ imports
┌──────────────────▼──────────────────────────────────┐
│          MODELS (Data Structure)                    │
│  Job, Employee, Application Models                 │
│  - TypeScript interfaces                           │
│  - Zod validation schemas                          │
│  - Type definitions                                │
└──────────────────┬──────────────────────────────────┘
                   │ imports
┌──────────────────▼──────────────────────────────────┐
│          AXIOS INSTANCE (HTTP Client)              │
│  src/lib/api.ts                                    │
│  - Pre-configured axios                            │
│  - Request/Response interceptors                   │
│  - Error handling                                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP Requests
┌──────────────────▼──────────────────────────────────┐
│              BACKEND API                            │
│  REST Endpoints                                    │
└─────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── models/                          # Data Models (M)
│   ├── job/
│   │   └── job.model.ts             # Job model, schemas, types
│   ├── employee/
│   │   ├── employee.model.ts        # Original employee model
│   │   └── employee-extended.model.ts # Extended employee & employer models
│   └── application/
│       └── application.model.ts     # Application model, schemas, types
│
├── service/                         # Services (Business Logic)
│   ├── api.ts                       # HTTP client configuration
│   ├── auth.service.ts              # Authentication service
│   ├── job.service.ts               # Job service methods
│   ├── employee.service.ts          # Employee & Employer services
│   └── application.service.ts       # Application service methods
│
├── hooks/                           # Custom Hooks (C)
│   ├── useAuth.ts                   # Authentication hook
│   ├── useJobs.ts                   # Jobs hook (queries & mutations)
│   ├── useEmployees.ts              # Employees hook (queries & mutations)
│   └── useApplications.ts           # Applications hook (queries & mutations)
│
├── components/                      # React Components (V)
│   ├── jobs/
│   │   ├── job-filter.tsx           # Job filtering component
│   │   └── jobs-card.tsx            # Job card component
│   ├── form-field/                  # Form field components
│   └── ...                          # Other UI components
│
└── app/                             # Next.js app directory
    ├── (auth)/                      # Auth group
    │   └── login/
    │       └── page.tsx             # Login page
    ├── dashboard/                   # Protected route
    │   └── page.tsx                 # Dashboard page
    └── (public)/                    # Public group
        └── page.tsx                 # Home page
```

## Core Concepts

### 1. Models (Data Layer)

Models define the structure and validation of your data.

**Files:**
- `src/models/job/job.model.ts`
- `src/models/employee/employee-extended.model.ts`
- `src/models/application/application.model.ts`

**What they contain:**
- TypeScript interfaces
- Zod validation schemas
- Enums
- Type inference from schemas

**Example:**

```typescript
// src/models/job/job.model.ts
export const jobCreateSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  employmentType: z.nativeEnum(EmploymentType),
  // ... more fields
});

export type JobCreateRequest = z.infer<typeof jobCreateSchema>;

export interface Job extends JobCreateRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Services (Business Logic Layer)

Services handle API calls, data transformation, and business logic.

**Files:**
- `src/service/job.service.ts`
- `src/service/employee.service.ts`
- `src/service/application.service.ts`

**What they do:**
- Validate input with Zod schemas
- Make API calls using axios instance
- Transform data
- Handle errors
- Provide consistent API

**Example:**

```typescript
// src/service/job.service.ts
export const jobService = {
  getAll: async (params?: Partial<JobFilterParams>): Promise<Job[]> => {
    try {
      const validatedParams = jobFilterSchema.partial().parse(params || {});
      const response = await api.get<JobListResponse>('/jobs', {
        params: validatedParams,
      });
      return response.data.data;
    } catch (error) {
      console.error('[JobService] Error fetching jobs:', error);
      throw error;
    }
  },

  create: async (data: JobCreateRequest): Promise<Job> => {
    const validatedData = jobCreateSchema.parse(data);
    const response = await api.post<JobResponse>('/jobs', validatedData);
    return response.data.data;
  },
  // ... more methods
};
```

### 3. Custom Hooks (Controller Layer)

Hooks manage component state and connect services to React Query.

**Files:**
- `src/hooks/useJobs.ts`
- `src/hooks/useEmployees.ts`
- `src/hooks/useApplications.ts`

**What they provide:**
- Queries (useQuery)
- Mutations (useMutation)
- Query key management
- Automatic caching
- Optimistic updates

**Example:**

```typescript
// src/hooks/useJobs.ts
export const useJobs = (filters?: JobFilterParams, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => jobService.getAll(filters),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobCreateRequest) => jobService.create(data),
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
};
```

### 4. Components (View Layer)

Components display data and handle user interactions.

**Example:**

```typescript
// src/components/jobs/jobs-list.tsx
'use client';

import { useJobs } from '@/hooks/useJobs';
import { useCreateJob } from '@/hooks/useJobs';

export function JobsList() {
  const { data: jobs, isLoading, error } = useJobs();
  const createJobMutation = useCreateJob();

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {jobs?.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
      ))}
      <button onClick={() => createJobMutation.mutate({ /* ... */ })}>
        Create Job
      </button>
    </div>
  );
}
```

## Data Flow

### Reading Data

1. **Component** calls `useJobs()` hook
2. **Hook** uses `useQuery()` from React Query
3. **Query function** calls `jobService.getAll()`
4. **Service** validates input and calls `api.get('/jobs')`
5. **Axios instance** sends HTTP request with interceptors
6. **Backend** returns data
7. **Service** transforms response
8. **Hook** updates React Query cache
9. **Component** receives data and re-renders

### Creating Data

1. **Component** calls `useCreateJob()` hook
2. **User clicks create** → mutation triggered
3. **Mutation function** calls `jobService.create(data)`
4. **Service** validates with Zod schema
5. **Service** calls `api.post('/jobs', validatedData)`
6. **Axios instance** sends request
7. **Backend** creates and returns data
8. **Service** returns response
9. **Mutation** updates React Query cache
10. **Component** shows success/error

## Usage Examples

### Fetching Jobs

```typescript
'use client';

import { useJobs } from '@/hooks/useJobs';

export function JobsPage() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {jobs?.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Creating a Job

```typescript
'use client';

import { useCreateJob } from '@/hooks/useJobs';
import { JobCreateRequest } from '@/models/job/job.model';

export function CreateJobForm() {
  const createMutation = useCreateJob();

  const handleSubmit = async (data: JobCreateRequest) => {
    try {
      const newJob = await createMutation.mutateAsync(data);
      console.log('Job created:', newJob);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(Object.fromEntries(formData) as JobCreateRequest);
    }}>
      <input name="title" required />
      <input name="company" required />
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Updating Employee Profile

```typescript
'use client';

import { useCurrentEmployee, useUpdateCurrentEmployee } from '@/hooks/useEmployees';

export function ProfileEditor() {
  const { data: employee } = useCurrentEmployee();
  const updateMutation = useUpdateCurrentEmployee();

  const handleUpdate = async (newData: Partial<EmployeeProfile>) => {
    try {
      await updateMutation.mutateAsync(newData);
      console.log('Profile updated!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div>
      <h1>{employee?.firstName} {employee?.lastName}</h1>
      <button onClick={() => handleUpdate({ firstName: 'NewName' })}>
        Update Name
      </button>
    </div>
  );
}
```

### Managing Job Applications

```typescript
'use client';

import { useApplicationsByJobId, useAcceptApplication } from '@/hooks/useApplications';

export function JobApplications({ jobId }: { jobId: string }) {
  const { data: applications } = useApplicationsByJobId(jobId);
  const acceptMutation = useAcceptApplication();

  const handleAccept = async (applicationId: string) => {
    await acceptMutation.mutateAsync({ id: applicationId });
  };

  return (
    <div>
      {applications?.map(app => (
        <div key={app.id}>
          <p>{app.employeeName} - {app.status}</p>
          <button onClick={() => handleAccept(app.id)}>Accept</button>
        </div>
      ))}
    </div>
  );
}
```

## Key Features

### 1. Type Safety
- Full TypeScript coverage
- Zod validation at runtime
- Type inference from schemas
- Compile-time error checking

### 2. Automatic Caching
- React Query handles caching
- Automatic refetching
- Stale time configuration
- Instant updates after mutations

### 3. Error Handling
- Service-level error logging
- Error propagation to components
- User-friendly error messages

### 4. Validation
- Input validation with Zod
- Server-side validation assumed
- Consistent data shapes

### 5. Scalability
- Easy to add new services
- Consistent patterns
- Separation of concerns

## Adding New Features

### Step 1: Create Model

```typescript
// src/models/feature/feature.model.ts
import { z } from 'zod';

export const featureSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  // ... more fields
});

export type Feature = z.infer<typeof featureSchema>;
```

### Step 2: Create Service

```typescript
// src/service/feature.service.ts
import api from '@/lib/api';
import { Feature, featureSchema } from '@/models/feature/feature.model';

export const featureService = {
  getAll: async () => {
    const response = await api.get<{ data: Feature[] }>('/features');
    return response.data.data;
  },
  create: async (data: Feature) => {
    const validated = featureSchema.parse(data);
    const response = await api.post<{ data: Feature }>('/features', validated);
    return response.data.data;
  },
};
```

### Step 3: Create Hook

```typescript
// src/hooks/useFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureService } from '@/service/feature.service';

export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => featureService.getAll(),
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => featureService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};
```

### Step 4: Use in Component

```typescript
// src/app/features/page.tsx
'use client';

import { useFeatures, useCreateFeature } from '@/hooks/useFeature';

export default function FeaturesPage() {
  const { data: features } = useFeatures();
  const createMutation = useCreateFeature();

  return (
    <div>
      {features?.map(feature => (
        <div key={feature.id}>{feature.name}</div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always validate in services** - Use Zod schemas for input validation
2. **Use query keys consistently** - Define QUERY_KEYS object in hooks
3. **Handle errors gracefully** - Log and provide meaningful messages
4. **Use React Query features** - Leverage caching, staleTime, and mutations
5. **Keep components simple** - Let hooks handle business logic
6. **Type everything** - Use TypeScript for type safety
7. **Reuse services** - Services can be used by multiple hooks
8. **Document endpoints** - Add comments explaining what each service method does

## Testing

Services can be easily tested by mocking the API:

```typescript
import { vi } from 'vitest';
import { jobService } from '@/service/job.service';
import api from '@/lib/api';

vi.mock('@/lib/api');

describe('JobService', () => {
  it('should fetch all jobs', async () => {
    const mockJobs = [{ id: '1', title: 'Developer' }];
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockJobs } });

    const result = await jobService.getAll();
    expect(result).toEqual(mockJobs);
  });
});
```

## Summary

The MVC architecture with services provides:

✓ **Clear separation of concerns** - Models, Services, Controllers, Views
✓ **Type safety** - Full TypeScript + Zod validation
✓ **Maintainability** - Easy to find and modify code
✓ **Scalability** - Patterns consistent across features
✓ **Testability** - Services easy to mock and test
✓ **Performance** - React Query caching and optimization
✓ **Developer experience** - IntelliSense and autocomplete

This structure scales from small projects to large applications!
