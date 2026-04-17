<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin Barbershop',
            'email'    => 'admin@barbershop.com',
            'password' => Hash::make('admin123'),
            'phone'    => '081234567890',
            'role'     => 'admin',
        ]);
    }
}