'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { 
  Package, 
  ClipboardList, 
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// Warna untuk chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Card Statistik
const StatCard = ({ title, value, icon: Icon, bgColor, textColor }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
    </div>
  </div>
)

// Tabel Aktivitas Terbaru
const RecentActivities = ({ activities }: { activities: any[] }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{activity.peminjam_nama}</span> meminjam{' '}
                <span className="font-medium">{activity.asset_name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
              activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {activity.status}
            </span>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">Belum ada aktivitas</p>
      )}
    </div>
  </div>
)

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    borrowedAssets: 0,
    damagedAssets: 0,
    totalUsers: 0,
    activeLoans: 0,
    pendingApprovals: 0
  })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [topAssets, setTopAssets] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Ambil semua data dalam 1 kali fetch (parallel)
      const [
        assetsResult,
        usersResult,
        loansResult,
        pendingResult,
        monthlyResult,
        topAssetsResult,
        activitiesResult
      ] = await Promise.all([
        // Total asset & status
        supabase.from('assets').select('status'),
        // Total users
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // Total peminjaman aktif
        supabase.from('asset_loans').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
        // Pending approvals
        supabase.from('asset_loans').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        // Data bulanan untuk chart
        supabase.from('asset_loans').select('created_at, status').gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString()),
        // Top 5 asset paling sering dipinjam
        supabase.from('asset_loans').select('asset_id, assets(nama)').then(async (loans) => {
          if (loans.error) throw loans.error
          const counts: any = {}
          loans.data?.forEach((loan: any) => {
            const assetId = loan.asset_id
            counts[assetId] = counts[assetId] || { count: 0, name: loan.assets?.nama || 'Unknown' }
            counts[assetId].count++
          })
          return Object.values(counts).sort((a: any, b: any) => b.count - a.count).slice(0, 5)
        }),
        // 10 aktivitas terbaru
        supabase.from('asset_loans')
          .select(`
            peminjam_nama,
            status,
            created_at,
            assets(nama)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      // Hitung statistik asset
      const assets = assetsResult.data || []
      const available = assets.filter(a => a.status === 'TERSEDIA').length
      const borrowed = assets.filter(a => a.status === 'DIPINJAM').length
      const damaged = assets.filter(a => a.status === 'RUSAK').length

      setStats({
        totalAssets: assets.length,
        availableAssets: available,
        borrowedAssets: borrowed,
        damagedAssets: damaged,
        totalUsers: usersResult.count || 0,
        activeLoans: loansResult.count || 0,
        pendingApprovals: pendingResult.count || 0
      })

      // Proses data bulanan untuk chart
      const monthly: any = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      
      monthlyResult.data?.forEach((loan: any) => {
        const date = new Date(loan.created_at)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        if (!monthly[monthKey]) {
          monthly[monthKey] = { month: monthKey, total: 0, approved: 0, pending: 0 }
        }
        monthly[monthKey].total++
        if (loan.status === 'APPROVED') monthly[monthKey].approved++
        if (loan.status === 'PENDING') monthly[monthKey].pending++
      })

      setMonthlyData(Object.values(monthly).slice(-6))
      setTopAssets(await topAssetsResult)
      setRecentActivities(activitiesResult.data?.map((a: any) => ({
        ...a,
        asset_name: a.assets?.nama
      })) || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di Asset Management System</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Asset"
          value={stats.totalAssets}
          icon={Package}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          title="Tersedia"
          value={stats.availableAssets}
          icon={CheckCircle}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          title="Dipinjam"
          value={stats.borrowedAssets}
          icon={ClipboardList}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatCard
          title="Rusak"
          value={stats.damagedAssets}
          icon={XCircle}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Statistik Baris 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
        <StatCard
          title="Peminjaman Aktif"
          value={stats.activeLoans}
          icon={TrendingUp}
          bgColor="bg-indigo-100"
          textColor="text-indigo-600"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApprovals}
          icon={Clock}
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart Peminjaman per Bulan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trend Peminjaman 6 Bulan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" fill="#0088FE" name="Disetujui" />
              <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Status Asset - FIXED */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Asset</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Tersedia', value: stats.availableAssets },
                  { name: 'Dipinjam', value: stats.borrowedAssets },
                  { name: 'Rusak', value: stats.damagedAssets }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                // FIXED: Added default value for percent
                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Tersedia', value: stats.availableAssets },
                  { name: 'Dipinjam', value: stats.borrowedAssets },
                  { name: 'Rusak', value: stats.damagedAssets }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Assets & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Asset */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Asset Paling Sering Dipinjam</h3>
          {topAssets.length > 0 ? (
            <div className="space-y-3">
              {topAssets.map((asset: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{asset.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(asset.count / topAssets[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{asset.count}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada data peminjaman</p>
          )}
        </div>

        {/* Recent Activities */}
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  )
}