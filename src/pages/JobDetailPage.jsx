import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useParams, Link, useNavigate
import { useNotification } from '../contexts/NotificationContext';
import { getJobDetails, deleteJob, getJobFiles } from '../utils/api'; // Import getJobFiles
import UpdateJobStatusModal from '../components/UpdateJobStatusModal';
import ConfirmationModal from '../components/ConfirmationModal';

const JobDetailPage = () => {
  const { job_type, job_id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobFiles, setJobFiles] = useState([]); // New state for job files

  const fetchJob = async () => {
    setLoading(true);
    try {
      const data = await getJobDetails(job_type, job_id);
      setJob(data);

      // Fetch job files
      const filesData = await getJobFiles(job_type, job_id);
      console.log('Fetched job files:', filesData); // Add this line
      setJobFiles(filesData);

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
    return <div className="p-4 text-center">Memuat detail pekerjaan...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!job) {
    return <div className="p-4 text-center">Tidak ada data pekerjaan ditemukan.</div>;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Define API_BASE_URL here
  const API_DOWNLOAD_URL = import.meta.env.VITE_API_DOWNLOAD_URL; // New download URL

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Detail Pekerjaan: {job.client_name}
      </h1>
      <div className="mb-4 flex space-x-3">
        <Link
          to={`/dashboard/jobs/${job_type}/${job_id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Edit Pekerjaan
        </Link>
        <button
          onClick={openUpdateStatusModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Perbarui Status
        </button>
        <button
          onClick={openDeleteModal}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Hapus
        </button>
      </div>
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">ID Pekerjaan</p>
          <p className="text-lg text-gray-900">{job.job_id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Tipe Pekerjaan</p>
          <p className="text-lg text-gray-900">{job_type}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Nama PIC</p>
          <p className="text-lg text-gray-900">{job.assigned_pic_staff_sigma_name}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Status</p>
          <p className="text-lg font-medium text-blue-600">{job.overall_status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Tahun Pekerjaan</p>
          <p className="text-lg text-gray-900">{job.job_year}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">ID Klien</p>
          <p className="text-lg text-gray-900">{job.client_id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">NPWP Klien</p>
          <p className="text-lg text-gray-900">{job.npwp_client}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Status Koreksi</p>
          <p className="text-lg text-gray-900">{job.correction_status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-semibold text-gray-600">Terakhir Diperbarui</p>
          <p className="text-lg text-gray-900">{new Date(job.updated_at).toLocaleString()}</p>
        </div>
        {job.tax_reports && job.tax_reports.length > 0 && (
          <div className="md:col-span-2 mt-6 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Laporan</h3>
            <div className="space-y-4">
              {job.tax_reports.map((report, index) => (
                <div key={report.report_id || index} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                  <p className="text-md font-semibold text-gray-700 mb-1">ID Laporan: <span className="font-normal text-gray-900">{report.report_id}</span></p>
                  <p className="text-md font-semibold text-gray-700 mb-1">Sudah Dilaporkan: <span className="font-normal text-gray-900">{report.is_reported ? 'Yes' : 'No'}</span></p>
                  <p className="text-md font-semibold text-gray-700 mb-1">Tanggal Laporan: <span className="font-normal text-gray-900">{report.report_date}</span></p>
                  <p className="text-md font-semibold text-gray-700">Status Laporan: <span className="font-normal text-gray-900">{report.report_status}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      </>

      {/* Directly display files if available - NEW LOCATION */}
      {jobFiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Bukti Pekerjaan</h3>
          <ul className="space-y-2">
            {jobFiles.map((file) => (
              <li key={file.file_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <a
                  href={`${API_DOWNLOAD_URL}${file.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium truncate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0l-3.75 3.75M21 3l-3.75-3.75" />
                  </svg>
                  {file.original_filename}
                </a>
                <span className="text-sm text-gray-500 ml-2">({(file.file_size / 1024).toFixed(2)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
