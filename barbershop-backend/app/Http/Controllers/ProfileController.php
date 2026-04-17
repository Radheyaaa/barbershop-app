<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // GET profil user
    public function show(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $request->user()
        ]);
    }

    // PUT update profil
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:15',
            'photo' => 'nullable|file|max:2048', // ← ganti image ke file
        ]);

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $file       = $request->file('photo');
            $filename   = time() . '_' . $file->getClientOriginalName();
            $user->photo = $file->storeAs('profiles', $filename, 'public');
        }

        $user->name  = $request->name  ?? $user->name;
        $user->phone = $request->phone ?? $user->phone;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Profil berhasil diupdate',
            'data'    => $user
        ]);
    }

    // PUT update email
    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password' => 'required',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Password salah'
            ], 422);
        }

        $user->email = $request->email;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Email berhasil diupdate',
            'data'    => $user
        ]);
    }

    // PUT update password
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Password lama salah'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Password berhasil diupdate',
        ]);
    }
}