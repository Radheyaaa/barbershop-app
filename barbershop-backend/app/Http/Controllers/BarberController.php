<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class BarberController extends Controller
{
    public function index()
    {
        $barbers = Barber::with('user')->where('is_active', true)->get();
        return response()->json(['status' => 'success', 'data' => $barbers]);
    }

    public function show($id)
    {
        $barber = Barber::with('user')->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $barber]);
    }

    public function adminIndex()
    {
        $barbers = Barber::with('user')->get();
        return response()->json(['status' => 'success', 'data' => $barbers]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'phone'    => 'nullable|string',
            'bio'      => 'nullable|string',
            'photo'    => 'nullable|file|max:2048', // ← ganti image ke file
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'barber',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $file      = $request->file('photo');
            $filename  = time() . '_' . $file->getClientOriginalName();
            $photoPath = $file->storeAs('barbers', $filename, 'public');
        }

        $barber = Barber::create([
            'user_id'   => $user->id,
            'bio'       => $request->bio,
            'photo'     => $photoPath,
            'is_active' => true,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Barber berhasil ditambahkan',
            'data'    => $barber->load('user')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $barber = Barber::findOrFail($id);

        $request->validate([
            'name'      => 'sometimes|string',
            'phone'     => 'nullable|string',
            'bio'       => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'photo'     => 'nullable|file|max:2048', // ← ganti image ke file
        ]);

        $barber->user->update([
            'name'  => $request->name  ?? $barber->user->name,
            'phone' => $request->phone ?? $barber->user->phone,
        ]);

        if ($request->hasFile('photo')) {
            if ($barber->photo) {
                Storage::disk('public')->delete($barber->photo);
            }
            $file         = $request->file('photo');
            $filename     = time() . '_' . $file->getClientOriginalName();
            $barber->photo = $file->storeAs('barbers', $filename, 'public');
        }

        $barber->bio       = $request->bio       ?? $barber->bio;
        $barber->is_active = $request->is_active ?? $barber->is_active;
        $barber->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Barber berhasil diupdate',
            'data'    => $barber->load('user')
        ]);
    }

    public function destroy($id)
    {
        $barber = Barber::findOrFail($id);
        if ($barber->photo) {
            Storage::disk('public')->delete($barber->photo);
        }
        $barber->user->delete();
        $barber->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Barber berhasil dihapus permanen',
        ]);
    }
}