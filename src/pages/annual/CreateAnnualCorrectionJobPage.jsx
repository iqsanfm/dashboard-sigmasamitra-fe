import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { createJob, getClients, getJobDetails, getStaffs } from '../../utils/api';

const CreateAnnualCorrectionJobPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { original_job_id } = useParams();
  const originalJobType = 'annual';

  const [formData, setFormData] = useState({
    client_id: '',
    assigned_pic_staff_sigma_id: '',
    job_year: '',
    overall_status: 'pending',
    correction_status: '',
    original_job_id: original_job_id,
    tax_reports: [], // Initialize tax_reports
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

        if (original_job_id) {
          const originalJobData = await getJobDetails(originalJobType, original_job_id);
          setFormData(prevData => ({
            ...prevData,
            client_id: originalJobData.client_id || '',
            assigned_pic_staff_sigma_id: originalJobData.assigned_pic_staff_sigma_id || '',
            job_year: originalJobData.job_year || '',
            overall_status: originalJobData.overall_status || 'pending',
            tax_reports: originalJobData.tax_reports || [], // Populate with original reports
          }));
        } else {
          setError('Original job ID is missing.');
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat data awal.');
        showNotification('Error memuat data awal', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [originalJobType, original_job_id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleReportChange = (index, e) => {
    const { name, value } = e.target;
    const newReports = [...formData.tax_reports];
    newReports[index] = { ...newReports[index], [name]: value };
    setFormData((prevData) => ({ ...prevData, tax_reports: newReports }));
  };

  const addReport = () => {
    setFormData((prevData) => ({
      ...prevData,
      tax_reports: [...prevData.tax_reports, { billing_code: '', payment_date: '', payment_amount: 0, report_status: 'Belum Lapor', report_date: '' }],
    }));
  };

  const handleRemoveReport = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      tax_reports: prevData.tax_reports.filter((_, index) => index !== indexToRemove),
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
        job_year: parseInt(formData.job_year, 10),
        job_type: "CORRECTION",
        correction_type: formData.correction_status,
        tax_reports: formData.tax_reports.map(report => ({
          ...report,
          payment_amount: parseInt(report.payment_amount, 10) || 0,
        })),
      };
      delete payload.correction_status;

      await createJob('annual', payload);
      showNotification('Pekerjaan pembetulan berhasil dibuat!', 'success');
      navigate('/dashboard/jobs/annual');
    } catch (err) {
      setError(err.message || 'Gagal membuat pekerjaan pembetulan.');
      showNotification(`Error: ${err.message || 'Gagal membuat pekerjaan pembetulan tahunan.'}`, 'error');
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buat Pekerjaan Pembetulan Tahunan Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... other fields ... */}
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Klien</label>
          <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
            <option value="">Pilih klien</option>
            {clients.map((client) => (<option key={client.client_id} value={client.client_id}>{client.client_name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="assigned_pic_staff_sigma_id" className="block text-sm font-medium text-gray-700 mb-1">Staf PIC</label>
          <select id="assigned_pic_staff_sigma_id" name="assigned_pic_staff_sigma_id" value={formData.assigned_pic_staff_sigma_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
            <option value="">Pilih Staf PIC</option>
            {staffs.map((staff) => (<option key={staff.staff_id} value={staff.staff_id}>{staff.nama} ({staff.role})</option>))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="job_year" className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input type="number" id="job_year" name="job_year" value={formData.job_year} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="correction_status" className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembetulan</label>
            <input type="text" id="correction_status" name="correction_status" value={formData.correction_status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
        </div>

        {/* Tax Reports Section */}
        <div className="border border-gray-200 p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Laporan Pajak</h3>
          {formData.tax_reports.map((report, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-md bg-gray-50 relative">
              <button type="button" onClick={() => handleRemoveReport(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div>
                <label htmlFor={`billing_code-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Kode Billing</label>
                <input type="text" id={`billing_code-${index}`} name="billing_code" value={report.billing_code} onChange={(e) => handleReportChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`payment_date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                <input type="date" id={`payment_date-${index}`} name="payment_date" value={report.payment_date} onChange={(e) => handleReportChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`payment_amount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembayaran</label>
                <input type="number" id={`payment_amount-${index}`} name="payment_amount" value={report.payment_amount} onChange={(e) => handleReportChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`report_status-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Status Laporan</label>
                <input type="text" id={`report_status-${index}`} name="report_status" value={report.report_status} onChange={(e) => handleReportChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`report_date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Tanggal Laporan</label>
                <input type="date" id={`report_date-${index}`} name="report_date" value={report.report_date} onChange={(e) => handleReportChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addReport} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Tambah Laporan</button>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Batal</button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={loading}>{loading ? 'Membuat Pekerjaan...' : 'Buat Pekerjaan'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnualCorrectionJobPage;