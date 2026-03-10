'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function CreateUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    jabatan: '',
    role: 'USER'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      const { error } = await supabase
        .from('users')
        .insert([{
          ...formData,
          password: hashedPassword
        }])

      if (error) {
        if (error.code === '23505') {
          toast.error('Email sudah terdaftar')
        } else {
          toast.error('Gagal menambah user')
        }
      } else {
        toast.success('User berhasil ditambahkan')
        router.push('/admin/users')
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/users"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className="text-2xl font-bold text-black">Tambah User Baru</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-black"
              placeholder="john@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Jabatan</label>
            <input
              type="text"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-black"
              placeholder="Manager / Staff / dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-black"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link
              href="/admin/users"
              className="bg-gray-100 text-black px-6 py-2 rounded-lg hover:bg-gray-200"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}