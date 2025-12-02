import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DB_DIR = join(process.cwd(), 'data')
const USERS_FILE = join(DB_DIR, 'users.json')
const PRODUCTS_FILE = join(DB_DIR, 'products.json')
const ORDERS_FILE = join(DB_DIR, 'orders.json')

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!existsSync(USERS_FILE)) {
  writeFileSync(USERS_FILE, JSON.stringify([], null, 2))
}

if (!existsSync(PRODUCTS_FILE)) {
  writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2))
}

if (!existsSync(ORDERS_FILE)) {
  writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2))
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
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

function readJsonFile<T>(filePath: string): T[] {
  try {
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeJsonFile<T>(filePath: string, data: T[]): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export const db = {
  users: {
    getAll: (): User[] => readJsonFile<User>(USERS_FILE),
    save: (users: User[]): void => writeJsonFile<User>(USERS_FILE, users),
    findById: (id: string): User | undefined => {
      const users = readJsonFile<User>(USERS_FILE)
      return users.find(u => u.id === id)
    },
    findByEmail: (email: string): User | undefined => {
      const users = readJsonFile<User>(USERS_FILE)
      return users.find(u => u.email === email)
    }
  },
  products: {
    getAll: (): Product[] => readJsonFile<Product>(PRODUCTS_FILE),
    save: (products: Product[]): void => writeJsonFile<Product>(PRODUCTS_FILE, products),
    findById: (id: string): Product | undefined => {
      const products = readJsonFile<Product>(PRODUCTS_FILE)
      return products.find(p => p.id === id)
    }
  },
  orders: {
    getAll: (): Order[] => readJsonFile<Order>(ORDERS_FILE),
    save: (orders: Order[]): void => writeJsonFile<Order>(ORDERS_FILE, orders),
    findById: (id: string): Order | undefined => {
      const orders = readJsonFile<Order>(ORDERS_FILE)
      return orders.find(o => o.id === id)
    },
    findByUserId: (userId: string): Order[] => {
      const orders = readJsonFile<Order>(ORDERS_FILE)
      return orders.filter(o => o.userId === userId)
    }
  }
}

