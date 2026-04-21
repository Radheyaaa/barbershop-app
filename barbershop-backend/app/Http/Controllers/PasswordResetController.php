<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    // POST - kirim link reset ke email
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email tidak ditemukan di sistem kami.'
        ]);

        // Hapus token lama jika ada
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Buat token baru
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($token),
            'created_at' => now(),
        ]);

        // Kirim email
        $user = User::where('email', $request->email)->first();
        $user->notify(new ResetPasswordNotification($token, $request->email));

        return response()->json([
            'status'  => 'success',
            'message' => 'Link reset password telah dikirim ke email kamu.',
        ]);
    }

    // POST - reset password dengan token
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'token'                 => 'required',
            'password'              => 'required|min:6|confirmed',
        ]);

        // Cari token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token tidak valid atau sudah kadaluarsa.'
            ], 422);
        }

        // Verifikasi token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token tidak valid.'
            ], 422);
        }

        // Cek apakah token sudah lebih dari 60 menit
        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'status'  => 'error',
                'message' => 'Token sudah kadaluarsa. Silakan minta link baru.'
            ], 422);
        }

        // Update password
        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Password berhasil direset. Silakan login.'
        ]);
    }
}