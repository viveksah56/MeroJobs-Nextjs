
# Java Backend Endpoints Checklist

This is a quick reference for all API endpoints your Java backend must implement for the frontend MVC pattern to work.

## Authentication Endpoints

### 1. Login
```
Endpoint: POST /auth/login
Frontend: authService.login(email, password)
Hook: useAuth().login()

Request:
{
  "email": "user@test.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "123",
      "email": "user@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  },
  "message": "Login successful"
}

Error (401):
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

- [ ] Implemented

### 2. Register
```
Endpoint: POST /auth/register
Frontend: authService.register(data)

Request:
{
  "email": "user@test.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "123",
    "email": "user@test.com",
    "message": "Registration successful"
  }
}
```

- [ ] Implemented

### 3. Logout
```
Endpoint: POST /auth/logout
Frontend: authService.logout()
Hook: useAuth().logout()

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

- [ ] Implemented

### 4. Refresh Token
```
Endpoint: POST /auth/refresh
Frontend: authService.refreshToken(token)

Request:
{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

- [ ] Implemented

### 5. Verify Email
```
Endpoint: POST /auth/verify-email
Frontend: employeeService.verifyEmail(token)

Request:
{
  "token": "verification_token"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

- [ ] Implemented

---

## Job Endpoints

### 1. Get All Jobs (Paginated)
```
Endpoint: GET /jobs
Frontend: jobService.getAll() or jobService.getPaginated(page, limit)
Hook: useJobs() or useJobsPaginated(page, limit)

Query Params:
- page: number (default 1)
- limit: number (default 10)
- status: ACTIVE | CLOSED | DRAFT | ARCHIVED
- employmentType: FULL_TIME | PART_TIME | CONTRACT | TEMPORARY
- minSalary: number
- maxSalary: number
- company: string
- location: string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Senior Developer",
      "company": "TechCorp",
      "location": "Kathmandu",
      "description": "...",
      "salaryMin": 50000,
      "salaryMax": 80000,
      "employmentType": "FULL_TIME",
      "status": "ACTIVE",
      "experienceRequired": 3,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "message": "Jobs retrieved successfully"
}
```

- [ ] Implemented

### 2. Get Single Job
```
Endpoint: GET /jobs/:id
Frontend: jobService.getById(id)
Hook: useJob(id)

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Senior Developer",
    "company": "TechCorp",
    "location": "Kathmandu",
    "description": "...",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "employmentType": "FULL_TIME",
    "status": "ACTIVE",
    "experienceRequired": 3,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

- [ ] Implemented

### 3. Create Job
```
Endpoint: POST /jobs
Frontend: jobService.create(data)
Hook: useCreateJob()
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "title": "Senior Developer",
  "company": "TechCorp",
  "location": "Kathmandu",
  "description": "Looking for experienced developer",
  "salaryMin": 50000,
  "salaryMax": 80000,
  "employmentType": "FULL_TIME",
  "experienceRequired": 3
}

Response (201):
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Senior Developer",
    "company": "TechCorp",
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Job created successfully"
}
```

- [ ] Implemented

### 4. Update Job
```
Endpoint: PUT /jobs/:id
Frontend: jobService.update(id, data)
Hook: useUpdateJob(id)
Auth: Required (EMPLOYER who owns job, ADMIN)

Request: Same as Create

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Senior Developer",
    "status": "ACTIVE",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Job updated successfully"
}
```

- [ ] Implemented

### 5. Delete Job
```
Endpoint: DELETE /jobs/:id
Frontend: jobService.delete(id)
Hook: useDeleteJob()
Auth: Required (EMPLOYER who owns job, ADMIN)

Response (200):
{
  "success": true,
  "message": "Job deleted successfully"
}
```

- [ ] Implemented

### 6. Search Jobs
```
Endpoint: GET /jobs/search
Frontend: jobService.search(query)
Hook: useSearchJobs(query)

