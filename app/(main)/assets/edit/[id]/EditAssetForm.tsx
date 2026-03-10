'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditAssetForm({ asset }: { asset: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    kode: asset.kode,
    nama: asset.nama,
    kategori: asset.kategori,
    lokasi: asset.lokasi,
    status: asset.status,
    deskripsi: asset.deskripsi || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('assets')
        .update(formData)
        .eq('id', asset.id)

      if (error) {
        toast.error('Gagal mengupdate asset')
      } else {
        toast.success('Asset berhasil diupdate')
        router.push('/assets')
        router.refresh()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/assets" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit Asset</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Kode Asset"
            required
            value={formData.kode}
            onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Nama Asset"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Kategori"
            required
            value={formData.kategori}
            onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Lokasi"
            required
            value={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
          >
            <option value="TERSEDIA">Tersedia</option>
            <option value="DIPINJAM">Dipinjam</option>
            <option value="RUSAK">Rusak</option>
          </select>
          <textarea
            placeholder="Deskripsi"
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-black"
            rows={3}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  )
}