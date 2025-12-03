import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }
      if (session?.user) {
        fetchUserData(session.user)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error in getSession:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const fetchUserData = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, is_admin')
        .eq('id', authUser.id)
        .single() as any

      if (error) {
        // If error is "relation does not exist" or similar, it means table doesn't exist
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          console.error('Users table does not exist. Please run migrations.')
          throw new Error('جدول المستخدمين غير موجود. يرجى تطبيق المايجريشنز')
        }
        throw error
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          isAdmin: data.is_admin || false,
        })
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error)
      
      // If it's a network error, don't try to create user
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        console.error('Network error - cannot create user')
        setLoading(false)
        return
      }

      // If user doesn't exist in users table, create it
      if (authUser.email) {
        try {
          // Try to get name from user_metadata (multiple possible keys)
          const userName = authUser.user_metadata?.name || 
                          authUser.user_metadata?.full_name || 
                          authUser.user_metadata?.display_name ||
                          authUser.email.split('@')[0]

          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              name: userName,
              email: authUser.email,
              is_admin: false,
            } as any)
            .select()
            .single() as any

          if (!insertError && newUser) {
            setUser({
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              isAdmin: newUser.is_admin || false,
            })
          } else if (insertError) {
            console.error('Error creating user record:', insertError)
            // Fallback: use auth user metadata directly
            if (authUser.user_metadata?.name || authUser.email) {
              setUser({
                id: authUser.id,
                name: userName,
                email: authUser.email,
                isAdmin: false,
              })
            }
          }
        } catch (insertErr) {
          console.error('Error in user creation:', insertErr)
          // Final fallback: use auth user metadata
          if (authUser.user_metadata?.name || authUser.email) {
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
              email: authUser.email,
              isAdmin: false,
            })
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        // Translate common errors to Arabic
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          throw new Error('فشل الاتصال بالخادم. تحقق من اتصال الإنترنت ومتغيرات Supabase')
        } else {
          throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول')
        }
      }

      if (data.user) {
        await fetchUserData(data.user)
      }
    } catch (error: any) {
      console.error('Login catch error:', error)
      // If it's already a translated error, re-throw it
      if (error.message && (error.message.includes('البريد') || error.message.includes('فشل') || error.message.includes('تأكيد'))) {
        throw error
      }
      // Otherwise, throw a generic error
      throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Store name in user_metadata
            full_name: name, // Also store as full_name for compatibility
          },
          emailRedirectTo: window.location.origin, // For email confirmation
        },
      })

      if (error) {
        console.error('Register error:', error)
        throw new Error(error.message || 'حدث خطأ أثناء إنشاء الحساب')
      }

      // User record will be created automatically by database trigger
      // But we'll try to fetch it, and if it doesn't exist, create it manually as fallback
      if (data.user) {
        // Wait a bit for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to fetch user data (trigger should have created it)
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('id, name, email, is_admin')
          .eq('id', data.user.id)
          .single() as any

        // If user doesn't exist (trigger didn't fire), create it manually
        if (fetchError || !userData) {
          console.log('Trigger did not create user, creating manually...')
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: name, // Use the name from registration form
              email: data.user.email || email,
              is_admin: false,
            } as any)
            .select()
            .single() as any

          if (insertError) {
            console.error('Error creating user record:', insertError)
            // If RLS blocks, try to set user data from auth user metadata
            if (data.user.user_metadata?.name) {
              setUser({
                id: data.user.id,
                name: data.user.user_metadata.name,
                email: data.user.email || email,
                isAdmin: false,
              })
              setLoading(false)
              return
            }
          } else if (newUser) {
            setUser({
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              isAdmin: newUser.is_admin || false,
            })
            setLoading(false)
            return
          }
        } else {
          // User exists, use it
          setUser({
            id: userData.id,
            name: userData.name || name, // Use name from DB or fallback to form name
            email: userData.email,
            isAdmin: userData.is_admin || false,
          })
          setLoading(false)
          return
        }

        // Final fallback: use auth user data
        await fetchUserData(data.user)
      } else {
        // No user returned - might need email confirmation
        throw new Error('يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب')
      }
    } catch (error: any) {
      console.error('Register catch error:', error)
      throw error
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

