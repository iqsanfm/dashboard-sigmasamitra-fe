import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { getSp2dkJobs, deleteJob } from '../../utils/api'; // Import deleteJob
import UpdateJobStatusModal from '../../components/UpdateJobStatusModal';
import ConfirmationModal from '../../components/ConfirmationModal'; // Import ConfirmationModal
import useDebounce from '../../hooks/useDebounce'; // Import useDebounce

const Sp2dkJobPage = () => {
  const { showNotification } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    client_name: '',
    pic_name: '',
    overall_status: 'pending',
    sp2dk_year: new Date().getFullYear(),
    sp2dk_month: '',
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

  const debouncedFilters = useDebounce(filters, 500); // Debounce filters with a 500ms delay

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSp2dkJobs(debouncedFilters, { page: pagination.page, limit: pagination.limit }); 
      setJobs(data || []);
      setPagination(prev => ({ ...prev, total: (data && data.length) || 0 }));
    } catch (err) {
      setError(err.message || 'Gagal memuat pekerjaan tahunan.');
      showNotification(`Error: ${err.message || 'Gagal memuat pekerjaan SP2DK.'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, pagination.page, pagination.limit, showNotification]);

  useEffect(() => {
    fetchJobs();
  }, [debouncedFilters, pagination.page, pagination.limit, fetchJobs]);

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
        await deleteJob('sp2dk', selectedJobForDelete.job_id); // 'annual' is the jobType for this page
        showNotification('Pekerjaan berhasil dihapus!', 'success');
        fetchJobs(); // Re-fetch jobs after deletion
        closeDeleteModal();
      } catch (err) {
        showNotification(`Error: ${err.message || 'Gagal menghapus pekerjaan.'}`, 'error');
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat pekerjaan SP2DK...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg min-w-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pekerjaan SP2DK</h1>

      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/dashboard/create-job/sp2dk"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md"
        >
          Tambah Pekerjaan SP2DK
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
            <option value="pending">Pending</option>
            <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Tertunda">Tertunda</option>
          </select>
        </div>
        <div>
          <label htmlFor="sp2dk_year" className="block text-sm font-medium text-gray-700">Tahun SP2DK</label>
          <input
            type="number"
            name="sp2dk_year"
            id="sp2dk_year"
            value={filters.sp2dk_year}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="sp2dk_month" className="block text-sm font-medium text-gray-700">Bulan SP2DK</label>
          <select
            name="sp2dk_month"
            id="sp2dk_month"
            value={filters.sp2dk_month}
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
        <div className="overflow-x-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">Klien</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">No. Kontrak</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">Tgl. Kontrak</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">No. SP2DK</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">Status Koreksi</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">PIC</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r whitespace-nowrap">Terakhir Diperbarui</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.job_id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">{job.client_name}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">{job.contract_no}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">
                      {job.contract_date ? new Date(job.contract_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">{job.sp2dk_no}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">
                      <span className={`py-1 px-2 inline-flex justify-center items-center text-xs leading-5 font-semibold rounded-full
                        ${job.overall_status === 'Selesai' ? 'bg-green-100 text-green-800' :
                          job.overall_status === 'Dalam Pengerjaan' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {job.overall_status}
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">{job.correction_status}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">{job.assigned_pic_staff_sigma_name}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r whitespace-nowrap">
                      {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <Link 
                          to={`/dashboard/jobs/sp2dk/${job.job_id}`} // Link to JobDetailPage
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 py-1 px-2 rounded-md inline-flex items-center justify-center"
                          title="Detail"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </Link>
                        <Link
                          to={`/dashboard/jobs/sp2dk/${job.job_id}/edit`} // Link to EditJobPage
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-2 rounded-md inline-flex items-center justify-center"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75v-10.5A2.25 2.25 0 015.25 6H10.5" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openUpdateStatusModal(job)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 py-1 px-2 rounded-md inline-flex items-center justify-center"
                          title="Perbarui Status"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.181m0 0l-3.181 3.181m0-4.992v4.992m0 0h4.992" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(job)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-2 rounded-md inline-flex items-center justify-center"
                          title="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.147-2.009-2.201L8.037 2.009A2.175 2.175 0 005.82 4.147v.916m7.5 0h-3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">Tidak ada pekerjaan SP2DK yang ditemukan.</p>
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
          jobType={'sp2dk'}
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

export default Sp2dkJobPage;
