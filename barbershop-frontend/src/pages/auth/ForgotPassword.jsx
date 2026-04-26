import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scissors, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

export default function ForgotPassword() {
  const navigate          = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
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
          <div className="space-y-2">
            <p className="text-amber-500 text-sm font-bold tracking-widest uppercase">
              Account Recovery
            </p>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Don't worry,<br />
              <span className="text-amber-400">we've got</span><br />
              you covered.
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs">
            Enter your registered email address and we'll send you a secure
            link to reset your password.
          </p>

          {/* Info card */}
          <div className="bg-white/[0.04] border border-white/[0.08]
            rounded-2xl p-5 space-y-3">
            {[
              'Check your inbox after submitting',
              'The reset link expires in 60 minutes',
              'Check spam folder if not received',
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-500/15 rounded-full flex
                  items-center justify-center shrink-0">
                  <span className="text-amber-400 text-[10px] font-black">
                    {i + 1}
                  </span>
                </div>
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

          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-gray-600
              hover:text-gray-300 text-sm mb-10 transition-colors group">
            <ArrowRight size={14}
              className="rotate-180 group-hover:-translate-x-0.5
                transition-transform" />
            Back to Login
          </button>

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                  Forgot Password?
                </h1>
                <p className="text-gray-600 text-sm">
                  Enter your email and we'll send you a reset link
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
                <div>
                  <label className="text-xs font-bold text-gray-500
                    uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2
                      -translate-y-1/2 text-gray-600" />
                    <input
                      type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      required placeholder="your@email.com"
                      className="w-full bg-white/[0.06] border border-white/[0.09]
                        rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-200
                        placeholder-gray-600 focus:outline-none
                        focus:border-amber-500/50 focus:bg-white/[0.08]
                        transition-all" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white
                    font-bold py-4 rounded-xl transition-all duration-200
                    disabled:opacity-50 hover:shadow-xl hover:shadow-amber-500/20
                    hover:-translate-y-0.5">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
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
          ) : (
            /* ── SUCCESS STATE ── */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 border
                border-green-500/20 rounded-3xl flex items-center
                justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-green-400"
                  strokeWidth={1.8} />
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                Email Sent!
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                We've sent a reset link to:
              </p>
              <p className="text-amber-400 font-bold text-base mb-8">
                {email}
              </p>

              <div className="bg-white/[0.03] border border-white/[0.07]
                rounded-2xl p-5 text-left space-y-3 mb-8">
                {[
                  ['Check your inbox', 'The email should arrive within a few minutes'],
                  ['Check spam folder', 'Sometimes reset emails end up in spam'],
                  ['Link expires in 60 min', 'Request a new one if it expires'],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-500/15 rounded-full flex
                      items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-400 text-[10px] font-black">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm font-semibold">
                        {title}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/login')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-4 rounded-xl transition-all duration-200
                  hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-0.5 mb-3">
                Back to Login
              </button>

              <button onClick={() => setSent(false)}
                className="w-full border border-white/[0.08] text-gray-500
                  hover:text-gray-300 hover:border-white/15 py-4 rounded-xl
                  text-sm font-medium transition-all">
                Resend Email
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}