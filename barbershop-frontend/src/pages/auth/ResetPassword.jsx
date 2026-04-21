import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Scissors, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

export default function ResetPassword() {
  const navigate                      = useNavigate()
  const [searchParams]                = useSearchParams()
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    email:                 '',
    token:                 '',
    password:              '',
    password_confirmation: '',
  })

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    if (!token || !email) {
      setError('Link reset password tidak valid.')
      return
    }
    setForm(f => ({ ...f, token, email }))
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi tidak cocok')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/reset-password', form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sisi kiri */}
      <div className="hidden md:flex flex-col justify-center items-center
        flex-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center
          justify-center mb-6">
          <Scissors size={30} className="text-black" />
        </div>
        <h1 className="text-4xl font-black mb-3">BarberCo</h1>
        <p className="text-gray-400 text-center max-w-xs">
          Buat password baru yang kuat untuk akunmu
        </p>
      </div>

      {/* Sisi kanan */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black mb-2">Password Berhasil Direset!</h2>
              <p className="text-gray-400 mb-8">
                Kamu sekarang bisa login dengan password baru kamu.
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition">
                Login Sekarang
              </button>
            </div>
          ) : error && !form.token ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center
                justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black mb-2">Link Tidak Valid</h2>
              <p className="text-gray-400 mb-8">
                Link reset password tidak valid atau sudah kadaluarsa.
              </p>
              <button onClick={() => navigate('/forgot-password')}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition">
                Minta Link Baru
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black mb-1">Reset Password</h2>
              <p className="text-gray-400 mb-2">
                Untuk akun: <strong>{form.email}</strong>
              </p>
              <p className="text-gray-400 mb-8 text-sm">
                Buat password baru yang kuat, minimal 6 karakter.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600
                  p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required placeholder="Min. 6 karakter"
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                        rounded-xl focus:outline-none focus:border-black transition" />
                    <button type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-black">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation}
                      onChange={e => setForm({
                        ...form, password_confirmation: e.target.value
                      })}
                      required placeholder="Ulangi password baru"
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                        rounded-xl focus:outline-none focus:border-black transition" />
                    <button type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-black">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password strength indicator */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition
                            ${form.password.length >= i * 3
                              ? i <= 1 ? 'bg-red-400'
                              : i <= 2 ? 'bg-yellow-400'
                              : i <= 3 ? 'bg-blue-400'
                              : 'bg-green-400'
                              : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {form.password.length < 4  ? 'Terlalu pendek' :
                       form.password.length < 7  ? 'Lemah' :
                       form.password.length < 10 ? 'Cukup' : 'Kuat'}
                    </p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-xl font-bold
                    hover:bg-gray-800 transition disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm mt-6 text-gray-400">
                Ingat password kamu?{' '}
                <Link to="/login" className="text-black font-bold hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}