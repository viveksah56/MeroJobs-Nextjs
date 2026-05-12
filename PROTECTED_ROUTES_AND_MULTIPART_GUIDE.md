
# Protected Routes & Multipart File Upload Guide

Complete guide for handling JWT tokens in protected routes and file uploads with multipart/form-data.

---

## Overview

Your frontend needs to:
1. **Send tokens for protected routes** - Automatically done by axios interceptor
2. **Send multipart data for file uploads** - Special handling needed
3. **Handle both together** - Token + file upload

---

## Part 1: Protected Routes (Already Implemented)

### How It Works

The axios instance **automatically** adds your JWT token to all requests:

```typescript
// src/lib/api.ts - Request Interceptor
api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

### What This Means

Every request you make with the axios instance automatically includes:

```
Headers: {
  'Authorization': 'Bearer {your_jwt_token}',
  'Content-Type': 'application/json'
}
```

### Example: Protected Route Request

```typescript
// This automatically includes your token
const response = await api.get('/employees/me');
// GET /employees/me
// Header: Authorization: Bearer eyJhbGc...
```

### Protected Routes List

All these routes automatically include your token:

```typescript
// GET requests (read data)
api.get('/employees/me')           // Get current employee
api.get('/jobs')                   // List jobs
api.get('/jobs/1')                 // Get specific job
api.get('/applications')           // Get applications
api.get('/employers/me')           // Get current employer

// POST requests (create data)
api.post('/jobs', jobData)         // Create job
api.post('/applications', appData) // Submit application
api.post('/employees/verify-email', { token })

// PUT requests (update data)
api.put('/employees/1', updateData)
api.put('/jobs/1', updateData)

