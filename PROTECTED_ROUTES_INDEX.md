
# Protected Routes & Multipart - Documentation Index

Quick navigation for all guides on handling JWT tokens and file uploads.

---

## Quick Links

### I Want the Quick Answer (2 minutes)
**Read:** `PROTECTED_ROUTES_QUICK_REFERENCE.md`
- Copy-paste examples
- Common patterns
- What NOT to do

### I Want to Understand Everything (30 minutes)
**Read:** `PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md`
- Complete explanation
- Architecture diagrams
- Backend requirements
- Debugging tips

### I Want Code Examples (10 minutes)
**Read:** `PROTECTED_ROUTES_EXAMPLES.ts`
- Service examples
- Component examples
- Hook examples
- Copy-paste templates

### I Want a Summary (15 minutes)
**Read:** `PROTECTED_ROUTES_AND_MULTIPART_SUMMARY.md`
- Overview
- Real-world examples
- Common mistakes
- Checklist

---

## By Use Case

### Use Case 1: Simple Protected GET Request

```typescript
// Question: How do I fetch data from a protected endpoint?
// Answer: Just use api.get()

api.get('/jobs');
// ✅ Token automatically added

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 1
```

### Use Case 2: POST JSON Data to Protected Route

```typescript
// Question: How do I create/update data on protected endpoint?
// Answer: Use api.post() or api.put()

api.post('/jobs', { title: 'Senior Dev' });
// ✅ Token automatically added

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 2
```

### Use Case 3: Upload Single File

```typescript
// Question: How do I upload a file?
// Answer: Create FormData, append file, post it

const formData = new FormData();
formData.append('file', file);
api.post('/upload', formData);
// ✅ Token + multipart automatic

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 3
```

### Use Case 4: Upload File + Form Data Together

```typescript
// Question: How do I send file AND form data?
// Answer: Append both to FormData

const formData = new FormData();
formData.append('file', file);
formData.append('jobId', '123');
formData.append('name', 'Resume');
api.post('/applications', formData);
// ✅ Everything sent together

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 4
```

### Use Case 5: React Component File Upload

```typescript
// Question: How do I integrate file upload in a component?
// Answer: Use state + form + service call

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  
  const handleUpload = async () => {
    if (!file) return;
    const result = await employeeService.uploadProfilePicture('id', file);
  };
  
  return <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />;
}

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 6
```

### Use Case 6: React Query Hook File Upload

```typescript
// Question: How do I use React Query for file uploads?
// Answer: useMutation + invalidateQueries

export const useUploadFile = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => employeeService.uploadFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', id] });
    }
  });
};

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 7
```

### Use Case 7: Upload with Progress Bar

```typescript
// Question: How do I show upload progress?
// Answer: Use onUploadProgress option

api.post('/upload', formData, {
  onUploadProgress: (progress) => {
    const percent = (progress.loaded / progress.total) * 100;
    setProgress(percent);
  }
});

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 8
```

### Use Case 8: What NOT to Do

```typescript
// ❌ Common Mistakes to Avoid:

// 1. Manual Authorization header
// ❌ api.get('/jobs', { headers: { Authorization: ... } })
// ✅ api.get('/jobs')

// 2. Manual Content-Type for FormData
// ❌ api.post('/upload', formData, { headers: { 'Content-Type': '...' } })
// ✅ api.post('/upload', formData)

// 3. Not using FormData for file
// ❌ api.post('/upload', { file: fileObject })
// ✅ const fd = new FormData(); fd.append('file', file); api.post(..., fd)

// 4. Using fetch instead of api
// ❌ fetch('/jobs') // Token not added
// ✅ api.get('/jobs') // Token auto-added

// Read: PROTECTED_ROUTES_QUICK_REFERENCE.md → What NOT to Do
```

---

## Documentation Files

| File | Purpose | Read Time | Best For |
|------|---------|-----------|----------|
| **PROTECTED_ROUTES_QUICK_REFERENCE.md** | TL;DR version | 5 min | Quick answers + copy-paste |
| **PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md** | Complete guide | 30 min | Deep understanding |
| **PROTECTED_ROUTES_EXAMPLES.ts** | Code examples | 10 min | Implementation |
| **PROTECTED_ROUTES_AND_MULTIPART_SUMMARY.md** | Overview | 15 min | Learning + checklist |
| **PROTECTED_ROUTES_INDEX.md** | This file | 5 min | Navigation |

---

