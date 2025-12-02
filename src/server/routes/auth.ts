import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/db.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'amwaj-beauty-secret-key-change-in-production'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
    }

    const existingUser = db.users.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const users = db.users.getAll()
    
    // First user becomes admin
    const isAdmin = users.length === 0

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      isAdmin,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    db.users.save(users)

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' })
    }

    const user = db.users.findByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' })
  }
})

router.get('/me', authenticate, (req: AuthRequest, res) => {
  const user = db.users.findById(req.userId!)
  if (!user) {
    return res.status(404).json({ message: 'المستخدم غير موجود' })
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  })
})

export default router

