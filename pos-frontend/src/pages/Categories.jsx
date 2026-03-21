import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useLang } from '../context/LanguageContext'

export default function Categories() {
  const { t } = useLang()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = () => { setLoading(true); api.get('/categories').then(res => { setCategories(res.data.data || res.data); setLoading(false) }) }
  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setError(null); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setError(null); setShowModal(true) }

  const handleSubmit = async () => {
    setSaving(true); setError(null)
    try {
      if (editing) { await api.put(`/categories/${editing.id}`, form) } else { await api.post('/categories', form) }
      fetchCategories(); setShowModal(false)
    } catch (err) { setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', ')) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => { if (!confirm(t('confirmDelete'))) return; await api.delete(`/categories/${id}`); fetchCategories() }

  const S = {
    input: { width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' },
    label: { fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px', display: 'block' },
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{t('categories')} 🏷️</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{t('manageCategories')}</div>
          </div>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={openAdd}>
            + {t('addCategory')}
          </button>
        </div>

        {/* Mobile: Card view / Desktop: Table view */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</div>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('noCategories')}</div>
            ) : categories.map((c, i) => (
              <div key={c.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>#{i + 1}</span>
                </div>
                {c.description && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{c.description}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(c)} style={{ flex: 1, background: '#fef3c7', color: '#d97706', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>✏️ {t('edit')}</button>
                  <button onClick={() => handleDelete(c.id)} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑️ {t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['#', t('name'), t('description'), 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('loading')}</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('noCategories')}</td></tr>
                ) : categories.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', color: '#94a3b8', width: '40px' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{c.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', color: '#64748b' }}>{c.description || '-'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <button onClick={() => openEdit(c)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginRight: '6px' }}>✏️ {t('edit')}</button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>🗑️ {t('delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              {editing ? `✏️ ${t('editCategory')}` : `🏷️ ${t('addCategory')}`}
            </div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>❌ {error}</div>}
            <label style={S.label}>{t('name')}</label>
            <input style={S.input} placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label style={S.label}>{t('description')} ({t('optional')})</label>
            <textarea style={{ ...S.input, resize: 'none', height: '80px' }} placeholder={t('description')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? t('loading') : editing ? t('save') : t('addCategory')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}