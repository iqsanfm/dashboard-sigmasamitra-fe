import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { updateJobStatus } from '../utils/api'; // We will create this function

const UpdateJobStatusModal = ({ isOpen, onClose, jobType, jobId, currentStatus, onStatusUpdated }) => {
  const { showNotification } = useNotification();
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [proofOfWorkFile, setProofOfWorkFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('overall_status', newStatus);
    if (proofOfWorkFile) {
      formData.append('proof_of_work_pdf', proofOfWorkFile);
    }

    try {
      await updateJobStatus(jobType, jobId, formData);
      showNotification('Status pekerjaan berhasil diperbarui!', 'success');
      onStatusUpdated(); // Callback to refresh data in parent component
      onClose();
    } catch (err) {
      showNotification(`Error: ${err.message || 'Gagal memperbarui status pekerjaan.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Perbarui Status Pekerjaan</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status Baru</label>
            <select
              id="status"
              name="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
              <option value="Selesai">Selesai</option>
              <option value="Tertunda">Tertunda</option>
              {/* Add other relevant statuses */}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">Bukti Kerja (PDF, Opsional)</label>
            <input
              type="file"
              id="proof"
              name="proof"
              accept=".pdf"
              onChange={(e) => setProofOfWorkFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Memperbarui...' : 'Perbarui Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateJobStatusModal;
