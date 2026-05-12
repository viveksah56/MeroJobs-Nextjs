
/**
 * COMPLETE EXAMPLES: Protected Routes & Multipart File Uploads
 * 
 * Copy and paste these examples into your services and components
 */

// ============================================================================
// SERVICE EXAMPLES - src/service/
// ============================================================================

/**
 * Example 1: Employee Service with Protected Routes & File Upload
 */
export const employeeServiceExamples = {
  // Regular protected GET
  getMe: async () => {
    // ✅ Token automatically added
    const response = await api.get('/employees/me');
    return response.data.data;
  },

  // Protected GET with ID
  getProfile: async (id: string) => {
    // ✅ Token automatically added
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  // Protected POST with JSON data
  updateProfile: async (id: string, data: any) => {
    // ✅ Token automatically added
    // ✅ Content-Type: application/json
    const response = await api.put(`/employees/${id}`, data);
    return response.data.data;
  },

  // Protected POST with file upload
  uploadProfilePicture: async (id: string, file: File) => {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'PROFILE_PICTURE');

    // ✅ Token automatically added
    // ✅ Content-Type: multipart/form-data (automatically set)
    const response = await api.post(
      `/employees/${id}/profile-picture`,
      formData
      // ❌ DON'T add headers here - axios handles it
    );

    return response.data.data;
  },

  // Protected DELETE
  deleteProfile: async (id: string) => {
    // ✅ Token automatically added
    await api.delete(`/employees/${id}`);
  },

  // Upload multiple files
  uploadDocuments: async (id: string, files: File[]) => {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    // ✅ Token automatically added
    // ✅ All files sent together
    const response = await api.post(
      `/employees/${id}/documents`,
      formData
    );

    return response.data.data;
  },
};

/**
 * Example 2: Job Service with Protected Routes
 */
export const jobServiceExamples = {
  // Protected GET all
  getAll: async (page: number = 1) => {
    const response = await api.get('/jobs', {
      params: { page, limit: 10 },
    });
    return response.data;
  },

  // Protected GET single
  getById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  },

  // Protected POST to create
  create: async (data: any) => {
    const response = await api.post('/jobs', data);
    return response.data.data;
  },

  // Protected PUT to update
  update: async (id: string, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data.data;
  },

  // Protected DELETE
  delete: async (id: string) => {
    await api.delete(`/jobs/${id}`);
  },
};

/**
 * Example 3: Application Service with Protected Routes
 */
