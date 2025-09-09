import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useNotification } from '../contexts/NotificationContext';
import { getJobDetails, deleteJob } from '../utils/api'; // Import deleteJob
import UpdateJobStatusModal from '../components/UpdateJobStatusModal';
import ConfirmationModal from '../components/ConfirmationModal'; // Import ConfirmationModal

const JobDetailPage = () => {
  const { job_type, job_id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const { showNotification } = useNotification();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal

  const fetchJob = async () => {
    setLoading(true);
    try {
      const data = await getJobDetails(job_type, job_id);
      setJob(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch job details.');
      showNotification(`Error: ${err.message || 'Failed to fetch job details.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [job_type, job_id]);

  const openUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
  };

  const handleStatusUpdated = () => {
    fetchJob(); // Re-fetch job details after status update
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteJob(job_type, job_id);
      showNotification('Pekerjaan berhasil dihapus!', 'success');
      navigate(`/dashboard/jobs/${job_type}`); // Navigate back to the job list page
    } catch (err) {
      showNotification(`Error: ${err.message || 'Gagal menghapus pekerjaan.'}`, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading job details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!job) {
    return <div className="p-4 text-center">No job data found.</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Job Details: {job.client_name}
      </h1>
      <div className="mb-4 flex space-x-3">
        <Link
          to={`/dashboard/jobs/${job_type}/${job_id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Edit Job
        </Link>
        <button
          onClick={openUpdateStatusModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Update Status
        </button>
        <button
          onClick={openDeleteModal}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Hapus
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Job ID</p>
          <p className="text-lg text-gray-900">{job.job_id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Job Type</p>
          <p className="text-lg text-gray-900">{job_type}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">PIC Name</p>
          <p className="text-lg text-gray-900">{job.assigned_pic_staff_sigma_name}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Status</p>
          <p className="text-lg font-medium text-blue-600">{job.overall_status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Job Year</p>
          <p className="text-lg text-gray-900">{job.job_year}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Client ID</p>
          <p className="text-lg text-gray-900">{job.client_id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">NPWP Client</p>
          <p className="text-lg text-gray-900">{job.npwp_client}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Correction Status</p>
          <p className="text-lg text-gray-900">{job.correction_status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Last Updated</p>
          <p className="text-lg text-gray-900">{new Date(job.updated_at).toLocaleString()}</p>
        </div>
        {job.reports && job.reports.length > 0 && (
          <div className="md:col-span-2 mt-6 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Reports</h3>
            <div className="space-y-4">
              {job.reports.map((report, index) => (
                <div key={report.report_id || index} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                  <p className="text-md font-semibold text-gray-700 mb-1">Report ID: <span className="font-normal text-gray-900">{report.report_id}</span></p>
                  <p className="text-md font-semibold text-gray-700 mb-1">Is Reported: <span className="font-normal text-gray-900">{report.is_reported ? 'Yes' : 'No'}</span></p>
                  <p className="text-md font-semibold text-gray-700 mb-1">Report Date: <span className="font-normal text-gray-900">{report.report_date}</span></p>
                  <p className="text-md font-semibold text-gray-700">Report Status: <span className="font-normal text-gray-900">{report.report_status}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {job && (
        <UpdateJobStatusModal
          isOpen={isUpdateStatusModalOpen}
          onClose={closeUpdateStatusModal}
          jobType={job_type}
          jobId={job_id}
          currentStatus={job.overall_status}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Pekerjaan"
        message={`Apakah Anda yakin ingin menghapus pekerjaan ini (${job_id})? Aksi ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default JobDetailPage;