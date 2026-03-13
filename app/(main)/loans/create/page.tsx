'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { useSession } from 'next-auth/react'
import { getEmployees, type Employee } from '@/lib/persona-hris'
import { logActivityClient } from '@/lib/activity-logger-client'
import toast from 'react-hot-toast'
import { ArrowLeft, Search, User, Loader2 } from 'lucide-react'

export default function CreateLoanPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [assets, setAssets] = useState<any[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    asset_id: '',
    employee_nik: '',
    peminjam_nama: '',
    peminjam_email: '',
    peminjam_department: '',
    peminjam_position: '',
    keperluan: '',
    tgl_pinjam: '',
    catatan: ''
  })

  // Load assets
  useEffect(() => {
    const fetchAssets = async () => {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('status', 'TERSEDIA')
        .order('nama')
      
      if (data) setAssets(data)
    }
    fetchAssets()
  }, [])

  // Load employees from Persona HRIS via proxy
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true)
      try {
        const data = await getEmployees()
        setEmployees(data)
        console.log('Employees loaded:', data)
      } catch (error) {
        console.error('Gagal fetch employees:', error)
        toast.error('Gagal memuat data karyawan')
      } finally {
        setIsLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [])

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle employee selection
  const selectEmployee = (employee: Employee) => {
    setFormData({
      ...formData,
      employee_nik: employee.nik,
      peminjam_nama: employee.full_name,
      peminjam_email: employee.email,
      peminjam_department: employee.department,
      peminjam_position: employee.position
    })
    setSearchTerm(employee.full_name)
    setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validasi employee_nik harus diisi
      if (!formData.employee_nik) {
        toast.error('Silakan pilih karyawan dari daftar')
        setIsLoading(false)
        return
      }

      const { error, data } = await supabase
        .from('asset_loans')
        .insert([{
          asset_id: formData.asset_id,
          employee_nik: formData.employee_nik,
          peminjam_nama: formData.peminjam_nama,
          peminjam_email: formData.peminjam_email,
          peminjam_department: formData.peminjam_department,
          peminjam_position: formData.peminjam_position,
          keperluan: formData.keperluan,
          tgl_pinjam: formData.tgl_pinjam,
          catatan: formData.catatan,
          status: 'PENDING'
        }])
        .select()

      if (error) {
        toast.error('Gagal mengajukan peminjaman')
        console.error(error)
      } else {
        // Log activity - FIXED: handle null values with ?? undefined
        await logActivityClient({
          userId: session?.user?.id ?? undefined,
          userEmail: session?.user?.email ?? undefined,
          userName: session?.user?.name ?? undefined,
          action: 'CREATE_LOAN',
          entityType: 'loan',
          entityId: data?.[0]?.id,
          details: { 
            assetId: formData.asset_id,
            employeeNik: formData.employee_nik,
            employeeName: formData.peminjam_nama
          }
        })

        toast.success('Peminjaman berhasil diajukan')
        router.push('/loans')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/loans"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">Ajukan Peminjaman</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Asset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pilih Asset <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">-- Pilih Asset --</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.nama} - {asset.kode}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Karyawan dengan Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cari Karyawan <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-400">(dari Persona HRIS)</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                  // Reset selected employee jika search berubah
                  if (formData.employee_nik) {
                    setFormData({
                      ...formData,
                      employee_nik: '',
                      peminjam_nama: '',
                      peminjam_email: '',
                      peminjam_department: '',
                      peminjam_position: ''
                    })
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Cari berdasarkan NIK, nama, atau email..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {isLoadingEmployees && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Dropdown Hasil Pencarian */}
            {showDropdown && searchTerm && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {isLoadingEmployees ? (
                  <div className="px-4 py-3 text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.nik}
                      type="button"
                      onClick={() => selectEmployee(emp)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800">{emp.full_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {emp.nik} • {emp.department} • {emp.position}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{emp.email}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500">
                    Karyawan dengan NIK/nama "{searchTerm}" tidak ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Karyawan Terpilih (Read-only) */}
          {formData.employee_nik && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-2">
                Karyawan Terpilih
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-medium">NIK:</span> {formData.employee_nik}</div>
                <div><span className="font-medium">Nama:</span> {formData.peminjam_nama}</div>
                <div><span className="font-medium">Email:</span> {formData.peminjam_email}</div>
                <div><span className="font-medium">Departemen:</span> {formData.peminjam_department}</div>
                <div><span className="font-medium">Jabatan:</span> {formData.peminjam_position}</div>
              </div>
            </div>
          )}

          {/* Keperluan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keperluan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.keperluan}
              onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              rows={3}
              placeholder="Deskripsi keperluan peminjaman..."
            />
          </div>

          {/* Tanggal Pinjam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal Pinjam <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.tgl_pinjam}
              onChange={(e) => setFormData({ ...formData, tgl_pinjam: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !formData.employee_nik}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengajukan...</span>
                </>
              ) : (
                <span>Ajukan Peminjaman</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}