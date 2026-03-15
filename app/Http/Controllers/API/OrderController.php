<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/orders
    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter archived
        if ($request->show_archived === 'true') {
            $query->where('archived', true);
        } else {
            $query->where('archived', false);
        }

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment
        if ($request->payment && $request->payment !== 'all') {
            $query->where('payment_method', $request->payment);
        }

        // Filter by cashier name
        if ($request->cashier) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->cashier . '%');
            });
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->get());
    }

    // POST /api/orders/{id}/archive
    public function archive($id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        $order->update(['archived' => true, 'archived_at' => now()]);
        return response()->json(['message' => 'Order archived']);
    }

    // POST /api/orders/{id}/unarchive
    public function unarchive($id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        $order->update(['archived' => false, 'archived_at' => null]);
        return response()->json(['message' => 'Order unarchived']);
    }

    // POST /api/orders (Checkout)
    public function store(Request $request)
    {
        $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'payment_method'     => 'required|in:cash,khqr',
            'discount'           => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    return response()->json(['message' => "Stock មិនគ្រប់គ្រាន់សម្រាប់ {$product->name}"], 422);
                }
                $subtotal += $product->price * $item['quantity'];
            }

            $discount = $request->discount ?? 0;
            $total = $subtotal - $discount;

            $order = Order::create([
                'user_id'        => $request->user()->id,
                'subtotal'       => $subtotal,
                'total'          => $total,
                'discount'       => $discount,
                'payment_method' => $request->payment_method,
                'status'         => $request->payment_method === 'cash' ? 'paid' : 'pending',
            ]);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'price'      => $product->price,
                    'subtotal'   => $product->price * $item['quantity'],
                ]);
                $product->decrement('stock', $item['quantity']);
            }

            DB::commit();
            return response()->json($order->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed: ' . $e->getMessage()], 500);
        }
    }

    // GET /api/orders/{id}
    public function show($id)
    {
        $order = Order::with(['items.product', 'user'])->find($id);
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        return response()->json($order);
    }
}