import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'amwaj-beauty-secret-key-change-in-production'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
    name: string
    isAdmin: boolean
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.userId = decoded.userId
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'رمز غير صالح' })
  }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'غير مصرح - تحتاج صلاحيات المدير' })
  }
  next()
}

