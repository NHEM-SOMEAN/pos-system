<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ បន្ថែម line នេះ

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // ✅ បន្ថែម HasApiTokens នៅទីនេះ

    protected $fillable = [
        'name', 'email', 'password', 'role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}