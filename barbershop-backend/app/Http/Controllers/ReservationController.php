<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    // POST buat reservasi baru (customer)
    public function store(Request $request)
    {
        $request->validate([
            'barber_id'   => 'required|exists:barbers,id',
            'service_id'  => 'required|exists:services,id',
            'schedule_id' => 'required|exists:schedules,id',
            'note'        => 'nullable|string',
        ]);

        // Cek apakah jadwal masih tersedia
        $schedule = Schedule::findOrFail($request->schedule_id);

        if ($schedule->is_booked) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal sudah tidak tersedia'
            ], 422);
        }

        // Buat reservasi
        $reservation = Reservation::create([
            'user_id'     => $request->user()->id,
            'barber_id'   => $request->barber_id,
            'service_id'  => $request->service_id,
            'schedule_id' => $request->schedule_id,
            'status'      => 'pending',
            'note'        => $request->note,
        ]);

        // Tandai jadwal sudah dibooking
        $schedule->update(['is_booked' => true]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dibuat',
            'data'    => $reservation->load([
                'user', 'barber.user', 'service', 'schedule'
            ])
        ], 201);
    }

    // GET riwayat reservasi milik customer
    public function myReservations(Request $request)
    {
        $reservations = Reservation::with([
                'barber.user', 'service', 'schedule'
            ])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $reservations
        ]);
    }

    // PUT batalkan reservasi (customer)
    public function cancel($id, Request $request)
    {
        $reservation = Reservation::where('id',      $id)
                                  ->where('user_id', $request->user()->id)
                                  ->firstOrFail();

        if (!in_array($reservation->status, ['pending', 'confirmed'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Reservasi tidak bisa dibatalkan'
            ], 422);
        }

        // Bebaskan kembali jadwal
        $reservation->schedule->update(['is_booked' => false]);
        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dibatalkan'
        ]);
    }

    // GET semua reservasi (admin)
    public function adminIndex()
    {
        $reservations = Reservation::with([
                'user', 'barber.user', 'service', 'schedule'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $reservations
        ]);
    }

    // PUT update status reservasi (admin)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled'
        ]);

        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => $request->status]);

        // Jika admin cancel, bebaskan jadwal
        if ($request->status === 'cancelled') {
            $reservation->schedule->update(['is_booked' => false]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Status reservasi diupdate',
            'data'    => $reservation->load([
                'user', 'barber.user', 'service', 'schedule'
            ])
        ]);
    }
}