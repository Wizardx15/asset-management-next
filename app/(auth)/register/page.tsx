'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    jabatan: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok')
      setIsLoading(false)
      return
    }

    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      const { error } = await supabase
        .from('users')
        .insert([{
          name: formData.name,
          email: formData.email,
          password: hashedPassword,
          jabatan: formData.jabatan,
          role: 'USER'
        }])

      if (error) {
        if (error.code === '23505') {
          toast.error('Email sudah terdaftar')
        } else {
          toast.error('Gagal mendaftar')
        }
      } else {
        toast.success('Registrasi berhasil! Silakan login')
        router.push('/login')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-black mb-2">Daftar</h1>
        <p className="text-sm text-center text-black mb-6">Buat akun baru</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Jabatan (opsional)"
            value={formData.jabatan}
            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
          />
          <input
            type="password"
            placeholder="Konfirmasi Password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Loading...' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-center text-black mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}