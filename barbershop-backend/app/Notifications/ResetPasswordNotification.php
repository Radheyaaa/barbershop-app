<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public string $token;
    public string $email;

    public function __construct(string $token, string $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $resetUrl = 'http://localhost:5173/reset-password?token='
            . $this->token . '&email=' . urlencode($this->email);

        return (new MailMessage)
            ->subject('Reset Password - BarberCo')
            ->greeting('Halo!')
            ->line('Kami menerima permintaan reset password untuk akun kamu.')
            ->action('Reset Password', $resetUrl)
            ->line('Link ini akan kadaluarsa dalam 60 menit.')
            ->line('Jika kamu tidak meminta reset password, abaikan email ini.')
            ->salutation('Salam, Tim BarberCo');
    }
}