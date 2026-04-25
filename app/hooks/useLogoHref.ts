'use client'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useLogoHref(): string {
  const [href, setHref] = useState('/')

  useEffect(() => {
    const sb = getSupabaseClient()
    sb.auth.getUser().then(async ({ data }: { data: { user: User | null } }) => {
      const user = data.user
      if (!user) return
      const { data: vp } = await sb
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('application_status', 'approved')
        .single()
      setHref(vp ? '/vendor/dashboard' : '/dashboard')
    })
  }, [])

  return href
}
