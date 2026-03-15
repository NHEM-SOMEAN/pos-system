<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // ── Daily Sales ──
        $dailySales = Order::whereDate('created_at', $today)
            ->where('status', 'paid')
            ->sum('total');

        $dailyOrders = Order::whereDate('created_at', $today)
            ->where('status', 'paid')
            ->count();

        // ── Monthly Sales ──
        $monthlySales = Order::where('created_at', '>=', $thisMonth)
            ->where('status', 'paid')
            ->sum('total');

        $monthlyOrders = Order::where('created_at', '>=', $thisMonth)
            ->where('status', 'paid')
            ->count();

        // ── Total Stats ──
        $totalProducts = Product::count();
        $totalStaff    = User::where('role', 'cashier')->count();
        $lowStock      = Product::where('stock', '<=', 10)->count();

        // ── Best Selling Products ──
        $bestSelling = Product::withSum('orderItems', 'quantity')
            ->orderByDesc('order_items_sum_quantity')
            ->take(5)
            ->get(['id', 'name', 'price', 'stock']);

        // ── Monthly Revenue Chart (Last 6 months) ──
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenueChart[] = [
                'month'   => $month->format('M Y'),
                'revenue' => Order::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->where('status', 'paid')
                    ->sum('total'),
            ];
        }

        // ── Recent Orders ──
        $recentOrders = Order::with('user')
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        return response()->json([
            'daily' => [
                'sales'  => $dailySales,
                'orders' => $dailyOrders,
            ],
            'monthly' => [
                'sales'  => $monthlySales,
                'orders' => $monthlyOrders,
            ],
            'stats' => [
                'total_products' => $totalProducts,
                'total_staff'    => $totalStaff,
                'low_stock'      => $lowStock,
            ],
            'best_selling'   => $bestSelling,
            'revenue_chart'  => $revenueChart,
            'recent_orders'  => $recentOrders,
        ]);
    }
}