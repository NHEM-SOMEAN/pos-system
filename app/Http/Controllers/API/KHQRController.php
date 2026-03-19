<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class KHQRController extends Controller
{
    // POST /api/khqr/generate
    public function generate(Request $request)
    {
        $request->validate([
            'amount'   => 'required|numeric|min:0.01',
            'order_id' => 'required|integer',
        ]);

        try {
            $individualInfo = new IndividualInfo(
                bakongAccountID: env('BAKONG_ACCOUNT_ID'),
                merchantName:    env('BAKONG_MERCHANT_NAME'),
                merchantCity:    env('BAKONG_MERCHANT_CITY'),
                currency:        KHQRData::CURRENCY_USD,
                amount:          $request->amount,
                expirationTimestamp: strval(floor(microtime(true) * 1000) + (30 * 60 * 1000)), // 30 minutes
            );

            $result = BakongKHQR::generateIndividual($individualInfo);

            if ($result->status['code'] !== 0) {
                return response()->json(['message' => 'Failed to generate QR'], 500);
            }

            return response()->json([
                'qr'       => $result->data['qr'],
                'md5'      => $result->data['md5'],
                'order_id' => $request->order_id,
                'amount'   => $request->amount,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // POST /api/khqr/check
    public function check(Request $request)
    {
        $request->validate([
            'md5'      => 'required|string',
            'order_id' => 'required|integer',
        ]);

        try {
            $token = env('BAKONG_TOKEN');
            $bakongKhqr = new BakongKHQR($token);
            $response = $bakongKhqr->checkTransactionByMD5($request->md5);

            // Payment success
            if (isset($response['responseCode']) && $response['responseCode'] === 0) {
                // Update order status to paid
                $order = Order::find($request->order_id);
                if ($order && $order->status === 'pending') {
                    $order->update(['status' => 'paid']);
                }
                return response()->json([
                    'status'  => 'paid',
                    'message' => 'Payment successful',
                    'data'    => $response['data'] ?? null,
                ]);
            }

            return response()->json(['status' => 'pending', 'message' => 'Payment pending']);

        } catch (\Exception $e) {
            return response()->json(['status' => 'pending', 'message' => $e->getMessage()]);
        }
    }
}