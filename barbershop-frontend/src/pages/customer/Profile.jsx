import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, User, Mail, Phone,
  Lock, Eye, EyeOff, Scissors, Check, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Profile() {
  const navigate           = useNavigate()
  const { user, login, token } = useAuth()
  const fileRef            = useRef()

  const [activeTab, setActiveTab]   = useState('profile')
  const [saving, setSaving]         = useState(false)
  const [feedback, setFeedback]     = useState(null) // {msg, ok}

  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  })
  const [emailForm, setEmailForm] = useState({
    email:    user?.email || '',
    password: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '', new_password: '', new_password_confirmation: '',
  })

  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass]         = useState(false)
  const [photoPreview, setPhotoPreview]       = useState(null)
  const [photoFile, setPhotoFile]             = useState(null)

  const showFeedback = (msg, ok = true) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handlePhotoChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', profileForm.name)
      fd.append('phone', profileForm.phone)
      if (photoFile) fd.append('photo', photoFile)
      const res = await api.post('/profile/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      login(res.data.data, token)
      setPhotoFile(null)
      showFeedback('Profile updated successfully!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to update', false)
    } finally { setSaving(false) }
  }

  const handleSaveEmail = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await api.post('/profile/update-email', emailForm)
      login(res.data.data, token)
      setEmailForm({ ...emailForm, password: '' })
      showFeedback('Email updated successfully!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to update', false)
    } finally { setSaving(false) }
  }

  const handleSavePassword = async e => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showFeedback('Passwords do not match', false); return
    }
    setSaving(true)
    try {
      await api.post('/profile/update-password', passwordForm)
      setPasswordForm({ current_password:'', new_password:'', new_password_confirmation:'' })
      showFeedback('Password updated successfully!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to update', false)
    } finally { setSaving(false) }
  }

  const avatarUrl = photoPreview || user?.photo_url || null

  const tabs = [
    { id:'profile',  label:'Profile',  icon:<User size={15} /> },
    { id:'email',    label:'Email',    icon:<Mail size={15} /> },
    { id:'password', label:'Password', icon:<Lock size={15} /> },
  ]

  const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl
    py-3.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none
    focus:border-amber-500/50 transition-colors`

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-[#0d0d0d] border-b border-white/[0.06] px-6 py-4
        flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => navigate('/home')}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-200
            hover:bg-white/5 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
            <Scissors size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-base text-amber-400">BarberCo</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-5">

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl
            text-sm font-medium border
            ${feedback.ok
              ? 'bg-green-500/8 border-green-500/20 text-green-400'
              : 'bg-red-500/8 border-red-500/20 text-red-400'}`}>
            {feedback.ok ? <Check size={16} /> : <X size={16} />}
            {feedback.msg}
          </div>
        )}

        {/* Avatar card */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
          p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5
              border border-white/[0.07] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile"
                  className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-700" strokeWidth={1.5} />
              )}
            </div>
            <button onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500
                hover:bg-amber-400 rounded-xl flex items-center justify-center
                transition-all shadow-lg shadow-amber-500/20">
              <Camera size={14} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="font-black text-white text-lg tracking-tight">
              {user?.name}
            </p>
            <p className="text-gray-600 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 bg-amber-500/10 text-amber-400
              text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase
              tracking-wider">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
          p-1.5 flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2
                py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:text-gray-300'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-5 tracking-tight">
              Edit Profile
            </h3>

            {photoFile && (
              <div className="bg-amber-500/8 border border-amber-500/20
                rounded-xl p-3 flex items-center gap-3 text-sm
                text-amber-400 mb-4">
                <Camera size={15} />
                New photo selected
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="ml-auto hover:text-amber-300">
                  <X size={15} />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type="text" value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className={`${inputCls} pl-11 pr-4`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type="text" value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className={`${inputCls} pl-11 pr-4`} placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-3.5 rounded-xl transition-all disabled:opacity-50
                  hover:shadow-lg hover:shadow-amber-500/20">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Email */}
        {activeTab === 'email' && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 tracking-tight">
              Change Email
            </h3>
            <p className="text-gray-600 text-xs mb-5">
              Confirm your password to update email address
            </p>
            <form onSubmit={handleSaveEmail} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">New Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type="email" value={emailForm.email}
                    onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                    required className={`${inputCls} pl-11 pr-4`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type="password" value={emailForm.password}
                    onChange={e => setEmailForm({ ...emailForm, password: e.target.value })}
                    required className={`${inputCls} pl-11 pr-4`} />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Email'}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Password */}
        {activeTab === 'password' && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 tracking-tight">
              Change Password
            </h3>
            <p className="text-gray-600 text-xs mb-5">
              Minimum 6 characters
            </p>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type={showCurrentPass ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({
                      ...passwordForm, current_password: e.target.value
                    })}
                    required className={`${inputCls} pl-11 pr-12`} />
                  <button type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                      text-gray-600 hover:text-gray-300 transition-colors">
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({
                      ...passwordForm, new_password: e.target.value
                    })}
                    required minLength={6}
                    className={`${inputCls} pl-11 pr-12`} />
                  <button type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                      text-gray-600 hover:text-gray-300 transition-colors">
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength indicator */}
                {passwordForm.new_password && (
                  <div className="mt-2 flex gap-1">
                    {[3,6,9,12].map(n => (
                      <div key={n}
                        className={`h-1 flex-1 rounded-full transition-colors
                          ${passwordForm.new_password.length >= n
                            ? n <= 3 ? 'bg-red-500'
                              : n <= 6 ? 'bg-yellow-500'
                              : n <= 9 ? 'bg-blue-500'
                              : 'bg-green-500'
                            : 'bg-white/10'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600
                  uppercase tracking-wider block mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2
                    -translate-y-1/2 text-gray-600" />
                  <input type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={e => setPasswordForm({
                      ...passwordForm, new_password_confirmation: e.target.value
                    })}
                    required className={`${inputCls} pl-11 pr-4`} />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}