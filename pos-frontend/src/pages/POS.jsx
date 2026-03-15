import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useLang } from '../context/LanguageContext'
import { useToast, ToastContainer } from '../components/Toast'
import Spinner from '../components/Spinner'
import Receipt from '../components/Receipt'

export default function POS() {
  const { t } = useLang()
  const { toasts, toast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [cashReceived, setCashReceived] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrModal, setQrModal] = useState(false)
  const [qrOrder, setQrOrder] = useState(null)
  const [qrPolling, setQrPolling] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data.data || res.data))
    api.get('/categories').then(res => setCategories(res.data.data || res.data))
  }, [])

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'all' || String(p.category_id) === String(selectedCategory)
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const addToCart = (product) => {
    if (product.stock <= 0) { toast.error('Stock មិនគ្រប់!'); return }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error('Stock មិនគ្រប់!'); return prev }
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id, qty) => { if (qty <= 0) return removeFromCart(id); setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i)) }
  const clearCart = () => { setCart([]); setDiscount(0); setCashReceived('') }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = Math.max(0, subtotal - discount)
  const change = cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0

  const handleCheckout = async (method) => {
  if (cart.length === 0) { toast.error('Cart ទទេ!'); return }
  if (method === 'khqr') {
    setQrModal(true)
    setQrPolling(true)
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
        payment_method: 'khqr',
        discount: discount,
      })
      setQrOrder(res.data)
      // Mock polling — simulate payment confirmed after 10s
      setTimeout(() => {
        setQrPolling(false)
        toast.success(`✅ Order #${res.data.id} ជោគជ័យ!`)
        clearCart()
        setQrModal(false)
        setQrOrder(null)
      }, 10000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'មានបញ្ហា')
      setQrModal(false)
    } finally {
      setLoading(false)
    }
    return
  }
  setLoading(true)
  try {
    const res = await api.post('/orders', {
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      payment_method: method,
      discount: discount,
    })
    const orderDetail = await api.get(`/orders/${res.data.id}`)
    setReceiptOrder(orderDetail.data)
    clearCart()
  } catch (err) {
    toast.error(err.response?.data?.message || 'មានបញ្ហា')
  } finally {
    setLoading(false)
  }
}

  const S = {
    container: { display: 'flex', gap: '20px', height: 'calc(100vh - 140px)' },
    left: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' },
    right: { width: '320px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    searchInput: { width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    catBtn: (active) => ({ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: active ? '#3b82f6' : 'white', color: active ? 'white' : '#64748b', border: active ? 'none' : '1px solid #e2e8f0', transition: 'all 0.15s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', overflowY: 'auto', paddingBottom: '8px' },
    productCard: (outOfStock) => ({ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', cursor: outOfStock ? 'not-allowed' : 'pointer', opacity: outOfStock ? 0.5 : 1, transition: 'all 0.15s' }),
    cartHeader: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cartTitle: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
    cartItems: { flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    cartFooter: { padding: '16px', borderTop: '1px solid #f1f5f9' },
    itemRow: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '10px', padding: '10px 12px' },
    qtyBtn: (color) => ({ width: '26px', height: '26px', border: 'none', borderRadius: '50%', background: color, color: color === '#3b82f6' ? 'white' : '#64748b', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px', marginBottom: '12px' },
    inputSmall: { flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' },
    btnGreen: { width: '100%', background: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnBlue: { width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnClear: { width: '100%', background: 'transparent', color: '#ef4444', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '6px' },
  }

  return (
    <Layout>
      <div style={S.container}>

        {/* LEFT */}
        <div style={S.left}>
          <input style={S.searchInput} placeholder={`🔍 ${t('search')}`} value={search} onChange={e => setSearch(e.target.value)} />

          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button style={S.catBtn(selectedCategory === 'all')} onClick={() => setSelectedCategory('all')}>{t('all')}</button>
            {categories.map(cat => (
              <button key={cat.id} style={S.catBtn(String(selectedCategory) === String(cat.id))} onClick={() => setSelectedCategory(cat.id)}>{cat.name}</button>
            ))}
          </div>

          {/* Products Grid */}
          <div style={S.grid}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📦</div>
                <div>{t('noProducts')}</div>
              </div>
            ) : filtered.map(product => (
              <div key={product.id} style={S.productCard(product.stock <= 0)} onClick={() => addToCart(product)}
                onMouseEnter={e => { if (product.stock > 0) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = '#3b82f6' } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              >
              <div style={{ 
                  background: '#f8fafc', 
                  borderRadius: '8px', 
                  height: '120px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '32px', 
                  marginBottom: '10px', 
                  overflow: 'hidden'
                }}>
                  {product.image 
                    ? <img 
                        src={`http://127.0.0.1:8000/storage/${product.image}`} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          padding: '8px'
                        }} 
                      /> 
                    : '📦'
                  }
            </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>${product.price}</div>
                <div style={{ fontSize: '11px', color: product.stock <= 5 ? '#ef4444' : '#94a3b8' }}>
                  {product.stock <= 5 && '⚠️ '}{t('stock')}: {product.stock}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - Cart */}
        <div style={S.right}>
          <div style={S.cartHeader}>
            <span style={S.cartTitle}>🛒 {t('cart')}</span>
            <span style={{ background: cart.length > 0 ? '#eff6ff' : '#f1f5f9', color: cart.length > 0 ? '#3b82f6' : '#94a3b8', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              {cart.length} items
            </span>
          </div>

          <div style={S.cartItems}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛒</div>
                <div style={{ fontSize: '13px' }}>{t('cartEmpty')}</div>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={S.itemRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button style={S.qtyBtn('#e2e8f0')} onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                  <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button style={S.qtyBtn('#3b82f6')} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}>×</button>
              </div>
            ))}
          </div>

          <div style={S.cartFooter}>
            <div style={S.summaryRow}>
              <span style={{ color: '#64748b' }}>{t('subtotal')}</span>
              <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ ...S.summaryRow, alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>{t('discount')} $</span>
              <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={{ ...S.inputSmall, width: '80px', textAlign: 'right' }} min="0" />
            </div>

            <div style={S.totalRow}>
              <span>{t('total')}</span>
              <span style={{ color: '#3b82f6' }}>${total.toFixed(2)}</span>
            </div>

            <div style={{ ...S.summaryRow, alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#64748b' }}>Cash $</span>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" style={{ ...S.inputSmall, width: '100px', textAlign: 'right' }} />
            </div>

            {cashReceived && (
              <div style={{ ...S.summaryRow, color: '#16a34a', fontWeight: '600', marginBottom: '12px', background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px' }}>
                <span>{t('change')}</span>
                <span>${change.toFixed(2)}</span>
              </div>
            )}

            <button
              style={{ ...S.btnGreen, opacity: loading || cart.length === 0 ? 0.6 : 1 }}
              onClick={() => handleCheckout('cash')}
              disabled={loading || cart.length === 0}
            >
              {loading ? <Spinner size={16} color="white" /> : '💵'} {t('cash')}
            </button>
            <button
              style={{ ...S.btnBlue, opacity: loading || cart.length === 0 ? 0.6 : 1 }}
              onClick={() => handleCheckout('khqr')}
              disabled={loading || cart.length === 0}
            >
              {loading ? <Spinner size={16} color="white" /> : '📱'} {t('khqr')}
            </button>
            {cart.length > 0 && (
              <button style={S.btnClear} onClick={clearCart}>🗑️ {t('clearCart')}</button>
            )}
          </div>
        </div>
      </div>

     {qrModal && qrOrder && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '340px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>📱 បង់ដោយ KHQR</h2>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Order #{qrOrder.id} — Total: <strong style={{ color: '#3b82f6' }}>${qrOrder.total}</strong></p>

      {/* Mock QR Code */}
      <div style={{ background: '#f8fafc', border: '2px dashed #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KHQR-MOCK-ORDER-${qrOrder.id}-TOTAL-${qrOrder.total}`}
          alt="KHQR Mock"
          style={{ width: '180px', height: '180px' }}
        />
      </div>

      {qrPolling ? (
        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            កំពុង រង់ចាំ payment... (Mock: 10s)
          </div>
        </div>
      ) : (
        <div style={{ color: '#16a34a', fontWeight: '600', marginBottom: '16px' }}>✅ Payment Confirmed!</div>
      )}

      <button
        onClick={() => { setQrModal(false); setQrOrder(null); setQrPolling(false) }}
        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
      >
        បោះបង់
      </button>
    </div>
  </div>
)}
     <Receipt order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      <ToastContainer toasts={toasts} />
      <ToastContainer toasts={toasts} />
    </Layout>
  )
}