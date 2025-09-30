<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un administrateur
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Créer des examinateurs
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'first_name' => 'Examinateur',
                'last_name' => $i,
                'email' => "examiner{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'examiner',
                'is_active' => true,
                'specialization' => 'Spécialité ' . $i,
                'experience_years' => rand(1, 10),
            ]);
        }

        // Créer des candidats
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'first_name' => 'Candidat',
                'last_name' => $i,
                'email' => "candidate{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'candidate',
                'is_active' => true,
                'profession' => 'Profession ' . $i,
            ]);
        }
    }
}
