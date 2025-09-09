import ProtectedRoute from './ProtectedRoute';
import React, { useState, useEffect } from 'react';
import { Link, Outlet, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import StaffsPage from '../pages/StaffsPage';
import ClientsPage from '../pages/ClientsPage';
import JobDetailPage from '../pages/JobDetailPage';
import CreateJobPage from '../pages/CreateJobPage';
import MonthlyJobsPage from '../pages/MonthlyJobsPage';
import EditJobPage from '../pages/EditJobPage'; // Import EditJobPage

const DashboardLayout = ({ userInfo, onLogout }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect for initial role-based redirection
  useEffect(() => {
    if (userInfo && location.pathname === '/dashboard') {
      if (userInfo.role === 'ADMIN') {
        navigate('/dashboard/admin-home', { replace: true });
      } else {
        navigate('/dashboard/user-home', { replace: true });
      }
    }
  }, [userInfo, navigate, location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-20'}`}
      >
        <div className="p-4 text-2xl font-bold border-b border-gray-700 flex items-center justify-between">
          {isSidebarExpanded ? (userInfo?.role === 'ADMIN' ? 'Admin Panel' : 'User Panel') : 'AP'}
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            {isSidebarExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3H3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {/* Update links to point to specific home pages */}
          {userInfo?.role === 'ADMIN' ? (
            <Link to="/dashboard/admin-home" className={`block py-3 rounded hover:bg-gray-700 flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
              {isSidebarExpanded ? 'Admin Home' : 'AH'}
            </Link>
          ) : (
            <Link to="/dashboard/user-home" className={`block py-3 rounded hover:bg-gray-700 flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
              {isSidebarExpanded ? 'User Home' : 'UH'}
            </Link>
          )}

          {userInfo?.role === 'ADMIN' && (
            <>
              <Link to="/dashboard/staffs" className={`block py-3 rounded hover:bg-gray-700 flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
                {isSidebarExpanded ? 'Staffs' : 'S'}
              </Link>
              <Link to="/dashboard/clients" className={`block py-3 rounded hover:bg-gray-700 flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
                {isSidebarExpanded ? 'Clients' : 'C'}
              </Link>
              {/* New Jobs Section */}
              <div className="py-2">
                <span className={`block py-3 text-xs font-semibold text-gray-400 uppercase flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
                  {isSidebarExpanded ? 'Pekerjaan' : 'PJ'} {/* Conditional rendering */}
                </span>
                <Link to="/dashboard/jobs/monthly" className={`block py-3 rounded hover:bg-gray-700 flex items-center ${isSidebarExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
                  {isSidebarExpanded ? 'Pekerjaan Bulanan' : 'PB'}
                </Link>
                {/* Add other job types here */}
              </div>
            </>
          )}
          {/* Add more navigation links here */}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
          >
            {isSidebarExpanded ? 'Logout' : 'L'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <h2 className="text-xl font-semibold">Welcome, {userInfo?.nama || userInfo?.staff_id || 'User'}!</h2>
          {/* User dropdown or other top bar elements */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <Routes> {/* Nested Routes for Dashboard content */}
            <Route path="user-home" element={<ProtectedRoute allowedRoles={['STAFF', 'KEUANGAN', 'ADMIN']} userInfo={userInfo}><DashboardPage userInfo={userInfo} onLogout={onLogout} /></ProtectedRoute>} />
            <Route path="admin-home" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><DashboardPage userInfo={userInfo} onLogout={onLogout} /></ProtectedRoute>} />
            <Route path="staffs" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><StaffsPage /></ProtectedRoute>} />
            <Route path="clients" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><ClientsPage userInfo={userInfo} /></ProtectedRoute>} />
            <Route path="jobs/monthly" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><MonthlyJobsPage /></ProtectedRoute>} />
            <Route path="create-job" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><CreateJobPage /></ProtectedRoute>} />
            <Route path="jobs/:job_type/:job_id" element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'KEUANGAN']} userInfo={userInfo}><JobDetailPage /></ProtectedRoute>} />
            <Route path="jobs/:job_type/:job_id/edit" element={<ProtectedRoute allowedRoles={['ADMIN']} userInfo={userInfo}><EditJobPage /></ProtectedRoute>} />
            {/* Redirect root /dashboard to the appropriate home based on role */}
            <Route
              path="/"
              element={
                userInfo?.role === 'ADMIN' ? (
                  <Navigate to="admin-home" replace />
                ) : (
                  <Navigate to="user-home" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;