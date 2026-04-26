import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Scissors, Mail, Lock, User, Phone,
  Eye, EyeOff, ArrowRight, Check
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', password:'', password_confirmation:''
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match'); return
    }
    setLoading(true); setError('')
    try {
      const res = await api.post('/register', form)
      login(res.data.user, res.data.token)
      const redirectTo = sessionStorage.getItem('redirect_after_login')
      sessionStorage.removeItem('redirect_after_login')
      navigate(redirectTo || '/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const inputCls = `w-full bg-white/[0.06] border border-white/[0.09]
    rounded-xl py-3.5 text-sm text-gray-200 placeholder-gray-600
    focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
    transition-all`

  const perks = [
    'Book your barber in under 60 seconds',
    'Real-time slot availability',
    'Cancel or reschedule anytime',
  ]

  return (
    <div className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── LEFT PANEL 50% ── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between
        bg-[#0d0d0d] border-r border-white/[0.06] p-16 relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96
            bg-amber-500/8 rounded-full blur-3xl translate-y-48 -translate-x-24" />
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

        <div className="relative space-y-8">
          <div className="space-y-2">
            <p className="text-amber-500 text-sm font-bold tracking-widest
              uppercase">Get started</p>
            <h2 className="text-5xl font-black text-white leading-tight
              tracking-tight">
              Join the<br />
              <span className="text-amber-400">BarberCo</span><br />
              family.
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs">
            Create your free account and start booking professional barbers
            in seconds.
          </p>

          {/* Perks */}
          <div className="space-y-3">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-500/15 rounded-full flex
                  items-center justify-center shrink-0">
                  <Check size={11} className="text-amber-400" strokeWidth={3} />
                </div>
                <p className="text-gray-400 text-sm">{perk}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-700 text-xs">© 2026 BarberCo</p>
      </div>

      {/* ── RIGHT PANEL 50% ── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center
        bg-[#0a0a0a] p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">

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
              Create Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join thousands of satisfied customers
            </p>
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20
              text-red-400 text-sm px-4 py-3.5 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="text" name="name" value={form.name}
                  onChange={handleChange} required placeholder="Your name"
                  className={`${inputCls} pl-11 pr-4`} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="your@email.com"
                  className={`${inputCls} pl-11 pr-4`} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">
                Phone <span className="text-gray-700 normal-case
                  tracking-normal font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="text" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="08xxxxxxxxxx"
                  className={`${inputCls} pl-11 pr-4`} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="Min. 6 characters"
                  className={`${inputCls} pl-11 pr-12`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-gray-500
                uppercase tracking-wider block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2
                  -translate-y-1/2 text-gray-600" />
                <input type="password" name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange} required
                  placeholder="Repeat password"
                  className={`${inputCls} pl-11 pr-4`} />
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
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link to="/login"
              className="text-amber-400 font-semibold hover:text-amber-300
                transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}