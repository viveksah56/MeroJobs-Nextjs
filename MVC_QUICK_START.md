# MVC Pattern - Quick Start Guide

## What Was Built

A complete **MVC (Model-View-Controller)** architecture with three main services:

1. **Job Service** - Manage job postings
2. **Employee Service** - Manage job seekers and employers
3. **Application Service** - Manage job applications

## File Structure

```
src/
├── models/
│   ├── job/job.model.ts                    # Job model & types
│   ├── employee/employee-extended.model.ts # Employee & Employer models
│   └── application/application.model.ts    # Application model & types
│
├── service/
│   ├── job.service.ts                      # Job API calls
│   ├── employee.service.ts                 # Employee/Employer API calls
│   └── application.service.ts              # Application API calls
│
└── hooks/
    ├── useJobs.ts                          # Jobs queries & mutations
    ├── useEmployees.ts                     # Employees queries & mutations
    └── useApplications.ts                  # Applications queries & mutations
```

## Quick Usage

### 1. Fetch Jobs

```typescript
'use client';
import { useJobs } from '@/hooks/useJobs';

export function JobsList() {
  const { data: jobs, isLoading } = useJobs();
  
  return (
    <div>
      {jobs?.map(job => (
        <h3 key={job.id}>{job.title}</h3>
      ))}
    </div>
  );
}
```

### 2. Create a Job

```typescript
'use client';
import { useCreateJob } from '@/hooks/useJobs';

export function CreateJob() {
  const createMutation = useCreateJob();

  return (
    <button 
      onClick={() => createMutation.mutate({
        title: 'Developer',
        company: 'TechCorp',
        employmentType: 'Full Time',
        location: 'Kathmandu',
        description: 'We are hiring...',
        salaryMin: 1000,
        salaryMax: 2000,
      })}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? 'Creating...' : 'Create Job'}
    </button>
  );
}
```

### 3. Update Employee Profile

```typescript
'use client';
import { useCurrentEmployee, useUpdateCurrentEmployee } from '@/hooks/useEmployees';

export function ProfileEditor() {
  const { data: employee } = useCurrentEmployee();
  const updateMutation = useUpdateCurrentEmployee();

  return (
    <button onClick={() => updateMutation.mutate({ bio: 'Updated bio' })}>
      Update Profile
    </button>
  );
}
```

### 4. Manage Applications

```typescript
'use client';
import { useApplicationsByJobId, useAcceptApplication } from '@/hooks/useApplications';

export function ApplicationList({ jobId }: { jobId: string }) {
  const { data: applications } = useApplicationsByJobId(jobId);
  const acceptMutation = useAcceptApplication();

  return (
    <div>
      {applications?.map(app => (
        <button 
          key={app.id}
          onClick={() => acceptMutation.mutate({ id: app.id })}
        >
          Accept {app.employeeName}
        </button>
      ))}
    </div>
  );
}
```

## Available Services

### Job Service

```typescript
import { jobService } from '@/service/job.service';

jobService.getAll()                      // Get all jobs
jobService.getPaginated(page, limit)    // Paginated jobs
jobService.getById(id)                   // Get single job
jobService.create(data)                  // Create job
jobService.update(id, data)              // Update job
jobService.delete(id)                    // Delete job
jobService.search(query)                 // Search jobs
jobService.getByCompany(name)            // Jobs by company
jobService.getStats()                    // Job statistics
jobService.close(id)                     // Close posting
jobService.reopen(id)                    // Reopen posting
```

### Employee Service

```typescript
import { employeeService, employerService } from '@/service/employee.service';

// EMPLOYEE
employeeService.getProfile(id)           // Get employee
employeeService.getMe()                  // Current employee
employeeService.getAll()                 // All employees
employeeService.updateProfile(id, data)  // Update profile
employeeService.updateMe(data)           // Update current
employeeService.delete(id)               // Delete account
employeeService.search(query)            // Search employees
employeeService.verifyEmail(token)       // Verify email
employeeService.updateProfilePicture()   // Upload picture

// EMPLOYER
employerService.getProfile(id)           // Get employer
employerService.getMe()                  // Current employer
employerService.updateProfile(id, data)  // Update profile
employerService.verifyCompany(id)        // Verify company
employerService.getPostedJobs(id)        // Posted jobs
employerService.getApplications(id)      // Received applications
```