export const applicationServiceExamples = {
  // Submit application (POST with file)
  submitApplication: async (jobId: string, formData: any, resume: File) => {
    const data = new FormData();

    // Add regular fields
    data.append('jobId', jobId);
    data.append('coverLetter', formData.coverLetter);

    // Add file
    data.append('resume', resume);

    // ✅ Token automatically added
    // ✅ Multipart automatically handled
    const response = await api.post('/applications', data);

    return response.data.data;
  },

  // Get my applications (protected)
  getMyApplications: async (page: number = 1) => {
    const response = await api.get('/applications/my', {
      params: { page, limit: 10 },
    });
    return response.data;
  },

  // Update application status (protected)
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/applications/${id}`, { status });
    return response.data.data;
  },

  // Accept application (protected)
  accept: async (id: string, message: string) => {
    const response = await api.post(`/applications/${id}/accept`, { message });
    return response.data.data;
  },

  // Reject application (protected)
  reject: async (id: string, reason: string) => {
    const response = await api.post(`/applications/${id}/reject`, { reason });
    return response.data.data;
  },
};

// ============================================================================
// COMPONENT EXAMPLES - src/views/ or src/components/
// ============================================================================

/**
 * Example 1: Simple File Upload Component
 */
export const FileUploadComponentExample = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // ✅ Token automatically included in request
      const result = await employeeServiceExamples.uploadProfilePicture(
        'employee-123',
        file
      );
      console.log('Upload success:', result);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept="image/*"
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

/**
 * Example 2: Application Form with File Upload
 */
export const ApplicationFormComponentExample = ({
  jobId,
}: {
  jobId: string;
}) => {
  const [formData, setFormData] = useState({ coverLetter: '' });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      alert('Please select a resume');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Token automatically included
      // ✅ File + form data sent together
      const result = await applicationServiceExamples.submitApplication(
        jobId,
        formData,
        resumeFile
      );
      console.log('Application submitted:', result);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Cover Letter"
        value={formData.coverLetter}
        onChange={(e) =>
          setFormData({ ...formData, coverLetter: e.target.value })
        }
        required
      />

      <input
        type="file"
        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx"
        required
      />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
};

/**
 * Example 3: Profile Update Component (No File)
 */
export const ProfileUpdateComponentExample = ({ employeeId }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUpdating(true);

    try {
      // ✅ Token automatically included
      // ✅ Regular JSON POST
      await employeeServiceExamples.updateProfile(employeeId, formData);
      alert('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.firstName}
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
        placeholder="First Name"
      />

      <input
        value={formData.lastName}
        onChange={(e) =>
          setFormData({ ...formData, lastName: e.target.value })
        }
        placeholder="Last Name"
      />

      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Bio"
      />

      <button type="submit" disabled={updating}>
        {updating ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

// ============================================================================
// HOOK EXAMPLES - src/hooks/
// ============================================================================

/**
 * Example 1: useUploadProfilePicture Hook
 */
export const useUploadProfilePictureExample = (employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      employeeServiceExamples.uploadProfilePicture(employeeId, file),
    onSuccess: (result) => {
      // Invalidate employee query to refetch
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });

      // Or set directly
      queryClient.setQueryData(['employee', employeeId], result);
    },
    onError: (error) => {
      console.error('[v0] Upload failed:', error);
    },
  });
};

/**
 * Example 2: useSubmitApplication Hook
 */
export const useSubmitApplicationExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      jobId: string;
      formData: any;
      resume: File;
    }) =>
      applicationServiceExamples.submitApplication(
        data.jobId,
        data.formData,
        data.resume
      ),
    onSuccess: () => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/**
 * Example 3: useGetJobs Hook
 */
export const useGetJobsExample = (page: number = 1) => {
  return useQuery({
    queryKey: ['jobs', page],
    queryFn: () => jobServiceExamples.getAll(page),
  });
};

/**
 * Example 4: useUpdateProfile Hook
 */
export const useUpdateProfileExample = (employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      employeeServiceExamples.updateProfile(employeeId, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['employee', employeeId], result);
    },
  });
};

// ============================================================================
// USAGE IN COMPONENTS
// ============================================================================

/**
 * Example: Using Hooks in Component
 */
export const MyProfileComponentExample = ({ employeeId }: any) => {
  const updateProfileMutation = useUpdateProfileExample(employeeId);
  const uploadPictureMutation = useUploadProfilePictureExample(employeeId);

  const handleProfileUpdate = async (data: any) => {
    try {
      // ✅ All token handling done automatically
      await updateProfileMutation.mutateAsync(data);
      alert('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handlePictureUpload = async (file: File) => {
    try {
      // ✅ All token handling done automatically
      await uploadPictureMutation.mutateAsync(file);
      alert('Picture uploaded!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {updateProfileMutation.isPending && <p>Updating profile...</p>}
      {uploadPictureMutation.isPending && <p>Uploading picture...</p>}

      <button onClick={() => handleProfileUpdate({ firstName: 'John' })}>
        Update Profile
      </button>

      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePictureUpload(file);
        }}
      />
    </div>
  );
};

// ============================================================================
// KEY PRINCIPLES
// ============================================================================

/**
 * REMEMBER:
 * 
 * 1. TOKEN HANDLING
 *    - ✅ Automatically added by axios interceptor
 *    - ❌ Don't manually set Authorization header
 *    - ✅ Works for ALL requests (GET, POST, PUT, DELETE)
 * 
 * 2. MULTIPART FILE UPLOAD
 *    - ✅ Use FormData for files
 *    - ✅ Append file to FormData
 *    - ❌ Don't set Content-Type header manually
 *    - ✅ Axios handles multipart encoding
 * 
 * 3. API CALLS
 *    - ✅ Use api.get(), api.post(), api.put(), api.delete()
 *    - ✅ Token automatically included
 *    - ✅ Error handling automatic (401 retry with refresh)
 * 
 * 4. FILE VALIDATION
 *    - ✅ Check file size on client
 *    - ✅ Check file type on client
 *    - ✅ Backend validates too
 * 
 * 5. ERROR HANDLING
 *    - ✅ 401 errors auto-handled (token refreshed)
 *    - ❌ Other errors need manual handling
 *    - ✅ Use try/catch blocks
 */

