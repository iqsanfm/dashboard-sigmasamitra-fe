import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { createJob, getClients, getStaffs } from '../../utils/api';

const CreateAnnualJobPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    client_id: '',
    job_year: new Date().getFullYear(),
    assigned_pic_staff_sigma_id: '',
    tax_report: {
      billing_code: '',
      payment_date: '',
      payment_amount: 0,
      report_status: 'Belum Lapor',
      report_date: '',
    },
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
    };
    fetchData();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTaxReportChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      tax_report: {
        ...prevData.tax_report,
        [name]: value,
      },
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
        job_year: parseInt(formData.job_year),
        tax_report: {
          ...formData.tax_report,
          payment_amount: parseInt(formData.tax_report.payment_amount),
        },
      };

      await createJob('annual', payload);
      showNotification('Pekerjaan tahunan berhasil dibuat!', 'success');
      navigate('/dashboard/jobs/annual');
    } catch (err) {
      setError(err.message || 'Gagal membuat pekerjaan.');
      showNotification(`Error: ${err.message || 'Gagal membuat pekerjaan.'}`, 'error');
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buat Pekerjaan Tahunan Baru</h1>
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
          <label htmlFor="job_year" className="block text-sm font-medium text-gray-700 mb-1">Tahun Pekerjaan</label>
          <input
            type="number"
            id="job_year"
            name="job_year"
            value={formData.job_year}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
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

        <div className="border border-gray-200 p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Laporan Pajak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billing_code" className="block text-sm font-medium text-gray-700 mb-1">Kode Billing</label>
              <input
                type="text"
                id="billing_code"
                name="billing_code"
                value={formData.tax_report.billing_code}
                onChange={handleTaxReportChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
              <input
                type="date"
                id="payment_date"
                name="payment_date"
                value={formData.tax_report.payment_date}
                onChange={handleTaxReportChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembayaran</label>
              <input
                type="number"
                id="payment_amount"
                name="payment_amount"
                value={formData.tax_report.payment_amount}
                onChange={handleTaxReportChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="report_status" className="block text-sm font-medium text-gray-700 mb-1">Status Laporan</label>
              <input
                type="text"
                id="report_status"
                name="report_status"
                value={formData.tax_report.report_status}
                onChange={handleTaxReportChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Laporan</label>
              <input
                type="date"
                id="report_date"
                name="report_date"
                value={formData.tax_report.report_date}
                onChange={handleTaxReportChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
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

export default CreateAnnualJobPage;
