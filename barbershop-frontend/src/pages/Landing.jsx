import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scissors, Star, Clock, Shield, ChevronRight, ChevronLeft, ChevronDown,
  MapPin, Phone, Globe, Menu, X, Sun, Moon,
  Award, Users, ThumbsUp, ArrowRight, LogIn
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Landing() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const [services, setServices]         = useState([])
  const [barbers, setBarbers]           = useState([])
  const [loadingData, setLoadingData]   = useState(true)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') !== 'light'
  )

  // Smooth scroll helper
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  useEffect(() => {
    const root = document.documentElement
    dark
      ? root.classList.add('dark')
      : root.classList.remove('dark')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  // Smooth scroll global
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, b] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
        ])
        setServices(s.data.data || [])
        setBarbers(b.data.data || [])
      } catch (err) {
        setServices([])
        setBarbers([])
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const handleBooking = () => {
    if (user) {
      navigate('/booking')
    } else {
      setShowBookingModal(true)
    }
  }

  const handleConfirmLogin = () => {
    sessionStorage.setItem('redirect_after_login', '/booking')
    navigate('/login')
  }

  // ─── Theme tokens ──────────────────────────────
  const D = dark
  const bg        = D ? 'bg-[#0a0a0a]'    : 'bg-white'
  const bgCard    = D ? 'bg-[#111111]'    : 'bg-white'
  const bgMuted   = D ? 'bg-[#0f0f0f]'   : 'bg-gray-50'
  const border    = D ? 'border-white/[0.07]' : 'border-gray-100'
  const txt       = D ? 'text-gray-100'   : 'text-gray-900'
  const txtMuted  = D ? 'text-gray-500'   : 'text-gray-500'
  const txtLight  = D ? 'text-gray-400'   : 'text-gray-600'

  const navBg = D
    ? 'bg-[#0a0a0a]/80 border-white/[0.06]'
    : 'bg-white/80 border-gray-100'

  const [carouselIdx, setCarouselIdx] = useState(0)
  const VISIBLE = 3 // barber yang terlihat sekaligus

  const maxIdx = Math.max(0, barbers.length - VISIBLE)
  const prevSlide = () => setCarouselIdx(i => Math.max(0, i - 1))
  const nextSlide = () => setCarouselIdx(i => Math.min(maxIdx, i + 1))
  const visibleBarbers = barbers.slice(carouselIdx, carouselIdx + VISIBLE)

  return (
    <div className={`min-h-screen ${bg} ${txt} antialiased`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════
          BOOKING MODAL
      ══════════════════════════════════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center
          px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowBookingModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className={`${bgCard} border ${border} rounded-3xl p-8 w-full
              max-w-md shadow-2xl ${D ? 'shadow-black/60' : 'shadow-gray-200'}`}
            style={{ animation: 'modalIn .2s ease' }}>

            {/* Icon */}
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex
              items-center justify-center mx-auto mb-6">
              <LogIn size={26} className="text-amber-500" strokeWidth={2} />
            </div>

            <h3 className={`text-xl font-black text-center ${txt} tracking-tight mb-2`}>
              Login Diperlukan
            </h3>
            <p className={`text-center ${txtMuted} text-sm leading-relaxed mb-8`}>
              Ingin melakukan reservasi? Silakan login terlebih dahulu
              untuk mengamankan jadwal Anda.
            </p>

            <div className="space-y-3">
              <button onClick={handleConfirmLogin}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white
                  font-bold py-3.5 rounded-2xl transition-all duration-200
                  flex items-center justify-center gap-2
                  hover:shadow-lg hover:shadow-amber-500/25">
                Lanjut ke Login
                <ArrowRight size={18} />
              </button>
              <button onClick={() => setShowBookingModal(false)}
                className={`w-full border ${border} ${txtMuted} hover:${txt}
                  font-medium py-3.5 rounded-2xl transition-all duration-200
                  ${D ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl
        border-b transition-colors duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16
          flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => scrollTo('hero')}
            className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex
              items-center justify-center shadow-lg shadow-amber-500/30">
              <Scissors size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className={`font-black text-xl tracking-tight ${txt}`}>
              BarberCo
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {[['services','Layanan'],['barbers','Barber'],['contact','Kontak']].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium
                  ${txtMuted} hover:text-amber-500 transition-colors duration-200`}>
                {label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)}
              className={`p-2.5 rounded-xl transition-all duration-200
                ${D ? 'bg-white/8 hover:bg-white/12 text-amber-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
              {D ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="hidden md:flex items-center gap-2 ml-1">
              {user ? (
                <button onClick={() => navigate('/home')}
                  className="bg-amber-500 hover:bg-amber-400 text-white text-sm
                    font-semibold px-5 py-2.5 rounded-xl transition-all duration-200
                    shadow-md shadow-amber-500/20">
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}
                    className={`text-sm font-medium ${txtMuted} hover:text-amber-500
                      px-4 py-2.5 rounded-xl transition-colors duration-200`}>
                    Masuk
                  </button>
                  <button onClick={() => navigate('/register')}
                    className="bg-amber-500 hover:bg-amber-400 text-white text-sm
                      font-semibold px-5 py-2.5 rounded-xl transition-all duration-200
                      shadow-md shadow-amber-500/20">
                    Daftar
                  </button>
                </>
              )}
            </div>

            <button className="md:hidden p-2.5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className={`md:hidden border-t ${border}
            ${D ? 'bg-[#0a0a0a]' : 'bg-white'} px-6 py-4 space-y-1`}>
            {[['services','Layanan'],['barbers','Barber'],['contact','Kontak']].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`w-full text-left py-3 px-3 rounded-xl text-sm
                  font-medium ${txtMuted} hover:text-amber-500
                  transition-colors`}>
                {label}
              </button>
            ))}
            <div className="pt-3 border-t ${border} flex gap-2">
              {user ? (
                <button onClick={() => navigate('/home')}
                  className="flex-1 bg-amber-500 text-white py-3 rounded-xl
                    text-sm font-semibold">
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}
                    className={`flex-1 border ${border} py-3 rounded-xl
                      text-sm font-medium ${txtMuted}`}>
                    Masuk
                  </button>
                  <button onClick={() => navigate('/register')}
                    className="flex-1 bg-amber-500 text-white py-3 rounded-xl
                      text-sm font-semibold">
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center
        bg-[#080808] overflow-hidden pt-16">

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96
            bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72
            bg-amber-600/6 rounded-full blur-[100px]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px,
              transparent 1px),
              linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)`,
            backgroundSize: '72px 72px'
          }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10
          w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center py-24">

          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 border
              border-amber-500/25 bg-amber-500/8 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full
                animate-pulse" />
              <span className="text-amber-400 text-sm font-medium
                tracking-widest uppercase">
                Barbershop Terpercaya #1
              </span>
            </div>

            <div>
              <h1 className="text-6xl lg:text-7xl font-black text-white
                leading-[1.0] tracking-tighter">
                Tampil
                <br />
                <span className="text-transparent bg-clip-text
                  bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
                  Keren
                </span>
                <br />
                Setiap Hari
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mt-6 max-w-md">
                Dapatkan pengalaman potong rambut terbaik bersama barber
                profesional kami. Booking mudah, hasil memuaskan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={handleBooking}
                className="group flex items-center gap-2.5 bg-amber-500
                  hover:bg-amber-400 text-white px-8 py-4 rounded-2xl
                  font-bold text-base transition-all duration-200
                  shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40
                  hover:-translate-y-0.5">
                Booking Sekarang
                <ArrowRight size={18}
                  className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => scrollTo('services')}
                className="flex items-center gap-2 border border-white/15
                  text-white/70 hover:text-white hover:border-white/30
                  px-8 py-4 rounded-2xl font-medium text-base
                  transition-all duration-200 hover:-translate-y-0.5
                  hover:bg-white/5">
                Lihat Layanan
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t
              border-white/8 mt-4">
              {[
                { icon: <Users size={18} />,    value: '500+', label: 'Pelanggan Puas' },
                { icon: <Award size={18} />,    value: '10+',  label: 'Barber Pro' },
                { icon: <ThumbsUp size={18} />, value: '5.0',  label: 'Rating Bintang' },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-500/70">
                    {s.icon}
                    <span className="text-2xl font-black text-white">
                      {s.value}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="relative w-[420px] h-[480px]">
              {/* Glow ring */}
              <div className="absolute inset-8 bg-amber-500/15 rounded-full
                blur-3xl" />
              {/* Card */}
              <div className="relative w-full h-full rounded-3xl border
                border-white/8 bg-white/[0.03] backdrop-blur-sm
                flex flex-col items-center justify-center gap-5 p-10
                overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2
                  border-l-2 border-amber-500/40 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2
                  border-r-2 border-amber-500/40 rounded-br-3xl" />

                <div className="text-8xl leading-none select-none">💈</div>
                <div className="text-center">
                  <p className="text-white font-black text-2xl tracking-tight">
                    BarberCo
                  </p>
                  <p className="text-gray-600 text-xs mt-1 tracking-[0.2em]
                    uppercase">
                    Professional Barbershop
                  </p>
                </div>

                {/* Floating badges */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5
                  bg-amber-500 text-white text-xs font-bold px-3 py-1.5
                  rounded-full shadow-lg shadow-amber-500/30">
                  <Star size={12} fill="currentColor" />
                  5.0 Rating
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-1.5
                  bg-white text-gray-900 text-xs font-bold px-3 py-1.5
                  rounded-full shadow-lg">
                  <Users size={12} />
                  500+ Pelanggan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2
            text-gray-600 hover:text-amber-500 transition-colors
            animate-bounce">
          <ChevronDown size={24} />
        </button>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className={`py-24 px-6 lg:px-10 ${bgMuted}
        transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon:  <Clock size={22} strokeWidth={1.8} />,
                title: 'Booking Mudah',
                desc:  'Reservasi online kapan saja dan di mana saja. Tanpa antri, tanpa repot.'
              },
              {
                icon:  <Award size={22} strokeWidth={1.8} />,
                title: 'Barber Bersertifikat',
                desc:  'Semua barber kami telah tersertifikasi dan berpengalaman di bidangnya.'
              },
              {
                icon:  <Shield size={22} strokeWidth={1.8} />,
                title: 'Terpercaya & Aman',
                desc:  'Ribuan pelanggan telah mempercayakan penampilan mereka kepada kami.'
              },
            ].map((item, i) => (
              <div key={i} className={`${bgCard} border ${border} rounded-2xl
                p-7 group hover:border-amber-500/35 transition-all duration-300
                hover:-translate-y-1 hover:shadow-2xl
                ${D ? 'hover:shadow-black/40' : 'hover:shadow-gray-100'}`}>
                <div className="w-11 h-11 bg-amber-500/10 text-amber-500
                  group-hover:bg-amber-500 group-hover:text-white
                  rounded-xl flex items-center justify-center mb-5
                  transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className={`font-bold text-base ${txt} mb-2.5 tracking-tight`}>
                  {item.title}
                </h3>
                <p className={`${txtMuted} text-sm leading-relaxed`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES
      ══════════════════════════════════════ */}
      <section id="services" className={`py-28 px-6 lg:px-10 ${bg}
        transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end
            justify-between gap-6 mb-16">
            <div>
              <p className="text-amber-500 text-xs font-bold tracking-[0.2em]
                uppercase mb-3">
                Apa yang Kami Tawarkan
              </p>
              <h2 className={`text-4xl lg:text-5xl font-black ${txt}
                tracking-tight leading-tight`}>
                Layanan Kami
              </h2>
              <div className="w-10 h-0.5 bg-amber-500 mt-4 rounded-full" />
            </div>
            <button onClick={handleBooking}
              className="hidden md:flex items-center gap-2 text-amber-500
                hover:text-amber-400 font-semibold text-sm transition-colors">
              Lihat semua & booking
              <ChevronRight size={16} />
            </button>
          </div>

          {loadingData ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-gray-700
                border-t-amber-500 rounded-full animate-spin" />
              <p className={`${txtMuted} text-sm`}>Memuat layanan...</p>
            </div>
          ) : services.length === 0 ? (
            <p className={`text-center ${txtMuted} py-20`}>
              Belum ada layanan tersedia
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <div key={service.id} onClick={handleBooking}
                  className={`group ${bgCard} border ${border} rounded-2xl p-6
                    hover:border-amber-500/40 transition-all duration-300
                    cursor-pointer hover:-translate-y-1 hover:shadow-2xl
                    ${D ? 'hover:shadow-black/50' : 'hover:shadow-gray-100'}`}>

                  <div className="flex items-start justify-between mb-6">
                    <div className="w-11 h-11 bg-amber-500/10
                      group-hover:bg-amber-500 rounded-xl flex items-center
                      justify-center transition-all duration-300 shrink-0">
                      <Scissors size={20}
                        className="text-amber-500 group-hover:text-white
                          transition-colors duration-300"
                        strokeWidth={2} />
                    </div>
                    <span className={`text-[11px] font-bold ${txtMuted}
                      tracking-widest uppercase border ${border}
                      px-2.5 py-1 rounded-lg`}>
                      {service.duration} MIN
                    </span>
                  </div>

                  <h3 className={`font-bold text-lg ${txt} mb-2 tracking-tight`}>
                    {service.name}
                  </h3>
                  <p className={`${txtMuted} text-sm leading-relaxed mb-6
                    line-clamp-2`}>
                    {service.description || 'Layanan profesional terbaik untuk kamu.'}
                  </p>

                  <div className={`flex justify-between items-center pt-4
                    border-t ${border}`}>
                    <span className="text-xl font-black text-amber-500">
                      Rp {Number(service.price).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold
                      text-amber-500 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200">
                      Booking <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          BARBERS
      ══════════════════════════════════════ */}
      <section id="barbers" className="py-28 px-6 lg:px-10 bg-[#080808]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end
            justify-between gap-6 mb-16">
            <div>
              <p className="text-amber-500 text-xs font-bold
                tracking-[0.2em] uppercase mb-3">Tim Kami</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white
                tracking-tight">Kenali Barber Kami</h2>
              <div className="w-10 h-0.5 bg-amber-500 mt-4 rounded-full" />
            </div>

            {/* Navigation arrows */}
            {barbers.length > VISIBLE && (
              <div className="flex items-center gap-2">
                <button onClick={prevSlide} disabled={carouselIdx === 0}
                  className={`w-11 h-11 rounded-xl border flex items-center
                    justify-center transition-all duration-200
                    ${carouselIdx === 0
                      ? 'border-white/[0.05] text-gray-700 cursor-not-allowed'
                      : 'border-white/15 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'}`}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide} disabled={carouselIdx >= maxIdx}
                  className={`w-11 h-11 rounded-xl border flex items-center
                    justify-center transition-all duration-200
                    ${carouselIdx >= maxIdx
                      ? 'border-white/[0.05] text-gray-700 cursor-not-allowed'
                      : 'border-white/15 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'}`}>
                  <ChevronRight size={20} />
                </button>

                {/* Dot indicators */}
                <div className="flex gap-1.5 ml-2">
                  {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setCarouselIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300
                        ${carouselIdx === i
                          ? 'w-5 bg-amber-500'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {loadingData ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-gray-800
                border-t-amber-500 rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Memuat barber...</p>
            </div>
          ) : barbers.length === 0 ? (
            <p className="text-center text-gray-600 py-20">
              Belum ada barber tersedia
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6
              transition-all duration-300">
              {visibleBarbers.map(barber => (
                <div key={barber.id}
                  className="group border border-white/[0.07] rounded-2xl
                    overflow-hidden hover:border-amber-500/30 transition-all
                    duration-300 hover:-translate-y-1 bg-[#111111]">

                  {/* Photo 4:5 */}
                  <div className="relative overflow-hidden"
                    style={{ aspectRatio: '4/5' }}>
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt={barber.user?.name}
                        className="w-full h-full object-cover object-center
                          group-hover:scale-105 transition-transform
                          duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br
                        from-gray-900 to-gray-800 flex flex-col items-center
                        justify-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-white/5
                          border border-white/[0.08] flex items-center
                          justify-center">
                          <Users size={36} className="text-gray-700"
                            strokeWidth={1.5} />
                        </div>
                        <p className="text-gray-600 text-sm">No photo yet</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t
                      from-[#111111] via-transparent to-transparent opacity-90" />
                  </div>

                  {/* Info */}
                  <div className="p-6 -mt-2 relative">
                    <h3 className="font-bold text-lg text-white tracking-tight">
                      {barber.user?.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 mb-5 leading-relaxed">
                      {barber.bio || 'Barber profesional berpengalaman.'}
                    </p>
                    <button onClick={handleBooking}
                      className="w-full border border-white/10
                        text-white/60 hover:bg-amber-500 hover:text-white
                        hover:border-amber-500 py-3 rounded-xl text-sm
                        font-semibold transition-all duration-200
                        flex items-center justify-center gap-2 group/btn">
                      Booking Sekarang
                      <ArrowRight size={15}
                        className="opacity-0 group-hover/btn:opacity-100
                          group-hover/btn:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="relative py-28 px-6 lg:px-10 bg-amber-500
        overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 0% 100%,
              rgba(0,0,0,0.15) 0%, transparent 50%),
              radial-gradient(circle at 100% 0%,
              rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-amber-200 text-xs font-bold tracking-[0.2em]
            uppercase mb-4">
            Tunggu Apa Lagi
          </p>
          <h2 className="text-4xl lg:text-5xl font-black text-white
            tracking-tight mb-5 leading-tight">
            Siap Tampil Keren?
          </h2>
          <p className="text-amber-100/80 text-lg mb-10 max-w-lg mx-auto
            leading-relaxed">
            Booking sekarang dan rasakan pengalaman barbershop profesional
            yang berbeda dari yang lain.
          </p>
          <button onClick={handleBooking}
            className="group inline-flex items-center gap-3 bg-white
              text-amber-600 hover:bg-gray-50 px-10 py-4 rounded-2xl
              font-black text-lg transition-all duration-200
              shadow-2xl hover:-translate-y-1">
            Booking Sekarang
            <ArrowRight size={22}
              className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer id="contact" className="bg-[#050505] border-t
        border-white/[0.06] py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex
                items-center justify-center">
                <Scissors size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                BarberCo
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Barbershop profesional dengan standar layanan tertinggi
              untuk penampilan terbaik kamu.
            </p>
          </div>

          {/* Kontak */}
          <div className="space-y-5">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase">
              Kontak
            </h4>
            <div className="space-y-3.5">
              {[
                { icon: <MapPin size={15} strokeWidth={2} />,
                  text: 'Jl. Gemini No. 12, Singaraja' },
                { icon: <Phone size={15} strokeWidth={2} />,
                  text: '+62 877-4335-8566' },
                { icon: <Globe size={15} strokeWidth={2} />,
                  text: '@barberco.official' },
              ].map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="text-amber-500/60 shrink-0">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Jam */}
          <div className="space-y-5">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase">
              Jam Operasional
            </h4>
            <div className="space-y-3">
              {[
                ['Senin — Sabtu', '08:00 – 21:00'],
                ['Minggu', 'TUTUP'],
              ].map(([day, time], i) => (
                <div key={i} className="flex justify-between items-center
                  border-b border-white/[0.05] pb-3">
                  <span className="text-gray-600 text-sm">{day}</span>
                  <span className="text-amber-400 font-bold text-sm">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-14 pt-6 border-t
          border-white/[0.05] flex flex-col md:flex-row justify-between
          items-center gap-3">
          <p className="text-gray-700 text-sm">
            © 2026 BarberCo. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs tracking-wide">
            Dibuat dengan ❤️ untuk tampil keren
          </p>
        </div>
      </footer>

    </div>
  )
}