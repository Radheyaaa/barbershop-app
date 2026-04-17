<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Barber;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik utama
        $totalReservations = Reservation::count();
        $totalBarbers      = Barber::where('is_active', true)->count();
        $totalServices     = Service::where('is_active', true)->count();
        $totalCustomers    = User::where('role', 'customer')->count();

        // Reservasi berdasarkan status
        $pending   = Reservation::where('status', 'pending')->count();
        $confirmed = Reservation::where('status', 'confirmed')->count();
        $completed = Reservation::where('status', 'completed')->count();
        $cancelled = Reservation::where('status', 'cancelled')->count();

        // Reservasi terbaru (5 data)
        $latestReservations = Reservation::with([
                'user', 'barber.user', 'service', 'schedule'
            ])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Layanan terpopuler
        $popularServices = Service::withCount('reservations')
            ->orderBy('reservations_count', 'desc')
            ->take(5)
            ->get();

        // Barber tersibuk
        $busiestBarbers = Barber::with('user')
            ->withCount('reservations')
            ->orderBy('reservations_count', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'stats' => [
                    'total_reservations' => $totalReservations,
                    'total_barbers'      => $totalBarbers,
                    'total_services'     => $totalServices,
                    'total_customers'    => $totalCustomers,
                    'pending'            => $pending,
                    'confirmed'          => $confirmed,
                    'completed'          => $completed,
                    'cancelled'          => $cancelled,
                ],
                'latest_reservations' => $latestReservations,
                'popular_services'    => $popularServices,
                'busiest_barbers'     => $busiestBarbers,
            ]
        ]);
    }
}