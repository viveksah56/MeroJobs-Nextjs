# Axios Instance - Quick Reference Card

## The Chain (Copy This Pattern)

```
Component → Hook → Service → Axios Instance → Backend API
```

---

## 1. Service Layer Template

**File: `src/service/{feature}.service.ts`**

```typescript
import api from '@/lib/api';
import { YourType } from '@/lib/types/{feature}';

export const {feature}Service = {
  // GET - Fetch data
  getAll: async () => {
    const response = await api.get<YourType[]>('/{endpoint}');
    return response.data;
  },

  // GET with ID
  getById: async (id: string) => {
    const response = await api.get<YourType>(`/{endpoint}/${id}`);
    return response.data;
  },

  // POST - Create
  create: async (data: Partial<YourType>) => {
    const response = await api.post<YourType>('/{endpoint}', data);
    return response.data;
  },

  // PUT - Full update
  update: async (id: string, data: Partial<YourType>) => {
    const response = await api.put<YourType>(`/{endpoint}/${id}`, data);
    return response.data;
  },

  // DELETE - Remove
  delete: async (id: string) => {
    await api.delete(`/{endpoint}/${id}`);
  },
};
```

**Real Example:**
```typescript
import api from '@/lib/api';
import { Job } from '@/lib/types/job';

export const jobsService = {
  getAll: async () => {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  create: async (data: Omit<Job, 'id'>) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },
};
```

---

## 2. Custom Hook Template

**File: `src/hooks/use{Feature}.ts`**

```typescript
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { {feature}Service } from '@/service/{feature}.service';

export const use{Feature} = () => {
  const queryClient = useQueryClient();

  // GET request with React Query
  const {featureName}Query = useQuery({
    queryKey: ['{feature}'],
    queryFn: () => {feature}Service.getAll(),
  });

  // POST request with React Query
  const create{Feature}Mutation = useMutation({
    mutationFn: (data) => {feature}Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{feature}'] });
    },
  });

  return {
    {featureName}: {featureName}Query.data,
    isLoading: {featureName}Query.isLoading,
    create: create{Feature}Mutation.mutate,
    isCreating: create{Feature}Mutation.isPending,
    error: {featureName}Query.error,
  };
};
```

**Real Example:**
```typescript
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/service/jobs.service';

export const useJobs = () => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsService.getAll(),
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => jobsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    jobs: jobsQuery.data,
    isLoading: jobsQuery.isLoading,
    createJob: createJobMutation.mutate,
  };
};
```

---

## 3. Component Usage Template

**File: `src/app/{route}/page.tsx` or `src/views/{component}.tsx`**

```typescript
'use client';

import { use{Feature} } from '@/hooks/use{feature}';

export function {Component}() {
  const { {featureName}, isLoading, create } = use{Feature}();

  const handleSubmit = async (data) => {
    create(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Use the data */}
      {Array.isArray({featureName}) && {featureName}.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

**Real Example:**
```typescript
'use client';

import { useJobs } from '@/hooks/useJobs';

export function JobsPage() {
  const { jobs, isLoading, createJob } = useJobs();

  const handleCreate = (data) => {
    createJob(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {jobs?.map((job) => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

---

## Axios Methods Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `api.get()` | Fetch data | `api.get('/jobs')` |
| `api.post()` | Create data | `api.post('/jobs', data)` |
| `api.put()` | Full update | `api.put('/jobs/1', data)` |
| `api.patch()` | Partial update | `api.patch('/jobs/1', data)` |
| `api.delete()` | Remove data | `api.delete('/jobs/1')` |

---

## GET with Query Parameters

```typescript
// Single parameter
const response = await api.get('/jobs', {
  params: { page: 1 }
});
// URL: /jobs?page=1

// Multiple parameters
const response = await api.get('/jobs', {
  params: { page: 1, limit: 10, search: 'senior' }
});
// URL: /jobs?page=1&limit=10&search=senior
```

---

## Error Handling

```typescript
import axios from 'axios';

try {
  const response = await api.post('/jobs', data);
  console.log('Success:', response.data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  } else {
    console.error('Error:', error);
  }
}
```

---

## TypeScript Types

```typescript
// Request type
interface LoginRequest {
  email: string;
  password: string;
}

// Response type
interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

// Service method
const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};
```

---

## Complete Example: Create a User Feature

### Step 1: Create Type
**`src/lib/types/user.ts`**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
```

### Step 2: Create Service
**`src/service/user.service.ts`**
```typescript
import api from '@/lib/api';
import { User, CreateUserRequest } from '@/lib/types/user';

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};
```

### Step 3: Create Hook
**`src/hooks/useUsers.ts`**
```typescript
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/service/user.service';
import { CreateUserRequest } from '@/lib/types/user';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    error: usersQuery.error,
  };
};
```

### Step 4: Use in Component
**`src/app/users/page.tsx`**
```typescript
'use client';

import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
  const { users, isLoading, createUser } = useUsers();

  const handleAdd = () => {
    createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
  };

  return (
    <div>
      <button onClick={handleAdd}>Add User</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users?.map((user) => (
            <li key={user.id}>{user.name} ({user.email})</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## File Locations Quick Map

```
📦 Project
├── src/
│   ├── lib/
│   │   ├── api.ts                    ← Axios instance (modify here for global settings)
│   │   └── types/
│   │       ├── auth.ts               ← Auth types
│   │       ├── user.ts               ← User types (create for new features)
│   │       └── job.ts                ← Job types
│   ├── service/
│   │   ├── auth.service.ts           ← Auth API calls
│   │   ├── user.service.ts           ← User API calls (create for new features)
│   │   └── job.service.ts            ← Job API calls
│   ├── hooks/
│   │   ├── useAuth.ts                ← Auth hook
│   │   ├── useUsers.ts               ← User hook (create for new features)
│   │   └── useJobs.ts                ← Job hook
│   └── views/
│       ├── auth/
│       │   └── login-form.tsx        ← Uses useAuth
│       ├── users/
│       │   └── user-form.tsx         ← Uses useUsers
│       └── jobs/
│           └── job-list.tsx          ← Uses useJobs
```

---

## When to Use Each File Type

| File | Purpose | Example |
|------|---------|---------|
| `src/lib/api.ts` | Configure Axios once, globally | Base URL, interceptors, headers |
| `src/lib/types/` | Define data shapes | `User`, `Job`, `LoginRequest` |
| `src/service/` | Make API calls | `api.get()`, `api.post()` |
| `src/hooks/` | Wrap API in React Query | `useQuery`, `useMutation` |
| `src/views/` | Use hooks in UI | `onClick`, form submissions |

---

## Summary

**Always Remember:**

1. **Never call Axios directly in components**
2. **Always create a Service** for API calls
3. **Always create a Hook** to wrap the Service
4. **Always use the Hook** in Components

**Order of creation:**
1. Define type in `src/lib/types/{feature}.ts`
2. Create API calls in `src/service/{feature}.service.ts`
3. Wrap in hook in `src/hooks/use{Feature}.ts`
4. Use hook in component

**Request flow:**
```
Component → Hook → Service → Axios → Backend
Response:
Backend → Axios → Service → Hook → Component
```