Query Params:
- q: search query (title, company, location, description)

Response (200):
{
  "success": true,
  "data": [
    { "id": "1", "title": "...", ... }
  ]
}
```

- [ ] Implemented

### 7. Get Jobs by Company
```
Endpoint: GET /jobs/company/:name
Frontend: jobService.getByCompany(name)
Hook: useJobsByCompany(name)

Response (200):
{
  "success": true,
  "data": [
    { "id": "1", "title": "...", ... }
  ]
}
```

- [ ] Implemented

### 8. Get Job Statistics
```
Endpoint: GET /jobs/stats
Frontend: jobService.getStats()
Hook: useJobStats()

Response (200):
{
  "success": true,
  "data": {
    "totalJobs": 100,
    "activeJobs": 75,
    "closedJobs": 25,
    "jobsByEmploymentType": {
      "FULL_TIME": 60,
      "PART_TIME": 15
    },
    "jobsByLocation": {
      "Kathmandu": 50,
      "Pokhara": 30
    }
  }
}
```

- [ ] Implemented

### 9. Close Job
```
Endpoint: POST /jobs/:id/close
Frontend: jobService.close(id)
Hook: useCloseJob()
Auth: Required (EMPLOYER who owns job, ADMIN)

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "CLOSED" },
  "message": "Job closed successfully"
}
```

- [ ] Implemented

### 10. Reopen Job
```
Endpoint: POST /jobs/:id/reopen
Frontend: jobService.reopen(id)
Hook: useReopenJob()
Auth: Required (EMPLOYER who owns job, ADMIN)

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "ACTIVE" },
  "message": "Job reopened successfully"
}
```

- [ ] Implemented

---

## Employee Endpoints

### 1. Get Employee Profile
```
Endpoint: GET /employees/:id
Frontend: employeeService.getProfile(id)
Hook: useEmployeeProfile(id)

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@test.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer",
    "profilePicture": "url",
    "skills": ["React", "Node.js"],
    "experience": 3,
    "status": "ACTIVE",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

- [ ] Implemented

### 2. Get Current Employee Profile
```
Endpoint: GET /employees/me
Frontend: employeeService.getMe()
Hook: useCurrentEmployee()
Auth: Required (EMPLOYEE)

Response (200): Same as above
```

- [ ] Implemented

### 3. Get All Employees
```
Endpoint: GET /employees
Frontend: employeeService.getAll(page, limit)
Hook: useEmployees(page, limit)

Query Params:
- page: number (default 1)
- limit: number (default 10)

Response (200):
{
  "success": true,
  "data": [
    { "id": "1", "email": "...", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

- [ ] Implemented

### 4. Update Employee Profile
```
Endpoint: PUT /employees/:id
Frontend: employeeService.updateProfile(id, data)
Hook: useUpdateEmployeeProfile(id)
Auth: Required (EMPLOYEE who owns profile, ADMIN)

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience": 4
}

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "John",
    "bio": "Updated bio",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

- [ ] Implemented

### 5. Update Current Employee Profile
```
Endpoint: PUT /employees/me
Frontend: employeeService.updateMe(data)
Hook: useUpdateCurrentEmployee()
Auth: Required (EMPLOYEE)

Request: Same as above
Response (200): Same as above
```

- [ ] Implemented

### 6. Delete Employee
```
Endpoint: DELETE /employees/:id
Frontend: employeeService.delete(id)
Hook: useDeleteEmployee()
Auth: Required (EMPLOYEE, ADMIN)

Response (200):
{
  "success": true,
  "message": "Employee account deleted successfully"
}
```

- [ ] Implemented

### 7. Search Employees
```
Endpoint: GET /employees/search
Frontend: employeeService.search(query)
Hook: useSearchEmployees(query)

Query Params:
- q: search query (name, email, bio, skills)

Response (200): List of employees
```

- [ ] Implemented

