import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Component, ErrorInfo, ReactNode } from 'react'
import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OrderPage from './pages/OrderPage'
import AdminPanel from './pages/AdminPanel'
import { AuthProvider, useAuth } from './context/AuthContext'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          direction: 'rtl',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>حدث خطأ</h1>
          <p style={{ color: '#666', margin: '1rem 0' }}>
            {this.state.error?.message || 'حدث خطأ غير متوقع'}
          </p>
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              padding: '1rem', 
              borderRadius: '4px',
              margin: '1rem 0',
              textAlign: 'right'
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
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  // التحقق من isAdmin أو من البريد الإلكتروني admin@amwajbeauty.com
  const isAdmin = user?.isAdmin || user?.email?.toLowerCase() === 'admin@amwajbeauty.com'
  return isAdmin ? <>{children}</> : <Navigate to="/" />
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/products/:id/order"
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

