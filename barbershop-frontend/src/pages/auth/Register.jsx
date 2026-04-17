import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scissors, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/register', form)
      login(res.data.user, res.data.token)
      navigate('/home')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors
      if (typeof message === 'object') {
        setError(Object.values(message)[0][0])
      } else {
        setError(message || 'Pendaftaran gagal')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sisi kiri — branding */}
      <div className="hidden md:flex flex-col justify-center items-center
        flex-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center
          justify-center mb-6">
          <Scissors size={30} className="text-black" />
        </div>
        <h1 className="text-4xl font-black mb-3">BarberCo</h1>
        <p className="text-gray-400 text-center max-w-xs">
          Daftar sekarang dan nikmati kemudahan booking barber profesional
        </p>
      </div>

      {/* Sisi kanan — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {/* Back to landing */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-gray-400
              hover:text-black mb-8 transition">
            ← Kembali ke Beranda
          </button>

          <h2 className="text-3xl font-black mb-1">Daftar Akun</h2>
          <p className="text-gray-400 mb-8">Buat akun BarberCo kamu sekarang</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
              p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={form.name}
                  onChange={handleChange} required
                  placeholder="Nama kamu"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                    rounded-xl focus:outline-none focus:border-black transition" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="email@kamu.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                    rounded-xl focus:outline-none focus:border-black transition" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nomor Telepon (Opsional)
              </label>
              <div className="relative">
                <Phone size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={form.phone}
                  onChange={handleChange}
                  placeholder="+62812345678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                    rounded-xl focus:outline-none focus:border-black transition" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                    rounded-xl focus:outline-none focus:border-black transition" />
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-black">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showConfirmPass ? 'text' : 'password'}
                  name="password_confirmation" value={form.password_confirmation}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                    rounded-xl focus:outline-none focus:border-black transition" />
                <button type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-black">
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-bold
                hover:bg-gray-800 transition disabled:opacity-50 text-lg mt-6">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : 'Daftar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login"
              className="text-black font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}