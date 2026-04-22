<?php

namespace App\Console\Commands;

use App\Models\Barber;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateSchedules extends Command
{
    protected $signature   = 'schedules:generate {days=30}';
    protected $description = 'Generate schedules for all active barbers';

    public function handle()
    {
        $barbers  = Barber::where('is_active', true)->get();
        $days     = (int) $this->argument('days');
        $interval = 30;
        $start    = '09:00';
        $end      = '20:30';
        $count    = 0;

        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::today()->addDays($i);
            foreach ($barbers as $barber) {
                $cur = Carbon::parse($date->format('Y-m-d') . ' ' . $start);
                $fin = Carbon::parse($date->format('Y-m-d') . ' ' . $end);
                while ($cur <= $fin) {
                    $exists = Schedule::where('barber_id', $barber->id)
                        ->where('available_date', $date->format('Y-m-d'))
                        ->where('start_time', $cur->format('H:i'))
                        ->exists();
                    if (!$exists) {
                        Schedule::create([
                            'barber_id'      => $barber->id,
                            'available_date' => $date->format('Y-m-d'),
                            'start_time'     => $cur->format('H:i'),
                            'end_time'       => $cur->copy()->addMinutes($interval)->format('H:i'),
                            'is_booked'      => false,
                        ]);
                        $count++;
                    }
                    $cur->addMinutes($interval);
                }
            }
        }
        $this->info("Generated {$count} schedules.");
    }
}