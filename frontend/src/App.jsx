import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import PatientDashboard from './pages/PatientDashboard'

function App() {
  const [currentUser, setCurrentUser] = useState(null); // { role: 'admin'|'receptionist'|'patient', data: {...} }

  // A simple pseudo-auth middleware wrapper
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!currentUser) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />; // Role mismatch
    }
    return children;
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home onLogin={setCurrentUser} currentUser={currentUser} />} />
        
        <Route element={<Layout currentUser={currentUser} onLogout={() => setCurrentUser(null)} />}>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receptionist" 
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard currentUser={currentUser} />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
