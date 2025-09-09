import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { getMonthlyJobs, deleteJob } from '../utils/api'; // Import deleteJob
import UpdateJobStatusModal from '../components/UpdateJobStatusModal';
import ConfirmationModal from '../components/ConfirmationModal'; // Import ConfirmationModal

const MonthlyJobsPage = () => {
  const { showNotification } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    client_name: '',
    pic_name: '',
    overall_status: '',
    job_year: new Date().getFullYear(),
    job_month: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedJobForStatusUpdate, setSelectedJobForStatusUpdate] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal
  const [selectedJobForDelete, setSelectedJobForDelete] = useState(null); // State for job to delete

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyJobs(filters, pagination); 
      setJobs(data || []);
      setPagination(prev => ({ ...prev, total: data.length || 0 }));
    } catch (err) {
      setError(err.message || 'Failed to fetch monthly jobs.');
      showNotification(`Error: ${err.message || 'Failed to fetch monthly jobs.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openUpdateStatusModal = (job) => {
    setSelectedJobForStatusUpdate(job);
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
    setSelectedJobForStatusUpdate(null);
  };

  const handleStatusUpdated = () => {
    fetchJobs(); // Re-fetch jobs after status update
  };

  const openDeleteModal = (job) => {
    setSelectedJobForDelete(job);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedJobForDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedJobForDelete) {
      try {
        await deleteJob('monthly', selectedJobForDelete.job_id); // 'monthly' is the jobType for this page
        showNotification('Pekerjaan berhasil dihapus!', 'success');
        fetchJobs(); // Re-fetch jobs after deletion
        closeDeleteModal();
      } catch (err) {
        showNotification(`Error: ${err.message || 'Gagal menghapus pekerjaan.'}`, 'error');
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat pekerjaan bulanan...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pekerjaan Bulanan</h1>

      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/dashboard/create-job"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Tambah Pekerjaan Bulanan
        </Link>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md shadow-sm">
        <div>
          <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">Nama Klien</label>
          <input
            type="text"
            name="client_name"
            id="client_name"
            value={filters.client_name}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cari nama klien..."
          />
        </div>
        <div>
          <label htmlFor="pic_name" className="block text-sm font-medium text-gray-700">Nama PIC</label>
          <input
            type="text"
            name="pic_name"
            id="pic_name"
            value={filters.pic_name}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Cari nama PIC..."
          />
        </div>
        <div>
          <label htmlFor="overall_status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="overall_status"
            id="overall_status"
            value={filters.overall_status}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Semua Status</option>
            <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tertunda">Tertunda</option>
          </select>
        </div>
        <div>
          <label htmlFor="job_year" className="block text-sm font-medium text-gray-700">Tahun</label>
          <input
            type="number"
            name="job_year"
            id="job_year"
            value={filters.job_year}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="job_month" className="block text-sm font-medium text-gray-700">Bulan</label>
          <select
            name="job_month"
            id="job_month"
            value={filters.job_month}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Semua Bulan</option>
            {[...Array(12).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job List Table */}
      {jobs.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Klien</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Periode</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">PIC</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Terakhir Diperbarui</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.client_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                    {new Date(0, job.job_month - 1).toLocaleString('id-ID', { month: 'short' })} {job.job_year}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{job.assigned_pic_staff_sigma_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${job.overall_status === 'Selesai' ? 'bg-green-100 text-green-800' : 
                        job.overall_status === 'Dalam Pengerjaan' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`
                    }>
                      {job.overall_status}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                    {new Date(job.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link 
                      to={`/dashboard/jobs/monthly/${job.job_id}`} // Link to JobDetailPage
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Detail
                    </Link>
                    <Link
                      to={`/dashboard/jobs/monthly/${job.job_id}/edit`} // Link to EditJobPage
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openUpdateStatusModal(job)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteModal(job)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">Tidak ada pekerjaan bulanan yang ditemukan.</p>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-gray-700">Halaman {pagination.page} dari {Math.ceil(pagination.total / pagination.limit)}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page * pagination.limit >= pagination.total}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      )}

      {selectedJobForStatusUpdate && (
        <UpdateJobStatusModal
          isOpen={isUpdateStatusModalOpen}
          onClose={closeUpdateStatusModal}
          jobType={'monthly'}
          jobId={selectedJobForStatusUpdate.job_id}
          currentStatus={selectedJobForStatusUpdate.overall_status}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {selectedJobForDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Konfirmasi Hapus Pekerjaan"
          message={`Apakah Anda yakin ingin menghapus pekerjaan untuk klien "${selectedJobForDelete.client_name}" (${selectedJobForDelete.job_id})? Aksi ini tidak dapat dibatalkan.`}
        />
      )}
    </div>
  );
};

export default MonthlyJobsPage;