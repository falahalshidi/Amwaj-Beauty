import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/db.js'
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, shippingInfo } = req.body

    if (!productId || !quantity || !shippingInfo) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' })
    }

    const product = db.products.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' })
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة' })
    }

    // Update product quantity
    const products = db.products.getAll()
    const productIndex = products.findIndex(p => p.id === productId)
    products[productIndex].quantity -= quantity
    products[productIndex].updatedAt = new Date().toISOString()
    db.products.save(products)

    // Create order
    const orders = db.orders.getAll()
    const newOrder = {
      id: uuidv4(),
      userId: req.userId!,
      productId,
      productName: product.name,
      quantity,
      totalPrice: product.price * quantity,
      shippingInfo,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    }

    orders.push(newOrder)
    db.orders.save(orders)

    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الطلب' })
  }
})

router.get('/', authenticate, isAdmin, (req: AuthRequest, res) => {
  try {
    const orders = db.orders.getAll()
    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' })
  }
})

router.get('/my-orders', authenticate, (req: AuthRequest, res) => {
  try {
    const orders = db.orders.findByUserId(req.userId!)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(orders)
  } catch (error) {
    console.error('Get my orders error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات' })
  }
})

router.put('/:id/status', authenticate, isAdmin, (req: AuthRequest, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'preparing', 'shipped', 'completed']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة غير صحيحة' })
    }

    const orders = db.orders.getAll()
    const orderIndex = orders.findIndex(o => o.id === req.params.id)

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'الطلب غير موجود' })
    }

    orders[orderIndex].status = status as any
    db.orders.save(orders)

    res.json(orders[orderIndex])
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الطلب' })
  }
})

export default router

