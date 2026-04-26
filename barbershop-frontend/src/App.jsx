import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Public
import Landing        from './pages/Landing'

// Customer
import Home           from './pages/Home'
import Booking        from './pages/customer/Booking'
import MyReservations from './pages/customer/MyReservations'
import Profile        from './pages/customer/Profile'

// Admin
import AdminLayout       from './components/AdminLayout'
import Dashboard         from './pages/admin/Dashboard'
import ManageBarbers     from './pages/admin/ManageBarbers'
import ManageServices    from './pages/admin/ManageServices'
import ManageReservations from './pages/admin/ManageReservations'
import Hours             from './pages/admin/Hours'
import AdminProfile from './pages/admin/AdminProfile'

// Guards Customer
function CustomerRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />
  return children
}
// Guards Admin
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/home" />
  return <AdminLayout>{children}</AdminLayout>
}

// ── App ─────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/"               element={<Landing />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Customer */}
      <Route path="/home" element={
        <CustomerRoute><Home /></CustomerRoute>
      }/>
      <Route path="/booking" element={
        <CustomerRoute><Booking /></CustomerRoute>
      }/>
      <Route path="/my-reservations" element={
        <CustomerRoute><MyReservations /></CustomerRoute>
      }/>
      <Route path="/profile" element={
        <CustomerRoute><Profile /></CustomerRoute>
      }/>

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <AdminRoute><Dashboard /></AdminRoute>
      }/>
      <Route path="/admin/barbers" element={
        <AdminRoute><ManageBarbers /></AdminRoute>
      }/>
      <Route path="/admin/services" element={
        <AdminRoute><ManageServices /></AdminRoute>
      }/>
      <Route path="/admin/reservations" element={
        <AdminRoute><ManageReservations /></AdminRoute>
      }/>
      <Route path="/admin/hours" element={
        <AdminRoute><Hours /></AdminRoute>
      }/>
      <Route path="/admin/profile" element={
        <AdminRoute><AdminProfile /></AdminRoute>
      }/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}