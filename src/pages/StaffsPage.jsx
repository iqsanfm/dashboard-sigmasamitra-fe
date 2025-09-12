import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const StaffsPage = () => {
  const { showNotification } = useNotification();
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff'); // Default role
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [currentEditName, setCurrentEditName] = useState('');
  const [currentEditEmail, setCurrentEditEmail] = useState('');
  const [currentEditRole, setCurrentEditRole] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewStaffPassword, setShowNewStaffPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchStaffs = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffs(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch staffs.');
      }
    } catch (err) {
      setError('Network error or unexpected issue while fetching staffs.');
      console.error('Fetch staffs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    showNotification(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      showNotification({ type: 'error', text: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          role: newStaffRole,
        }),
      });

      if (response.ok) {
        showNotification('Staff added successfully!', 'success');
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPassword('');
        setNewStaffRole('staff');
        setShowAddStaffForm(false); // Hide form after success
        fetchStaffs(); // Re-fetch staff list
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to add staff.', 'error');
      }
    } catch (err) {
      showNotification('Network error or unexpected issue while adding staff.', 'error');
      console.error('Add staff error:', err);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    showNotification(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      showNotification('Authentication token not found.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showNotification('Staff deleted successfully!', 'success');
        fetchStaffs(); // Re-fetch staff list
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to delete staff.', 'error');
      }
    } catch (err) {
      showNotification('Network error or unexpected issue while deleting staff.', 'error');
      console.error('Delete staff error:', err);
    }
  };

  const handleEditClick = (staff) => {
    setEditingStaffId(staff.staff_id);
    setCurrentEditName(staff.nama);
    setCurrentEditEmail(staff.email);
    setCurrentEditRole(staff.role);
    setShowEditModal(true);
    showNotification(null);
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setShowEditModal(false);
    showNotification(null);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    showNotification(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      showNotification('Authentication token not found.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/${editingStaffId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: currentEditName,
          email: currentEditEmail,
          role: currentEditRole,
        }),
      });

      if (response.ok) {
        showNotification('Staff updated successfully!', 'success');
        setEditingStaffId(null); // Exit edit mode
        setShowEditModal(false);
        fetchStaffs(); // Re-fetch staff list
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to update staff.', 'error');
      }
    } catch (err) {
      showNotification('Network error or unexpected issue while updating staff.', 'error');
      console.error('Update staff error:', err);
    }
  };

  const toggleNewStaffPasswordVisibility = () => {
    setShowNewStaffPassword(!showNewStaffPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-xl font-semibold">Loading staffs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="text-xl font-semibold">Error: {error}</p>
      </div>
    );
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    showNotification(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      showNotification('Authentication token not found.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/staffs/${editingStaffId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (response.ok) {
        showNotification('Password updated successfully!', 'success');
        setShowChangePasswordModal(false);
        setNewPassword('');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to update password.', 'error');
      }
    } catch (err) {
      showNotification('Network error or unexpected issue while updating password.', 'error');
      console.error('Update password error:', err);
    }
  };

  const renderChangePasswordModal = () => {
    if (!showChangePasswordModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Change Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 focus:outline-none top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.622a8.967 8.967 0 01.998-.756A48.322 48.322 0 0112 3c2.32 0 4.65.656 6.892 1.916c.32.15.63.31.93.48l.001.001c.88.49 1.45 1.24 1.45 2.11v.001c0 .87-.57 1.62-1.45 2.11l-.001.001c-.3.17-.61.33-.93.48A48.322 48.322 0 0112 21c-2.32 0-4.65-.656-6.892-1.916c-.32-.15-.63-.31-.93-.48l-.001-.001c-.88-.49-1.45-1.24-1.45-2.11v-.001c0-.87.57-1.62 1.45-2.11l.001-.001c.3-.17.61-.33.93-.48A48.322 48.322 0 0112 3z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">Update Password</button>
              <button type="button" onClick={() => { setShowChangePasswordModal(false); setNewPassword(''); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg ml-4 transition-transform transform hover:scale-105">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Edit Staff</h2>
          <form onSubmit={handleUpdateStaff}>
            <div className="mb-4">
              <label htmlFor="currentEditName" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                id="currentEditName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentEditName}
                onChange={(e) => setCurrentEditName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="currentEditEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                id="currentEditEmail"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentEditEmail}
                onChange={(e) => setCurrentEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="currentEditRole" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select
                id="currentEditRole"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentEditRole}
                onChange={(e) => setCurrentEditRole(e.target.value)}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="KEUANGAN">Keuangan</option>
              </select>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">Save Changes</button>
                <button type="button" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">Cancel</button>
              </div>
              <button type="button" onClick={() => setShowChangePasswordModal(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 ml-6">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Staffs Management</h1>
      
      <button
        onClick={() => setShowAddStaffForm(!showAddStaffForm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showAddStaffForm ? 'Cancel Add Staff' : 'Add New Staff'}
      </button>

      {showAddStaffForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Add New Staff</h2>
          <form onSubmit={handleAddStaff}>
            <div className="mb-4">
              <label htmlFor="newStaffName" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                id="newStaffName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newStaffEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                id="newStaffEmail"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newStaffPassword" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showNewStaffPassword ? "text" : "password"}
                  id="newStaffPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={toggleNewStaffPasswordVisibility}
                  className="absolute right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 focus:outline-none top-1/2 -translate-y-1/2"
                >
                  {showNewStaffPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.622a8.967 8.967 0 01.998-.756A48.322 48.322 0 0112 3c2.32 0 4.65.656 6.892 1.916c.32.15.63.31.93.48l.001.001c.88.49 1.45 1.24 1.45 2.11v.001c0 .87-.57 1.62-1.45 2.11l-.001.001c-.3.17-.61.33-.93.48A48.322 48.322 0 0112 21c-2.32 0-4.65-.656-6.892-1.916c-.32-.15-.63-.31-.93-.48l-.001-.001c-.88-.49-1.45-1.24-1.45-2.11v-.001c0-.87.57-1.62 1.45-2.11l.001-.001c.3-.17.61-.33.93-.48A48.322 48.322 0 0112 3z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="newStaffRole" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select
                id="newStaffRole"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
              >
                <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                      <option value="KEUANGAN">Keuangan</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              Add Staff
            </button>
          </form>
        </div>
      )}

      {renderEditModal()}
      {renderChangePasswordModal()}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r">Role</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.staff_id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                  {staff.nama}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                  {staff.email}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r">
                  {staff.role}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button 
                    onClick={() => handleEditClick(staff)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteStaff(staff.staff_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffsPage;
