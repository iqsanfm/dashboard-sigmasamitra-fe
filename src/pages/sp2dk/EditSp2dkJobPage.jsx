import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { getJobDetails, updateJob, getClients, getStaffs } from '../../utils/api';

const EditSp2dkJobPage = () => {
  const { job_id } = useParams(); // job_type is no longer needed
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const job_type = 'sp2dk'; // Hardcode job_type

  const [formData, setFormData] = useState({
    client_id: '',
    assigned_pic_staff_sigma_id: '',
    overall_status: '',
    contract_no: '',
    contract_date: '',
    sp2dk_no: '',
    sp2dk_date: '',
    bap2dk_no: '',
    bap2dk_date: '',
    payment_date: '',
    report_date: '',
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
          contract_no: jobData.contract_no || '',
          contract_date: jobData.contract_date ? jobData.contract_date.split('T')[0] : '',
          sp2dk_no: jobData.sp2dk_no || '',
          sp2dk_date: jobData.sp2dk_date ? jobData.sp2dk_date.split('T')[0] : '',
          bap2dk_no: jobData.bap2dk_no || '',
          bap2dk_date: jobData.bap2dk_date ? jobData.bap2dk_date.split('T')[0] : '',
          payment_date: jobData.payment_date ? jobData.payment_date.split('T')[0] : '',
          report_date: jobData.report_date ? jobData.report_date.split('T')[0] : '',
        });

        const clientsData = await getClients();
        setClients(clientsData);

        const staffsData = await getStaffs();
        setStaffs(staffsData);

        const client = clientsData.find(c => c.client_id === jobData.client_id);
        setJobName(client ? `${client.client_name} - SP2DK` : `Job ID: ${job_id}`);

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
      await updateJob(job_type, job_id, formData);
      showNotification('Job updated successfully!', 'success');
      navigate(`/dashboard/jobs/sp2dk/${job_id}`);
    } catch (err) {
      setError(err.message || 'Failed to update job.');
      showNotification(`Error: ${err.message || 'Failed to update job.'}`, 'error');
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
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

export default EditSp2dkJobPage;