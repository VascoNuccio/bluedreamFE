import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import DashboardUser from '@/pages/DashboardUser'
import DashboardAdmin from '@/pages/DashboardAdmin'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Navbar from './components/Navbar'
import Register from './pages/Register'

const ROLE_USER = import.meta.env.VITE_ROLE_USER;
const ROLE_ADMIN = import.meta.env.VITE_ROLE_ADMIN;
const ROLE_SUPERADMIN = import.meta.env.VITE_ROLE_SUPERADMIN;

export default function App() {
  const { user } = useAuth()

  return (
    <div>
      <Routes>
        
        <Route
          path="/"
          element={user ? (
            user.role === ROLE_ADMIN ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/user" replace />
            )
          ) : (
            <Login />
          )}
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/user"
          element={
            <ProtectedRoute role={ROLE_USER}>
              <Navbar />
              <DashboardUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={[ROLE_ADMIN, ROLE_SUPERADMIN]}>
              <Navbar />
              <DashboardAdmin isSuperadmin={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role={ROLE_SUPERADMIN}>
              <Navbar />
              <DashboardAdmin isSuperadmin={true} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
