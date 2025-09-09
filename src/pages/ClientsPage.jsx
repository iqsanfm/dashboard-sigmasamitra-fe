import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const ClientsPage = ({ userInfo }) => {
  const { showNotification } = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  
  // State for the new comprehensive client form
  const [newClient, setNewClient] = useState({
    client_name: '',
    npwp_client: '',
    address_client: '',
    membership_status: 'active',
    phone_client: '',
    email_client: '',
    pic_client: '',
    djp_online_username: '',
    coretax_username: '',
    coretax_password: '',
    pic_staff_sigma_id: '',
    djp_online_password: '',
    client_category: '',
    pph_final_umkm: false,
    pph_25: false,
    pph_21: false,
    pph_unifikasi: false,
    ppn: false,
    spt_tahunan: false,
    pelaporan_deviden: false,
    laporan_keuangan: false,
    investasi_deviden: false,
    tanggal_terdaftar: '',
    no_sk_terdaftar: '',
    tanggal_pengukuhan_pkp: '',
    no_sk_pengukuhan_pkp: ''
  });

  // State for editing a client
  const [editingClientId, setEditingClientId] = useState(null);
  const [currentEditClient, setCurrentEditClient] = useState(null);

  // State for detail modal
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [staffs, setStaffs] = useState([]);

  // Fetch staffs from API
  const fetchStaffs = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffs(data);
      } else {
        console.error('Failed to fetch staffs.');
      }
    } catch (err) {
      console.error('Network error or unexpected issue while fetching staffs:', err);
    }
  };

  // Fetch clients from API
  const fetchClients = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch clients.');
      }
    } catch (err) {
      setError('Network error or unexpected issue while fetching clients.');
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchStaffs();
  }, []);

  const handleNewClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEditClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEditClient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle adding a new client
  // Handle adding a new client
  const handleAddClient = async (e) => {
    e.preventDefault();
    setAddClientMessage(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setAddClientMessage({ type: 'error', text: 'Authentication token not found.' });
      return;
    }
    if (userInfo?.role !== 'ADMIN') {
      setAddClientMessage({ type: 'error', text: 'You do not have permission to add clients.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        setAddClientMessage({ type: 'success', text: 'Client added successfully!' });
        setShowAddClientForm(false);
        fetchClients(); // Re-fetch client list
        // Reset form
        setNewClient({
            client_name: '', npwp_client: '', address_client: '', membership_status: 'active',
            phone_client: '', email_client: '', pic_client: '', djp_online_username: '',
            coretax_username: '', coretax_password: '', pic_staff_sigma_id: '', djp_online_password: '',
            client_category: '', pph_final_umkm: false, pph_25: false, pph_21: false,
            pph_unifikasi: false, ppn: false, spt_tahunan: false, pelaporan_deviden: false,
            laporan_keuangan: false, investasi_deviden: false, tanggal_terdaftar: '', no_sk_terdaftar: '',
            tanggal_pengukuhan_pkp: '', no_sk_pengukuhan_pkp: ''
        });
      } else {
        const errorData = await response.json();
        setAddClientMessage({ type: 'error', text: errorData.error || 'Failed to add client.' });
      }
    } catch (err) {
      setAddClientMessage({ type: 'error', text: 'Network error or unexpected issue while adding client.' });
      console.error('Add client error:', err);
    }
  };

  // Handle deleting a client
  // Handle deleting a client
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    setDeleteMessage(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setDeleteMessage({ type: 'error', text: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setDeleteMessage({ type: 'success', text: 'Client deleted successfully!' });
        fetchClients();
      } else {
        const errorData = await response.json();
        setDeleteMessage({ type: 'error', text: errorData.error || 'Failed to delete client.' });
      }
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'Network error or unexpected issue while deleting client.' });
      console.error('Delete client error:', err);
    }
  };

  // Handle edit click
  const handleEditClick = (client) => {
    setEditingClientId(client.client_id);
    setCurrentEditClient({ ...client });
    setEditMessage(null);
  };

  // Handle detail click
  const handleDetailClick = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  // Handle close detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedClient(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingClientId(null);
    setEditMessage(null);
  };

  // Handle updating a client
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    showNotification(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      showNotification('Authentication token not found.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${editingClientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(currentEditClient),
      });

      if (response.ok) {
        showNotification('Client updated successfully!', 'success');
        setEditingClientId(null);
        fetchClients();
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to update client.', 'error');
      }
    } catch (err) {
      showNotification('Network error or unexpected issue while updating client.', 'error');
      console.error('Update client error:', err);
    }
  };

  if (loading) return <div className="p-4 text-center"><p className="text-xl font-semibold">Loading clients...</p></div>;
  if (error) return <div className="p-4 text-center text-red-600"><p className="text-xl font-semibold">Error: {error}</p></div>;

  const renderClientForm = (clientData, handleChange, handleSubmit, onCancel, isEditing) => {
    const InputField = ({ name, value, onChange, placeholder, type = 'text', required = false }) => (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{placeholder}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required={required}
        />
      </div>
    );

    const TextAreaField = ({ name, value, onChange, placeholder }) => (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{placeholder}</label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
        />
      </div>
    );

    const SelectField = ({ name, value, onChange, children }) => (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                {children}
            </select>
        </div>
    );

    const CheckboxField = ({ name, checked, onChange, label }) => (
      <label className="flex items-center text-gray-700">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        {label}
      </label>
    );

    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">{isEditing ? 'Edit Client' : 'Add a New Client'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            {/* Column 1 */}
            <div className="flex flex-col">
              <InputField name="client_name" value={clientData.client_name} onChange={handleChange} placeholder="Client Name" required />
              <InputField name="npwp_client" value={clientData.npwp_client} onChange={handleChange} placeholder="NPWP" />
              <TextAreaField name="address_client" value={clientData.address_client} onChange={handleChange} placeholder="Address" />
              <InputField name="phone_client" value={clientData.phone_client} onChange={handleChange} placeholder="Phone" />
              <InputField name="email_client" type="email" value={clientData.email_client} onChange={handleChange} placeholder="Email" />
              <InputField name="pic_client" value={clientData.pic_client} onChange={handleChange} placeholder="PIC Name" />
              <InputField name="pic_staff_sigma_id" value={clientData.pic_staff_sigma_id} onChange={handleChange} placeholder="PIC Staff Sigma ID" />
              <SelectField name="membership_status" value={clientData.membership_status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </div>
            {/* Column 2 */}
            <div className="flex flex-col">
              <InputField name="djp_online_username" value={clientData.djp_online_username} onChange={handleChange} placeholder="DJP Online Username" />
              <InputField name="djp_online_password" type="password" value={clientData.djp_online_password} onChange={handleChange} placeholder="DJP Online Password" />
              <InputField name="coretax_username" value={clientData.coretax_username} onChange={handleChange} placeholder="Coretax Username" />
              <InputField name="coretax_password" type="password" value={clientData.coretax_password} onChange={handleChange} placeholder="Coretax Password" />
              <InputField name="client_category" value={clientData.client_category} onChange={handleChange} placeholder="Client Category" />
              <InputField name="tanggal_terdaftar" type="date" value={clientData.tanggal_terdaftar} onChange={handleChange} placeholder="Tanggal Terdaftar" />
              <InputField name="no_sk_terdaftar" value={clientData.no_sk_terdaftar} onChange={handleChange} placeholder="No SK Terdaftar" />
              <InputField name="tanggal_pengukuhan_pkp" type="date" value={clientData.tanggal_pengukuhan_pkp} onChange={handleChange} placeholder="Tanggal Pengukuhan PKP" />
              <InputField name="no_sk_pengukuhan_pkp" value={clientData.no_sk_pengukuhan_pkp} onChange={handleChange} placeholder="No SK Pengukuhan PKP" />
            </div>
            {/* Column 3 - Checkboxes */}
            <div className="flex flex-col space-y-3">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Tax Obligations</h3>
                <CheckboxField name="pph_final_umkm" checked={clientData.pph_final_umkm} onChange={handleChange} label="PPh Final UMKM" />
                <CheckboxField name="pph_25" checked={clientData.pph_25} onChange={handleChange} label="PPh 25" />
                <CheckboxField name="pph_21" checked={clientData.pph_21} onChange={handleChange} label="PPh 21" />
                <CheckboxField name="pph_unifikasi" checked={clientData.pph_unifikasi} onChange={handleChange} label="PPh Unifikasi" />
                <CheckboxField name="ppn" checked={clientData.ppn} onChange={handleChange} label="PPN" />
                <CheckboxField name="spt_tahunan" checked={clientData.spt_tahunan} onChange={handleChange} label="SPT Tahunan" />
                <CheckboxField name="pelaporan_deviden" checked={clientData.pelaporan_deviden} onChange={handleChange} label="Pelaporan Deviden" />
                <CheckboxField name="laporan_keuangan" checked={clientData.laporan_keuangan} onChange={handleChange} label="Laporan Keuangan" />
                <CheckboxField name="investasi_deviden" checked={clientData.investasi_deviden} onChange={handleChange} label="Investasi Deviden" />
            </div>
          </div>
          <div className="mt-6 flex items-center pt-4 border-t border-gray-200">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">Submit</button>
            {onCancel && <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg ml-4 transition-transform transform hover:scale-105">Cancel</button>}
          </div>
        </form>
      </div>
    )
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedClient) return null;

    const DetailItem = ({ label, value }) => (
      <div className="mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg text-gray-800">{value || '-'}</p>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full max-h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800">{selectedClient.client_name}</h2>
            <button onClick={handleCloseDetail} className="text-gray-500 hover:text-gray-800 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* General Information */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">General Info</h3>
              <DetailItem label="NPWP" value={selectedClient.npwp_client} />
              <DetailItem label="Email" value={selectedClient.email_client} />
              <DetailItem label="Phone" value={selectedClient.phone_client} />
              <DetailItem label="Address" value={selectedClient.address_client} />
            </div>

            {/* PIC & Status */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Contact & Status</h3>
              <DetailItem label="PIC Name" value={selectedClient.pic_client} />
              <DetailItem label="PIC Staff Sigma" value={staffs.find(s => s.staff_id === selectedClient.pic_staff_sigma_id)?.nama || selectedClient.pic_staff_sigma_id} />
              <DetailItem label="Client Category" value={selectedClient.client_category} />
              <DetailItem label="Membership Status" value={selectedClient.membership_status} />
            </div>

            {/* Credentials & Dates */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Credentials & Dates</h3>
              <DetailItem label="DJP Online Username" value={selectedClient.djp_online_username} />
              <DetailItem label="Coretax Username" value={selectedClient.coretax_username} />
              <DetailItem label="Registration Date" value={selectedClient.tanggal_terdaftar} />
              <DetailItem label="Registration SK" value={selectedClient.no_sk_terdaftar} />
              <DetailItem label="PKP Confirmation Date" value={selectedClient.tanggal_pengukuhan_pkp} />
              <DetailItem label="PKP Confirmation SK" value={selectedClient.no_sk_pengukuhan_pkp} />
            </div>
          </div>

          {/* Tax Obligations */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Tax Obligations</h3>
            <div className="flex flex-wrap gap-3">
              {selectedClient.pph_final_umkm && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">PPh Final UMKM</span>}
              {selectedClient.pph_25 && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">PPh 25</span>}
              {selectedClient.pph_21 && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">PPh 21</span>}
              {selectedClient.pph_unifikasi && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">PPh Unifikasi</span>}
              {selectedClient.ppn && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">PPN</span>}
              {selectedClient.spt_tahunan && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">SPT Tahunan</span>}
              {selectedClient.pelaporan_deviden && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Pelaporan Deviden</span>}
              {selectedClient.laporan_keuangan && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Laporan Keuangan</span>}
              {selectedClient.investasi_deviden && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Investasi Deviden</span>}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-right">
            <button onClick={handleCloseDetail} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Clients Management</h1>

      {userInfo?.role === 'ADMIN' && !showAddClientForm && (
        <div className="mb-6 flex space-x-4">
          <button onClick={() => setShowAddClientForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add New Client
          </button>
          <Link to="/dashboard/jobs/create" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            Create New Job
          </Link>
        </div>
      )}

      {showAddClientForm && renderClientForm(newClient, handleNewClientChange, handleAddClient, () => setShowAddClientForm(false), false)}

      {renderDetailModal()}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Client Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">NPWP</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">PIC</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.client_id}>
                {editingClientId === client.client_id ? (
                    <td colSpan="6" className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {renderClientForm(currentEditClient, handleEditClientChange, handleUpdateClient, handleCancelEdit, true)}
                    </td>
                ) : (
                  <>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{client.client_name}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{client.npwp_client}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{client.pic_client}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{client.email_client}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">{client.membership_status}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button onClick={() => handleEditClick(client)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button onClick={() => handleDeleteClient(client.client_id)} className="text-red-600 hover:text-red-900 mr-3">Delete</button>
                      <button onClick={() => handleDetailClick(client)} className="text-gray-600 hover:text-gray-900">Detail</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsPage;
