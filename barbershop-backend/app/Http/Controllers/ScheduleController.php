<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Barber;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    // GET jadwal tersedia berdasarkan barber
    public function index(Request $request)
    {
        $query = Schedule::with('barber.user')
            ->where('is_booked', false);

        if ($request->barber_id) {
            $query->where('barber_id', $request->barber_id);
        }

        if ($request->date) {
            $query->where('available_date', $request->date);
        }

        $schedules = $query->orderBy('available_date')
                           ->orderBy('start_time')
                           ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $schedules
        ]);
    }

    // POST buat jadwal baru (admin)
    public function store(Request $request)
    {
        $request->validate([
            'barber_id'      => 'required|exists:barbers,id',
            'available_date' => 'required|date|after_or_equal:today',
            'start_time'     => 'required',
            'end_time'       => 'required|after:start_time',
        ]);

        // Cek apakah jadwal sudah ada
        $exists = Schedule::where('barber_id',      $request->barber_id)
                          ->where('available_date', $request->available_date)
                          ->where('start_time',     $request->start_time)
                          ->exists();

        if ($exists) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal sudah ada untuk waktu tersebut'
            ], 422);
        }

        $schedule = Schedule::create([
            'barber_id'      => $request->barber_id,
            'available_date' => $request->available_date,
            'start_time'     => $request->start_time,
            'end_time'       => $request->end_time,
            'is_booked'      => false,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Jadwal berhasil ditambahkan',
            'data'    => $schedule->load('barber.user')
        ], 201);
    }

    // DELETE hapus jadwal (admin)
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);

        if ($schedule->is_booked) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal sudah dibooking, tidak bisa dihapus'
            ], 422);
        }

        $schedule->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Jadwal berhasil dihapus'
        ]);
    }

    // GET semua jadwal (admin)
    public function adminIndex()
    {
        $schedules = Schedule::with('barber.user')
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $schedules
        ]);
    }
}