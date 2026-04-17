<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarberController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;

// ============ PUBLIC ROUTES ============
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/barbers',       [BarberController::class, 'index']);
Route::get('/barbers/{id}',  [BarberController::class, 'show']);
Route::get('/services',      [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/schedules',     [ScheduleController::class, 'index']);

// ============ PROTECTED ROUTES ============
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Profile routes
    Route::get('/profile',                  [ProfileController::class, 'show']);
    Route::post('/profile/update',          [ProfileController::class, 'update']);
    Route::post('/profile/update-email',    [ProfileController::class, 'updateEmail']);
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword']);

    // Customer routes
    Route::post('/reservations',          [ReservationController::class, 'store']);
    Route::get('/reservations/my',        [ReservationController::class, 'myReservations']);
    Route::put('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    // Admin routes
    Route::middleware('admin')->group(function () {

        Route::get('/admin/barbers',  [BarberController::class, 'adminIndex']);
        Route::get('/admin/services', [ServiceController::class, 'adminIndex']);
        // Barber
        Route::post('/barbers',        [BarberController::class, 'store']);
        Route::post('/barbers/{id}',   [BarberController::class, 'update']);
        Route::put('/barbers/{id}',    [BarberController::class, 'update']);
        Route::delete('/barbers/{id}', [BarberController::class, 'destroy']);

        // Service
        Route::post('/services',        [ServiceController::class, 'store']);
        Route::put('/services/{id}',    [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

        // Schedule
        Route::post('/schedules',        [ScheduleController::class, 'store']);
        Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);
        Route::get('/admin/schedules',   [ScheduleController::class, 'adminIndex']);

        // Reservations
        Route::get('/admin/reservations',              [ReservationController::class, 'adminIndex']);
        Route::put('/admin/reservations/{id}/status',  [ReservationController::class, 'updateStatus']);

        Route::get('/admin/dashboard', [DashboardController::class, 'index']);
    });
});