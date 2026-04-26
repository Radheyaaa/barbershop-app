import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scissors, ChevronLeft, ChevronRight, Clock,
  Calendar, Check, User, ArrowRight, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// ── Helpers ─────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function getDays(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      iso:     d.toISOString().split('T')[0],
      day:     d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date:    d.getDate(),
      month:   d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    }
  })
}

// ── Step Indicator ───────────────────────────────────────
const STEPS = [
  { n: 1, label: 'SERVICE' },
  { n: 2, label: 'BARBER' },
  { n: 3, label: 'DATE & TIME' },
  { n: 4, label: 'CONFIRM' },
]

function StepBar({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done   = step > s.n
        const active = step === s.n
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center
                justify-center font-bold text-sm transition-all duration-300
                ${done
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : active
                    ? 'border-amber-500 text-amber-500 bg-transparent'
                    : 'border-white/10 text-gray-600 bg-transparent'}`}>
                {done ? <Check size={16} strokeWidth={3} /> : s.n}
              </div>
              <span className={`text-[10px] font-bold tracking-widest
                transition-colors duration-300
                ${active ? 'text-amber-500' : done ? 'text-amber-400/60' : 'text-gray-600'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-24 lg:w-36 h-px mx-3 mb-5 transition-colors duration-300
                ${done ? 'bg-amber-500/60' : 'bg-white/8'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Success Modal ────────────────────────────────────────
function SuccessModal({ reservation, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/[0.08] rounded-3xl
        p-8 w-full max-w-md text-center shadow-2xl"
        style={{ animation: 'modalIn .25s ease' }}>
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center
          justify-center mx-auto mb-6">
          <Check size={36} className="text-green-400" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your appointment has been successfully scheduled.
        </p>
        <div className="bg-white/5 border border-white/[0.07] rounded-2xl
          p-5 text-left space-y-3 mb-8">
          {[
            ['Service',  reservation?.service?.name],
            ['Barber',   reservation?.barber?.user?.name],
            ['Date',     reservation?.schedule?.available_date
              ? formatDate(reservation.schedule.available_date) : '-'],
            ['Time',     reservation?.schedule?.start_time],
            ['Total',    `Rp ${Number(reservation?.service?.price || 0)
              .toLocaleString('id-ID')}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center
              text-sm">
              <span className="text-gray-600">{label}</span>
              <span className={`font-semibold ${label === 'Total'
                ? 'text-amber-400' : 'text-gray-200'}`}>
                {val}
              </span>
            </div>
          ))}
        </div>
        <button onClick={onClose}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white
            font-bold py-3.5 rounded-2xl transition-all duration-200">
          Done
        </button>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.94) translateY(10px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────
export default function Booking() {
  const navigate      = useNavigate()
  const { user, logout } = useAuth()
  const [services, setServices] = useState([])
  const [barbers, setBarbers]   = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [successData, setSuccessData]   = useState(null)

  const [step, setStep]   = useState(1)
  const [selected, setSelected] = useState({
    service:  null,
    barber:   null,
    date:     null,
    schedule: null,
    note:     '',
  })

  const days = getDays(21)

  // Fetch services & barbers
  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, b] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
        ])
        setServices(s.data.data || [])
        setBarbers(b.data.data || [])
      } finally { setLoading(false) }
    }
    fetch()
  }, [])

  // Fetch schedules saat barber atau tanggal berubah
  useEffect(() => {
    if (!selected.barber || !selected.date) return
    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSelected(s => ({ ...s, schedule: null }))
      try {
        const res = await api.get(
          `/schedules?barber_id=${selected.barber.id}&date=${selected.date}`
        )
        setSchedules(res.data.data || [])
      } finally { setLoadingSlots(false) }
    }
    fetchSlots()
  }, [selected.barber, selected.date])

  // Cek apakah slot waktu sudah lewat
  const isSlotPast = (schedule) => {
    const now      = new Date()
    const todayIso = now.toISOString().split('T')[0]
    if (selected.date !== todayIso) return false
    const [h, m]  = schedule.start_time.split(':').map(Number)
    const slotMin = h * 60 + m
    const nowMin  = now.getHours() * 60 + now.getMinutes()
    return slotMin <= nowMin
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await api.post('/reservations', {
        barber_id:   selected.barber.id,
        service_id:  selected.service.id,
        schedule_id: selected.schedule.id,
        note:        selected.note,
      })
      setSuccessData(res.data.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reservation')
    } finally { setSubmitting(false) }
  }

  const handleSuccessClose = () => {
    navigate('/my-reservations')
  }

  const cardBase = `border rounded-xl p-5 cursor-pointer transition-all
    duration-200 hover:-translate-y-0.5`
  const cardActive   = 'border-amber-500 bg-amber-500/8'
  const cardInactive = 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-800 border-t-amber-500
        rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {successData && (
        <SuccessModal reservation={successData} onClose={handleSuccessClose} />
      )}

      {/* Navbar */}
      <nav className="bg-[#0d0d0d] border-b border-white/[0.06] px-6 py-4
        flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center
            justify-center">
            <Scissors size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-base text-amber-400 tracking-tight">
            BarberCo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/my-reservations')}
            className="text-sm text-gray-500 hover:text-gray-200
              transition-colors">
            My History
          </button>
          <button onClick={() => navigate('/booking')}
            className="bg-amber-500 hover:bg-amber-400 text-white text-sm
              font-semibold px-4 py-2 rounded-xl transition-all">
            Book Now
          </button>
          <button onClick={logout}
            className="border border-white/10 text-gray-400 hover:text-white
              text-sm px-4 py-2 rounded-xl transition-all hover:border-white/20">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Step Bar */}
        <StepBar step={step} />

        {/* ══ STEP 1 — SERVICE ══ */}
        {step === 1 && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-7">
              <Scissors size={20} className="text-amber-500" strokeWidth={2} />
              <h2 className="text-xl font-black text-white tracking-tight">
                Select Service
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map(service => {
                const active = selected.service?.id === service.id
                return (
                  <div key={service.id}
                    onClick={() => setSelected(s => ({ ...s, service }))}
                    className={`${cardBase} ${active ? cardActive : cardInactive}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`font-bold text-base tracking-tight
                        ${active ? 'text-white' : 'text-gray-200'}`}>
                        {service.name}
                      </h3>
                      <span className="text-amber-400 font-black text-base ml-4 shrink-0">
                        Rp {Number(service.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className={`text-sm mb-4 leading-relaxed
                      ${active ? 'text-gray-300' : 'text-gray-600'}`}>
                      {service.description || 'Professional barbershop service.'}
                    </p>
                    <div className={`flex items-center gap-1.5 text-[11px]
                      font-bold tracking-widest uppercase
                      ${active ? 'text-amber-400/80' : 'text-gray-700'}`}>
                      <Clock size={12} strokeWidth={2} />
                      {service.duration} minutes
                    </div>
                    {active && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20
                        flex items-center gap-2 text-amber-400 text-xs font-semibold">
                        <Check size={13} strokeWidth={3} />
                        Selected
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!selected.service}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                  text-white font-bold px-8 py-3.5 rounded-xl transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-amber-500/20">
                Next: Choose Barber
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — BARBER ══ */}
        {step === 2 && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-7">
              <button onClick={() => setStep(1)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300
                  hover:bg-white/5 transition-all">
                <ChevronLeft size={18} />
              </button>
              <User size={20} className="text-amber-500" strokeWidth={2} />
              <h2 className="text-xl font-black text-white tracking-tight">
                Choose Your Barber
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map(barber => {
                const active = selected.barber?.id === barber.id
                return (
                  <div key={barber.id}
                    onClick={() => setSelected(s => ({
                      ...s, barber, schedule: null
                    }))}
                    className={`${cardBase} text-center
                      ${active ? cardActive : cardInactive}`}>
                    {/* Photo */}
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden mx-auto
                      mb-4 border-2 transition-colors
                      ${active ? 'border-amber-500' : 'border-white/10'}`}>
                      {barber.photo_url ? (
                        <img src={barber.photo_url} alt={barber.user?.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center
                          justify-center">
                          <User size={32} className="text-gray-600"
                            strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <p className={`font-bold text-base tracking-tight mb-1
                      ${active ? 'text-white' : 'text-gray-200'}`}>
                      {barber.user?.name}
                    </p>
                    <p className={`text-xs leading-relaxed
                      ${active ? 'text-gray-400' : 'text-gray-600'}`}>
                      {barber.bio || 'Professional barber'}
                    </p>
                    {active && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20
                        flex items-center justify-center gap-2
                        text-amber-400 text-xs font-semibold">
                        <Check size={13} strokeWidth={3} />
                        Selected
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(3)}
                disabled={!selected.barber}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                  text-white font-bold px-8 py-3.5 rounded-xl transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-amber-500/20">
                Next: Pick a Date
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — DATE & TIME ══ */}
        {step === 3 && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-7">
              <button onClick={() => setStep(2)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300
                  hover:bg-white/5 transition-all">
                <ChevronLeft size={18} />
              </button>
              <Calendar size={20} className="text-amber-500" strokeWidth={2} />
              <h2 className="text-xl font-black text-white tracking-tight">
                Select Date & Time
              </h2>
            </div>

            {/* Date picker */}
            <div className="mb-8">
              <p className="text-[11px] font-bold text-gray-600 tracking-widest
                uppercase mb-4">Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map(d => {
                  const active = selected.date === d.iso
                  return (
                    <button key={d.iso}
                      onClick={() => setSelected(s => ({
                        ...s, date: d.iso, schedule: null
                      }))}
                      className={`flex flex-col items-center shrink-0 w-16
                        py-3 px-2 rounded-xl border transition-all duration-200
                        ${active
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-white/[0.07] text-gray-400 hover:border-amber-500/40 hover:text-white'}`}>
                      <span className="text-[10px] font-bold tracking-wider mb-1">
                        {d.day}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {d.date}
                      </span>
                      <span className={`text-[10px] mt-1
                        ${active ? 'text-amber-100' : 'text-gray-600'}`}>
                        {d.month}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selected.date && (
              <div>
                <p className="text-[11px] font-bold text-gray-600 tracking-widest
                  uppercase mb-4">Available Slots</p>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-7 h-7 border-2 border-gray-800
                      border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-12 border border-white/[0.05]
                    rounded-xl">
                    <Clock size={32} className="text-gray-700 mx-auto mb-3"
                      strokeWidth={1.5} />
                    <p className="text-gray-600 text-sm">
                      No available slots for this date
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                      Try another date or barber
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6
                    gap-2">
                    {schedules.map(slot => {
                      const past   = isSlotPast(slot)
                      const active = selected.schedule?.id === slot.id
                      return (
                        <button key={slot.id}
                          disabled={past}
                          onClick={() => !past && setSelected(s => ({
                            ...s, schedule: slot
                          }))}
                          className={`py-3 px-2 rounded-xl border text-sm
                            font-semibold transition-all duration-200
                            ${past
                              ? 'border-white/[0.03] text-gray-800 cursor-not-allowed line-through'
                              : active
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-white/[0.07] text-gray-400 hover:border-amber-500/40 hover:text-white'
                            }`}>
                          {slot.start_time.slice(0, 5)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(4)}
                disabled={!selected.schedule}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                  text-white font-bold px-8 py-3.5 rounded-xl transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-amber-500/20">
                Review Booking
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 — CONFIRM ══ */}
        {step === 4 && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(3)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300
                  hover:bg-white/5 transition-all">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-xl font-black text-white tracking-tight">
                Confirm Booking
              </h2>
            </div>

            {/* Summary card */}
            <div className="border border-white/[0.07] rounded-2xl overflow-hidden
              mb-8">
              <div className="bg-white/[0.03] px-6 py-4 border-b
                border-white/[0.07]">
                <p className="text-sm font-bold text-white tracking-tight">
                  Booking Summary
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service */}
                <div>
                  <p className="text-[10px] font-bold text-gray-600
                    tracking-widest uppercase mb-2">Service</p>
                  <p className="text-white font-bold text-base">
                    {selected.service?.name}
                  </p>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {selected.service?.duration} min
                  </p>
                </div>
                {/* Barber */}
                <div>
                  <p className="text-[10px] font-bold text-gray-600
                    tracking-widest uppercase mb-2">Barber</p>
                  <p className="text-white font-bold text-base">
                    {selected.barber?.user?.name}
                  </p>
                  <p className="text-amber-500/70 text-xs uppercase
                    tracking-widest mt-0.5">
                    {selected.barber?.bio || 'Professional Barber'}
                  </p>
                </div>
                {/* Date & Time */}
                <div>
                  <p className="text-[10px] font-bold text-gray-600
                    tracking-widest uppercase mb-2">Date & Time</p>
                  <p className="text-white font-bold">
                    {selected.date ? formatDate(selected.date) : '-'}
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {selected.schedule?.start_time}
                  </p>
                </div>
                {/* Price */}
                <div>
                  <p className="text-[10px] font-bold text-gray-600
                    tracking-widest uppercase mb-2">Total Price</p>
                  <p className="text-amber-400 font-black text-2xl">
                    Rp {Number(selected.service?.price).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mb-8">
              <label className="text-[11px] font-bold text-gray-600
                tracking-widest uppercase block mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={selected.note}
                onChange={e => setSelected(s => ({ ...s, note: e.target.value }))}
                placeholder="Any special requests or notes for your barber..."
                rows={3}
                className="w-full bg-white/5 border border-white/[0.07]
                  rounded-xl px-4 py-3 text-sm text-gray-200
                  placeholder-gray-700 focus:outline-none
                  focus:border-amber-500/40 transition-colors resize-none"
              />
            </div>

            {/* Confirm button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                  text-white font-black px-10 py-4 rounded-xl transition-all
                  disabled:opacity-50 text-sm tracking-widest uppercase
                  hover:shadow-xl hover:shadow-amber-500/25
                  hover:-translate-y-0.5">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30
                      border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={17} strokeWidth={3} />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}