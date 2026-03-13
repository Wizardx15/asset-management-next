'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { useSession } from 'next-auth/react'
import { logActivityClient } from '@/lib/activity-logger'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Filter,
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Package
} from 'lucide-react'

// Tipe data untuk peminjaman
interface Loan {
  id: string
  asset_id: string
  employee_nik: string
  peminjam_nama: string
  peminjam_email: string
  peminjam_department: string
  peminjam_position: string
  keperluan: string
  tgl_pinjam: string
  tgl_kembali: string | null
  catatan: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED'
  created_at: string
  updated_at: string
  assets?: {
    nama: string
    kode: string
    kategori: string
  }
}

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
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default function LoansPage() {
  const { data: session } = useSession()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  
  const itemsPerPage = 10

  // Fetch loans
  const fetchLoans = async () => {
    setIsLoading(true)
    try {
      // Query builder untuk data
      let query = supabase
        .from('asset_loans')
        .select(`
          *,
          assets (
            nama,
            kode,
            kategori
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by status
      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      // Search
      if (searchTerm) {
        query = query.or(`
          peminjam_nama.ilike.%${searchTerm}%,
          peminjam_email.ilike.%${searchTerm}%,
          employee_nik.ilike.%${searchTerm}%,
          keperluan.ilike.%${searchTerm}%
        `)
      }

      // HITUNG TOTAL DATA DULU (untuk pagination)
      const countQuery = supabase
        .from('asset_loans')
        .select('*', { count: 'exact', head: true })

      // Apply filter yang sama ke count query
      if (statusFilter !== 'ALL') {
        countQuery.eq('status', statusFilter)
      }
      
      if (searchTerm) {
        countQuery.or(`
          peminjam_nama.ilike.%${searchTerm}%,
          peminjam_email.ilike.%${searchTerm}%,
          employee_nik.ilike.%${searchTerm}%,
          keperluan.ilike.%${searchTerm}%
        `)
      }

      const { count, error: countError } = await countQuery

      if (countError) throw countError

      // PAGINATION - ambil data sesuai halaman
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      const { data, error } = await query.range(from, to)

      if (error) throw error

      setLoans(data || [])
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage))
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
      toast.error('Gagal memuat data peminjaman')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [statusFilter, currentPage, searchTerm])

  // Handle delete
  const handleDelete = async () => {
    if (!selectedLoan) return

    try {
      const { error } = await supabase
        .from('asset_loans')
        .delete()
        .eq('id', selectedLoan.id)

      if (error) throw error

      // Log activity
      await logActivityClient({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'DELETE_LOAN',
        entityType: 'loan',
        entityId: selectedLoan.id,
        details: { 
          loanId: selectedLoan.id,
          peminjam: selectedLoan.peminjam_nama
        }
      })

      toast.success('Peminjaman berhasil dihapus')
      fetchLoans()
      setShowDeleteModal(false)
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error deleting loan:', error)
      toast.error('Gagal menghapus peminjaman')
    }
  }

  // Handle approve
  const handleApprove = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from('asset_loans')
        .update({ 
          status: 'APPROVED',
          updated_at: new Date().toISOString()
        })
        .eq('id', loan.id)

      if (error) throw error

      // Log activity
      await logActivityClient({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'APPROVE_LOAN',
        entityType: 'loan',
        entityId: loan.id,
        details: { 
          loanId: loan.id,
          peminjam: loan.peminjam_nama
        }
      })

      toast.success('Peminjaman disetujui')
      fetchLoans()
    } catch (error) {
      console.error('Error approving loan:', error)
      toast.error('Gagal menyetujui peminjaman')
    }
  }

  // Handle reject
  const handleReject = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from('asset_loans')
        .update({ 
          status: 'REJECTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', loan.id)

      if (error) throw error

      // Log activity
      await logActivityClient({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'REJECT_LOAN',
        entityType: 'loan',
        entityId: loan.id,
        details: { 
          loanId: loan.id,
          peminjam: loan.peminjam_nama
        }
      })

      toast.success('Peminjaman ditolak')
      fetchLoans()
    } catch (error) {
      console.error('Error rejecting loan:', error)
      toast.error('Gagal menolak peminjaman')
    }
  }

  // Handle return
  const handleReturn = async (loan: Loan) => {
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

      // Log activity
      await logActivityClient({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'RETURN_LOAN',
        entityType: 'loan',
        entityId: loan.id,
        details: { 
          loanId: loan.id,
          peminjam: loan.peminjam_nama
        }
      })

      toast.success('Asset telah dikembalikan')
      fetchLoans()
    } catch (error) {
      console.error('Error returning asset:', error)
      toast.error('Gagal memproses pengembalian')
    }
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Data Peminjaman</h1>
        <Link
          href="/loans/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Peminjaman</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, email, keperluan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
              <option value="RETURNED">Dikembalikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peminjam</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keperluan</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Belum ada data peminjaman</p>
                    <Link
                      href="/loans/create"
                      className="inline-block mt-2 text-blue-600 hover:underline"
                    >
                      Ajukan peminjaman pertama
                    </Link>
                  </td>
                </tr>
              ) : (
                loans.map((loan, index) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-800">{loan.peminjam_nama}</div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div>NIK: {loan.employee_nik}</div>
                            <div>{loan.peminjam_department} - {loan.peminjam_position}</div>
                            <div className="text-gray-400">{loan.peminjam_email}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-800">{loan.assets?.nama || '-'}</div>
                        <div className="text-xs text-gray-500">
                          {loan.assets?.kode} • {loan.assets?.kategori}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(loan.tgl_pinjam)}</span>
                      </div>
                      {loan.tgl_kembali && (
                        <div className="text-xs text-gray-500 mt-1">
                          Kembali: {formatDate(loan.tgl_kembali)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {loan.keperluan}
                      </div>
                      {loan.catatan && (
                        <div className="text-xs text-gray-400 mt-1">
                          Catatan: {loan.catatan}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/loans/${loan.id}`}
                          className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(loan)}
                              className="p-1 hover:bg-green-100 rounded-lg text-green-600"
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(loan)}
                              className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {loan.status === 'APPROVED' && (
                          <button
                            onClick={() => handleReturn(loan)}
                            className="p-1 hover:bg-blue-100 rounded-lg text-blue-600"
                            title="Proses Pengembalian"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <Link
                          href={`/loans/edit/${loan.id}`}
                          className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => {
                            setSelectedLoan(loan)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Peminjaman</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus peminjaman dari <span className="font-medium">{selectedLoan.peminjam_nama}</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedLoan(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}