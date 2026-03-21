import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterCashier, setFilterCashier] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selected, setSelected] = useState(null)
  const [archiving, setArchiving] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchOrders() }, [showArchived])

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders', { params: { show_archived: showArchived } }).then(res => {
      setOrders(res.data.data || res.data)
      setLoading(false)
    })
  }

  const handleArchive = async (id) => { setArchiving(id); await api.post(`/orders/${id}/archive`); fetchOrders(); setArchiving(null) }
  const handleUnarchive = async (id) => { setArchiving(id); await api.post(`/orders/${id}/unarchive`); fetchOrders(); setArchiving(null) }

  const filtered = orders.filter(o => {
    const matchSearch = String(o.id).includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchPayment = filterPayment === 'all' || o.payment_method === filterPayment
    const matchCashier = !filterCashier || o.user?.name?.toLowerCase().includes(filterCashier.toLowerCase())
    const matchDateFrom = !dateFrom || new Date(o.created_at) >= new Date(dateFrom)
    const matchDateTo = !dateTo || new Date(o.created_at) <= new Date(dateTo + 'T23:59:59')
    return matchSearch && matchStatus && matchPayment && matchCashier && matchDateFrom && matchDateTo
  })

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + parseFloat(o.total), 0)
  const totalPaid = orders.filter(o => o.status === 'paid').length
  const totalPending = orders.filter(o => o.status === 'pending').length

  const exportCSV = () => {
    const headers = ['Order ID', 'Cashier', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment', 'Status', 'Date']
    const rows = filtered.map(o => [`#${o.id}`, o.user?.name || '-', o.items?.length || 0, `$${parseFloat(o.subtotal || 0).toFixed(2)}`, `$${parseFloat(o.discount || 0).toFixed(2)}`, `$${parseFloat(o.total).toFixed(2)}`, o.payment_method, o.status, new Date(o.created_at).toLocaleDateString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url); setShowExport(false)
  }

  const exportExcel = () => {
    const data = filtered.map(o => ({ 'Order ID': `#${o.id}`, 'Cashier': o.user?.name || '-', 'Items': o.items?.length || 0, 'Total': parseFloat(o.total), 'Payment': o.payment_method, 'Status': o.status, 'Date': new Date(o.created_at).toLocaleDateString() }))
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Orders')
    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0,10)}.xlsx`); setShowExport(false)
  }

  const exportPDF = () => {
    const doc = new jsPDF(); doc.setFontSize(16); doc.text('Orders Report', 14, 15)
    autoTable(doc, { startY: 28, head: [['ID', 'Cashier', 'Total', 'Payment', 'Status', 'Date']], body: filtered.map(o => [`#${o.id}`, o.user?.name || '-', `$${parseFloat(o.total).toFixed(2)}`, o.payment_method, o.status, new Date(o.created_at).toLocaleDateString()]), styles: { fontSize: 9 }, headStyles: { fillColor: [59, 130, 246] } })
    doc.save(`orders_${new Date().toISOString().slice(0,10)}.pdf`); setShowExport(false)
  }

  const S = {
    input: { border: '1px solid #e2e8f0', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', outline: 'none', background: 'white', color: '#475569' },
    btn: (bg, color) => ({ background: bg, color, border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }),
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Orders 📋</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{showArchived ? '📦 Archived Orders' : 'Orders សកម្ម'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowArchived(!showArchived)} style={S.btn(showArchived ? '#fef3c7' : '#f1f5f9', showArchived ? '#d97706' : '#475569')}>
            {showArchived ? '📋 Active' : '📦 Archived'}
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExport(!showExport)} style={S.btn('#22c55e', 'white')}>📥 Export ▾</button>
            {showExport && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 100, minWidth: '160px', overflow: 'hidden' }}>
                {[{ label: '📄 Export CSV', fn: exportCSV }, { label: '📊 Export Excel', fn: exportExcel }, { label: '📑 Export PDF', fn: exportPDF }].map(item => (
                  <button key={item.label} onClick={item.fn} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'white', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={fetchOrders} style={S.btn('#f1f5f9', '#475569')}>🔄</button>
        </div>
      </div>

      {/* Stats */}
      {!showArchived && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Revenue សរុប', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: '#22c55e' },
            { label: 'Orders បានបង់', value: totalPaid, icon: '✅', color: '#3b82f6' },
            { label: 'Orders រង់ចាំ', value: totalPending, icon: '⏳', color: '#f59e0b' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{card.value}</div>
              </div>
              <div style={{ fontSize: '28px' }}>{card.icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input placeholder="🔍 Order ID / Cashier..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, flex: isMobile ? '1 1 100%' : '0 0 200px' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.input}>
          <option value="all">Status ទាំងអស់</option>
          <option value="paid">✅ Paid</option>
          <option value="pending">⏳ Pending</option>
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={S.input}>
          <option value="all">Payment ទាំងអស់</option>
          <option value="cash">💵 Cash</option>
          <option value="khqr">📱 KHQR</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={S.input} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={S.input} />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>បង្ហាញ {filtered.length} / {orders.length} orders</div>

      {/* Table or Cards */}
      {isMobile ? (
        // Mobile: Card view
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>កំពុងផ្ទុក...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px' }}>📋</div>
              <div>គ្មាន order</div>
            </div>
          ) : filtered.map(o => (
            <div key={o.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>#{o.id}</span>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{o.user?.name || '-'}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(o.created_at).toLocaleDateString('km-KH')}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <span style={{ background: o.payment_method === 'cash' ? '#f0fdf4' : '#eff6ff', color: o.payment_method === 'cash' ? '#16a34a' : '#2563eb', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                  {o.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR'}
                </span>
                <span style={{ background: o.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'paid' ? '#16a34a' : '#d97706', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                  {o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setSelected(o)} style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: 'none', padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>👁️ Detail</button>
                {showArchived
                  ? <button onClick={() => handleUnarchive(o.id)} disabled={archiving === o.id} style={{ flex: 1, background: '#f0fdf4', color: '#16a34a', border: 'none', padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>📤 Unarchive</button>
                  : <button onClick={() => handleArchive(o.id)} disabled={archiving === o.id} style={{ flex: 1, background: '#fffbeb', color: '#d97706', border: 'none', padding: '7px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>📦 Archive</button>
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop: Table view
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Order ID', 'Cashier', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>កំពុងផ្ទុក...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}><div style={{ fontSize: '40px' }}>📋</div>គ្មាន order</td></tr>
              ) : filtered.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>#{o.id}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{o.user?.name || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{o.items?.length || 0} items</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: o.payment_method === 'cash' ? '#f0fdf4' : '#eff6ff', color: o.payment_method === 'cash' ? '#16a34a' : '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {o.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: o.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'paid' ? '#16a34a' : '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>{new Date(o.created_at).toLocaleDateString('km-KH')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelected(o)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>👁️ Detail</button>
                      {showArchived
                        ? <button onClick={() => handleUnarchive(o.id)} disabled={archiving === o.id} style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>📤 Unarchive</button>
                        : <button onClick={() => handleArchive(o.id)} disabled={archiving === o.id} style={{ background: '#fffbeb', color: '#d97706', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>📦 Archive</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>📋 Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              {[{ label: 'Cashier', value: selected.user?.name || '-' }, { label: 'Payment', value: selected.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR' }, { label: 'Status', value: selected.status === 'paid' ? '✅ Paid' : '⏳ Pending' }, { label: 'Date', value: new Date(selected.created_at).toLocaleString('km-KH') }].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>{row.label}</span>
                  <span style={{ fontWeight: '600' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(selected.items || []).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', borderRadius: '8px', padding: '10px 14px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.product?.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>${item.price} × {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6' }}>${parseFloat(item.subtotal).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}><span>Subtotal</span><span>${parseFloat(selected.subtotal || 0).toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}><span>Discount</span><span>-${parseFloat(selected.discount || 0).toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px' }}>
                <span>Total</span><span style={{ color: '#3b82f6' }}>${parseFloat(selected.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}