### Application Service

```typescript
import { applicationService } from '@/service/application.service';

applicationService.getAll()              // All applications
applicationService.getById(id)           // Get application
applicationService.create(data)          // Submit application
applicationService.update(id, data)      // Update status
applicationService.delete(id)            // Delete application
applicationService.getByJobId(jobId)     // Job applications
applicationService.getByEmployeeId()     // Employee applications
applicationService.accept(id)            // Accept application
applicationService.reject(id)            // Reject application
applicationService.shortlist(id)         // Shortlist candidate
applicationService.scheduleInterview()   // Schedule interview
```

## Available Hooks

### useJobs Hook

```typescript
import { 
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useSearchJobs,
  useJobsByCompany,
  useJobStats,
  useCloseJob,
  useReopenJob 
} from '@/hooks/useJobs';

// Queries
useJobs(filters)                          // Fetch jobs with filters
useJobsPaginated(page, limit)            // Paginated fetch
useJob(id)                                // Single job
useSearchJobs(query)                      // Search jobs
useJobsByCompany(company)                 // Company jobs
useJobStats()                             // Statistics

// Mutations
useCreateJob()                            // Create
useUpdateJob(id)                          // Update
useDeleteJob()                            // Delete
useCloseJob()                             // Close posting
useReopenJob()                            // Reopen posting
```

### useEmployees Hook

```typescript
import {
  useEmployeeProfile,
  useCurrentEmployee,
  useEmployees,
  useUpdateEmployeeProfile,
  useUpdateCurrentEmployee,
  useDeleteEmployee,
  useSearchEmployees,
  useVerifyEmployeeEmail,
  useUpdateEmployeeProfilePicture,
  useEmployerProfile,
  useCurrentEmployer,
  useEmployers,
  useUpdateEmployerProfile,
  useUpdateCurrentEmployer,
  useDeleteEmployer,
  useEmployerPostedJobs,
  useEmployerApplications,
  useVerifyEmployerCompany
} from '@/hooks/useEmployees';
```

### useApplications Hook

```typescript
import {
  useApplications,
  useApplication,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
  useApplicationsByJobId,
  useApplicationsByEmployeeId,
  useMyApplications,
  useAcceptApplication,
  useRejectApplication,
  useShortlistApplication,
  useScheduleInterview,
  useApplicationStats
} from '@/hooks/useApplications';
```

## Key Features

✅ **Type Safety** - Full TypeScript with Zod validation
✅ **Automatic Caching** - React Query handles it
✅ **Error Handling** - Service-level error logging
✅ **Validation** - Input/output validation with Zod
✅ **Scalability** - Easy to add new services
✅ **Separation of Concerns** - Views, Controllers, Models separated

## Adding New Features

### Step 1: Create Model
```typescript
// src/models/feature/feature.model.ts
import { z } from 'zod';

export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Feature = z.infer<typeof featureSchema>;
```

### Step 2: Create Service
```typescript
// src/service/feature.service.ts
import api from '@/lib/api';

export const featureService = {
  getAll: async () => {
    const response = await api.get('/features');
    return response.data.data;
  },
};
```

### Step 3: Create Hook
```typescript
// src/hooks/useFeature.ts
import { useQuery } from '@tanstack/react-query';
import { featureService } from '@/service/feature.service';

export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => featureService.getAll(),
  });
};
```

### Step 4: Use in Component
```typescript
// src/app/features/page.tsx
'use client';
import { useFeatures } from '@/hooks/useFeature';

export default function Page() {
  const { data } = useFeatures();
  return <div>{data?.map(f => <div key={f.id}>{f.name}</div>)}</div>;
}
```

## Documentation

- **MVC_ARCHITECTURE.md** - Complete guide with diagrams
- **MVC_IMPLEMENTATION_SUMMARY.txt** - Full reference

## Next Steps

1. Implement Backend API Endpoints matching the service methods
2. Build UI Components using the hooks
3. Test with real data
4. Deploy!

## Ready to Go!

You have a complete MVC architecture with services for:
- Jobs ✅
- Employees & Employers ✅
- Applications ✅

Start building! 🚀
