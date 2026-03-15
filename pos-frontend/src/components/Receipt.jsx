export default function Receipt({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content').innerHTML
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 16px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 4px 0; }
          .logo { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 4px; }
          @media print {
            body { width: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent}
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const subtotal = parseFloat(order.subtotal || 0)
  const discount = parseFloat(order.discount || 0)
  const total = parseFloat(order.total || 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>🧾 Receipt</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', color: '#64748b' }}>✕ បិទ</button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" style={{ background: '#fafafa', borderRadius: '10px', padding: '20px', fontFamily: "'Courier New', monospace", fontSize: '12px', border: '1px solid #e2e8f0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>🛒 POS System</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>POS Receipt</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(order.created_at).toLocaleString()}</div>
          </div>

          <div style={{ borderTop: '1px dashed #94a3b8', margin: '10px 0' }}></div>

          {/* Order Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>Order #</span>
            <span style={{ fontWeight: '700' }}>{order.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>Cashier</span>
            <span>{order.user?.name || 'Admin'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>Payment</span>
            <span>{order.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR'}</span>
          </div>

          <div style={{ borderTop: '1px dashed #94a3b8', margin: '10px 0' }}></div>

          {/* Items */}
          <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>ITEMS</div>
          {(order.items || []).map(item => (
            <div key={item.id} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ flex: 1 }}>{item.product?.name}</span>
                <span style={{ fontWeight: '600' }}>${parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                ${item.price} × {item.quantity}
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #94a3b8', margin: '10px 0' }}></div>

          {/* Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#64748b' }}>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Discount</span>
              <span style={{ color: '#ef4444' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', borderTop: '1px dashed #94a3b8', paddingTop: '8px', marginTop: '4px' }}>
            <span>TOTAL</span>
            <span style={{ color: '#3b82f6' }}>${total.toFixed(2)}</span>
          </div>

          <div style={{ borderTop: '1px dashed #94a3b8', margin: '12px 0' }}></div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
            <div>អរគុណសម្រាប់ការទិញ!</div>
            <div>Thank you for your purchase!</div>
            <div style={{ marginTop: '4px' }}>*** {order.status === 'paid' ? '✅ PAID' : '⏳ PENDING'} ***</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button onClick={onClose}
            style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            បិទ
          </button>
          <button onClick={handlePrint}
            style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}