
# Complete Documentation Index

Welcome! This document helps you navigate all the guides and resources for the MeroJobs frontend and backend integration.

---

## Quick Navigation

### **For Java Backend Developers**
Start here if you're implementing the backend:
1. **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** - All 47 endpoints you must implement
2. **FRONTEND_BACKEND_INTEGRATION.md** - How frontend talks to your API
3. **README_FRONTEND_BACKEND.md** - Complete system overview

### **For Frontend Developers**
Start here if you're building the UI:
1. **README_FRONTEND_BACKEND.md** - Understand the system
2. **MVC_ARCHITECTURE.md** - Deep dive into MVC pattern
3. **MVC_QUICK_START.md** - Quick reference guide
4. **AXIOS_WHERE_TO_USE.md** - When/where to use axios

### **For Full-Stack Developers**
1. **README_FRONTEND_BACKEND.md** - Start here first
2. **FRONTEND_BACKEND_INTEGRATION.md** - Integration details
3. **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** - Endpoint specs
4. **MVC_ARCHITECTURE.md** - Frontend architecture

---

## Documentation Files by Purpose

### Overview & Architecture

| File | Content | Read Time |
|------|---------|-----------|
| **README_FRONTEND_BACKEND.md** | Complete system overview, file structure, data flow, testing | 20 min |
| **FRONTEND_BACKEND_INTEGRATION.md** | Frontend-backend communication, endpoints, auth flow | 25 min |
| **MVC_ARCHITECTURE.md** | Detailed MVC pattern explanation with examples | 30 min |

### Quick References

| File | Content | Read Time |
|------|---------|-----------|
| **MVC_QUICK_START.md** | Quick copy-paste templates and examples | 5 min |
| **MVC_IMPLEMENTATION_SUMMARY.txt** | What was created, examples, key features | 10 min |
| **AXIOS_WHERE_TO_USE.md** | Where to import and use axios instance | 5 min |
| **AXIOS_QUICK_REFERENCE.md** | Copy-paste templates for axios usage | 5 min |

### Implementation Guides

| File | Content | Read Time |
|------|---------|-----------|
| **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** | All 47 endpoints with request/response specs | 45 min |
| **AUTH_SETUP.md** | Authentication system setup and usage | 20 min |
| **QUICK_START.md** | 30-second setup and testing | 5 min |

---

## File Directory Map

### Root Level Documentation (Read These First)
```
/
├── README_FRONTEND_BACKEND.md ..................... START HERE - System overview
├── JAVA_BACKEND_ENDPOINTS_CHECKLIST.md ........... ALL 47 endpoints to implement
├── FRONTEND_BACKEND_INTEGRATION.md ............... Frontend-Java communication
├── DOCUMENTATION_INDEX.md ......................... This file
└── QUICK_START.md ................................ 30-second setup

Frontend Architecture (Frontend Developers)
├── MVC_ARCHITECTURE.md ........................... Deep dive into MVC pattern
├── MVC_QUICK_START.md ............................ Quick reference
├── MVC_IMPLEMENTATION_SUMMARY.txt ................ What was created
├── AXIOS_WHERE_TO_USE.md ......................... Axios usage
├── AXIOS_QUICK_REFERENCE.md ...................... Copy-paste templates
└── AXIOS_USAGE_GUIDE.md .......................... Complete axios guide

Legacy/Auth (Optional Reading)
├── AUTH_SETUP.md ................................. Authentication setup
├── IMPLEMENTATION_SUMMARY.md ..................... Earlier implementation
└── SETUP_CHECKLIST.md ............................ Completion checklist
```

---

## Learning Paths

### Path 1: I Want to Understand Everything (2 hours)
1. **README_FRONTEND_BACKEND.md** (20 min) - Understand the complete system
2. **MVC_ARCHITECTURE.md** (30 min) - Learn MVC pattern in detail
3. **FRONTEND_BACKEND_INTEGRATION.md** (25 min) - Learn integration
4. **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** (45 min) - Understand all endpoints

### Path 2: I'm a Frontend Developer (1 hour)
1. **README_FRONTEND_BACKEND.md** (20 min) - System overview
2. **MVC_QUICK_START.md** (10 min) - Quick reference
3. **AXIOS_WHERE_TO_USE.md** (5 min) - Axios basics
4. **MVC_ARCHITECTURE.md** (25 min) - Deep dive (if interested)