### 8. Verify Employee Email
```
Endpoint: POST /employees/verify-email
Frontend: employeeService.verifyEmail(token)
Hook: useVerifyEmployeeEmail()

Request:
{
  "token": "verification_token"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

- [ ] Implemented

### 9. Resend Verification Email
```
Endpoint: POST /employees/resend-verification
Frontend: employeeService.resendVerificationEmail(email)
Hook: useResendVerificationEmail()

Request:
{
  "email": "user@test.com"
}

Response (200):
{
  "success": true,
  "message": "Verification email sent"
}
```

- [ ] Implemented

### 10. Update Employee Picture
```
Endpoint: POST /employees/:id/profile-picture
Frontend: employeeService.updateProfilePicture(id, formData)
Hook: useUpdateEmployeeProfilePicture(id)
Auth: Required (EMPLOYEE, ADMIN)

Request: FormData with file

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "profilePicture": "url"
  },
  "message": "Profile picture updated"
}
```

- [ ] Implemented

---

## Employer Endpoints

### 1. Get Employer Profile
```
Endpoint: GET /employers/:id
Frontend: employerService.getProfile(id)
Hook: useEmployerProfile(id)

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "companyName": "TechCorp",
    "email": "contact@techcorp.com",
    "website": "https://techcorp.com",
    "description": "Company description",
    "logo": "url",
    "location": "Kathmandu",
    "employeeCount": 50,
    "verified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

- [ ] Implemented

### 2. Get Current Employer Profile
```
Endpoint: GET /employers/me
Frontend: employerService.getMe()
Hook: useCurrentEmployer()
Auth: Required (EMPLOYER)

Response (200): Same as above
```

- [ ] Implemented

### 3. Get All Employers
```
Endpoint: GET /employers
Frontend: employerService.getAll(page, limit)
Hook: useEmployers(page, limit)

Query Params:
- page: number (default 1)
- limit: number (default 10)
- verified: boolean

Response (200): List of employers with pagination
```

- [ ] Implemented

### 4. Update Employer Profile
```
Endpoint: PUT /employers/:id
Frontend: employerService.updateProfile(id, data)
Hook: useUpdateEmployerProfile(id)
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "companyName": "TechCorp",
  "website": "https://techcorp.com",
  "description": "Updated description",
  "location": "Kathmandu",
  "employeeCount": 60
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "companyName": "TechCorp", ... },
  "message": "Profile updated successfully"
}
```

- [ ] Implemented

### 5. Update Current Employer Profile
```
Endpoint: PUT /employers/me
Frontend: employerService.updateMe(data)
Hook: useUpdateCurrentEmployer()
Auth: Required (EMPLOYER)

Request: Same as above
Response (200): Same as above
```

- [ ] Implemented

### 6. Get Employer's Posted Jobs
```
Endpoint: GET /employers/:id/jobs
Frontend: employerService.getPostedJobs(id)
Hook: useEmployerPostedJobs(id)

Query Params:
- page: number (default 1)
- limit: number (default 10)

Response (200):
{
  "success": true,
  "data": [
    { "id": "1", "title": "Senior Developer", ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "pages": 2
  }
}
```

- [ ] Implemented

### 7. Get Employer's Received Applications
```
Endpoint: GET /employers/:id/applications
Frontend: employerService.getApplications(id)
Hook: useEmployerApplications(id)

Query Params:
- page: number (default 1)
- limit: number (default 10)
- status: SUBMITTED | REVIEWING | SHORTLISTED | REJECTED | ACCEPTED

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeName": "John Doe",
      "jobTitle": "Senior Developer",
      "status": "REVIEWING",
      "appliedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

- [ ] Implemented

### 8. Verify Employer Company
```
Endpoint: POST /employers/:id/verify
Frontend: employerService.verifyCompany(id)
Hook: useVerifyEmployerCompany()
Auth: Required (ADMIN)

