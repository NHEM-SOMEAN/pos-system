import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useLang } from '../context/LanguageContext'
import api, { STORAGE_URL } from '../api/axios'

const emptyForm = { category_id: '', name: '', price: '', stock: '', barcode: '' }

export default function Products() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProducts(); api.get('/categories').then(res => setCategories(res.data.data || res.data)) }, [])

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products').then(res => { setProducts(res.data.data || res.data); setLoading(false) })
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImage(null); setError(null); setShowModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ category_id: p.category_id, name: p.name, price: p.price, stock: p.stock, barcode: p.barcode || '' }); setImage(null); setError(null); setShowModal(true) }

  const handleSubmit = async () => {
  setSaving(true); setError(null)
  try {
    if (editing) {
      await api.put(`/products/${editing.id}`, form)
    } else {
      const data = new FormData()
      Object.keys(form).forEach(k => { if (form[k] !== '') data.append(k, form[k]) })
      if (image) data.append('image', image)
      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    fetchProducts(); setShowModal(false)
  } catch (err) {
    setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', '))
  } finally { setSaving(false) }
}

  const handleDelete = async (id) => { if (!confirm(t('confirmDelete'))) return; await api.delete(`/products/${id}`); fetchProducts() }
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const S = {
    page: { display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: '24px', fontWeight: '700', color: '#0f172a' },
    subtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
    btnPrimary: { background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    searchBox: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', width: '280px', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '14px 16px', borderBottom: '1px solid #f8fafc', color: '#334155' },
    card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
    btnEdit: { background: '#fef3c7', color: '#d97706', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginRight: '6px' },
    btnDel: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modal: { background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
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
        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={S.title}>{t('products')} 📦</div>
            <div style={S.subtitle}>{t('manageProducts')}</div>
          </div>
          <button style={S.btnPrimary} onClick={openAdd}>{t('addProduct')}</button>
        </div>

        {/* Search */}
        <input style={S.searchBox} placeholder={`🔍 ${t('search')}`} value={search} onChange={e => setSearch(e.target.value)} />

        {/* Table */}
        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t('products')}</th>
                <th style={S.th}>{t('category')}</th>
                <th style={S.th}>{t('price')}</th>
                <th style={S.th}>{t('stock')}</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>{t('loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>{t('noProducts')}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {p.image ? <img src={`http://${STORAGE_URL}/${p.image}`} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px' }} /> : '📦'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.name}</div>
                        {p.barcode && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.barcode}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>
                    <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{p.category?.name || '-'}</span>
                  </td>
                  <td style={{ ...S.td, fontWeight: '600', color: '#3b82f6' }}>${p.price}</td>
                  <td style={S.td}>
                    <span style={{ background: p.stock <= 5 ? '#fee2e2' : '#f0fdf4', color: p.stock <= 5 ? '#dc2626' : '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td style={S.td}>
                    <button style={S.btnEdit} onClick={() => openEdit(p)}>✏️ {t('edit')}</button>
                    <button style={S.btnDel} onClick={() => handleDelete(p.id)}>🗑️ {t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editing ? `✏️ ${t('editProduct')}` : `📦 ${t('addProduct')}`}</div>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>❌ {error}</div>}
            <label style={S.label}>{t('category')}</label>
            <select style={S.input} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">{t('selectCategory')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label style={S.label}>{t('name')}</label>
            <input style={S.input} placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <label style={S.label}>{t('price')}</label>
            <input style={S.input} type="number" placeholder={t('price')} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <label style={S.label}>{t('stock')}</label>
            <input style={S.input} type="number" placeholder={t('stock')} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <label style={S.label}>{t('barcode')} ({t('optional')})</label>
            <input style={S.input} placeholder={t('barcode')} value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
            {!editing && (
              <>
                <label style={S.label}>{t('image')} ({t('optional')})</label>
                <input style={S.input} type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
              </>
            )}
            <div style={S.btnRow}>
              <button style={S.btnCancel} onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button style={{ ...S.btnSave, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? t('loading') : editing ? t('save') : t('addProduct')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}