### Path 3: I'm a Backend Developer (45 minutes)
1. **README_FRONTEND_BACKEND.md** (20 min) - System overview
2. **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** (20 min) - Endpoint specs
3. **FRONTEND_BACKEND_INTEGRATION.md** (5 min) - How frontend calls API

### Path 4: I Just Want to Code (5 minutes)
1. **MVC_QUICK_START.md** - Copy examples and start coding
2. **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** - Endpoint specs

### Path 5: I'm New to This Architecture (30 minutes)
1. **MVC_ARCHITECTURE.md** - Learn the pattern
2. **MVC_QUICK_START.md** - See examples
3. **AXIOS_WHERE_TO_USE.md** - Understand HTTP layer

---

## Quick Links by Topic

### Setting Up
- System setup: **README_FRONTEND_BACKEND.md** → "Getting Started"
- Quick setup: **QUICK_START.md**
- 30-second setup: **QUICK_START.md** → "Quick Start"

### Frontend MVC Pattern
- Understanding MVC: **MVC_ARCHITECTURE.md**
- Quick reference: **MVC_QUICK_START.md**
- What was built: **MVC_IMPLEMENTATION_SUMMARY.txt**

### Authentication
- How it works: **AUTH_SETUP.md**
- Integration: **FRONTEND_BACKEND_INTEGRATION.md** → "Authentication Flow"
- Endpoints: **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** → "Authentication Endpoints"

### Data Flow Examples
- Create job flow: **README_FRONTEND_BACKEND.md** → "Data Flow"
- Login flow: **FRONTEND_BACKEND_INTEGRATION.md** → "Login Process"
- All endpoints: **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md**

### Using Axios
- Where to use: **AXIOS_WHERE_TO_USE.md**
- How to use: **AXIOS_QUICK_REFERENCE.md**
- Complete guide: **AXIOS_USAGE_GUIDE.md**

### Troubleshooting
- Common issues: **README_FRONTEND_BACKEND.md** → "Troubleshooting"
- Integration issues: **FRONTEND_BACKEND_INTEGRATION.md** → "Troubleshooting"
- Auth issues: **AUTH_SETUP.md** → "Troubleshooting"

---

## Endpoint Reference by Service

### Authentication Endpoints (5 total)
**Read:** JAVA_BACKEND_ENDPOINTS_CHECKLIST.md → "Authentication Endpoints"
- Login
- Register
- Logout
- Refresh Token
- Verify Email

### Job Endpoints (10 total)
**Read:** JAVA_BACKEND_ENDPOINTS_CHECKLIST.md → "Job Endpoints"
- Get All Jobs
- Get Single Job
- Create Job
- Update Job
- Delete Job
- Search Jobs
- Get Jobs by Company
- Get Statistics
- Close Job
- Reopen Job

### Employee Endpoints (10 total)
**Read:** JAVA_BACKEND_ENDPOINTS_CHECKLIST.md → "Employee Endpoints"
- Get Profile
- Get Current Profile
- Get All Employees
- Update Profile
- Update Current Profile
- Delete Account
- Search Employees
- Verify Email
- Resend Verification
- Update Profile Picture

### Employer Endpoints (9 total)
**Read:** JAVA_BACKEND_ENDPOINTS_CHECKLIST.md → "Employer Endpoints"
- Get Profile
- Get Current Profile
- Get All Employers
- Update Profile
- Update Current Profile
- Get Posted Jobs
- Get Applications
- Verify Company
- Delete Account

### Application Endpoints (13 total)
**Read:** JAVA_BACKEND_ENDPOINTS_CHECKLIST.md → "Application Endpoints"
- Get All Applications
- Get Single Application
- Submit Application
- Update Application
- Delete Application
- Get Job Applications
- Get Employee Applications
- Get My Applications
- Accept Application
- Reject Application
- Shortlist Application
- Schedule Interview
- Get Statistics

**Total: 47 Endpoints**

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.2.4
- **React:** 19.2.4
- **TypeScript:** 5
- **State:** React Query + React Hooks
- **HTTP:** Axios
- **Validation:** Zod
- **Forms:** React Hook Form
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** JWT + Cookies

### Backend
- **Framework:** Java Spring Boot
- **Database:** MySQL
- **Auth:** JWT (Spring Security)
- **Cache:** Redis (optional)
- **ORM:** Spring Data JPA
- **Validation:** @Valid + custom validators
- **API Format:** REST with JSON

---

## Code Structure by Layer

