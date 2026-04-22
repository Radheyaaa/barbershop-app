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

  const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl
    py-3.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none
    focus:border-amber-500/50 transition-colors`

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px]
        shrink-0 bg-[#0d0d0d] border-r border-white/[0.06] p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center
            justify-center">
            <Scissors size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl text-amber-400 tracking-tight">
            BarberCo
          </span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white leading-tight">
            Welcome back to<br />
            <span className="text-amber-400">BarberCo</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sign in to manage your appointments and keep your style on point.
          </p>
        </div>
        <p className="text-gray-700 text-xs">© 2026 BarberCo</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300
              text-sm mb-10 transition-colors">
            <ArrowRight size={14} className="rotate-180" />
            Back to home
          </button>

          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            Sign In
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 text-red-400
              text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600
                uppercase tracking-wider block mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="your@email.com"
                  className={`${inputCls} pl-11 pr-4`} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600
                uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className={`${inputCls} pl-11 pr-12`} />
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password"
                className="text-xs text-gray-600 hover:text-amber-400
                  transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white
                font-bold py-3.5 rounded-xl transition-all duration-200
                disabled:opacity-50 mt-2 hover:shadow-lg
                hover:shadow-amber-500/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30
                    border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-amber-400 font-semibold hover:text-amber-300
                transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}