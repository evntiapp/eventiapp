'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useLogoHref(): string {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  if (!isLoggedIn) return '/'
  if (pathname?.startsWith('/vendor')) return '/vendor/dashboard'
  return '/dashboard'
}
