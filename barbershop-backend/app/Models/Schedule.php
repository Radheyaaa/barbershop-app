<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'barber_id',
        'available_date',
        'start_time',
        'end_time',
        'is_booked',
    ];

    public function barber()
    {
        return $this->belongsTo(Barber::class);
    }

    public function reservation()
    {
        return $this->hasOne(Reservation::class);
    }
}