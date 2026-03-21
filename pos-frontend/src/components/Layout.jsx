import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useLang } from '../context/LanguageContext'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { lang, toggleLang, t } = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: '📊' },
    { path: '/pos', label: t('pos'), icon: '🛒' },
    ...(user.role === 'admin' ? [
      { path: '/products', label: t('products'), icon: '📦' },
      { path: '/categories', label: t('categories'), icon: '🏷️' },
      { path: '/staff', label: t('staff'), icon: '👥' },
    ] : []),
    { path: '/orders', label: t('orders'), icon: '📋' },
  ]

  const handleLogout = async () => {
    await api.post('/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const pageTitle = navItems.find(i => i.path === location.pathname)?.label || t('dashboard')
  const today = new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const Sidebar = () => (
    <aside style={{ width: '220px', background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh' }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>P</div>
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>POS System</div>
            <div style={{ color: '#475569', fontSize: '11px' }}>v1.0.0</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ margin: '12px 10px', background: '#1e293b', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
          {user.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Admin'}</div>
          <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'capitalize' }}>{user.role || 'admin'}</div>
        </div>
      </div>

      <div style={{ padding: '8px 0' }}>
        <div style={{ color: '#475569', fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>Menu</div>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', margin: '1px 8px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '500', background: active ? '#3b82f6' : 'transparent', color: active ? 'white' : '#64748b' }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}></span>}
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={toggleLang} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', marginBottom: '4px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#94a3b8', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
          <span>🌐 Language</span>
          <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
            {lang === 'en' ? 'EN' : 'ខ្មែរ'}
          </span>
        </button>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
          <span>🚪</span><span>{t('signOut')}</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
      )}

      {/* Sidebar Desktop */}
      <div style={{ display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
        <Sidebar />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 999 }}>
          <Sidebar />
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger Menu */}
            <button onClick={() => setSidebarOpen(true)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#0f172a' }}>☰</button>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{pageTitle}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{today}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#22c55e' }}>
            <div style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%' }}></div>
            {t('systemOnline')}
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}