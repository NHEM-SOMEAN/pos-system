import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      fetchProducts(); setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', '))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => { if (!confirm(t('confirmDelete'))) return; await api.delete(`/products/${id}`); fetchProducts() }
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

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
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{t('products')} 📦</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{t('manageProducts')}</div>
          </div>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={openAdd}>
            + {t('addProduct')}
          </button>
        </div>

        {/* Search */}
        <input style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', width: '100%', outline: 'none', boxSizing: 'border-box' }}
          placeholder={`🔍 ${t('search')}`} value={search} onChange={e => setSearch(e.target.value)} />

        {/* Mobile: Card view / Desktop: Table view */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('noProducts')}</div>
            ) : filtered.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? <img src={`${STORAGE_URL}/${p.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>📦</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.category?.name || '-'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#3b82f6' }}>${p.price}</span>
                  <span style={{ background: p.stock <= 5 ? '#fee2e2' : '#f0fdf4', color: p.stock <= 5 ? '#dc2626' : '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                    {p.stock} units
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, background: '#fef3c7', color: '#d97706', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>✏️ {t('edit')}</button>
                  <button onClick={() => handleDelete(p.id)} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑️ {t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {[t('products'), t('category'), t('price'), t('stock'), 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('loading')}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('noProducts')}</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {p.image ? <img src={p.image?.startsWith('http') ? p.image : `${STORAGE_URL}/${p.image}`} style={{ width: '38px', height: '38px', objectFit: 'cover' }} /> : '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.name}</div>
                          {p.barcode && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.barcode}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>{p.category?.name || '-'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', fontWeight: '600', color: '#3b82f6' }}>${p.price}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ background: p.stock <= 5 ? '#fee2e2' : '#f0fdf4', color: p.stock <= 5 ? '#dc2626' : '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>{p.stock} units</span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginRight: '6px' }}>✏️ {t('edit')}</button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>🗑️ {t('delete')}</button>
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
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
              {editing ? `✏️ ${t('editProduct')}` : `📦 ${t('addProduct')}`}
            </div>
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? t('loading') : editing ? t('save') : t('addProduct')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}