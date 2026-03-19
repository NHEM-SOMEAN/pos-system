<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@pos.com'],
            [
                'name'     => 'Admin',
                'password' => bcrypt('password'),
                'role'     => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'cashier@pos.com'],
            [
                'name'     => 'Cashier',
                'password' => bcrypt('password'),
                'role'     => 'cashier',
            ]
        );
    }
}