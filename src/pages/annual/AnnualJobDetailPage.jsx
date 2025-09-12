import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { getJobDetails, deleteJob, getJobFiles } from '../../utils/api';
import UpdateJobStatusModal from '../../components/UpdateJobStatusModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const AnnualJobDetailPage = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const job_type = 'annual'; // Hardcode job_type

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobFiles, setJobFiles] = useState([]);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobDetails(job_type, job_id);
      setJob(data);
      const filesData = await getJobFiles(job_type, job_id);
      setJobFiles(filesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch job details.');
      showNotification(`Error: ${err.message || 'Failed to fetch job details.'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [job_type, job_id, showNotification]);

  useEffect(() => {
    fetchJob();
  }, [job_id, fetchJob]);

  const openUpdateStatusModal = () => setIsUpdateStatusModalOpen(true);
  const closeUpdateStatusModal = () => setIsUpdateStatusModalOpen(false);
  const handleStatusUpdated = () => fetchJob();
  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDeleteConfirm = async () => {
    try {
      await deleteJob(job_type, job_id);
      showNotification('Pekerjaan berhasil dihapus!', 'success');
      navigate(`/dashboard/jobs/annual`); // Navigate back to the annual job list
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

  const API_DOWNLOAD_URL = import.meta.env.VITE_API_DOWNLOAD_URL;

  

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Detail Pekerjaan Tahunan: {job.client_name}
      </h1>
      <div className="mb-4 flex space-x-3">
        <Link
          to={`/dashboard/jobs/annual/${job_id}/edit`}
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
        <Link
          to={`/dashboard/create-correction/annual/${job_id}`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Buat Pembetulan
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">ID Pekerjaan</p><p className="text-lg text-gray-900">{job.job_id}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Nama Klien</p><p className="text-lg text-gray-900">{job.client_name}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Tahun Pekerjaan</p><p className="text-lg text-gray-900">{job.job_year}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Nama PIC</p><p className="text-lg text-gray-900">{job.assigned_pic_staff_sigma_name}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Status</p><p className="text-lg font-medium text-blue-600">{job.overall_status}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Status Koreksi</p><p className="text-lg text-gray-900">{job.correction_status || '-'}</p></div>
        <div className="bg-gray-50 p-4 rounded-md"><p className="text-sm font-semibold text-gray-600">Terakhir Diperbarui</p><p className="text-lg text-gray-900">{new Date(job.updated_at).toLocaleString('id-ID')}</p></div>
      </div>

      {jobFiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Bukti Pekerjaan</h3>
          <ul className="space-y-2">
            {jobFiles.map((file) => (
              <li key={file.file_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                <a
                  href={`${API_DOWNLOAD_URL}${file.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium truncate"
                >
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

export default AnnualJobDetailPage;
