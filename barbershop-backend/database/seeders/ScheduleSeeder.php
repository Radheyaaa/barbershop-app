<?php

namespace Database\Seeders;

use App\Models\Barber;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $barbers   = Barber::where('is_active', true)->get();
        $startTime = '09:00';
        $endTime   = '20:30';
        $interval  = 30; // menit

        // Buat jadwal untuk 30 hari ke depan
        for ($day = 0; $day < 30; $day++) {
            $date = Carbon::today()->addDays($day);

            // Skip hari tertentu jika perlu (opsional)
            // if ($date->dayOfWeek === Carbon::SUNDAY) continue;

            foreach ($barbers as $barber) {
                $current = Carbon::parse($date->format('Y-m-d') . ' ' . $startTime);
                $end     = Carbon::parse($date->format('Y-m-d') . ' ' . $endTime);

                while ($current <= $end) {
                    // Cek apakah jadwal sudah ada
                    $exists = Schedule::where('barber_id', $barber->id)
                        ->where('available_date', $date->format('Y-m-d'))
                        ->where('start_time', $current->format('H:i'))
                        ->exists();

                    if (!$exists) {
                        Schedule::create([
                            'barber_id'      => $barber->id,
                            'available_date' => $date->format('Y-m-d'),
                            'start_time'     => $current->format('H:i'),
                            'end_time'       => $current->copy()
                                ->addMinutes($interval)->format('H:i'),
                            'is_booked'      => false,
                        ]);
                    }

                    $current->addMinutes($interval);
                }
            }
        }

        $this->command->info('Schedules created successfully!');
    }
}