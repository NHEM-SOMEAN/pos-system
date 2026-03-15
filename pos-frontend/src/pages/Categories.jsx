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
    page: { display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: '24px', fontWeight: '700', color: '#0f172a' },
    subtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '14px 16px', borderBottom: '1px solid #f8fafc', color: '#334155' },
    btnEdit: { background: '#fef3c7', color: '#d97706', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginRight: '6px' },
    btnDel: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modal: { background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px' },
    modalTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' },
    input: { width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' },
    label: { fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px', display: 'block' },
    btnRow: { display: 'flex', gap: '10px', marginTop: '8px' },
    btnCancel: { flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    btnSave: { flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  }

  return (
    <Layout>
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <div style={S.title}>{t('categories')} 🏷️</div>
            <div style={S.subtitle}>{t('manageCategories')}</div>
          </div>
          <button style={S.btnPrimary} onClick={openAdd}>{t('addCategory')}</button>
        </div>

        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>{t('name')}</th>
                <th style={S.th}>{t('description')}</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>{t('loading')}</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>{t('noCategories')}</td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ ...S.td, color: '#94a3b8', width: '40px' }}>{i + 1}</td>
                  <td style={S.td}>
                    <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{c.name}</span>
                  </td>
                  <td style={{ ...S.td, color: '#64748b' }}>{c.description || '-'}</td>
                  <td style={S.td}>
                    <button style={S.btnEdit} onClick={() => openEdit(c)}>✏️ {t('edit')}</button>
                    <button style={S.btnDel} onClick={() => handleDelete(c.id)}>🗑️ {t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editing ? `✏️ ${t('editCategory')}` : `🏷️ ${t('addCategory')}`}</div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>❌ {error}</div>}
            <label style={S.label}>{t('name')}</label>
            <input style={S.input} placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label style={S.label}>{t('description')} ({t('optional')})</label>
            <textarea style={{ ...S.input, resize: 'none', height: '80px' }} placeholder={t('description')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={S.btnRow}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button style={{ ...S.btnSave, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? t('loading') : editing ? t('save') : t('addCategory')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}