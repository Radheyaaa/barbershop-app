<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role', 'photo'
    ];

    protected $hidden = ['password'];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        try {
            if (!empty($this->attributes['photo'])) {
                return url('storage/' . $this->attributes['photo']);
            }
        } catch (\Exception $e) {
            return null;
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