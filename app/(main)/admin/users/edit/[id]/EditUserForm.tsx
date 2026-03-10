'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Key } from 'lucide-react'

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    jabatan: user.jabatan || '',
    role: user.role
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updateData: any = { ...formData }

      // Kalau ada password baru, validasi dulu
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('Password tidak cocok')
          setIsLoading(false)
          return
        }
        if (newPassword.length < 6) {
          toast.error('Password minimal 6 karakter')
          setIsLoading(false)
          return
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        updateData.password = hashedPassword
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('Email sudah digunakan')
        } else {
          toast.error('Gagal mengupdate user')
        }
      } else {
        toast.success('User berhasil diupdate')
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
        <h1 className="text-2xl font-bold text-black">Edit User</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@email.com"
            />
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Jabatan
            </label>
            <input
              type="text"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Manager / Staff / dll"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Reset Password Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <Key className="w-4 h-4" />
              {showResetPassword ? 'Sembunyikan' : 'Reset Password'}
            </button>
          </div>

          {/* Form Reset Password (muncul jika diklik) */}
          {showResetPassword && (
            <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-sm font-semibold text-orange-700">Reset Password User</h3>
              
              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ketik ulang password"
                />
              </div>

              {/* Info kecil */}
              <p className="text-xs text-orange-600">
                * Password akan di-hash secara otomatis untuk keamanan
              </p>
            </div>
          )}

          {/* Tombol Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link
              href="/admin/users"
              className="bg-gray-100 text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}