// DELETE requests (delete data)
api.delete('/jobs/1')
api.delete('/employees/1')
```

### Important: No Manual Token Adding Needed

```typescript
// ❌ DON'T DO THIS - Token added automatically
const token = tokenManager.getAccessToken();
api.get('/jobs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ DO THIS - Much simpler
api.get('/jobs');
```

---

## Part 2: Multipart Form Data (File Uploads)

### The Problem

When uploading files, you need to send `multipart/form-data` instead of `application/json`:

```
Regular Request:
Content-Type: application/json
{ "title": "My Job" }

File Upload Request:
Content-Type: multipart/form-data
------boundary123
Content-Disposition: form-data; name="file"

[binary file data]
------boundary123
```

### Solution: Create FormData

```typescript
// Create FormData for file uploads
const formData = new FormData();
formData.append('file', fileObject);
formData.append('name', 'Profile Picture');
```

### Important: Don't Set Content-Type Header

When using FormData, **don't** manually set `Content-Type`:

```typescript
// ❌ WRONG - This breaks multipart
api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// ✅ CORRECT - Let axios handle it
api.post('/upload', formData);
// Axios automatically:
// 1. Sets Content-Type: multipart/form-data
// 2. Sets correct boundary
// 3. Encodes file properly
// 4. Adds your token
```

### How Axios Handles Multipart Automatically

```typescript
// When you post FormData
api.post('/upload', formData);

// Axios does:
// 1. Detects FormData object
// 2. Sets Content-Type: multipart/form-data (automatically)
// 3. Adds token to Authorization header (via interceptor)
// 4. Sends with correct encoding

// Final request:
POST /upload
Headers: {
  'Authorization': 'Bearer {token}',
  'Content-Type': 'multipart/form-data; boundary=----boundary123'
}
Body: [multipart encoded data with file]
```

---

## Part 3: Complete Examples

### Example 1: Upload Profile Picture

```typescript
// src/service/employee.service.ts

export const employeeService = {
  // Upload profile picture
  uploadProfilePicture: async (employeeId: string, file: File): Promise<Employee> => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'PROFILE_PICTURE');
      
      // Post to backend
      // ✅ Token automatically added by interceptor
      // ✅ Content-Type automatically set to multipart/form-data
      const response = await api.post<EmployeeResponse>(
        `/employees/${employeeId}/profile-picture`,
        formData
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      throw error;
    }
  },

  // Update profile (regular JSON)
  updateProfile: async (employeeId: string, data: EmployeeProfile): Promise<Employee> => {
    try {
      // Validate against schema
      const validated = employeeUpdateSchema.parse(data);
      
      // Post to backend
      // ✅ Token automatically added
      // ✅ Content-Type: application/json
      const response = await api.put<EmployeeResponse>(
        `/employees/${employeeId}`,
        validated
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },
};
```

### Example 2: Upload Multiple Files

```typescript
// Upload resume and cover letter
const formData = new FormData();
formData.append('resume', resumeFile);           // File object
formData.append('coverLetter', coverLetterFile); // File object
formData.append('jobId', '123');                 // Regular data

const response = await api.post('/applications', formData);
// ✅ Token automatically added
// ✅ Multipart automatically handled
```

### Example 3: Upload with Progress

```typescript
// Track upload progress
const formData = new FormData();
formData.append('file', largeFile);

const response = await api.post('/upload', formData, {
  onUploadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload: ${percentCompleted}%`);
      // Update UI with progress
    }
  },
});
// ✅ Token still automatically added
// ✅ Progress tracking works
```

### Example 4: React Component with File Upload

```typescript
// views/employees/profile-picture-upload.tsx
'use client';

import { useState } from 'react';
import { employeeService } from '@/service/employee.service';

export function ProfilePictureUpload({ employeeId }: { employeeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File too large. Max 5MB.');
        return;
      }
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Must be an image file.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    
    try {
      // Upload file
      // ✅ Token automatically included
      // ✅ Multipart handled automatically
      const updatedEmployee = await employeeService.uploadProfilePicture(
        employeeId,
        file
      );
      
      console.log('Upload success:', updatedEmployee);
      setFile(null);
      // Show success message
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <label>
        Select Picture:
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          required
        />
      </label>
      
      {file && <p>Selected: {file.name}</p>}
      
      <button type="submit" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Example 5: useEmployees Hook

```typescript
// hooks/useEmployees.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/service/employee.service';

export const useUpdateEmployeeProfilePicture = (employeeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => employeeService.uploadProfilePicture(employeeId, file),
    onSuccess: (updatedEmployee) => {
      // Invalidate and refetch employee data
      queryClient.invalidateQueries({ 
        queryKey: ['employee', employeeId] 
      });
      
      // Or update directly
      queryClient.setQueryData(['employee', employeeId], updatedEmployee);
    },
  });
};

// Usage in component
export function MyComponent() {
  const uploadMutation = useUpdateEmployeeProfilePicture('123');
  
  const handleUpload = async (file: File) => {
    try {
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <>
      <input 
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploadMutation.isPending}
      />
      {uploadMutation.isPending && <p>Uploading...</p>}
      {uploadMutation.isError && <p>Upload failed</p>}
    </>
  );
}
```

---

## Part 4: Backend Implementation (Java)

### File Upload Endpoint

```java
@RestController
@RequestMapping("/employees")
public class EmployeeController {

  @PostMapping("/{id}/profile-picture")
  @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
  public ResponseEntity<?> uploadProfilePicture(
    @PathVariable String id,
    @RequestParam("file") MultipartFile file,
    @AuthenticationPrincipal UserDetails userDetails
  ) throws IOException {
    
    // Validate file
    if (file.isEmpty()) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, null, "File is empty"));
    }
    
    // Check file size (5MB max)
    if (file.getSize() > 5 * 1024 * 1024) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, null, "File too large"));
    }
    
    // Check file type
    if (!file.getContentType().startsWith("image/")) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, null, "Must be image"));
    }
    
    // Save file (to disk, S3, etc.)
    String fileUrl = fileStorageService.saveFile(file);
    
    // Update employee picture
    Employee employee = employeeService.updateProfilePicture(id, fileUrl);
    
    return ResponseEntity.ok(
      new ApiResponse<>(true, employee, "Picture uploaded")
    );
  }
}
```

### Spring Boot Configuration

```properties
# application.properties

# File upload settings
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB

# Temporary file location
spring.servlet.multipart.location=/tmp
```

### Multipart Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  
  @Bean
  public MultipartConfigElement multipartConfigElement() {
    MultipartConfigFactory factory = new MultipartConfigFactory();
    
    factory.setMaxFileSize(DataSize.ofMegabytes(5));
    factory.setMaxRequestSize(DataSize.ofMegabytes(10));
    
    return factory.createMultipartConfig();
  }
}
```

---

## Part 5: Common Patterns

### Pattern 1: Simple Protected GET

```typescript
// Fetch protected data
const response = await api.get('/jobs/1');
// ✅ Token in header
// ✅ Content-Type: application/json
// ✅ Response validated by interceptor on 401
```

### Pattern 2: Protected POST (JSON Data)

```typescript
// Send JSON data to protected route
const jobData = { title: 'Senior Dev', company: 'TechCorp' };
const response = await api.post('/jobs', jobData);
// ✅ Token in header
// ✅ Content-Type: application/json
// ✅ Auto-refresh on 401
```

### Pattern 3: Protected POST (Multipart)

