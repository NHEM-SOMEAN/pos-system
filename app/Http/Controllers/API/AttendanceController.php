<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // POST /api/attendance/checkin
    public function checkIn(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $userId = $request->user()->id;

        // Check already checked in today
        $existing = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'បានចូលរួចហើយថ្ងៃនេះ'], 422);
        }

        $attendance = Attendance::create([
            'user_id'  => $userId,
            'date'     => $today,
            'check_in' => Carbon::now()->toTimeString(),
            'status'   => 'present',
        ]);

        return response()->json($attendance, 201);
    }

    // POST /api/attendance/checkout
    public function checkOut(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $userId = $request->user()->id;

        $attendance = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'មិនទាន់ check-in ថ្ងៃនេះទេ'], 422);
        }

        if ($attendance->check_out) {
            return response()->json(['message' => 'បាន check-out រួចហើយ'], 422);
        }

        $attendance->update([
            'check_out' => Carbon::now()->toTimeString(),
        ]);

        return response()->json($attendance);
    }

    // GET /api/attendance
    public function index(Request $request)
    {
        $attendance = Attendance::with('user')
            ->orderBy('date', 'desc')
            ->get();
        return response()->json($attendance);
    }
}