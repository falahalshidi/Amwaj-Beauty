import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
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
  product_id: string
  product_name: string
  quantity: number
  total_price: number
  shipping_info: {
    name: string
    phone: string
    city: string
    deliveryType?: 'home' | 'office'
  }
  status: 'pending' | 'preparing' | 'shipped' | 'completed'
  created_at: string
}

function AdminPanel() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'shipped' | 'completed'>('all')
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ])

      if (productsRes.error) throw productsRes.error
      if (ordersRes.error) throw ordersRes.error

      setProducts((productsRes.data || []) as Product[])
      const ordersData = (ordersRes.data || []) as Order[]
      setOrders(ordersData)
      applyOrderFilter(ordersData, orderFilter)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyOrderFilter = (ordersList: Order[], filter: typeof orderFilter) => {
    if (filter === 'all') {
      setFilteredOrders(ordersList)
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === filter))
    }
  }

  useEffect(() => {
    if (orders.length > 0) {
      applyOrderFilter(orders, orderFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderFilter])

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = productForm.image

      // Upload image if a new file is selected
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          alert('فشل رفع الصورة. يرجى المحاولة مرة أخرى.')
          return
        }
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image: imageUrl || null,
        quantity: parseInt(productForm.quantity),
      }

      if (editingProduct) {
        const { error } = await (supabase
          .from('products') as any)
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await (supabase
          .from('products') as any)
          .insert(productData)

        if (error) throw error
      }

      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', image: '', quantity: '' })
      setSelectedImage(null)
      setImagePreview(null)
      fetchData()
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert(error.message || 'حدث خطأ أثناء حفظ المنتج')
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
    setSelectedImage(null)
    setImagePreview(product.image || null)
    setShowProductForm(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      alert(error.message || 'حدث خطأ أثناء حذف المنتج')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await (supabase
        .from('orders') as any)
        .update({ status })
        .eq('id', orderId)

      if (error) throw error
      // تحديث الحالة محلياً
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      )
      applyOrderFilter(
        orders.map(order => order.id === orderId ? { ...order, status } : order),
        orderFilter
      )
    } catch (error: any) {
      console.error('Error updating order status:', error)
      alert(error.message || 'حدث خطأ أثناء تحديث حالة الطلب')
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
                  setSelectedImage(null)
                  setImagePreview(null)
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
                      <label>صورة المنتج</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ marginBottom: '1rem' }}
                      />
                      {imagePreview && (
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '300px', 
                              borderRadius: '8px',
                              border: '2px solid var(--pink-light)'
                            }} 
                          />
                        </div>
                      )}
                      {uploadingImage && (
                        <div style={{ color: 'var(--pink-medium)', marginTop: '0.5rem' }}>
                          جاري رفع الصورة...
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="save-btn"
                        disabled={uploadingImage}
                      >
                        {uploadingImage 
                          ? 'جاري الحفظ...' 
                          : editingProduct 
                            ? 'حفظ التعديلات' 
                            : 'إضافة المنتج'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                        disabled={uploadingImage}
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
            <div className="orders-header">
              <h2>الطلبات</h2>
              <div className="order-filters">
                <button
                  className={orderFilter === 'all' ? 'filter-active' : ''}
                  onClick={() => setOrderFilter('all')}
                >
                  الكل
                </button>
                <button
                  className={orderFilter === 'pending' ? 'filter-active' : ''}
                  onClick={() => setOrderFilter('pending')}
                >
                  قيد الانتظار
                </button>
                <button
                  className={orderFilter === 'preparing' ? 'filter-active' : ''}
                  onClick={() => setOrderFilter('preparing')}
                >
                  جاري الإعداد
                </button>
                <button
                  className={orderFilter === 'shipped' ? 'filter-active' : ''}
                  onClick={() => setOrderFilter('shipped')}
                >
                  تم الشحن
                </button>
                <button
                  className={orderFilter === 'completed' ? 'filter-active' : ''}
                  onClick={() => setOrderFilter('completed')}
                >
                  مكتمل
                </button>
              </div>
            </div>
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-admin-card">
                  <div className="order-header-info">
                    <div>
                      <h3>طلب #{order.id.slice(0, 8)}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString('ar-OM', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
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
                    <p><strong>المنتج:</strong> {order.product_name}</p>
                    <p><strong>الكمية:</strong> {order.quantity}</p>
                    <p><strong>المجموع:</strong> {order.total_price.toFixed(3)} ر.ع</p>
                  </div>
                  <div className="order-shipping">
                    <h4>معلومات الشحن:</h4>
                    <p><strong>الاسم:</strong> {order.shipping_info?.name || 'غير متوفر'}</p>
                    <p><strong>الهاتف:</strong> {order.shipping_info?.phone || 'غير متوفر'}</p>
                    <p><strong>الولاية:</strong> {order.shipping_info?.city || 'غير متوفر'}</p>
                    <p><strong>مكان التوصيل:</strong> 
                      <span style={{ 
                        color: order.shipping_info?.deliveryType === 'office' ? '#FF6B9D' : '#4CAF50',
                        fontWeight: 'bold',
                        marginRight: '0.5rem'
                      }}>
                        {order.shipping_info?.deliveryType === 'office' ? '📦 مكتب الشحن' : '🏠 المنزل'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="no-orders">
                  <p>لا توجد طلبات {orderFilter !== 'all' ? `بالحالة "${orderFilter}"` : ''} حالياً</p>
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

