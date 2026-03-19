<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    // GET /api/staff
    public function index()
    {
        $staff = User::where('role', '!=', 'admin')->get();
        return response()->json($staff);
    }

    // POST /api/staff
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:cashier,admin',
        ]);
        $staff = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);
        return response()->json($staff, 201);
    }

    // GET /api/staff/{id}
    public function show($id)
    {
        $staff = User::find($id);
        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }
        return response()->json($staff);
    }

    // PUT /api/staff/{id}
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }
        $staff = User::find($id);
        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role'  => 'required|in:cashier,admin',
        ]);
        $staff->update([
            'name'  => $request->name,
            'email' => $request->email,
            'role'  => $request->role,
        ]);
        return response()->json($staff);
    }

    // DELETE /api/staff/{id}
    public function destroy($id)
    {
        if (request()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }
        $staff = User::find($id);
        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }
        $staff->delete();
        return response()->json(['message' => 'Staff deleted']);
    }
}