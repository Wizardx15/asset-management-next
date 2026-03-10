'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as React from 'react'  // IMPORTANT: Tambah ini untuk unwrap params
import { supabase } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  User,
  Calendar,
  Package,
  Mail,
  Building2,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Printer
} from 'lucide-react'

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
    APPROVED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Disetujui' },
    REJECTED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Ditolak' },
    RETURNED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Dikembalikan' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format datetime
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// FIXED: params is now a Promise, we unwrap it with React.use()
export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params menggunakan React.use()
  const { id } = React.use(params)
  
  const router = useRouter()
  const [loan, setLoan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLoanDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('asset_loans')
          .select(`
            *,
            assets (
              id,
              kode,
              nama,
              kategori,
              lokasi,
              deskripsi
            )
          `)
          .eq('id', id)  // Using the unwrapped id
          .single()

        if (error) throw error
        if (!data) {
          toast.error('Data peminjaman tidak ditemukan')
          router.push('/loans')
          return
        }

        setLoan(data)
      } catch (error) {
        console.error('Error fetching loan:', error)
        toast.error('Gagal memuat data peminjaman')
        router.push('/loans')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoanDetail()
  }, [id, router])  // Changed from params.id to id

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!loan) return null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/loans"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Detail Peminjaman</h1>
          <StatusBadge status={loan.status} />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/loans/edit/${loan.id}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Peminjam */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informasi Peminjam
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">NIK</label>
                  <p className="text-gray-800 font-medium">{loan.employee_nik}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nama Lengkap</label>
                  <p className="text-gray-800 font-medium">{loan.peminjam_nama}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Email</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${loan.peminjam_email}`} className="hover:text-blue-600">
                    {loan.peminjam_email}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Departemen</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{loan.peminjam_department}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Jabatan</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{loan.peminjam_position}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Asset */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Informasi Asset
            </h2>
            {loan.assets ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Kode Asset</label>
                    <p className="text-gray-800 font-medium">{loan.assets.kode}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Nama Asset</label>
                    <p className="text-gray-800 font-medium">{loan.assets.nama}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Kategori</label>
                    <p className="text-gray-800">{loan.assets.kategori}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Lokasi</label>
                    <p className="text-gray-800">{loan.assets.lokasi || '-'}</p>
                  </div>
                </div>

                {loan.assets.deskripsi && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Deskripsi Asset</label>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                      {loan.assets.deskripsi}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Data asset tidak ditemukan</p>
            )}
          </div>

          {/* Keperluan & Catatan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detail Peminjaman
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Keperluan</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {loan.keperluan}
                </p>
              </div>

              {loan.catatan && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Catatan</label>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                    {loan.catatan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Status */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Diajukan</p>
                  <p className="text-xs text-gray-500">{formatDateTime(loan.created_at)}</p>
                </div>
              </div>

              {loan.status !== 'PENDING' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {loan.status === 'APPROVED' && 'Disetujui'}
                      {loan.status === 'REJECTED' && 'Ditolak'}
                      {loan.status === 'RETURNED' && 'Dikembalikan'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(loan.updated_at)}</p>
                  </div>
                </div>
              )}

              {loan.tgl_kembali && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Tanggal Kembali</p>
                    <p className="text-xs text-gray-500">{formatDate(loan.tgl_kembali)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Tanggal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Tanggal</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tanggal Pinjam</label>
                <p className="text-gray-800 font-medium">{formatDate(loan.tgl_pinjam)}</p>
              </div>
              {loan.tgl_kembali && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tanggal Kembali</label>
                  <p className="text-gray-800 font-medium">{formatDate(loan.tgl_kembali)}</p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <label className="text-xs text-gray-500 block mb-1">Terakhir Diupdate</label>
                <p className="text-sm text-gray-600">{formatDateTime(loan.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {loan.status === 'PENDING' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi</h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('asset_loans')
                        .update({ 
                          status: 'APPROVED',
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', loan.id)

                      if (error) throw error
                      toast.success('Peminjaman disetujui')
                      router.refresh()
                    } catch (error) {
                      toast.error('Gagal menyetujui peminjaman')
                    }
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Setujui Peminjaman</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('asset_loans')
                        .update({ 
                          status: 'REJECTED',
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', loan.id)

                      if (error) throw error
                      toast.success('Peminjaman ditolak')
                      router.refresh()
                    } catch (error) {
                      toast.error('Gagal menolak peminjaman')
                    }
                  }}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Peminjaman</span>
                </button>
              </div>
            </div>
          )}

          {loan.status === 'APPROVED' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi</h2>
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from('asset_loans')
                      .update({ 
                        status: 'RETURNED',
                        tgl_kembali: new Date().toISOString().split('T')[0],
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', loan.id)

                    if (error) throw error
                    toast.success('Asset telah dikembalikan')
                    router.refresh()
                  } catch (error) {
                    toast.error('Gagal memproses pengembalian')
                  }
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Proses Pengembalian</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}