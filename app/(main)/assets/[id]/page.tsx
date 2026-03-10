import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft, Edit, Package, MapPin, Tag, Calendar } from 'lucide-react'

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: asset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (!asset) {
    redirect('/assets')
  }

  const { data: loans } = await supabase
    .from('asset_loans')
    .select('*')
    .eq('asset_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/assets"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className="text-2xl font-bold text-black">Detail Asset</h1>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Asset Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-black">{asset.nama}</h2>
              <span className={`
                px-3 py-1 text-sm rounded-full font-medium
                ${asset.status === 'TERSEDIA' ? 'bg-green-100 text-green-700' : ''}
                ${asset.status === 'DIPINJAM' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${asset.status === 'RUSAK' ? 'bg-red-100 text-red-700' : ''}
              `}>
                {asset.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kode Asset</p>
                  <p className="text-black font-medium">{asset.kode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <p className="text-black">{asset.kategori}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Lokasi</p>
                  <p className="text-black">{asset.lokasi}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ditambahkan Pada</p>
                  <p className="text-black">
                    {new Date(asset.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {asset.deskripsi && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Deskripsi</p>
                  <p className="text-black">{asset.deskripsi}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                href={`/assets/edit/${asset.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Asset
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-black mb-4">History Peminjaman</h3>
            {loans && loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map((loan) => (
                  <div key={loan.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-black">{loan.peminjam_nama}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(loan.tgl_pinjam).toLocaleDateString('id-ID')}
                    </p>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full inline-block mt-2
                      ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' : ''}
                      ${loan.status === 'DIPINJAM' ? 'bg-blue-100 text-blue-700' : ''}
                      ${loan.status === 'DIKEMBALIKAN' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {loan.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Belum ada history peminjaman
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}