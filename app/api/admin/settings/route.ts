// app/api/admin/settings/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const app_name = formData.get('app_name')
    const logo_url = formData.get('logo_url')
    const company_name = formData.get('company_name')
    const support_email = formData.get('support_email')

    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        app_name,
        logo_url,
        company_name,
        support_email,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.redirect(new URL('/admin/settings', request.url))
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}