### View Layer (React Components)
**Location:** `src/views/`, `src/app/`
**Read:** MVC_ARCHITECTURE.md → "View Layer"
**Examples:** JobsList, JobCard, CreateJobForm

### Controller Layer (React Hooks)
**Location:** `src/hooks/`
**Read:** MVC_QUICK_START.md → "Custom Hooks"
**Examples:** useJobs, useEmployees, useApplications

### Service Layer (Business Logic)
**Location:** `src/service/`
**Read:** AXIOS_WHERE_TO_USE.md
**Examples:** jobService, employeeService, applicationService

### Model Layer (Types & Schemas)
**Location:** `src/models/`
**Read:** MVC_ARCHITECTURE.md → "Model Layer"
**Examples:** job.model.ts, employee.model.ts

### HTTP Layer (Axios)
**Location:** `src/lib/api.ts`
**Read:** AXIOS_WHERE_TO_USE.md
**Examples:** request interceptor, response interceptor

---

## Common Tasks

### "I need to add a new service"
1. Read: **MVC_QUICK_START.md** → "Adding a New Service"
2. Copy template from: **AXIOS_QUICK_REFERENCE.md**
3. Reference pattern: Check existing services in `src/service/`

### "I don't know where to put this code"
1. Read: **README_FRONTEND_BACKEND.md** → "File Structure"
2. Reference: **MVC_ARCHITECTURE.md** → "Layer Breakdown"

### "I want to understand how data flows"
1. Read: **README_FRONTEND_BACKEND.md** → "Data Flow Example"
2. See real example: **FRONTEND_BACKEND_INTEGRATION.md** → "Request/Response Format"

### "I need endpoint specifications"
1. Read: **JAVA_BACKEND_ENDPOINTS_CHECKLIST.md** for your service
2. Reference format: **FRONTEND_BACKEND_INTEGRATION.md** → "API Endpoint Mapping"

### "How do I use axios?"
1. Quick: **AXIOS_WHERE_TO_USE.md** (5 min)
2. Detailed: **AXIOS_USAGE_GUIDE.md** (30 min)
3. Templates: **AXIOS_QUICK_REFERENCE.md**

### "I need to test the integration"
1. Read: **README_FRONTEND_BACKEND.md** → "Testing the Integration"
2. Follow steps in: **QUICK_START.md**

### "My API call isn't working"
1. Check: **README_FRONTEND_BACKEND.md** → "Troubleshooting"
2. Check: **FRONTEND_BACKEND_INTEGRATION.md** → "Troubleshooting"

---

## Document Sizes

| File | Size | Read Time |
|------|------|-----------|
| README_FRONTEND_BACKEND.md | 643 lines | 20 min |
| MVC_ARCHITECTURE.md | 556 lines | 25 min |
| FRONTEND_BACKEND_INTEGRATION.md | 731 lines | 25 min |
| JAVA_BACKEND_ENDPOINTS_CHECKLIST.md | 1141 lines | 45 min |
| MVC_QUICK_START.md | 348 lines | 10 min |
| AXIOS_USAGE_GUIDE.md | 548 lines | 20 min |
| AXIOS_QUICK_REFERENCE.md | 453 lines | 15 min |
| MVC_IMPLEMENTATION_SUMMARY.txt | 583 lines | 15 min |

---

## Getting Help

### If you get stuck:
1. **Search this index** for your topic
2. **Read the relevant file** from the list above
3. **Check the Troubleshooting section** in that file
4. **Look for example code** in quick reference guides

### If you're confused:
1. **You might be in the wrong layer** → Read MVC_ARCHITECTURE.md
2. **You might need more context** → Read README_FRONTEND_BACKEND.md
3. **You might need specific endpoint details** → Check JAVA_BACKEND_ENDPOINTS_CHECKLIST.md

### If you need examples:
1. Check: **MVC_QUICK_START.md** for copy-paste code
2. Check: **AXIOS_QUICK_REFERENCE.md** for templates
3. Check: **README_FRONTEND_BACKEND.md** → "Development Workflow"

---

## Summary

This project is fully documented with:
- ✅ Complete system architecture guides
- ✅ 47 endpoints with full specifications
- ✅ MVC pattern implementation
- ✅ Frontend-backend integration guide
- ✅ Copy-paste code examples
- ✅ Troubleshooting guides
- ✅ Quick reference cards

**Start with:** README_FRONTEND_BACKEND.md (20 minutes to understand everything)

---

**Happy coding!** 🚀

