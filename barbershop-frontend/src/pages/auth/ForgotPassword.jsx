import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scissors, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../services/api'

export default function ForgotPassword() {
  const navigate          = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim email')
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
          Tenang, kami akan bantu kamu masuk kembali ke akunmu
        </p>
      </div>

      {/* Sisi kanan */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1 text-sm text-gray-400
              hover:text-black mb-8 transition">
            <ArrowLeft size={16} /> Kembali ke Login
          </button>

          {!sent ? (
            <>
              <h2 className="text-3xl font-black mb-1">Lupa Password?</h2>
              <p className="text-gray-400 mb-8">
                Masukkan email akunmu dan kami akan kirimkan link untuk reset password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600
                  p-4 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      required placeholder="email@kamu.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                        rounded-xl focus:outline-none focus:border-black transition" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-xl font-bold
                    hover:bg-gray-800 transition disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </span>
                  ) : 'Kirim Link Reset'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black mb-2">Email Terkirim!</h2>
              <p className="text-gray-400 mb-2">
                Link reset password telah dikirim ke:
              </p>
              <p className="font-bold text-black mb-6">{email}</p>
              <p className="text-sm text-gray-400 mb-8">
                Cek inbox atau folder spam kamu. Link akan kadaluarsa dalam 60 menit.
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition">
                Kembali ke Login
              </button>
              <button onClick={() => setSent(false)}
                className="w-full mt-3 border border-gray-200 py-3 rounded-xl
                  text-sm text-gray-500 hover:bg-gray-50 transition">
                Kirim ulang email
              </button>
            </div>
          )}

          <p className="text-center text-sm mt-6 text-gray-400">
            Ingat password kamu?{' '}
            <Link to="/login" className="text-black font-bold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}