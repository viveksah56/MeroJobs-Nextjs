
# Protected Routes & Multipart - Quick Reference

TL;DR version with copy-paste examples.

---

## Quick Answer

### For Protected Routes
✅ Token is **automatically** added by axios interceptor
✅ Just use `api.get()`, `api.post()`, etc.
✅ Nothing special to do

### For Multipart File Upload
✅ Create `FormData`
✅ Post it with `api.post()`
✅ Don't manually set Content-Type header
✅ Token is still automatically added

---

## Copy-Paste Examples

### 1. GET Protected Data
```typescript
// Automatically includes token
const jobs = await api.get('/jobs');
// Header: Authorization: Bearer {token}
```

### 2. POST JSON to Protected Route
```typescript
// Automatically includes token
const newJob = await api.post('/jobs', {
  title: 'Senior Dev',
  company: 'TechCorp'
});
// Header: Authorization: Bearer {token}
```

### 3. Upload File (Simple)
```typescript
// Create FormData with file
const formData = new FormData();
formData.append('file', fileInputElement.files[0]);

// Post it (token automatically added)
const response = await api.post('/employees/1/profile-picture', formData);
// ✅ Token: Bearer {token}
// ✅ Content-Type: multipart/form-data
```

### 4. Upload File + Additional Data
```typescript
const formData = new FormData();
formData.append('file', fileInputElement.files[0]);
formData.append('name', 'My Resume');
formData.append('type', 'RESUME');

const response = await api.post('/uploads', formData);
// ✅ File + Data sent together
// ✅ Token automatically included
```

### 5. Service Method for File Upload
```typescript
// src/service/employee.service.ts
export const employeeService = {
  uploadProfilePicture: async (employeeId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/employees/${employeeId}/profile-picture`,
      formData
      // ✅ Don't add 3rd parameter with headers
      // ✅ Axios handles everything automatically
    );
    
    return response.data.data;
  },
};
```

### 6. React Component with File Upload
```typescript
'use client';
import { useState } from 'react';
import { employeeService } from '@/service/employee.service';

export function UploadPicture({ employeeId }: { employeeId: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // ✅ Token automatically included
      const result = await employeeService.uploadProfilePicture(employeeId, file);
      console.log('Success:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
      disabled={uploading}
    />
  );
}
```

### 7. React Query Hook for File Upload
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUploadProfilePicture = (employeeId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => 
      employeeService.uploadProfilePicture(employeeId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['employee', employeeId] 
      });
    },
  });
};

// Usage:
const uploadMutation = useUploadProfilePicture('123');

const handleUpload = async (file: File) => {
  await uploadMutation.mutateAsync(file);
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
    {uploadMutation.isError && <p>Failed!</p>}
  </>
);
```

### 8. Upload with Progress
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await api.post('/upload', formData, {
  onUploadProgress: (progress) => {
    const percentCompleted = Math.round(
      (progress.loaded * 100) / progress.total
    );
    setProgress(percentCompleted);
    // Update UI with: 0% → 50% → 100%
  },
});
// ✅ Token still automatically added
```

### 9. Update Protected Resource (PUT)
```typescript
// Automatically includes token
const updated = await api.put('/employees/123', {
  firstName: 'John',
  lastName: 'Doe',
});
// Header: Authorization: Bearer {token}
```

### 10. Delete Protected Resource
```typescript
// Automatically includes token
await api.delete('/jobs/123');
// Header: Authorization: Bearer {token}
```

---

## What NOT to Do

### ❌ Don't manually set Authorization header
```typescript
// WRONG
const token = tokenManager.getAccessToken();
api.post('/jobs', data, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// RIGHT
api.post('/jobs', data);
// Token added automatically by interceptor
```

### ❌ Don't manually set Content-Type for multipart
```typescript
// WRONG
api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// RIGHT
api.post('/upload', formData);
// Axios sets Content-Type automatically
```

### ❌ Don't forget the FormData for file uploads
```typescript
// WRONG
api.post('/upload', { file: fileObject });
// This sends file as JSON (doesn't work)

// RIGHT
const formData = new FormData();
formData.append('file', fileObject);
api.post('/upload', formData);
// This sends as multipart/form-data (correct)
```

---

## Debugging

### Check if token is being sent:
```
DevTools → Network → Click request
→ Headers tab → Look for:
Authorization: Bearer eyJhbGc...

If not present:
- Token expired/not stored
- Interceptor not working
```

### Check if multipart is correct:
```
DevTools → Network → Click request
→ Headers tab → Look for:
Content-Type: multipart/form-data; boundary=...

If shows 'application/json':
- You manually set Content-Type (wrong)
- Remove manual headers for FormData
```

---

## Service Method Template

```typescript
// Copy this template for new endpoints

export const myService = {
  createItem: async (data: ItemCreate): Promise<Item> => {
    try {
      const validated = itemCreateSchema.parse(data);
      const response = await api.post<ItemResponse>('/items', validated);
      return response.data.data;
    } catch (error) {
      console.error('Create failed:', error);
      throw error;
    }
  },

  uploadFile: async (id: string, file: File): Promise<Item> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ItemResponse>(
        `/items/${id}/file`,
        formData
      );
      return response.data.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  updateItem: async (id: string, data: ItemUpdate): Promise<Item> => {
    try {
      const validated = itemUpdateSchema.parse(data);
      const response = await api.put<ItemResponse>(`/items/${id}`, validated);
      return response.data.data;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  },

  deleteItem: async (id: string): Promise<void> => {
    try {
      await api.delete(`/items/${id}`);
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  },
};
```

---

## Hook Template

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ItemCreate) => myService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItemFile = (itemId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => myService.uploadFile(itemId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    },
  });
};
```

---

## File Upload Validation

```typescript
export const validateFile = (file: File): string | null => {
  // Check size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return 'File too large (max 5MB)';
  }
  
  // Check type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type';
  }
  
  return null; // Valid
};

// Usage:
const error = validateFile(selectedFile);
if (error) {
  console.error(error);
  return;
}

await employeeService.uploadProfilePicture(id, selectedFile);
```

---

## Summary Table

| Task | Code | Token? | Multipart? |
|------|------|--------|-----------|
| GET data | `api.get('/path')` | Auto | - |
| POST JSON | `api.post('/path', data)` | Auto | No |
| PUT JSON | `api.put('/path', data)` | Auto | No |
| DELETE | `api.delete('/path')` | Auto | - |
| Upload file | `api.post('/path', formData)` | Auto | Auto |
| Multipart + data | `formData.append()` + `api.post()` | Auto | Auto |

---

## Remember

✅ **Token is automatic** - Don't worry about it
✅ **Multipart is automatic** - Just use FormData
✅ **Everything is secure** - HttpOnly cookies
✅ **Auto-refresh works** - 401 handled seamlessly
✅ **Just use the api instance** - Everything else is handled

**Just focus on your business logic!** 🚀