## Key Files in Code

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Axios instance with interceptors |
| `src/lib/token.ts` | Token management utilities |
| `src/service/*.service.ts` | Business logic with api calls |
| `src/hooks/*.ts` | React Query hooks |
| `src/views/*.tsx` | React components |

---

## Common Questions

### Q: Do I need to manually add the token?
**A:** No! Request interceptor does it automatically.
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → Part 1

### Q: How do I upload a file?
**A:** Create FormData, append file, post it with api.post()
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 3

### Q: Can I send file + data together?
**A:** Yes! Append both to FormData
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 4

### Q: How do I show upload progress?
**A:** Use onUploadProgress option
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → Example 8

### Q: What if token expires?
**A:** Response interceptor handles it automatically. Request is retried.
- **Read:** PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md → Error Handling

### Q: Should I manually set Authorization header?
**A:** NO! Interceptor adds it automatically.
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → What NOT to Do

### Q: Should I manually set Content-Type for FormData?
**A:** NO! Axios sets it automatically. It breaks if you do.
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → What NOT to Do

### Q: How do I debug if token isn't being sent?
**A:** Check DevTools Network tab → Headers
- **Read:** PROTECTED_ROUTES_AND_MULTIPART_SUMMARY.md → Debugging

### Q: How do I validate file size?
**A:** Check file.size before upload
- **Read:** PROTECTED_ROUTES_QUICK_REFERENCE.md → File Upload Validation

### Q: What should my Java backend do?
**A:** Validate Authorization header and handle multipart
- **Read:** PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md → Backend Implementation

---

## Learning Path

### Path 1: I Just Want to Code (5 minutes)
1. Read: PROTECTED_ROUTES_QUICK_REFERENCE.md
2. Copy: code examples for your use case
3. Start: coding

### Path 2: I Want Full Understanding (45 minutes)
1. Read: PROTECTED_ROUTES_AND_MULTIPART_GUIDE.md (30 min)
2. Read: PROTECTED_ROUTES_QUICK_REFERENCE.md (5 min)
3. Study: PROTECTED_ROUTES_EXAMPLES.ts (10 min)
4. Code: implement with understanding

### Path 3: I'm Debugging an Issue (15 minutes)
1. Read: PROTECTED_ROUTES_AND_MULTIPART_SUMMARY.md → Debugging Checklist
2. Check: DevTools Network tab
3. Read: relevant error section
4. Fix: issue

### Path 4: I'm Teaching Someone (1 hour)
1. Share: PROTECTED_ROUTES_AND_MULTIPART_SUMMARY.md
2. Show: PROTECTED_ROUTES_EXAMPLES.ts
3. Explain: 3 Core Concepts section
4. Let them: practice with examples

---

## Quick Command Reference

### GET Protected Data
```typescript
api.get('/jobs');
```

### POST JSON to Protected Route
```typescript
api.post('/jobs', { title: 'Senior Dev' });
```

### PUT JSON to Protected Route
```typescript
api.put('/jobs/1', { title: 'Updated' });
```

### DELETE Protected Resource
```typescript
api.delete('/jobs/1');
```

### Upload Single File
```typescript
const formData = new FormData();
formData.append('file', file);
api.post('/upload', formData);
```

### Upload Multiple Files
```typescript
const formData = new FormData();
formData.append('file1', file1);
formData.append('file2', file2);
api.post('/upload', formData);
```

### Upload File + Data
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('jobId', '123');
api.post('/upload', formData);
```

### Show Upload Progress
```typescript
api.post('/upload', formData, {
  onUploadProgress: (p) => setProgress((p.loaded / p.total) * 100)
});
```

---

## Checklist: Am I Doing It Right?

- [ ] I'm using `api.*` methods (not fetch)
- [ ] I'm NOT manually setting Authorization header
- [ ] I'm using FormData for file uploads
- [ ] I'm NOT manually setting Content-Type header for FormData
- [ ] I'm creating FormData BEFORE posting (not as string)
- [ ] I'm appending files to FormData with `.append()`
- [ ] I'm validating file size/type on client
- [ ] I'm using services for API calls (not direct in components)
- [ ] I'm using hooks for React state management
- [ ] I'm handling errors with try/catch

---

## Summary

**Protected Routes:** Token automatically added by interceptor
```typescript
api.get('/jobs'); // Token included
```

**File Upload:** FormData + post it
```typescript
const fd = new FormData();
fd.append('file', file);
api.post('/upload', fd); // Token + multipart automatic
```

**That's it!** Read the relevant guide for your use case and you're good to go.

---

**Happy coding!** 🚀

