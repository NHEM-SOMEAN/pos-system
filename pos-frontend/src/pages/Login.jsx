import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdEmail, MdLock, MdPointOfSale } from 'react-icons/md'
import api from '../api/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Email ឬ Password មិនត្រឹមត្រូវ!')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(60px)' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(139,92,246,0.06)', borderRadius: '50%', filter: 'blur(80px)' }}/>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
            <MdPointOfSale size={32} color="white"/>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>POS System</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>សូមចូលគណនីរបស់អ្នក</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdLock size={16}/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <MdEmail size={18}/>
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@pos.com" required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px 12px 42px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <MdLock size={18}/>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px 12px 42px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(59,130,246,0.3)' }}>
            {loading ? 'កំពុងចូល...' : 'ចូលប្រព័ន្ធ →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>POS System v1.0.0 · Powered by Laravel + React</p>
        </div>
      </div>
    </div>
  )
}