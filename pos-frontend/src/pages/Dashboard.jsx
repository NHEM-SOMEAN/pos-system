import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import Layout from '../components/Layout'
import api from '../api/axios'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: '28px' }}>{icon}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    api.get('/dashboard')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'API Error'); setLoading(false) })
  }, [])

  if (loading) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8' }}>⏳ កំពុងផ្ទុក...</div></Layout>
  if (error || !data) return <Layout><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#ef4444' }}>❌ {error}</div></Layout>

  return (
    <Layout>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dashboard 📊</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>ទិដ្ឋភាពទូទៅនៃអាជីវកម្ម</p>
      </div>

      {/* Stat Cards Row 1 */}
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>ថ្ងៃនេះ</div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <StatCard icon="💰" label="ចំណូលថ្ងៃនេះ" value={`$${parseFloat(data.daily?.sales || 0).toFixed(2)}`} color="#22c55e" />
        <StatCard icon="🛒" label="Orders ថ្ងៃនេះ" value={data.daily?.orders || 0} color="#3b82f6" />
        <StatCard icon="📅" label="ចំណូលខែនេះ" value={`$${parseFloat(data.monthly?.sales || 0).toFixed(2)}`} color="#8b5cf6" />
        <StatCard icon="📦" label="Orders ខែនេះ" value={data.monthly?.orders || 0} color="#f59e0b" />
      </div>

      {/* Stat Cards Row 2 */}
      <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon="📦" label="Products សរុប" value={data.stats?.total_products || 0} color="#3b82f6" />
        <StatCard icon="👥" label="Staff សរុប" value={data.stats?.total_staff || 0} color="#22c55e" />
        <StatCard icon="⚠️" label="Low Stock" value={data.stats?.low_stock || 0} sub="Stock ≤ 10" color="#ef4444" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>📈 Revenue 6 ខែចុងក្រោយ</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenue_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>🏆 Best Selling</div>
          {data.best_selling?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.best_selling} dataKey="order_items_sum_quantity" nameKey="name" cx="50%" cy="50%" outerRadius={55}>
                    {data.best_selling.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Sold']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.best_selling.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                      <span style={{ fontSize: '11px', color: '#475569' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6' }}>{p.order_items_sum_quantity || 0}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 0' }}>គ្មានទិន្នន័យ</div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>📉 Revenue Trend</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.revenue_chart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>📋 Orders ថ្មីៗ</div>
        {isMobile ? (
          // Mobile: Card view
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data.recent_orders || []).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>គ្មាន orders</div>
            ) : (data.recent_orders || []).map(o => (
              <div key={o.id} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>#{o.id}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{o.user?.name || '-'}</span>
                  <span style={{ background: o.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'paid' ? '#16a34a' : '#d97706', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Table view
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['ID', 'Cashier', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders || []).length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>គ្មាន orders</td></tr>
              ) : (data.recent_orders || []).map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < data.recent_orders.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>#{o.id}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px' }}>{o.user?.name || '-'}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '700' }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ background: o.payment_method === 'cash' ? '#f0fdf4' : '#eff6ff', color: o.payment_method === 'cash' ? '#16a34a' : '#2563eb', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {o.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ background: o.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'paid' ? '#16a34a' : '#d97706', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#94a3b8' }}>{new Date(o.created_at).toLocaleDateString('km-KH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}