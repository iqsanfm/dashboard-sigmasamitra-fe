import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = ({ userInfo }) => {
  const [jobsData, setJobsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format numbers with commas
  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return num.toLocaleString();
    }
    return num;
  };

  // Dashboard Card Component
  const DashboardCard = ({ title, value, description }) => {
    let displayValue;
    if (Array.isArray(value)) {
      displayValue = value.join(', '); // Join array elements with a comma and space
    } else if (typeof value === 'object' && value !== null) {
      // Special handling for invoice_status_counts
      if (title === 'Invoice Status Counts') {
        const statusEntries = Object.entries(value);
        if (statusEntries.length > 0) {
          displayValue = statusEntries.map(([status, count]) => `${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${formatNumber(count)}`).join(', ');
        } else {
          displayValue = 'No data';
        }
      } else {
        displayValue = JSON.stringify(value); // Fallback for other objects
      }
    } else {
      displayValue = formatNumber(value);
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-4xl font-bold text-blue-600 mb-2">{displayValue}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    );
  };

  useEffect(() => {
    const fetchSummaryData = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('DashboardPage: Jobs data fetched successfully:', data);
          setJobsData(data);
        } else {
          const errorData = await response.json();
          console.error('DashboardPage: Failed to fetch jobs:', response.status, errorData);
          setError(errorData.error || 'Failed to fetch dashboard jobs.');
        }
      } catch (err) {
        console.error('DashboardPage: Network error or unexpected issue:', err);
        setError('Network error or unexpected issue while fetching jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-xl font-semibold text-gray-700">Loading dashboard summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="text-xl font-semibold">Error: {error}</p>
      </div>
    );
  }

    return (
    <div className="p-4">
        
        {userInfo?.role === 'ADMIN' ? (
          <> {/* Admin Content */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Dashboard Summary</h2>
              {jobsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DashboardCard
                    key="total_jobs"
                    title="Total Jobs"
                    value={jobsData.total_jobs}
                    description="Overall number of jobs"
                  />
                  {Object.entries(jobsData.jobs_by_status).map(([status, count]) => (
                    <DashboardCard
                      key={status}
                      title={`${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Jobs`}
                      value={count}
                      description={`Jobs currently in ${status.replace(/_/g, ' ')}`}
                    />
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Jobs</h2>
                {jobsData && jobsData.jobs.length > 0 ? (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Job Type</th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Client Name</th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">PIC Name</th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Status</th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Date</th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobsData.jobs.map((job) => (
                          <tr key={job.job_id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.job_type}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.client_name}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.pic_name}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.status}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(job.job_date).toLocaleDateString()}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <Link 
                                to={`/dashboard/jobs/${job.job_type.toLowerCase()}/${job.job_id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No recent jobs to display.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <> {/* Staff Content */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Dashboard</h2>
              <p className="text-lg text-gray-700">This is your personalized dashboard content.</p>
              <p className="text-md text-gray-600 mt-2">You can view your assigned tasks and relevant information here.</p>
            </div>
          </>
        )}
    </div>
  );
};

export default DashboardPage;