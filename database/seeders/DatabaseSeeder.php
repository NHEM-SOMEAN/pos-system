<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Cashier user
        User::create([
            'name' => 'Cashier',
            'email' => 'cashier@pos.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // Categories
        $food = Category::create(['name' => 'Food', 'description' => 'Food items']);
        $drink = Category::create(['name' => 'Drink', 'description' => 'Drink items']);

        // Products
        Product::create(['category_id' => $food->id, 'name' => 'Rice', 'price' => 2.50, 'stock' => 100]);
        Product::create(['category_id' => $food->id, 'name' => 'Bread', 'price' => 1.50, 'stock' => 50]);
        Product::create(['category_id' => $drink->id, 'name' => 'Water', 'price' => 0.50, 'stock' => 200]);
        Product::create(['category_id' => $drink->id, 'name' => 'Coke', 'price' => 1.00, 'stock' => 150]);
    }
}