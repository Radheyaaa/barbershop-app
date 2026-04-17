import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, User, Mail, Phone,
  Lock, Eye, EyeOff, Scissors, Check, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Profile() {
  const navigate      = useNavigate()
  const { user, login, token } = useAuth()
  const fileRef       = useRef()

  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  // Form profil
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  })

  // Form email
  const [emailForm, setEmailForm] = useState({
    email:    user?.email || '',
    password: '',
  })

  // Form password
  const [passwordForm, setPasswordForm] = useState({
    current_password:              '',
    new_password:                  '',
    new_password_confirmation:     '',
  })

  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass]         = useState(false)
  const [photoPreview, setPhotoPreview]       = useState(null)
  const [photoFile, setPhotoFile]             = useState(null)

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg)
    else setSuccess(msg)
    setTimeout(() => { setSuccess(''); setError('') }, 3000)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name',  profileForm.name)
      formData.append('phone', profileForm.phone)
      if (photoFile) formData.append('photo', photoFile)

      const res = await api.post('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      login(res.data.data, token)
      setPhotoFile(null)
      showFeedback('Profil berhasil diupdate!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Gagal update profil', true)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEmail = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/profile/update-email', emailForm)
      login(res.data.data, token)
      setEmailForm({ ...emailForm, password: '' })
      showFeedback('Email berhasil diupdate!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Gagal update email', true)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showFeedback('Password baru tidak cocok', true)
      return
    }
    setSaving(true)
    try {
      await api.post('/profile/update-password', passwordForm)
      setPasswordForm({
        current_password: '', new_password: '', new_password_confirmation: ''
      })
      showFeedback('Password berhasil diupdate!')
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Gagal update password', true)
    } finally {
      setSaving(false)
    }
  }

  const avatarUrl = photoPreview
    || user?.photo_url
    || null

  const tabs = [
    { id: 'profile',  label: 'Profil',   icon: <User size={16} /> },
    { id: 'email',    label: 'Email',    icon: <Mail size={16} /> },
    { id: 'password', label: 'Password', icon: <Lock size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')}
            className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Scissors size={14} className="text-white" />
            </div>
            <span className="font-bold">Profil Saya</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Feedback */}
        {(success || error) && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium
            ${success
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {success ? <Check size={18} /> : <X size={18} />}
            {success || error}
          </div>
        )}

        {/* Avatar card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br
              from-gray-200 to-gray-300 overflow-hidden flex items-center
              justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto profil"
                  className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white
                rounded-xl flex items-center justify-center hover:bg-gray-800
                transition shadow-lg">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <h2 className="text-xl font-black">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 bg-gray-100 text-gray-600
              px-3 py-1 rounded-full text-xs font-semibold capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3
                rounded-xl text-sm font-semibold transition
                ${activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black'}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB PROFIL ===== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-5">Edit Informasi Profil</h3>
            <form onSubmit={handleSaveProfile} className="space-y-5">

              {/* Foto profil preview */}
              {photoFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl
                  p-3 flex items-center gap-3 text-sm text-blue-700">
                  <Camera size={16} />
                  Foto baru dipilih: <strong>{photoFile.name}</strong>
                  <button type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                    className="ml-auto text-blue-400 hover:text-blue-700">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={profileForm.name}
                    onChange={e => setProfileForm({
                      ...profileForm, name: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="Nama lengkap" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  No. Telepon
                </label>
                <div className="relative">
                  <Phone size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={profileForm.phone}
                    onChange={e => setProfileForm({
                      ...profileForm, phone: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="08xxxxxxxxxx" />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white
                      rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {/* ===== TAB EMAIL ===== */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-1">Ganti Email</h3>
            <p className="text-gray-400 text-sm mb-5">
              Masukkan password untuk konfirmasi perubahan email
            </p>
            <form onSubmit={handleSaveEmail} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email Baru
                </label>
                <div className="relative">
                  <Mail size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={emailForm.email}
                    onChange={e => setEmailForm({
                      ...emailForm, email: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="email@baru.com" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={emailForm.password}
                    onChange={e => setEmailForm({
                      ...emailForm, password: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="Password kamu" required />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Ganti Email'}
              </button>
            </form>
          </div>
        )}

        {/* ===== TAB PASSWORD ===== */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-1">Ganti Password</h3>
            <p className="text-gray-400 text-sm mb-5">
              Password minimal 6 karakter
            </p>
            <form onSubmit={handleSavePassword} className="space-y-5">

              {/* Current password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <Lock size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({
                      ...passwordForm, current_password: e.target.value
                    })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="Password lama" required />
                  <button type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-black">
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({
                      ...passwordForm, new_password: e.target.value
                    })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="Password baru" required />
                  <button type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-black">
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={e => setPasswordForm({
                      ...passwordForm, new_password_confirmation: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200
                      rounded-xl focus:outline-none focus:border-black transition"
                    placeholder="Ulangi password baru" required />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-black text-white py-3 rounded-xl font-bold
                  hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}