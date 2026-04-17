<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barber extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'photo',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
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