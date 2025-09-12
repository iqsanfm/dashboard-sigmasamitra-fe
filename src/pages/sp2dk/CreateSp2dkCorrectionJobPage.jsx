import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { createJob, getClients, getJobDetails, getStaffs } from '../../utils/api';

const CreateSp2dkCorrectionJobPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { original_job_id } = useParams();
  const originalJobType = 'sp2dk';

  const [formData, setFormData] = useState({
    client_id: '',
    assigned_pic_staff_sigma_id: '',
    contract_no: '',
    contract_date: '',
    sp2dk_no: '',
    sp2dk_date: '',
    bap2dk_no: '',
    bap2dk_date: '',
    payment_date: '',
    report_date: '',
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
        contract_no: originalJobData.contract_no || '',
        contract_date: originalJobData.contract_date ? originalJobData.contract_date.split('T')[0] : '',
        sp2dk_no: originalJobData.sp2dk_no || '',
        sp2dk_date: originalJobData.sp2dk_date ? originalJobData.sp2dk_date.split('T')[0] : '',
        bap2dk_no: originalJobData.bap2dk_no || '',
        bap2dk_date: originalJobData.bap2dk_date ? originalJobData.bap2dk_date.split('T')[0] : '',
        payment_date: originalJobData.payment_date ? originalJobData.payment_date.split('T')[0] : '',
        report_date: originalJobData.report_date ? originalJobData.report_date.split('T')[0] : '',
        overall_status: originalJobData.overall_status || 'pending',
        // correction_status is for the new job, not inherited
        // original_job_id is already set
      }));
    };
    fetchData();
  }, [originalJobType, original_job_id, showNotification]); // Added showNotification to deps

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
        job_type: "CORRECTION", // Ensure job_type is CORRECTION for correction jobs
        correction_type: formData.correction_status, // Map correction_status to correction_type
      };
      // Remove correction_status from payload as it's mapped to correction_type
      delete payload.correction_status;

      await createJob('sp2dk', payload); // 'sp2dk' is the jobType for the API endpoint
      showNotification('Pekerjaan pembetulan berhasil dibuat!', 'success');
      navigate('/dashboard/jobs/sp2dk');
    } catch (err) {
      setError(err.message || 'Gagal membuat pekerjaan pembetulan.');
      showNotification(`Error: ${err.message || 'Gagal membuat pekerjaan pembetulan SP2DK.'}`, 'error');
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buat Pekerjaan SP2DK Baru</h1>
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
            <label htmlFor="contract_no" className="block text-sm font-medium text-gray-700 mb-1">No. Kontrak</label>
            <input
              type="text"
              id="contract_no"
              name="contract_no"
              value={formData.contract_no}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="contract_date" className="block text-sm font-medium text-gray-700 mb-1">Tgl. Kontrak</label>
            <input
              type="date"
              id="contract_date"
              name="contract_date"
              value={formData.contract_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="sp2dk_no" className="block text-sm font-medium text-gray-700 mb-1">No. SP2DK</label>
            <input
              type="text"
              id="sp2dk_no"
              name="sp2dk_no"
              value={formData.sp2dk_no}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="sp2dk_date" className="block text-sm font-medium text-gray-700 mb-1">Tgl. SP2DK</label>
            <input
              type="date"
              id="sp2dk_date"
              name="sp2dk_date"
              value={formData.sp2dk_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bap2dk_no" className="block text-sm font-medium text-gray-700 mb-1">No. BAP2DK</label>
            <input
              type="text"
              id="bap2dk_no"
              name="bap2dk_no"
              value={formData.bap2dk_no}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bap2dk_date" className="block text-sm font-medium text-gray-700 mb-1">Tgl. BAP2DK</label>
            <input
              type="date"
              id="bap2dk_date"
              name="bap2dk_date"
              value={formData.bap2dk_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Laporan</label>
            <input
              type="date"
              id="report_date"
              name="report_date"
              value={formData.report_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="overall_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

export default CreateSp2dkCorrectionJobPage;