```typescript
// Send file + data to protected route
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Resume');

const response = await api.post('/uploads', formData);
// ✅ Token in header
// ✅ Content-Type: multipart/form-data (auto)
// ✅ File sent with form data
// ✅ Auto-refresh on 401
```

### Pattern 4: Protected PUT (JSON Data)

```typescript
// Update protected resource
const updateData = { firstName: 'John', lastName: 'Doe' };
const response = await api.put('/employees/1', updateData);
// ✅ Token in header
// ✅ Auto-refresh on 401
```

### Pattern 5: Protected DELETE

```typescript
// Delete protected resource
const response = await api.delete('/jobs/1');
// ✅ Token in header
// ✅ Auto-refresh on 401
```

---

## Part 6: Error Handling

### 401 Unauthorized (Auto-Handled)

```
Request fails with 401
↓
Axios interceptor catches it
↓
Calls /auth/refresh automatically
↓
Gets new token
↓
Retries original request
↓
Request succeeds
↓
User never sees 401 (usually)
```

### 403 Forbidden (Not Auto-Handled)

```
Request fails with 403
↓
User doesn't have permission
↓
Not auto-fixed
↓
Show error message
```

### Service Implementation

```typescript
export const jobService = {
  createJob: async (data: JobCreateRequest): Promise<Job> => {
    try {
      const validated = jobCreateSchema.parse(data);
      
      // Make request (token auto-added)
      const response = await api.post<JobResponse>('/jobs', validated);
      
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          // 401: Token issue (auto-handled)
          // This usually won't happen because interceptor retries
        } else if (error.response?.status === 403) {
          // 403: Permission denied (not auto-handled)
          throw new Error('You do not have permission to create jobs');
        } else if (error.response?.status === 400) {
          // 400: Validation error
          throw new Error(error.response.data?.message || 'Invalid data');
        }
      }
      
      throw error;
    }
  },
};
```

---

## Part 7: Debugging

### Check Token is Sent

```typescript
// In browser DevTools:
// 1. Network tab
// 2. Click any API request
// 3. Headers tab
// 4. Look for: Authorization: Bearer eyJhbGc...

// If not present:
// - Token might be expired
// - Token not stored in cookies
// - Interceptor not working
```

### Check Multipart is Sent

```typescript
// In browser DevTools:
// 1. Network tab
// 2. Click file upload request
// 3. Request headers should show:
//    Content-Type: multipart/form-data; boundary=...
//
// If shows 'application/json':
// - Content-Type was manually set (wrong)
// - Don't set headers when using FormData
```

### Test Token Refresh

```typescript
// Manually trigger token refresh
import { authService } from '@/service/auth.service';

const newToken = await authService.refreshToken();
console.log('New token:', newToken);

// Or check token expiry
import { tokenManager } from '@/lib/token';

const token = tokenManager.getAccessToken();
if (token) {
  const expirySeconds = tokenManager.getTimeUntilExpiry(token);
  console.log(`Token expires in ${expirySeconds} seconds`);
}
```

---

## Part 8: Java Backend Checklist

- [ ] POST /auth/login returns `{ token, refreshToken, user }`
- [ ] POST /auth/refresh returns `{ token, refreshToken }`
- [ ] Protected routes require `Authorization: Bearer {token}` header
- [ ] POST /employees/{id}/profile-picture accepts multipart/form-data
- [ ] File size limit set (max 5MB)
- [ ] File type validation (only images)
- [ ] Return proper HTTP status codes (401, 403, 400)
- [ ] All file upload endpoints require authentication
- [ ] multipart.max-file-size configured
- [ ] File storage implemented (disk, S3, cloud)

---

## Summary

### Protected Routes
- ✅ Token automatically added by axios interceptor
- ✅ No manual header setting needed
- ✅ Works for GET, POST, PUT, DELETE
- ✅ Auto-refresh on 401 error

### Multipart File Upload
- ✅ Create FormData with file
- ✅ Don't set Content-Type header
- ✅ Axios handles multipart automatically
- ✅ Token still automatically added
- ✅ Same auto-refresh on 401

### Best Practices
1. Always use `api.*` methods (automatically includes token)
2. Never manually set Authorization header
3. Never manually set Content-Type for multipart
4. Let axios/interceptors handle all HTTP details
5. Focus on business logic, not HTTP mechanics

---

## Files to Read

1. `src/lib/api.ts` - Axios interceptors
2. `src/lib/token.ts` - Token management
3. `src/service/*.service.ts` - Service examples
4. `src/hooks/*.ts` - React Query hooks

Everything is already implemented and ready to use!

