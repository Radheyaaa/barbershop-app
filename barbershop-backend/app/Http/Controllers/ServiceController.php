<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // GET semua service
    public function index()
    {
        $services = Service::where('is_active', true)->get();
        return response()->json([
            'status' => 'success',
            'data'   => $services
        ]);
    }

    // GET detail service
    public function show($id)
    {
        $service = Service::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data'   => $service
        ]);
    }

    // POST buat service baru (admin)
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'price'       => 'required|integer',
            'duration'    => 'required|integer',
        ]);

        $service = Service::create([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'duration'    => $request->duration,
            'is_active'   => true,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Layanan berhasil ditambahkan',
            'data'    => $service
        ], 201);
    }

    // PUT update service (admin)
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string',
            'description' => 'nullable|string',
            'price'       => 'sometimes|integer',
            'duration'    => 'sometimes|integer',
        ]);

        $service->update($request->only([
            'name', 'description', 'price', 'duration', 'is_active'
        ]));

        return response()->json([
            'status'  => 'success',
            'message' => 'Layanan berhasil diupdate',
            'data'    => $service
        ]);
    }

    // DELETE nonaktifkan service (admin)
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Layanan berhasil dihapus permanen',
        ]);
    }
        // GET semua service termasuk nonaktif (admin)
    public function adminIndex()
    {
        $services = Service::all(); // tanpa filter is_active
        return response()->json([
            'status' => 'success',
            'data'   => $services
        ]);
    }      
}