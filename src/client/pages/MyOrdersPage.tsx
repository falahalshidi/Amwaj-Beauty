import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './MyOrdersPage.css'

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

function MyOrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders((data || []) as Order[])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: 'قيد الانتظار',
      preparing: 'جاري الإعداد',
      shipped: 'تم الشحن',
      completed: 'مكتمل'
    }
    return labels[status]
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#ffc107',
      preparing: '#17a2b8',
      shipped: '#007bff',
      completed: '#28a745'
    }
    return colors[status]
  }

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="my-orders-page">
      <header className="orders-header">
        <button onClick={() => navigate('/products')} className="back-button">
          ← العودة للمنتجات
        </button>
        <h1>طلباتي</h1>
      </header>

      <main className="orders-main">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>لا توجد طلبات حالياً</p>
            <button onClick={() => navigate('/products')} className="browse-products-btn">
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>طلب #{order.id.slice(0, 8)}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString('ar-OM', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div 
                    className="order-status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-product">
                    <h4>المنتج:</h4>
                    <p>{order.product_name}</p>
                  </div>
                  <div className="order-info-row">
                    <div>
                      <span className="label">الكمية:</span>
                      <span className="value">{order.quantity}</span>
                    </div>
                    <div>
                      <span className="label">المجموع:</span>
                      <span className="value">{order.total_price.toFixed(3)} ر.ع</span>
                    </div>
                  </div>
                </div>

                <div className="order-shipping">
                  <h4>معلومات الشحن:</h4>
                  <div className="shipping-details">
                    <p><strong>الاسم:</strong> {order.shipping_info?.name || 'غير متوفر'}</p>
                    <p><strong>الهاتف:</strong> {order.shipping_info?.phone || 'غير متوفر'}</p>
                    <p><strong>الولاية:</strong> {order.shipping_info?.city || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyOrdersPage

