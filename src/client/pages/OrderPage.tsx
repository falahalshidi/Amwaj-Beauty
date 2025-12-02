import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './OrderPage.css'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
}

const API_URL = 'http://localhost:5000/api'

function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProduct()
  }, [id, user])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      setProduct(response.data)
      setShippingInfo(prev => ({ ...prev, name: user?.name || '' }))
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (quantity > product.quantity) {
      setError('الكمية المطلوبة غير متوفرة')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await axios.post(`${API_URL}/orders`, {
        productId: product.id,
        quantity,
        shippingInfo
      })
      alert('تم إرسال الطلب بنجاح!')
      navigate('/products')
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  if (!product) {
    return <div className="error">المنتج غير موجود</div>
  }

  const totalPrice = product.price * quantity

  return (
    <div className="order-page">
      <header className="order-header">
        <button onClick={() => navigate('/products')} className="back-button">
          ← العودة للمنتجات
        </button>
        <h1>إتمام الطلب</h1>
      </header>

      <div className="order-container">
        <div className="order-content">
          <div className="product-summary">
            <h2>ملخص المنتج</h2>
            <div className="product-card-summary">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image-summary"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23FFE5E5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="%23FF91A4"%3EAmwaj%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <div className="product-image-summary product-image-placeholder-summary">
                  <span>Amwaj</span>
                </div>
              )}
              <div className="product-details-summary">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="price-info">
                  <span>السعر: {product.price.toFixed(3)} ر.ع</span>
                  <span>المتاح: {product.quantity} قطعة</span>
                </div>
              </div>
            </div>

            <div className="quantity-selector">
              <label>الكمية:</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setQuantity(Math.min(product.quantity, Math.max(1, val)))
                  }}
                  min="1"
                  max={product.quantity}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  disabled={quantity >= product.quantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-price">
              <strong>المجموع: {totalPrice.toFixed(3)} ر.ع</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="shipping-form">
            <h2>معلومات الشحن</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>الاسم الكامل</label>
              <input
                type="text"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>رقم الهاتف</label>
              <input
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>العنوان</label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>المدينة</label>
              <input
                type="text"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="submit-order-btn" disabled={submitting || product.quantity === 0}>
              {submitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderPage

