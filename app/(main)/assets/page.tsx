import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import DeleteButton from './DeleteButton'

export default async function AssetsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: assets } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  // Cek role user
  const isAdmin = session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN'

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Assets</h1>
          <p className="text-black mt-1">Kelola semua aset perusahaan</p>
        </div>
        <Link 
          href="/assets/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Asset
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Lokasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets && assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-black font-medium">{asset.kode}</td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/assets/${asset.id}`}
                        className="text-black hover:text-blue-600 hover:underline"
                      >
                        {asset.nama}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-black">{asset.kategori}</td>
                    <td className="px-4 py-3 text-black">{asset.lokasi}</td>
                    <td className="px-4 py-3">
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${asset.status === 'TERSEDIA' ? 'bg-green-100 text-green-700' : ''}
                        ${asset.status === 'DIPINJAM' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${asset.status === 'RUSAK' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Tombol Detail - SEMUA BISA */}
                        <Link 
                          href={`/assets/${asset.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* Tombol Edit & Delete - HANYA UNTUK ADMIN */}
                        {isAdmin && (
                          <>
                            <Link 
                              href={`/assets/edit/${asset.id}`}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <DeleteButton assetId={asset.id} assetName={asset.nama} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-black">
                    Belum ada data asset
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}