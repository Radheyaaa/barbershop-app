import { useState, useRef } from 'react'
import { Camera, User, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AdminProfile() {
  const { user, login, token } = useAuth()
  const fileRef = useRef()

  const [activeTab, setActiveTab]   = useState('profile')
  const [saving, setSaving]         = useState(false)
  const [feedback, setFeedback]     = useState(null)
  const [photoFile, setPhotoFile]   = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || ''
  })
  const [emailForm, setEmailForm] = useState({
    email: user?.email || '', password: ''
  })
  const [passForm, setPassForm] = useState({
    current_password: '', new_password: '', new_password_confirmation: ''
  })

  const showFeedback = (msg, ok = true) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const saveProfile = async e => {
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
      showFeedback('Profile updated!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed', false)
    } finally { setSaving(false) }
  }

  const saveEmail = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await api.post('/profile/update-email', emailForm)
      login(res.data.data, token)
      setEmailForm({ ...emailForm, password: '' })
      showFeedback('Email updated!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed', false)
    } finally { setSaving(false) }
  }

  const savePassword = async e => {
    e.preventDefault()
    if (passForm.new_password !== passForm.new_password_confirmation) {
      showFeedback('Passwords do not match', false); return
    }
    setSaving(true)
    try {
      await api.post('/profile/update-password', passForm)
      setPassForm({ current_password:'', new_password:'', new_password_confirmation:'' })
      showFeedback('Password updated!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed', false)
    } finally { setSaving(false) }
  }

  const avatarUrl = photoPreview || user?.photo_url || null
  const tabs = [
    { id:'profile', label:'Profile' },
    { id:'email',   label:'Email' },
    { id:'password', label:'Password' },
  ]

  const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl
    px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none
    focus:border-amber-500/40 transition-colors`

  return (
    <div className="p-8 max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Admin Profile
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

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

      {/* Avatar */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
        p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5
            border border-white/[0.07] flex items-center justify-center">
            {avatarUrl
              ? <img src={avatarUrl} alt="Profile"
                  className="w-full h-full object-cover" />
              : <User size={32} className="text-gray-700" strokeWidth={1.5} />
            }
          </div>
          <button onClick={() => fileRef.current.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500
              hover:bg-amber-400 rounded-xl flex items-center justify-center
              transition-all shadow-lg shadow-amber-500/20">
            <Camera size={14} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="font-black text-white text-lg tracking-tight">
            {user?.name}
          </p>
          <p className="text-gray-600 text-sm mt-0.5">{user?.email}</p>
          <span className="inline-block mt-2 bg-amber-500/10 text-amber-400
            text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Administrator
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
        p-1.5 flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200
              ${activeTab === t.id
                ? 'bg-amber-500 text-white'
                : 'text-gray-600 hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
          {photoFile && (
            <div className="bg-amber-500/8 border border-amber-500/20
              rounded-xl p-3 flex items-center gap-3 text-sm
              text-amber-400 mb-4">
              <Camera size={15} />
              New photo ready to save
              <button onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="ml-auto">
                <X size={15} />
              </button>
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">Full Name</label>
              <input type="text" value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">Phone</label>
              <input type="text" value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className={inputCls} placeholder="08xxxxxxxxxx" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white
                font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Email tab */}
      {activeTab === 'email' && (
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
          <form onSubmit={saveEmail} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">New Email</label>
              <input type="email" value={emailForm.email}
                onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">Current Password</label>
              <input type="password" value={emailForm.password}
                onChange={e => setEmailForm({ ...emailForm, password: e.target.value })}
                required className={inputCls} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white
                font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Email'}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {activeTab === 'password' && (
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'}
                  value={passForm.current_password}
                  onChange={e => setPassForm({
                    ...passForm, current_password: e.target.value
                  })}
                  required className={`${inputCls} pr-12`} />
                <button type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'}
                  value={passForm.new_password}
                  onChange={e => setPassForm({
                    ...passForm, new_password: e.target.value
                  })}
                  required minLength={6} className={`${inputCls} pr-12`} />
                <button type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-gray-600 hover:text-gray-300">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600
                uppercase tracking-wider block mb-2">Confirm New Password</label>
              <input type="password"
                value={passForm.new_password_confirmation}
                onChange={e => setPassForm({
                  ...passForm, new_password_confirmation: e.target.value
                })}
                required className={inputCls} />
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
  )
}