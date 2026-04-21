<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role', 'photo'
    ];

    protected $hidden = ['password'];

    // Tambahkan ini agar tidak error jika kolom belum ada
    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        if (!empty($this->attributes['photo'])) {
            return url('storage/' . $this->attributes['photo']);
        }
        return null;
    }

    public function barber()
    {
        return $this->hasOne(Barber::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}