<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Vérifie que l'utilisateur courant est admin.
     */
    protected function ensureAdmin(): void
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== User::ROLE_ADMIN) {
            abort(403, 'Accès interdit (admin requis)');
        }
    }

    /**
     * Créer un administrateur.
     */
    public function createAdmin(Request $request)
    {
        // Autoriser la création du tout premier admin sans rôle admin (bootstrap)
        $hasAdmin = User::where('role', User::ROLE_ADMIN)->exists();
        if ($hasAdmin) {
            $this->ensureAdmin();
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'phone'      => 'required|string|max:30',
            'profession' => 'nullable|string|max:100',
            'password'   => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $admin = User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'],
            'profession' => $data['profession'] ?? null,
            'password'   => Hash::make($request->password),
            'role'       => User::ROLE_ADMIN,
            'is_active'  => true,
        ]);

        return response()->json(['message' => 'Administrateur créé', 'user' => $admin], 201);
    }

    /**
     * Créer un examinateur.
     */
    public function createExaminer(Request $request)
    {
        $this->ensureAdmin();

        $validator = Validator::make($request->all(), [
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'email'          => 'required|string|email|max:255|unique:users,email',
            'phone'          => 'required|string|max:30',
            'specialization' => 'required|string|max:150',
            'experience'     => 'nullable|string|max:500',
            'password'       => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $examiner = User::create([
            'first_name'     => $data['first_name'],
            'last_name'      => $data['last_name'],
            'email'          => $data['email'],
            'phone'          => $data['phone'],
            'specialization' => $data['specialization'],
            'qualifications' => null,
            'experience_years' => null,
            'password'       => Hash::make($request->password),
            'role'           => User::ROLE_EXAMINER,
            'is_active'      => true,
        ]);

        return response()->json(['message' => 'Examinateur créé', 'user' => $examiner], 201);
    }

    /**
     * Lister les utilisateurs (optionnellement par rôle).
     */
    public function list(Request $request)
    {
        $this->ensureAdmin();
        $role = $request->query('role');
        $status = $request->query('status'); // active|inactive
        $search = $request->query('search');

        $q = User::query();
        if ($role) { $q->where('role', $role); }
        if ($status === 'active') { $q->where('is_active', true); }
        if ($status === 'inactive') { $q->where('is_active', false); }
        if ($search) {
            $q->where(function($qq) use ($search) {
                $qq->where('first_name', 'like', "%$search%")
                   ->orWhere('last_name', 'like', "%$search%")
                   ->orWhere('email', 'like', "%$search%");
            });
        }
        return response()->json($q->latest()->paginate(20));
    }

    /**
     * Mettre à jour le statut actif/inactif
     */
    public function updateStatus($id, Request $request)
    {
        $this->ensureAdmin();
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }
        $user = User::findOrFail($id);
        $user->is_active = (bool)$request->boolean('is_active');
        $user->save();
        return response()->json(['message' => 'Statut mis à jour', 'user' => $user]);
    }

    /**
     * Mettre à jour les informations de base d'un utilisateur
     */
    public function update($id, Request $request)
    {
        $this->ensureAdmin();
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:100',
            'last_name'  => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone'      => 'sometimes|string|max:30',
            'address'    => 'sometimes|nullable|string|max:255',
            'city'       => 'sometimes|nullable|string|max:255',
            'country'    => 'sometimes|nullable|string|max:255',
            'profession' => 'sometimes|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $user->fill($validator->validated());
        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    /**
     * Supprimer un utilisateur si c'est permis
     */
    public function delete($id)
    {
        $this->ensureAdmin();
        $user = User::findOrFail($id);
        if (!$user->canBeDeleted()) {
            return response()->json(['message' => "Cet utilisateur ne peut pas être supprimé (liens existants)"], 409);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
