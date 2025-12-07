import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './ProductsPage.css'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = (product: Product) => {
    if (!user) {
      alert('سجّل دخول عشان تكمل الطلب')
      navigate('/login')
      return
    }
    navigate(`/products/${product.id}/order`)
  }

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="products-page">
      <header className="products-header">
        <div className="header-content">
          <img 
            src="/logo.jpg" 
            alt="Amwaj Beauty" 
            className="logo-small" 
          />
          <h1>Amwaj Beauty</h1>
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <span>مرحباً، {user.name}</span>
                <button onClick={() => navigate('/my-orders')} className="orders-btn">
                  طلباتي
                </button>
                {user.isAdmin && (
                  <button onClick={() => navigate('/admin')} className="admin-btn">
                    لوحة التحكم
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="login-btn">
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="products-main">
        <h2 className="page-title">منتجاتنا</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="300" height="300" fill="%23FFE5E5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="%23FF91A4"%3EAmwaj Beauty%3C/text%3E%3C/svg%3E'
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>Amwaj Beauty</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <div className="product-price">
                    {product.price.toFixed(3)} ر.ع
                  </div>
                  <div className="product-quantity">
                    متوفر: {product.quantity} قطعة
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="buy-now-btn"
                    onClick={() => handleBuyNow(product)}
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? 'نفذ المخزون' : 'اطلب الآن'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="no-products">
            <p>لا توجد منتجات متاحة حالياً</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductsPage

