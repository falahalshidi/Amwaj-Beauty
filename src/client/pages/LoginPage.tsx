import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [envWarning, setEnvWarning] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if Supabase env vars are missing
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
      setEnvWarning(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // إذا كان البريد الإلكتروني هو admin@amwajbeauty.com، توجه إلى صفحة الأدمن
      if (email.toLowerCase() === 'admin@amwajbeauty.com') {
        navigate('/admin')
      } else {
        navigate('/products')
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img 
            src="/logo.png" 
            alt="Amwaj Beauty" 
            className="auth-logo" 
          />
          <h1>Amwaj Beauty</h1>
          <h2>تسجيل الدخول</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {envWarning && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'right',
              direction: 'rtl'
            }}>
              <strong>⚠️ تحذير:</strong> متغيرات Supabase غير موجودة!
              <br />
              يرجى إنشاء ملف <code>.env</code> وإضافة:
              <br />
              <code>VITE_SUPABASE_URL=your_url</code>
              <br />
              <code>VITE_SUPABASE_ANON_KEY=your_key</code>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ليس لديك حساب؟ <Link to="/register">سجّل الآن</Link>
          </p>
          <Link to="/" className="back-link">← العودة للصفحة الرئيسية</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

