import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Hanya SUPER_ADMIN yang bisa akses settings
  if (session.user?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()
  
  // Ambil data settings (contoh)
  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')
    .single()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Pengaturan Aplikasi</h1>
        <p className="text-black mt-1">Kelola konfigurasi global aplikasi</p>
      </div>

      {/* Form Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form action="/api/admin/settings" method="POST" className="space-y-4">
          {/* Nama Aplikasi */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Nama Aplikasi
            </label>
            <input
              type="text"
              name="app_name"
              defaultValue={settings?.app_name || 'Asset Management'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Logo URL
            </label>
            <input
              type="text"
              name="logo_url"
              defaultValue={settings?.logo_url || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          {/* Company Info */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Nama Perusahaan
            </label>
            <input
              type="text"
              name="company_name"
              defaultValue={settings?.company_name || 'PT. Contoh Perusahaan'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          {/* Email Support */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email Support
            </label>
            <input
              type="email"
              name="support_email"
              defaultValue={settings?.support_email || 'support@example.com'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}