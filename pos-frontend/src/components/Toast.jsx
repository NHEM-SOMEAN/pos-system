import { useEffect, useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  }

  const addToast = (message, type) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  return { toasts, toast }
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
  }, [])

  const styles = {
    success: { bg: '#f0fdf4', border: '#22c55e', color: '#16a34a', icon: '✅' },
    error: { bg: '#fef2f2', border: '#ef4444', color: '#dc2626', icon: '❌' },
    info: { bg: '#eff6ff', border: '#3b82f6', color: '#2563eb', icon: 'ℹ️' },
  }

  const s = styles[toast.type] || styles.info

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderLeft: `4px solid ${s.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '280px',
      maxWidth: '360px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: visible ? 'translateX(0)' : 'translateX(100px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
    }}>
      <span style={{ fontSize: '16px' }}>{s.icon}</span>
      <span style={{ fontSize: '13px', fontWeight: '500', color: s.color, flex: 1 }}>{toast.message}</span>
    </div>
  )
}