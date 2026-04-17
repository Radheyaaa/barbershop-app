import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scissors, Star, Clock, Shield, ChevronRight,
  MapPin, Phone, Globe, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Landing() {
  const navigate            = useNavigate()
  const { user }            = useAuth()
  const [services, setServices] = useState([])
  const [barbers, setBarbers]   = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, b] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
        ])
        setServices(s.data.data)
        setBarbers(b.data.data)
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
      // Simpan tujuan redirect setelah login
      sessionStorage.setItem('redirect_after_login', '/booking')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur
        border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Scissors size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl">BarberCo</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services"
              className="text-gray-600 hover:text-black text-sm transition">
              Layanan
            </a>
            <a href="#barbers"
              className="text-gray-600 hover:text-black text-sm transition">
              Barber
            </a>
            <a href="#contact"
              className="text-gray-600 hover:text-black text-sm transition">
              Kontak
            </a>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500">Halo, {user.name}!</span>
                <button onClick={() => navigate('/home')}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm
                    hover:bg-gray-800 transition">
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-black px-4 py-2 transition">
                  Masuk
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm
                    hover:bg-gray-800 transition">
                  Daftar
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
            <a href="#services" onClick={() => setMenuOpen(false)}
              className="block text-gray-600 hover:text-black text-sm px-2">Layanan</a>
            <a href="#barbers" onClick={() => setMenuOpen(false)}
              className="block text-gray-600 hover:text-black text-sm px-2">Barber</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}
              className="block text-gray-600 hover:text-black text-sm px-2">Kontak</a>
            <div className="flex gap-3 px-2 pt-2">
              {user ? (
                <button onClick={() => navigate('/home')}
                  className="flex-1 bg-black text-white py-2 rounded-xl text-sm">
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">
                    Masuk
                  </button>
                  <button onClick={() => navigate('/register')}
                    className="flex-1 bg-black text-white py-2 rounded-xl text-sm">
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-24 pb-20 px-6 bg-gradient-to-br from-gray-950
        via-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2
              rounded-full text-sm">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span>Barbershop #1 di Kota Anda</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Tampil <span className="text-transparent bg-clip-text
                bg-gradient-to-r from-yellow-400 to-orange-400">Keren</span>
              <br />Setiap Hari
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Dapatkan pengalaman potong rambut terbaik bersama barber profesional kami.
              Booking mudah, hasil memuaskan.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleBooking}
                className="flex items-center gap-2 bg-white text-black px-6 py-3
                  rounded-2xl font-bold hover:bg-gray-100 transition text-lg">
                Booking Sekarang
                <ChevronRight size={20} />
              </button>
              <a href="#services"
                className="flex items-center gap-2 border border-white/30 px-6 py-3
                  rounded-2xl font-medium hover:bg-white/10 transition">
                Lihat Layanan
              </a>
            </div>
            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: '500+', label: 'Pelanggan Puas' },
                { value: '10+',  label: 'Barber Pro' },
                { value: '5★',   label: 'Rating' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ilustrasi kanan */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400
                to-orange-500 rounded-full opacity-20 blur-3xl" />
              <div className="relative w-full h-full bg-white/5 rounded-3xl
                border border-white/10 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="text-8xl">💈</div>
                  <p className="text-white font-bold text-xl">BarberCo</p>
                  <p className="text-gray-400 text-sm">Professional Barbershop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEUNGGULAN ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock size={28} />,
                title: 'Booking Mudah',
                desc:  'Reservasi online kapan saja dan di mana saja tanpa perlu antri'
              },
              {
                icon: <Star size={28} />,
                title: 'Barber Profesional',
                desc:  'Semua barber kami berpengalaman dan terlatih di bidangnya'
              },
              {
                icon: <Shield size={28} />,
                title: 'Terpercaya',
                desc:  'Ribuan pelanggan puas dengan layanan kami setiap bulannya'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm
                hover:shadow-md transition">
                <div className="w-12 h-12 bg-black text-white rounded-xl
                  flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LAYANAN ===== */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3">Layanan Kami</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Pilih layanan yang sesuai dengan kebutuhanmu
            </p>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black
                rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Belum ada layanan tersedia
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <div key={service.id}
                  className="group bg-white border-2 border-gray-100
                    hover:border-black rounded-2xl p-6 transition cursor-pointer"
                  onClick={handleBooking}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-black
                      rounded-xl flex items-center justify-center transition">
                      <Scissors size={22}
                        className="text-gray-600 group-hover:text-white transition" />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500
                      px-3 py-1 rounded-full">
                      {service.duration} menit
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
                    {service.description || 'Layanan profesional terbaik'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black">
                      Rp {Number(service.price).toLocaleString('id-ID')}
                    </span>
                    <button onClick={handleBooking}
                      className="flex items-center gap-1 text-sm font-semibold
                        text-black hover:underline">
                      Booking <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== BARBER ===== */}
      <section id="barbers" className="py-20 px-6 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3">Tim Barber Kami</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Kenali barber profesional yang siap melayani kamu
            </p>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-white
                rounded-full animate-spin" />
            </div>
          ) : barbers.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              Belum ada barber tersedia
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map(barber => (
              <div key={barber.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6
                    hover:bg-white/10 transition text-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4
                    bg-gradient-to-br from-yellow-400 to-orange-500
                    flex items-center justify-center">
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt={barber.user?.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">👨</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{barber.user?.name}</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    {barber.bio || 'Barber profesional berpengalaman'}
                  </p>
                  <button onClick={handleBooking}
                    className="mt-4 w-full border border-white/20 py-2 rounded-xl
                      text-sm hover:bg-white hover:text-black transition font-medium">
                    Booking dengan Barber Ini
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-yellow-400
        to-orange-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-black mb-4">
            Siap Tampil Keren?
          </h2>
          <p className="text-black/70 mb-8 text-lg">
            Booking sekarang dan dapatkan pengalaman potong rambut terbaik!
          </p>
          <button onClick={handleBooking}
            className="bg-black text-white px-10 py-4 rounded-2xl font-bold
              text-lg hover:bg-gray-900 transition inline-flex items-center gap-2">
            Booking Sekarang <ChevronRight size={22} />
          </button>
        </div>
      </section>

      {/* ===== FOOTER / KONTAK ===== */}
      <footer id="contact" className="bg-gray-950 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Scissors size={16} className="text-black" />
              </div>
              <span className="font-bold text-xl">BarberCo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Barbershop profesional dengan layanan terbaik untuk penampilan terbaik kamu.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Kontak</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={15} />
                <span>Jl. Barbershop No. 1, Kota Anda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={15} />
                <span>@barberco.official</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Jam Operasional</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex justify-between">
                <span>Senin - Jumat</span>
                <span>08:00 - 21:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sabtu - Minggu</span>
                <span>09:00 - 20:00</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/10
          text-center text-gray-500 text-sm">
          © 2026 BarberCo. All rights reserved.
        </div>
      </footer>

    </div>
  )
}