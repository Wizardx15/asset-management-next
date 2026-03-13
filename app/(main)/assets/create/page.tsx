'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { useSession } from 'next-auth/react'
import { logActivityClient } from '@/lib/activity-logger'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function CreateAssetPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: '',
    lokasi: '',
    status: 'TERSEDIA',
    deskripsi: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error, data } = await supabase
        .from('assets')
        .insert([formData])
        .select()

      if (error) {
        toast.error('Gagal menambah asset')
        console.error(error)
      } else {
        // Log activity
        await logActivityClient({
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userName: session?.user?.name,
          action: 'CREATE_ASSET',
          entityType: 'asset',
          entityId: data?.[0]?.id,
          details: { assetData: formData }
        })

        toast.success('Asset berhasil ditambahkan')
        router.push('/assets')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold text-black">Tambah Asset</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Kode Asset</label>
            <input
              type="text"
              required
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="AST-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Nama Asset</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="Laptop Dell XPS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Kategori</label>
            <input
              type="text"
              required
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="Elektronik"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Lokasi</label>
            <input
              type="text"
              required
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              placeholder="Ruang IT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            >
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="RUSAK">Rusak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              rows={3}
              placeholder="Deskripsi asset..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}