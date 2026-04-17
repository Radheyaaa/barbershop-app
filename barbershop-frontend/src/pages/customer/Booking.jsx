import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { ArrowLeft, Scissors } from 'lucide-react'

export default function Booking() {
  const navigate = useNavigate()
  const [loadingSchedules, setLoadingSchedules] = useState(false)

  const [step, setStep]         = useState(1) // 1: pilih service, 2: pilih barber, 3: pilih jadwal, 4: konfirmasi
  const [services, setServices] = useState([])
  const [barbers, setBarbers]   = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading]   = useState(false)

  const [selected, setSelected] = useState({
    service:  null,
    barber:   null,
    schedule: null,
    note:     '',
  })

  // Fetch services & barbers saat pertama load
  useEffect(() => {
    const fetchData = async () => {
      const [s, b] = await Promise.all([
        api.get('/services'),
        api.get('/barbers'),
      ])
      setServices(s.data.data)
      setBarbers(b.data.data)
    }
    fetchData()
  }, [])

  // Fetch jadwal saat barber dipilih
  useEffect(() => {
    if (!selected.barber) return
    const fetchSchedules = async () => {
      setLoadingSchedules(true)
      try {
        const res = await api.get(`/schedules?barber_id=${selected.barber.id}`)
        setSchedules(res.data.data)
      } finally {
        setLoadingSchedules(false)
      }
    }
    fetchSchedules()
  }, [selected.barber])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/reservations', {
        barber_id:   selected.barber.id,
        service_id:  selected.service.id,
        schedule_id: selected.schedule.id,
        note:        selected.note,
      })
      alert('Reservasi berhasil dibuat!')
      navigate('/my-reservations')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat reservasi')
    } finally {
      setLoading(false)
    }
  }

  // Step indicator
  const steps = [
    { n: 1, label: 'Layanan' },
    { n: 2, label: 'Barber' },
    { n: 3, label: 'Jadwal' },
    { n: 4, label: 'Konfirmasi' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

    {/* Navbar dengan tombol kembali */}
    <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <Scissors size={14} className="text-white" />
          </div>
          <span className="font-bold">Buat Reservasi</span>
        </div>
      </div>
    </nav>

    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-8">💈 Buat Reservasi</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                ${step >= s.n ? 'bg-black text-white' : 'bg-gray-300 text-gray-500'}`}>
                {s.n}
              </div>
              <span className={`ml-2 text-sm font-medium
                ${step >= s.n ? 'text-black' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-10 h-1 mx-3
                  ${step > s.n ? 'bg-black' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          {/* ======= STEP 1: Pilih Layanan ======= */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pilih Layanan</h2>
              <div className="space-y-3">
                {services.length === 0 && (
                  <p className="text-gray-400 text-center py-6">Tidak ada layanan tersedia</p>
                )}
                {services.map(service => (
                  <div key={service.id}
                    onClick={() => setSelected({ ...selected, service })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition
                      ${selected.service?.id === service.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className={`text-sm mt-1
                          ${selected.service?.id === service.id
                            ? 'text-gray-300' : 'text-gray-500'}`}>
                          {service.description || 'Tidak ada deskripsi'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          Rp {Number(service.price).toLocaleString('id-ID')}
                        </p>
                        <p className={`text-sm
                          ${selected.service?.id === service.id
                            ? 'text-gray-300' : 'text-gray-500'}`}>
                          {service.duration} menit
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!selected.service}
                className="w-full mt-6 bg-black text-white p-3 rounded-xl font-semibold
                  hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                Lanjut →
              </button>
            </div>
          )}

          {/* ======= STEP 2: Pilih Barber ======= */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pilih Barber</h2>
              <div className="space-y-3">
                {barbers.length === 0 && (
                  <p className="text-gray-400 text-center py-6">Tidak ada barber tersedia</p>
                )}
                {barbers.map(barber => (
                  <div key={barber.id}
                    onClick={() => setSelected({ ...selected, barber, schedule: null })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition
                      ${selected.barber?.id === barber.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                        👨
                      </div>
                      <div>
                        <p className="font-semibold">{barber.user?.name}</p>
                        <p className={`text-sm
                          ${selected.barber?.id === barber.id
                            ? 'text-gray-300' : 'text-gray-500'}`}>
                          {barber.bio || 'Barber profesional'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-black p-3 rounded-xl font-semibold hover:bg-gray-100">
                  ← Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selected.barber}
                  className="flex-1 bg-black text-white p-3 rounded-xl font-semibold
                    hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* ======= STEP 3: Pilih Jadwal ======= */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-1">Pilih Jadwal</h2>
              <p className="text-sm text-gray-500 mb-4">
                Barber: <strong>{selected.barber?.user?.name}</strong>
              </p>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {loadingSchedules ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                  </div>
                ) : schedules.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">
                    Tidak ada jadwal tersedia untuk barber ini
                  </p>
                ) : (
                schedules.map(schedule => (
                  <div key={schedule.id}
                    onClick={() => setSelected({ ...selected, schedule })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition
                      ${selected.schedule?.id === schedule.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{schedule.available_date}</p>
                        <p className={`text-sm
                          ${selected.schedule?.id === schedule.id
                            ? 'text-gray-300' : 'text-gray-500'}`}>
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full
                        ${selected.schedule?.id === schedule.id
                          ? 'bg-white text-black'
                          : 'bg-green-100 text-green-700'}`}>
                        Tersedia
                      </span>
                    </div>
                  </div>
                )))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)}
                  className="flex-1 border border-black p-3 rounded-xl font-semibold hover:bg-gray-100">
                  ← Kembali
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selected.schedule}
                  className="flex-1 bg-black text-white p-3 rounded-xl font-semibold
                    hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* ======= STEP 4: Konfirmasi ======= */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Konfirmasi Reservasi</h2>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Layanan</span>
                  <span className="font-semibold">{selected.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga</span>
                  <span className="font-semibold">
                    Rp {Number(selected.service?.price).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durasi</span>
                  <span className="font-semibold">{selected.service?.duration} menit</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">Barber</span>
                  <span className="font-semibold">{selected.barber?.user?.name}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal</span>
                  <span className="font-semibold">{selected.schedule?.available_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jam</span>
                  <span className="font-semibold">
                    {selected.schedule?.start_time} - {selected.schedule?.end_time}
                  </span>
                </div>
              </div>

              {/* Catatan */}
              <textarea
                placeholder="Catatan tambahan (opsional)..."
                value={selected.note}
                onChange={(e) => setSelected({ ...selected, note: e.target.value })}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2
                  focus:ring-black resize-none mb-4"
                rows={3}
              />

              <div className="flex gap-3">
                <button onClick={() => setStep(3)}
                  className="flex-1 border border-black p-3 rounded-xl font-semibold hover:bg-gray-100">
                  ← Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-black text-white p-3 rounded-xl font-semibold
                    hover:bg-gray-800 disabled:opacity-40">
                  {loading ? 'Memproses...' : '✅ Konfirmasi Booking'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>
  )
}