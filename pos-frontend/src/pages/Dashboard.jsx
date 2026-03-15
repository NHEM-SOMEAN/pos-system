import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import Layout from '../components/Layout'
import api from '../api/axios'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: '36px' }}>{icon}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'API Error'); setLoading(false) })
  }, [])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '14px' }}>
        ⏳ កំពុងផ្ទុក...
      </div>
    </Layout>
  )

  if (error || !data) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#ef4444', fontSize: '14px' }}>
        ❌ {error || 'API មិន response'}
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dashboard 📊</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>ទិដ្ឋភាពទូទៅនៃអាជីវកម្ម</p>
      </div>

      {/* Stat Cards Row 1 - Today */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>ថ្ងៃនេះ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <StatCard icon="💰" label="ចំណូលថ្ងៃនេះ" value={`$${parseFloat(data.daily?.sales || 0).toFixed(2)}`} color="#22c55e" />
          <StatCard icon="🛒" label="Orders ថ្ងៃនេះ" value={data.daily?.orders || 0} color="#3b82f6" />
          <StatCard icon="📅" label="ចំណូលខែនេះ" value={`$${parseFloat(data.monthly?.sales || 0).toFixed(2)}`} color="#8b5cf6" />
          <StatCard icon="📦" label="Orders ខែនេះ" value={data.monthly?.orders || 0} color="#f59e0b" />
        </div>
      </div>

      {/* Stat Cards Row 2 - Overview */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <StatCard icon="📦" label="Products សរុប" value={data.stats?.total_products || 0} color="#3b82f6" />
          <StatCard icon="👥" label="Staff សរុប" value={data.stats?.total_staff || 0} color="#22c55e" />
          <StatCard icon="⚠️" label="Low Stock" value={data.stats?.low_stock || 0} sub="Stock ≤ 10" color="#ef4444" />
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Revenue Bar Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>📈 Revenue 6 ខែចុងក្រោយ</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenue_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Selling Pie Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>🏆 Best Selling</div>
          {data.best_selling?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={data.best_selling} dataKey="order_items_sum_quantity" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                    {data.best_selling.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Sold']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {data.best_selling.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }}></div>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>{p.order_items_sum_quantity || 0} sold</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '40px 0' }}>គ្មានទិន្នន័យ</div>
          )}
        </div>
      </div>

      {/* Revenue Line Chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>📉 Revenue Trend</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.revenue_chart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>📋 Orders ថ្មីៗ</div>
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
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>គ្មាន orders</td></tr>
            ) : (data.recent_orders || []).map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < data.recent_orders.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>#{o.id}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0f172a' }}>{o.user?.name || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>${parseFloat(o.total).toFixed(2)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: o.payment_method === 'cash' ? '#f0fdf4' : '#eff6ff', color: o.payment_method === 'cash' ? '#16a34a' : '#2563eb', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {o.payment_method === 'cash' ? '💵 Cash' : '📱 KHQR'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: o.status === 'paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'paid' ? '#16a34a' : '#d97706', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
                  {new Date(o.created_at).toLocaleDateString('km-KH')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}