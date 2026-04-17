<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'photo',
    ];

    protected $hidden = [
        'password',
    ];

    public function barber()
    {
        return $this->hasOne(Barber::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function getPhotoUrlAttribute()
    {
        if ($this->photo) {
            return url('storage/' . $this->photo);
        }
        return null;
    }
    protected $appends = ['photo_url'];
}