Request:
{
  "registrationNumber": "...",
  "documentUrl": "..."
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "verified": true },
  "message": "Company verified successfully"
}
```

- [ ] Implemented

### 9. Delete Employer
```
Endpoint: DELETE /employers/:id
Frontend: employerService.delete(id)
Hook: useDeleteEmployer()
Auth: Required (EMPLOYER, ADMIN)

Response (200):
{
  "success": true,
  "message": "Employer account deleted successfully"
}
```

- [ ] Implemented

---

## Application Endpoints

### 1. Get All Applications
```
Endpoint: GET /applications
Frontend: applicationService.getAll(page, limit)
Hook: useApplications(page, limit)
Auth: Required (ADMIN)

Query Params:
- page: number (default 1)
- limit: number (default 10)
- status: SUBMITTED | REVIEWING | SHORTLISTED | REJECTED | ACCEPTED

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "1",
      "jobId": "job1",
      "employeeId": "emp1",
      "employeeName": "John Doe",
      "jobTitle": "Senior Developer",
      "status": "REVIEWING",
      "appliedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

- [ ] Implemented

### 2. Get Single Application
```
Endpoint: GET /applications/:id
Frontend: applicationService.getById(id)
Hook: useApplication(id)
Auth: Required (EMPLOYEE, EMPLOYER, ADMIN)

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "jobId": "job1",
    "employeeId": "emp1",
    "status": "REVIEWING",
    "appliedAt": "2024-01-15T10:00:00Z",
    "notes": "Great candidate"
  }
}
```

- [ ] Implemented

### 3. Submit Application
```
Endpoint: POST /applications
Frontend: applicationService.create(data)
Hook: useCreateApplication()
Auth: Required (EMPLOYEE)

Request:
{
  "jobId": "1",
  "coverLetter": "I am interested in this position..."
}

Response (201):
{
  "success": true,
  "data": {
    "id": "1",
    "jobId": "1",
    "status": "SUBMITTED",
    "appliedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Application submitted successfully"
}
```

- [ ] Implemented

### 4. Update Application
```
Endpoint: PUT /applications/:id
Frontend: applicationService.update(id, data)
Hook: useUpdateApplication(id)
Auth: Required (EMPLOYEE, EMPLOYER, ADMIN)

Request:
{
  "status": "REVIEWING",
  "notes": "..."
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "REVIEWING" },
  "message": "Application updated successfully"
}
```

- [ ] Implemented

### 5. Delete Application
```
Endpoint: DELETE /applications/:id
Frontend: applicationService.delete(id)
Hook: useDeleteApplication()
Auth: Required (EMPLOYEE, ADMIN)

Response (200):
{
  "success": true,
  "message": "Application deleted successfully"
}
```

- [ ] Implemented

### 6. Get Applications for Job
```
Endpoint: GET /applications/job/:jobId
Frontend: applicationService.getByJobId(jobId)
Hook: useApplicationsByJobId(jobId)
Auth: Required (EMPLOYER, ADMIN)

Query Params:
- page: number (default 1)
- limit: number (default 10)

Response (200): List of applications with pagination
```

- [ ] Implemented

### 7. Get Employee's Applications
```
Endpoint: GET /applications/employee/:employeeId
Frontend: applicationService.getByEmployeeId(employeeId)
Hook: useApplicationsByEmployeeId(employeeId)
Auth: Required (EMPLOYEE, ADMIN)

Query Params:
- page: number (default 1)
- limit: number (default 10)

Response (200): List of employee's applications
```

- [ ] Implemented

### 8. Get Current Employee's Applications
```
Endpoint: GET /applications/my
Frontend: applicationService.getEmployerApplications()
Hook: useMyApplications()
Auth: Required (EMPLOYEE)

Query Params:
- page: number (default 1)
- limit: number (default 10)

Response (200): List of current user's applications
```

- [ ] Implemented

