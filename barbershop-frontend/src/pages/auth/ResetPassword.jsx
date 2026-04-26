import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Scissors, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, ArrowRight, Check
} from 'lucide-react'
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
    email: '', token: '',
    password: '', password_confirmation: '',
  })

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    if (!token || !email) {
      setError('Invalid or expired reset link.')
      return
    }
    setForm(f => ({ ...f, token, email }))
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match'); return
    }
    setLoading(true); setError('')
    try {
      await api.post('/reset-password', form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length
  const strengthConfig = strength === 0
    ? { label: '', color: '' }
    : strength < 4
      ? { label: 'Too short', color: 'bg-red-500' }
      : strength < 7
        ? { label: 'Weak', color: 'bg-yellow-500' }
        : strength < 10
          ? { label: 'Good', color: 'bg-blue-500' }
          : { label: 'Strong', color: 'bg-green-500' }

  const inputCls = `w-full bg-white/[0.06] border border-white/[0.09]
    rounded-xl py-3.5 text-sm text-gray-200 placeholder-gray-600
    focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
    transition-all`

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

        <div className="relative space-y-6">
          <div className="space-y-2">
            <p className="text-amber-500 text-sm font-bold tracking-widest uppercase">
              Set New Password
            </p>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Almost<br />
              <span className="text-amber-400">there.</span>
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs">
            Create a strong new password to secure your BarberCo account.
          </p>

          {/* Password tips */}
          <div className="bg-white/[0.04] border border-white/[0.08]
            rounded-2xl p-5 space-y-3">
            <p className="text-gray-400 text-xs font-bold uppercase
              tracking-wider mb-1">
              Password Tips
            </p>
            {[
              'Use at least 6 characters',
              'Mix letters and numbers',
              'Avoid common passwords',
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check size={13} className="text-amber-400 shrink-0"
                  strokeWidth={3} />
                <p className="text-gray-400 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-700 text-xs">© 2026 BarberCo</p>
      </div>

      {/* ── RIGHT PANEL 50% ── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center
        bg-[#0a0a0a] p-8">
        <div className="w-full max-w-md">

          {/* Success state */}
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 border
                border-green-500/20 rounded-3xl flex items-center
                justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-green-400"
                  strokeWidth={1.8} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                Password Reset!
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Your password has been successfully updated.
                You can now sign in with your new password.
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-4 rounded-xl transition-all duration-200
                  hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-0.5">
                Sign In Now
              </button>
            </div>

          /* Invalid link state */
          ) : error && !form.token ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/10 border
                border-red-500/20 rounded-3xl flex items-center
                justify-center mx-auto mb-6">
                <AlertCircle size={36} className="text-red-400"
                  strokeWidth={1.8} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                Invalid Link
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                This reset link is invalid or has expired.
                Please request a new one.
              </p>
              <button onClick={() => navigate('/forgot-password')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-4 rounded-xl transition-all duration-200
                  hover:shadow-xl hover:shadow-amber-500/20">
                Request New Link
              </button>
            </div>

          /* Form state */
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-gray-600
                  hover:text-gray-300 text-sm mb-10 transition-colors group">
                <ArrowRight size={14}
                  className="rotate-180 group-hover:-translate-x-0.5
                    transition-transform" />
                Back to Login
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                  Reset Password
                </h1>
                <p className="text-gray-600 text-sm">
                  For account:{' '}
                  <span className="text-amber-400 font-medium">{form.email}</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-500/8 border border-red-500/20
                  text-red-400 text-sm px-4 py-3.5 rounded-xl mb-6
                  flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="text-xs font-bold text-gray-500
                    uppercase tracking-wider block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2
                      -translate-y-1/2 text-gray-600" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required placeholder="Min. 6 characters"
                      className={`${inputCls} pl-11 pr-12`} />
                    <button type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                        text-gray-600 hover:text-gray-300 transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {form.password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[3, 6, 9, 12].map(n => (
                          <div key={n}
                            className={`h-1 flex-1 rounded-full transition-all
                              duration-300
                              ${form.password.length >= n
                                ? strengthConfig.color
                                : 'bg-white/10'}`} />
                        ))}
                      </div>
                      {strengthConfig.label && (
                        <p className="text-xs text-gray-600">
                          Strength:{' '}
                          <span className={`font-semibold
                            ${strength < 4 ? 'text-red-400'
                              : strength < 7 ? 'text-yellow-400'
                              : strength < 10 ? 'text-blue-400'
                              : 'text-green-400'}`}>
                            {strengthConfig.label}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-xs font-bold text-gray-500
                    uppercase tracking-wider block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2
                      -translate-y-1/2 text-gray-600" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation}
                      onChange={e => setForm({
                        ...form, password_confirmation: e.target.value
                      })}
                      required placeholder="Repeat new password"
                      className={`${inputCls} pl-11 pr-12`} />
                    <button type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                        text-gray-600 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {form.password_confirmation && (
                    <p className={`text-xs mt-1.5 flex items-center gap-1.5
                      ${form.password === form.password_confirmation
                        ? 'text-green-400' : 'text-red-400'}`}>
                      {form.password === form.password_confirmation ? (
                        <><Check size={12} strokeWidth={3} /> Passwords match</>
                      ) : (
                        <><AlertCircle size={12} /> Passwords do not match</>
                      )}
                    </p>
                  )}
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
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-8">
                Remember your password?{' '}
                <Link to="/login"
                  className="text-amber-400 font-semibold hover:text-amber-300
                    transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}