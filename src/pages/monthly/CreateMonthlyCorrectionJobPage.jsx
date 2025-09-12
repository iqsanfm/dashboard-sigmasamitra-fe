import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { createJob, getClients, getJobDetails, getStaffs } from '../../utils/api';

const CreateMonthlyCorrectionJobPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { original_job_id } = useParams();
  const originalJobType = 'monthly';

  const [formData, setFormData] = useState({
    client_id: '',
    assigned_pic_staff_sigma_id: '',
    job_year: '',
    job_month: '',
    overall_status: 'pending',
    correction_status: '',
    original_job_id: original_job_id
  });

  const [clients, setClients] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
        const staffsData = await getStaffs();
        setStaffs(staffsData);
      } catch (err) {
        setError(err.message || 'Gagal memuat data awal.');
        showNotification('Error memuat data awal', 'error');
      } finally {
        setLoading(false);
      }

      if (!original_job_id) {
        setError('Original job ID is missing. Cannot load correction job details.');
        setLoading(false);
        return;
      }
      const originalJobData = await getJobDetails(originalJobType, original_job_id);

      setFormData(prevData => ({
        ...prevData,
        client_id: originalJobData.client_id || '',
        assigned_pic_staff_sigma_id: originalJobData.assigned_pic_staff_sigma_id || '',
        job_year: originalJobData.job_year || '',
        job_month: originalJobData.job_month || '',
        overall_status: originalJobData.overall_status || 'pending',
      }));
    };
    fetchData();
  }, [originalJobType, original_job_id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.client_id || !formData.assigned_pic_staff_sigma_id) {
        showNotification('Client and PIC are required.', 'error');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        job_type: "CORRECTION",
        correction_type: formData.correction_status,
      };
      delete payload.correction_status;

      await createJob('monthly', payload);
      showNotification('Pekerjaan pembetulan berhasil dibuat!', 'success');
      navigate('/dashboard/jobs/monthly');
    } catch (err) {
      setError(err.message || 'Gagal membuat pekerjaan pembetulan.');
      showNotification(`Error: ${err.message || 'Gagal membuat pekerjaan pembetulan bulanan.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat data formulir...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buat Pekerjaan Pembetulan Bulanan Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Klien</label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Pilih klien</option>
            {clients.map((client) => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assigned_pic_staff_sigma_id" className="block text-sm font-medium text-gray-700 mb-1">Staf PIC yang Ditugaskan</label>
          <select
            id="assigned_pic_staff_sigma_id"
            name="assigned_pic_staff_sigma_id"
            value={formData.assigned_pic_staff_sigma_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Pilih Staf PIC</option>
            {staffs.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.nama} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label htmlFor="job_month" className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select
                id="job_month"
                name="job_month"
                value={formData.job_month}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Pilih Bulan</option>
                {[...Array(12).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="correction_status" className="block text-sm font-medium text-gray-700 mb-1">Status Pembetulan</label>
              <input
                type="text"
                id="correction_status"
                name="correction_status"
                value={formData.correction_status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
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
            {loading ? 'Membuat Pekerjaan...' : 'Buat Pekerjaan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMonthlyCorrectionJobPage;
