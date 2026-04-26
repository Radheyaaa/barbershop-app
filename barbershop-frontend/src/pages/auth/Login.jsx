import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scissors, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/login', form)
      login(res.data.user, res.data.token)
      const redirectTo = sessionStorage.getItem('redirect_after_login')
      sessionStorage.removeItem('redirect_after_login')
      if (res.data.user.role === 'admin') navigate('/admin/dashboard')
      else if (redirectTo) navigate(redirectTo)
      else navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT PANEL 50% ── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between
        bg-[#0d0d0d] border-r border-white/[0.06] p-16 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96
            bg-amber-500/8 rounded-full blur-3xl translate-y-48 -translate-x-24" />
          <div className="absolute top-1/3 right-0 w-64 h-64
            bg-amber-500/5 rounded-full blur-3xl translate-x-24" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center
            justify-center shadow-lg shadow-amber-500/30">
            <Scissors size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">
            BarberCo
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="space-y-1">
            <p className="text-amber-500 text-sm font-bold tracking-widest
              uppercase">Welcome back</p>
            <h2 className="text-5xl font-black text-white leading-tight
              tracking-tight">
              Look sharp,<br />
              <span className="text-amber-400">feel sharp.</span>
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs">
            Sign in to manage your appointments and keep your style on point.
          </p>

          {/* Testimonial */}
          <div className="mt-8 bg-white/[0.04] border border-white/[0.08]
            rounded-2xl p-5">
            <p className="text-gray-400 text-sm leading-relaxed italic mb-4">
              "Best barbershop booking experience. Quick, professional, and
              always on time."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex
                items-center justify-center">
                <span className="text-amber-400 text-xs font-bold">A</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Aldi Pratama</p>
                <p className="text-gray-600 text-xs">Regular Customer</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-gray-700 text-xs">© 2026 BarberCo</p>
      </div>

      {/* ── RIGHT PANEL 50% ── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center
        bg-[#0a0a0a] p-8">
        <div className="w-full max-w-md">

          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-600
              hover:text-gray-300 text-sm mb-10 transition-colors group">
            <ArrowRight size={14}
              className="rotate-180 group-hover:-translate-x-0.5
                transition-transform" />
            Back to home
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              Sign In
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20
              text-red-400 text-sm px-4 py-3.5 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="your@email.com"
                  className="w-full bg-white/[0.06] border border-white/[0.09]
                    rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-200
                    placeholder-gray-600 focus:outline-none
                    focus:border-amber-500/50 focus:bg-white/[0.08]
                    transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/[0.09]
                    rounded-xl pl-11 pr-12 py-3.5 text-sm text-gray-200
                    placeholder-gray-600 focus:outline-none
                    focus:border-amber-500/50 focus:bg-white/[0.08]
                    transition-all" />
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password"
                  className="text-xs text-gray-600 hover:text-amber-400
                    transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white
                font-bold py-4 rounded-xl transition-all duration-200
                disabled:opacity-50 hover:shadow-xl hover:shadow-amber-500/20
                hover:-translate-y-0.5 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30
                    border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-amber-400 font-semibold hover:text-amber-300
                transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}