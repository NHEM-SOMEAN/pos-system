import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const emptyForm = { name: '', email: '', password: '', role: 'cashier' }

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = () => {
    setLoading(true)
    api.get('/staff').then(res => { setStaff(res.data.data || res.data); setLoading(false) })
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(null); setShowModal(true) }
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, email: s.email, password: '', role: s.role }); setError(null); setShowModal(true) }

  const handleSubmit = async () => {
    setSaving(true); setError(null)
    try {
      if (editing) {
        const data = { name: form.name, email: form.email, role: form.role }
        if (form.password) data.password = form.password
        await api.put(`/staff/${editing.id}`, data)
      } else {
        await api.post('/staff', form)
      }
      fetchStaff(); setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', '))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('លុប staff នេះ?')) return
    await api.delete(`/staff/${id}`); fetchStaff()
  }

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalAdmin = staff.filter(s => s.role === 'admin').length
  const totalCashier = staff.filter(s => s.role === 'cashier').length

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Staff Management 👥</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>គ្រប់គ្រង staff និង role ទាំងអស់</p>
        </div>
        <button onClick={openAdd} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          + បន្ថែម Staff
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Staff សរុប', value: staff.length, icon: '👥', color: '#3b82f6' },
          { label: 'Admin', value: totalAdmin, icon: '👑', color: '#f59e0b' },
          { label: 'Cashier', value: totalCashier, icon: '💼', color: '#22c55e' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{card.value}</div>
            </div>
            <div style={{ fontSize: '28px' }}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input type="text" placeholder="🔍 ស្វែងរក staff..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', outline: 'none', width: '100%', marginBottom: '16px', background: 'white', boxSizing: 'border-box' }} />

      {/* Mobile: Card / Desktop: Table */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>កំពុងផ្ទុក...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>គ្មាន staff</div>
          ) : filtered.map(s => (
            <div key={s.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: s.role === 'admin' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                </div>
                <span style={{ background: s.role === 'admin' ? '#fef3c7' : '#dbeafe', color: s.role === 'admin' ? '#d97706' : '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                  {s.role === 'admin' ? '👑 Admin' : '💼 Cashier'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(s)} style={{ flex: 1, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => handleDelete(s.id)} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Staff', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>កំពុងផ្ទុក...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>គ្មាន staff</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: s.role === 'admin' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>{s.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: s.role === 'admin' ? '#fef3c7' : '#dbeafe', color: s.role === 'admin' ? '#d97706' : '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {s.role === 'admin' ? '👑 Admin' : '💼 Cashier'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#94a3b8' }}>{new Date(s.created_at).toLocaleDateString('km-KH')}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(s)} style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {editing ? '✏️' : '👤'}
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editing ? 'កែ Staff' : 'បន្ថែម Staff ថ្មី'}
              </h2>
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>❌ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'ឈ្មោះ', key: 'name', type: 'text', placeholder: 'ឈ្មោះពេញ' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: editing ? 'Password ថ្មី (optional)' : 'Password', key: 'password', type: 'password', placeholder: editing ? 'ទុកចន្លោះបើមិនផ្លាស់ប្តូរ' : 'Password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block' }}>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', background: 'white' }}>
                  <option value="cashier">💼 Cashier</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>បោះបង់</button>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ កំពុងរក្សាទុក...' : editing ? '💾 រក្សាទុក' : '➕ បន្ថែម'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}