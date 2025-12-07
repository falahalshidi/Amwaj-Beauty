export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    name: string
                    email: string
                    is_admin: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    email: string
                    is_admin?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    is_admin?: boolean
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    description: string
                    price: number
                    image: string | null
                    quantity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    price: number
                    image?: string | null
                    quantity: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    price?: number
                    image?: string | null
                    quantity?: number
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
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
                Insert: {
                    id?: string
                    user_id: string
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
                    status?: 'pending' | 'preparing' | 'shipped' | 'completed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    product_name?: string
                    quantity?: number
                    total_price?: number
                    shipping_info?: {
                        name: string
                        phone: string
                        address: string
                        city: string
                    }
                    status?: 'pending' | 'preparing' | 'shipped' | 'completed'
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
