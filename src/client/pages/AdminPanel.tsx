import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './AdminPanel.css'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
}

interface Order {
  id: string
  productId: string
  productName: string
  quantity: number
  totalPrice: number
  shippingInfo: {
    name: string
    phone: string
    address: string
    city: string
  }
  status: 'pending' | 'preparing' | 'shipped' | 'completed'
  createdAt: string
}

const API_URL = 'http://localhost:5000/api'

function AdminPanel() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    quantity: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/orders`)
      ])
      setProducts(productsRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, {
          ...productForm,
          price: parseFloat(productForm.price),
          quantity: parseInt(productForm.quantity)
        })
      } else {
        await axios.post(`${API_URL}/products`, {
          ...productForm,
          price: parseFloat(productForm.price),
          quantity: parseInt(productForm.quantity)
        })
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', image: '', quantity: '' })
      fetchData()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('حدث خطأ أثناء حفظ المنتج')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      quantity: product.quantity.toString()
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      await axios.delete(`${API_URL}/products/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('حدث خطأ أثناء حذف المنتج')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status })
      fetchData()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('حدث خطأ أثناء تحديث حالة الطلب')
    }
  }

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>لوحة التحكم - Amwaj Beauty</h1>
          <div className="admin-actions">
            <span>مرحباً، {user?.name}</span>
            <button onClick={logout} className="logout-btn">تسجيل الخروج</button>
          </div>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          إدارة المنتجات
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          إدارة الطلبات
        </button>
      </div>

      <main className="admin-main">
        {activeTab === 'products' && (
          <div className="products-admin">
            <div className="section-header">
              <h2>المنتجات</h2>
              <button
                className="add-product-btn"
                onClick={() => {
                  setEditingProduct(null)
                  setProductForm({ name: '', description: '', price: '', image: '', quantity: '' })
                  setShowProductForm(true)
                }}
              >
                + إضافة منتج جديد
              </button>
            </div>

            {showProductForm && (
              <div className="product-form-modal">
                <div className="product-form-content">
                  <h3>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                      <label>اسم المنتج</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>الوصف</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        required
                        rows={4}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>السعر (ر.ع)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>الكمية</label>
                        <input
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>رابط الصورة</label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="products-list">
              {products.map((product) => (
                <div key={product.id} className="product-admin-card">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-admin-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23FFE5E5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="20" fill="%23FF91A4"%3EAmwaj Beauty%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="product-admin-image product-admin-image-placeholder">
                      <span>Amwaj Beauty</span>
                    </div>
                  )}
                  <div className="product-admin-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-admin-details">
                      <span>السعر: {product.price.toFixed(3)} ر.ع</span>
                      <span>الكمية: {product.quantity}</span>
                    </div>
                  </div>
                  <div className="product-admin-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditProduct(product)}
                    >
                      تعديل
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-admin">
            <h2>الطلبات</h2>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-admin-card">
                  <div className="order-header-info">
                    <div>
                      <h3>طلب #{order.id.slice(0, 8)}</h3>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('ar-OM')}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="status-select"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="preparing">تم الإعداد</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="completed">مكتمل</option>
                    </select>
                  </div>
                  <div className="order-details">
                    <p><strong>المنتج:</strong> {order.productName}</p>
                    <p><strong>الكمية:</strong> {order.quantity}</p>
                    <p><strong>المجموع:</strong> {order.totalPrice.toFixed(3)} ر.ع</p>
                  </div>
                  <div className="order-shipping">
                    <h4>معلومات الشحن:</h4>
                    <p><strong>الاسم:</strong> {order.shippingInfo.name}</p>
                    <p><strong>الهاتف:</strong> {order.shippingInfo.phone}</p>
                    <p><strong>العنوان:</strong> {order.shippingInfo.address}</p>
                    <p><strong>المدينة:</strong> {order.shippingInfo.city}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="no-orders">
                  <p>لا توجد طلبات حالياً</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel

