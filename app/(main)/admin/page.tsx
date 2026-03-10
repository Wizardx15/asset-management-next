import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Users, Package, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Cek role admin
  if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()
  
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })

  const { count: totalLoans } = await supabase
    .from('asset_loans')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-2">Admin Panel</h1>
      <p className="text-black mb-6">Selamat datang, {session.user?.name} ({session.user?.role})</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-black">Total Users</h2>
          </div>
          <p className="text-3xl font-bold text-black">{totalUsers || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-black">Total Assets</h2>
          </div>
          <p className="text-3xl font-bold text-black">{totalAssets || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-black">Total Loans</h2>
          </div>
          <p className="text-3xl font-bold text-black">{totalLoans || 0}</p>
        </div>
      </div>
    </div>
  )
}