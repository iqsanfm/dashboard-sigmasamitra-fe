import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { getJobDetails, updateJob, getClients, getStaffs, createMonthlyTaxReport, updateMonthlyTaxReport, deleteMonthlyTaxReport } from '../utils/api'; // Import new functions

const EditJobPage = () => {
  const { job_type, job_id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    client_id: '',
    job_year: '',
    job_month: '',
    assigned_pic_staff_sigma_id: '',
    overall_status: '',
    correction_status: '',
    // Add other fields as needed based on job type
    reports: [],
  });

  const [clients, setClients] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobName, setJobName] = useState('');
  const [originalReports, setOriginalReports] = useState([]); // New state to store original reports

  useEffect(() => {
    console.log('EditJobPage: useEffect triggered for job_type:', job_type, 'job_id:', job_id);
    const fetchData = async () => {
      console.log('EditJobPage: fetchData started.');
      setLoading(true); // Ensure loading is true at start of fetch
      try {
        console.log('EditJobPage: Attempting to fetch job details...');
        const jobData = await getJobDetails(job_type, job_id);
        console.log('EditJobPage: Job data fetched:', jobData);
        setFormData({
          client_id: jobData.client_id || '',
          job_year: jobData.job_year || '',
          job_month: jobData.job_month || '',
          assigned_pic_staff_sigma_id: jobData.assigned_pic_staff_sigma_id || '',
          overall_status: jobData.overall_status || '',
          correction_status: jobData.correction_status || '',
          reports: jobData.tax_reports || [],
          // Map other fields as necessary
        });
        setOriginalReports(jobData.tax_reports || []); // Store original reports

        console.log('EditJobPage: Attempting to fetch clients...');
        const clientsData = await getClients();
        console.log('EditJobPage: Clients data fetched:', clientsData);
        setClients(clientsData);

        console.log('EditJobPage: Attempting to fetch staffs...');
        const staffsData = await getStaffs();
        console.log('EditJobPage: Staffs data fetched:', staffsData);
        setStaffs(staffsData);

        // Construct job name after all data is fetched
        const client = clientsData.find(c => c.client_id === jobData.client_id);
        if (client) {
          const monthName = jobData.job_month ? new Date(0, jobData.job_month - 1).toLocaleString('id-ID', { month: 'long' }) : '';
          setJobName(`${client.client_name} - ${monthName} ${jobData.job_year}`);
        } else {
          setJobName(`Job ID: ${job_id}`); // Fallback if client not found
        }

        console.log('EditJobPage: All data fetched successfully.');
      } catch (err) {
        console.error('EditJobPage: Error during fetchData:', err);
        setError(err.message || 'Failed to fetch job details for editing.');
        showNotification('Error fetching job details', 'error');
      } finally {
        console.log('EditJobPage: fetchData finished. Setting loading to false.');
        setLoading(false);
      }
    };
    fetchData();
  }, [job_type, job_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReportChange = (index, e) => {
    const { name, value } = e.target;
    const newReports = [...formData.reports];
    newReports[index] = { ...newReports[index], [name]: value };
    setFormData((prevData) => ({
      ...prevData,
      reports: newReports,
    }));
  };

  const addReport = () => {
    setFormData((prevData) => ({
      ...prevData,
      reports: [...prevData.reports, { tax_type: '', billing_code: '', payment_date: '', payment_amount: 0, report_status: '', report_date: '' }],
    }));
  };

  const handleRemoveReport = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      reports: prevData.reports.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare job data for update (excluding reports)
      const jobPayload = { ...formData };
      delete jobPayload.reports; // Remove reports from the main job payload

      // Convert numeric fields to actual numbers for jobPayload
      jobPayload.job_year = parseInt(jobPayload.job_year);
      if (jobPayload.job_month) {
        jobPayload.job_month = parseInt(jobPayload.job_month);
      }

      // Update main job details
      await updateJob(job_type, job_id, jobPayload);

      // Process reports: new, updated, and deleted
      const currentReportIds = new Set(formData.reports.filter(r => r.report_id).map(r => r.report_id));
      const originalReportIds = new Set(originalReports.map(r => r.report_id));

      // Reports to delete
      const reportsToDelete = originalReports.filter(
        (originalReport) => !currentReportIds.has(originalReport.report_id)
      );

      for (const report of reportsToDelete) {
        await deleteMonthlyTaxReport(job_id, report.report_id);
      }

      // Reports to create or update
      for (const report of formData.reports) {
        const reportPayload = { ...report };
        reportPayload.payment_amount = parseInt(reportPayload.payment_amount);

        if (report.report_id && originalReportIds.has(report.report_id)) {
          // Existing report, check if it's modified and update
          const original = originalReports.find(r => r.report_id === report.report_id);
          // Simple comparison, a more robust solution would deep compare
          if (JSON.stringify(original) !== JSON.stringify(report)) {
            await updateMonthlyTaxReport(job_id, report.report_id, reportPayload);
          }
        } else {
          // New report
          await createMonthlyTaxReport(job_id, reportPayload);
        }
      }

      showNotification('Job and reports updated successfully!', 'success');
      navigate(`/dashboard/jobs/${job_type}/${job_id}`); // Redirect back to job detail
    } catch (err) {
      setError(err.message || 'Failed to update job or reports.');
      showNotification(`Error: ${err.message || 'Failed to update job or reports.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat data pekerjaan untuk diedit...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Job: {jobName}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection (Read-only for edit, or allow change if business logic permits) */}
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled // Client ID usually not changeable after creation
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type (Read-only for edit) */}
        <div>
          <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
          <input
            type="text"
            id="job_type"
            name="job_type"
            value={job_type} // Display from URL param, not editable
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
            readOnly
          />
        </div>

        {/* Job Year */}
        <div>
          <label htmlFor="job_year" className="block text-sm font-medium text-gray-700 mb-1">Job Year</label>
          <input
            type="number"
            id="job_year"
            name="job_year"
            value={formData.job_year}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Job Month (Conditional for Monthly) */}
        {job_type.toLowerCase() === 'monthly' && (
          <div>
            <label htmlFor="job_month" className="block text-sm font-medium text-gray-700 mb-1">Job Month</label>
            <input
              type="number"
              id="job_month"
              name="job_month"
              value={formData.job_month}
              onChange={handleChange}
              min="1"
              max="12"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        )}

        {/* Assigned PIC Staff Selection */}
        <div>
          <label htmlFor="assigned_pic_staff_sigma_id" className="block text-sm font-medium text-gray-700 mb-1">Assigned PIC Staff</label>
          <select
            id="assigned_pic_staff_sigma_id"
            name="assigned_pic_staff_sigma_id"
            value={formData.assigned_pic_staff_sigma_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select PIC Staff</option>
            {staffs.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.nama} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        {/* Overall Status */}
        <div>
          <label htmlFor="overall_status" className="block text-sm font-medium text-gray-700 mb-1">Overall Status</label>
          <select
            id="overall_status"
            name="overall_status"
            value={formData.overall_status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tertunda">Tertunda</option>
            {/* Add other statuses as per API docs */}
          </select>
        </div>

        {/* Correction Status */}
        <div>
          <label htmlFor="correction_status" className="block text-sm font-medium text-gray-700 mb-1">Correction Status</label>
          <select
            id="correction_status"
            name="correction_status"
            value={formData.correction_status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="NORMAL">NORMAL</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="PB">PB</option>
            <option value="BT">BT</option>
          </select>
        </div>

        {/* Reports/Tax Reports Section (Conditional based on job type) */}
        {job_type.toLowerCase() === 'monthly' || job_type.toLowerCase() === 'annual' || job_type.toLowerCase() === 'dividend' ? (
          <div className="border border-gray-200 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Reports</h3>
            {formData.reports.map((report, index) => (
              <div key={report.report_id || index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveReport(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div>
                  <label htmlFor={`tax_type-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                  <input
                    type="text"
                    id={`tax_type-${index}`}
                    name="tax_type"
                    value={report.tax_type}
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`billing_code-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Billing Code</label>
                  <input
                    type="text"
                    id={`billing_code-${index}`}
                    name="billing_code"
                    value={report.billing_code}
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`payment_date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    id={`payment_date-${index}`}
                    name="payment_date"
                    value={report.payment_date ? report.payment_date.split('T')[0] : ''} // Format date for input type="date"
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`payment_amount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                  <input
                    type="number"
                    id={`payment_amount-${index}`}
                    name="payment_amount"
                    value={report.payment_amount}
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`report_status-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Report Status</label>
                  <input
                    type="text"
                    id={`report_status-${index}`}
                    name="report_status"
                    value={report.report_status}
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`report_date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    id={`report_date-${index}`}
                    name="report_date"
                    value={report.report_date ? report.report_date.split('T')[0] : ''} // Format date for input type="date"
                    onChange={(e) => handleReportChange(index, e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addReport} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Add Report
            </button>
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Updating Job...' : 'Update Job'}
        </button>
      </form>
    </div>
  );
};

export default EditJobPage;
