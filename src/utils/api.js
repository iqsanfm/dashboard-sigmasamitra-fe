const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => {
  return localStorage.getItem('jwtToken');
};

const apiFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle query parameters for GET requests
  let url = `${API_BASE_URL}/${path}`;
  if (options.params) {
    const queryString = new URLSearchParams(options.params).toString();
    url = `${url}?${queryString}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
};

export const getJobDetails = (jobType, jobId) => {
  // Sanitize jobType to be URL-friendly (e.g., "SP2DK" -> "sp2dk-jobs", "Annual" -> "annual-jobs")
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/${jobId}`);
};

export const getClients = () => {
  return apiFetch('clients/');
};

export const getStaffs = () => {
  return apiFetch('staffs/');
};

export const createJob = (jobType, jobData) => {
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/`, {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
};

// New function for Monthly Jobs
export const getMonthlyJobs = (filters = {}, pagination = {}) => {
  const params = {
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
  };
  // Remove undefined or null values from params
  Object.keys(params).forEach(key => {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      delete params[key];
    }
  });

  
  

  return apiFetch('monthly-jobs/', { params });
};

// New function to update a job
export const updateJob = (jobType, jobId, jobData) => {
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(jobData),
  });
};

// New function to update job status with file upload
export const updateJobStatus = (jobType, jobId, formData) => {
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/${jobId}/status`, {
    method: 'PATCH',
    body: formData, // formData will automatically set Content-Type: multipart/form-data
  });
};

// New function to delete a job
export const deleteJob = (jobType, jobId) => {
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/${jobId}`, {
    method: 'DELETE',
  });
};

export const createMonthlyTaxReport = (jobId, reportData) => {
  return apiFetch(`monthly-jobs/${jobId}/tax-reports/`, {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
};

export const updateMonthlyTaxReport = (jobId, reportId, reportData) => {
  return apiFetch(`monthly-jobs/${jobId}/tax-reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(reportData),
  });
};

export const deleteMonthlyTaxReport = (jobId, reportId) => {
  return apiFetch(`monthly-jobs/${jobId}/tax-reports/${reportId}`, {
    method: 'DELETE',
  });
};

export const getJobFiles = (jobType, jobId) => {
  const formattedJobType = `${jobType.toLowerCase().replace(/\s+/g, '-')}-jobs`;
  return apiFetch(`${formattedJobType}/${jobId}/files`);
};