### 9. Accept Application
```
Endpoint: POST /applications/:id/accept
Frontend: applicationService.accept(id, notes)
Hook: useAcceptApplication()
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "notes": "Welcome to the team!"
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "ACCEPTED" },
  "message": "Application accepted"
}
```

- [ ] Implemented

### 10. Reject Application
```
Endpoint: POST /applications/:id/reject
Frontend: applicationService.reject(id, notes)
Hook: useRejectApplication()
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "notes": "We found a better match"
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "REJECTED" },
  "message": "Application rejected"
}
```

- [ ] Implemented

### 11. Shortlist Application
```
Endpoint: POST /applications/:id/shortlist
Frontend: applicationService.shortlist(id, notes)
Hook: useShortlistApplication()
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "notes": "Great candidate, schedule interview"
}

Response (200):
{
  "success": true,
  "data": { "id": "1", "status": "SHORTLISTED" },
  "message": "Application shortlisted"
}
```

- [ ] Implemented

### 12. Schedule Interview
```
Endpoint: POST /applications/:id/schedule
Frontend: applicationService.scheduleInterview(id, data)
Hook: useScheduleInterview()
Auth: Required (EMPLOYER, ADMIN)

Request:
{
  "date": "2024-02-15T10:00:00Z",
  "location": "Office/Virtual",
  "notes": "Interview details"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "1",
    "interviewDate": "2024-02-15T10:00:00Z"
  },
  "message": "Interview scheduled"
}
```

- [ ] Implemented

### 13. Get Application Statistics
```
Endpoint: GET /applications/stats
Frontend: applicationService.getStats()
Hook: useApplicationStats()
Auth: Required (ADMIN, EMPLOYER)

Response (200):
{
  "success": true,
  "data": {
    "totalApplications": 500,
    "submitted": 200,
    "reviewing": 150,
    "shortlisted": 100,
    "rejected": 40,
    "accepted": 10
  }
}
```

- [ ] Implemented

---

## Summary Checklist

- [ ] **Authentication (5 endpoints)**
  - [ ] Login
  - [ ] Register
  - [ ] Logout
  - [ ] Refresh Token
  - [ ] Verify Email

- [ ] **Jobs (10 endpoints)**
  - [ ] Get All Jobs
  - [ ] Get Single Job
  - [ ] Create Job
  - [ ] Update Job
  - [ ] Delete Job
  - [ ] Search Jobs
  - [ ] Get Jobs by Company
  - [ ] Get Statistics
  - [ ] Close Job
  - [ ] Reopen Job

- [ ] **Employees (10 endpoints)**
  - [ ] Get Profile
  - [ ] Get Current Profile
  - [ ] Get All Employees
  - [ ] Update Profile
  - [ ] Update Current Profile
  - [ ] Delete Account
  - [ ] Search Employees
  - [ ] Verify Email
  - [ ] Resend Verification
  - [ ] Update Profile Picture

- [ ] **Employers (9 endpoints)**
  - [ ] Get Profile
  - [ ] Get Current Profile
  - [ ] Get All Employers
  - [ ] Update Profile
  - [ ] Update Current Profile
  - [ ] Get Posted Jobs
  - [ ] Get Applications
  - [ ] Verify Company
  - [ ] Delete Account

- [ ] **Applications (13 endpoints)**
  - [ ] Get All Applications
  - [ ] Get Single Application
  - [ ] Submit Application
  - [ ] Update Application
  - [ ] Delete Application
  - [ ] Get Job Applications
  - [ ] Get Employee Applications
  - [ ] Get My Applications
  - [ ] Accept Application
  - [ ] Reject Application
  - [ ] Shortlist Application
  - [ ] Schedule Interview
  - [ ] Get Statistics

**Total: 47 Endpoints**

---

## How to Use This Checklist

1. Go through each endpoint
2. Implement in your Java backend
3. Check the box when done
4. Test with curl or Postman
5. Verify frontend can communicate

