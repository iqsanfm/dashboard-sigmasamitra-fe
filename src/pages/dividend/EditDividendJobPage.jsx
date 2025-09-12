import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { getJobDetails, updateJob, getClients, getStaffs, updateDividendReport } from '../../utils/api';

const EditDividendJobPage = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const job_type = 'dividend';

  const [formData, setFormData] = useState({
    client_id: '',
    assigned_pic_staff_sigma_id: '',
    overall_status: '',
    job_year: '',
    correction_status: '',
    reports: [],
  });

  const [clients, setClients] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobName, setJobName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobData = await getJobDetails(job_type, job_id);
        setFormData({
          client_id: jobData.client_id || '',
          assigned_pic_staff_sigma_id: jobData.assigned_pic_staff_sigma_id || '',
          overall_status: jobData.overall_status || '',
          job_year: jobData.job_year || '',
          correction_status: jobData.correction_status || '',
          reports: jobData.reports || [],
        });

        const clientsData = await getClients();
        setClients(clientsData);
        const staffsData = await getStaffs();
        setStaffs(staffsData);
        const client = clientsData.find(c => c.client_id === jobData.client_id);
        setJobName(client ? `${client.client_name} - Dividend` : `Job ID: ${job_id}`);
      } catch (err) {
        setError(err.message || 'Failed to fetch job details for editing.');
        showNotification('Error fetching job details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [job_id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleReportChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const newReports = [...formData.reports];
    newReports[index] = { ...newReports[index], [name]: type === 'checkbox' ? checked : value };
    setFormData((prevData) => ({ ...prevData, reports: newReports }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Separate main job data from reports data
    const { reports, ...mainJobData } = formData;

    try {
      // 1. Update the main job details
      const updateMainJobPromise = updateJob(job_type, job_id, mainJobData);

      // 2. Update each report individually
      const updateReportPromises = reports.map(report => {
        // Don't send job_id or other top-level fields in the report body
        const { report_id, job_id: r_job_id, created_at, updated_at, ...reportPayload } = report;
        return updateDividendReport(job_id, report_id, reportPayload);
      });

      // 3. Run all promises in parallel
      await Promise.all([updateMainJobPromise, ...updateReportPromises]);

      showNotification('Job and all reports updated successfully!', 'success');
      navigate(`/dashboard/jobs/dividend/${job_id}`);

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
        {/* Main Job Fields... */}
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
            required
            disabled
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label htmlFor="job_year" className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input
                type="number"
                id="job_year"
                name="job_year"
                value={formData.job_year}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="correction_status" className="block text-sm font-medium text-gray-700 mb-1">Status Koreksi</label>
              <input
                type="text"
                id="correction_status"
                name="correction_status"
                value={formData.correction_status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
        </div>

        <div>
          <label htmlFor="overall_status" className="block text-sm font-medium text-gray-700 mb-1">Overall Status</label>
          <select
            id="overall_status"
            name="overall_status"
            value={formData.overall_status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tertunda">Tertunda</option>
          </select>
        </div>

        {/* Reports Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Laporan Terkait</h3>
          {formData.reports.map((report, index) => (
            <div key={report.report_id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md mb-4">
              <div>
                <label htmlFor={`report_status_${index}`} className="block text-sm font-medium text-gray-700 mb-1">Status Laporan</label>
                <input
                  type="text"
                  id={`report_status_${index}`}
                  name="report_status"
                  value={report.report_status}
                  onChange={(e) => handleReportChange(e, index)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor={`report_date_${index}`} className="block text-sm font-medium text-gray-700 mb-1">Tanggal Laporan</label>
                <input
                  type="date"
                  id={`report_date_${index}`}
                  name="report_date"
                  value={report.report_date ? report.report_date.split('T')[0] : ''} // Format date for input
                  onChange={(e) => handleReportChange(e, index)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id={`is_reported_${index}`}
                  name="is_reported"
                  checked={report.is_reported}
                  onChange={(e) => handleReportChange(e, index)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`is_reported_${index}`} className="ml-2 block text-sm font-medium text-gray-700">Sudah Dilaporkan?</label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Updating Job...' : 'Update Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDividendJobPage;
