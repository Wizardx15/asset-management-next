import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { 
  Package, 
  ClipboardList, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const supabase = await createServerSupabaseClient()

  // Ambil statistik
  const { count: totalAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })

  const { count: availableAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'TERSEDIA')

  const { count: borrowedAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DIPINJAM')

  const { count: damagedAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'RUSAK')

  // Statistik peminjaman
  const { count: totalLoans } = await supabase
    .from('asset_loans')
    .select('*', { count: 'exact', head: true })

  const { count: pendingLoans } = await supabase
    .from('asset_loans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  const { count: approvedLoans } = await supabase
    .from('asset_loans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'APPROVED')

  const { count: returnedLoans } = await supabase
    .from('asset_loans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DIKEMBALIKAN')

  // Statistik user (hanya untuk admin)
  let totalUsers = 0
  let adminCount = 0
  let userCount = 0
  
  const isAdmin = session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN'
  
  if (isAdmin) {
    const { count: users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    totalUsers = users || 0

    const { count: admins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'ADMIN')
    adminCount = admins || 0

    const { count: regularUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'USER')
    userCount = regularUsers || 0
  }

  // Ambil 5 peminjaman terbaru
  const { data: recentLoans } = await supabase
    .from('asset_loans')
    .select(`
      *,
      assets:asset_id (
        nama,
        kode
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Ambil 5 asset terbaru
  const { data: recentAssets } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Hitung persentase
const availablePercent = totalAssets ? Math.round(((availableAssets || 0) / totalAssets) * 100) : 0
const borrowedPercent = totalAssets ? Math.round(((borrowedAssets || 0) / totalAssets) * 100) : 0
const damagedPercent = totalAssets ? Math.round(((damagedAssets || 0) / totalAssets) * 100) : 0
  return (
    <div className="space-y-6">
      {/* Header with Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-black mt-1">
            Selamat datang, <span className="font-semibold text-blue-600">{session.user?.name}</span>!
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {session.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-black">{session.user?.name}</p>
            <p className="text-xs text-black">
              <span className={`
                px-2 py-0.5 rounded-full
                ${session.user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : ''}
                ${session.user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : ''}
                ${session.user?.role === 'USER' ? 'bg-gray-100 text-gray-700' : ''}
              `}>
                {session.user?.role}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards - Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Asset */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-black bg-blue-50 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-sm text-black mb-1">Total Asset</p>
          <p className="text-2xl font-bold text-black">{totalAssets || 0}</p>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <ArrowUp className="w-3 h-3 mr-1" />
            <span>{availablePercent}% tersedia</span>
          </div>
        </div>

        {/* Tersedia */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-black bg-green-50 px-2 py-1 rounded-full">
              {availablePercent}%
            </span>
          </div>
          <p className="text-sm text-black mb-1">Tersedia</p>
          <p className="text-2xl font-bold text-green-600">{availableAssets || 0}</p>
          <p className="mt-2 text-xs text-black">Siap dipinjam</p>
        </div>

        {/* Dipinjam */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs text-black bg-yellow-50 px-2 py-1 rounded-full">
              {borrowedPercent}%
            </span>
          </div>
          <p className="text-sm text-black mb-1">Dipinjam</p>
          <p className="text-2xl font-bold text-yellow-600">{borrowedAssets || 0}</p>
          <p className="mt-2 text-xs text-black">Sedang digunakan</p>
        </div>

        {/* Rusak */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-black bg-red-50 px-2 py-1 rounded-full">
              {damagedPercent}%
            </span>
          </div>
          <p className="text-sm text-black mb-1">Rusak</p>
          <p className="text-2xl font-bold text-red-600">{damagedAssets || 0}</p>
          <p className="mt-2 text-xs text-black">Perlu perbaikan</p>
        </div>
      </div>

      {/* Stat Cards - Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peminjaman */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-black">Total Peminjaman</p>
          </div>
          <p className="text-2xl font-bold text-black">{totalLoans || 0}</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-black">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingLoans || 0}</p>
        </div>

        {/* Disetujui */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-black">Disetujui</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{approvedLoans || 0}</p>
        </div>

        {/* Dikembalikan */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-black">Dikembalikan</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{returnedLoans || 0}</p>
        </div>
      </div>

      {/* User Stats - Hanya untuk admin */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Statistik Pengguna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-black">Total Users</p>
              <p className="text-2xl font-bold text-black">{totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-black">Admin</p>
              <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
            </div>
            <div>
              <p className="text-sm text-black">Regular User</p>
              <p className="text-2xl font-bold text-blue-600">{userCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Terbaru */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Asset Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAssets && recentAssets.length > 0 ? (
              recentAssets.map((asset) => (
                <div key={asset.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        href={`/assets/${asset.id}`}
                        className="font-medium text-black hover:text-blue-600"
                      >
                        {asset.nama}
                      </Link>
                      <p className="text-xs text-black mt-1">{asset.kode} • {asset.kategori}</p>
                    </div>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${asset.status === 'TERSEDIA' ? 'bg-green-100 text-green-700' : ''}
                      ${asset.status === 'DIPINJAM' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${asset.status === 'RUSAK' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {asset.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-black">
                Belum ada asset
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <Link href="/assets" className="text-sm text-blue-600 hover:underline">
              Lihat Semua Asset →
            </Link>
          </div>
        </div>

        {/* Peminjaman Terbaru */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-black flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-600" />
              Peminjaman Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentLoans && recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <div key={loan.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-black">{loan.peminjam_nama}</p>
                      <p className="text-xs text-black mt-1">
                        {loan.assets?.nama} • {new Date(loan.tgl_pinjam).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' : ''}
                      ${loan.status === 'DIPINJAM' ? 'bg-blue-100 text-blue-700' : ''}
                      ${loan.status === 'DIKEMBALIKAN' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {loan.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-black">
                Belum ada peminjaman
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <Link href="/loans" className="text-sm text-blue-600 hover:underline">
              Lihat Semua Peminjaman →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}