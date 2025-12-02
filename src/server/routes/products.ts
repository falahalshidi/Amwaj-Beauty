import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/db.js'
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.js'

const router = express.Router()

router.get('/', (req, res) => {
  try {
    const products = db.products.getAll()
    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات' })
  }
})

router.get('/:id', (req, res) => {
  try {
    const product = db.products.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' })
    }
    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتج' })
  }
})

router.post('/', authenticate, isAdmin, (req: AuthRequest, res) => {
  try {
    const { name, description, price, image, quantity } = req.body

    if (!name || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' })
    }

    const products = db.products.getAll()
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      image: image || '',
      quantity: parseInt(quantity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    products.push(newProduct)
    db.products.save(products)

    res.status(201).json(newProduct)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المنتج' })
  }
})

router.put('/:id', authenticate, isAdmin, (req: AuthRequest, res) => {
  try {
    const { name, description, price, image, quantity } = req.body
    const products = db.products.getAll()
    const productIndex = products.findIndex(p => p.id === req.params.id)

    if (productIndex === -1) {
      return res.status(404).json({ message: 'المنتج غير موجود' })
    }

    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      description: description || products[productIndex].description,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      image: image !== undefined ? image : products[productIndex].image,
      quantity: quantity !== undefined ? parseInt(quantity) : products[productIndex].quantity,
      updatedAt: new Date().toISOString()
    }

    db.products.save(products)
    res.json(products[productIndex])
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج' })
  }
})

router.delete('/:id', authenticate, isAdmin, (req: AuthRequest, res) => {
  try {
    const products = db.products.getAll()
    const filteredProducts = products.filter(p => p.id !== req.params.id)

    if (products.length === filteredProducts.length) {
      return res.status(404).json({ message: 'المنتج غير موجود' })
    }

    db.products.save(filteredProducts)
    res.json({ message: 'تم حذف المنتج بنجاح' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج' })
  }
})

export default router

