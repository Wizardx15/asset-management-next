'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'
import { Key } from 'lucide-react'
import toast from 'react-hot-toast'

interface ResetPasswordButtonProps {
  userId: string
  userName: string
  userEmail: string
}

export default function ResetPasswordButton({ userId, userName, userEmail }: ResetPasswordButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setIsLoading(true)
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Password untuk ${userName} telah direset`)
      setShowModal(false)
      setNewPassword('')
      setConfirmPassword('')
      router.refresh()
    } catch (error) {
      toast.error('Gagal mereset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Tombol Reset Password */}
      <button
        onClick={() => setShowModal(true)}
        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
        title="Reset Password"
      >
        <Key className="w-4 h-4" />
      </button>

      {/* Modal Reset Password */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-black mb-2">Reset Password</h3>
            <p className="text-sm text-black mb-4">
              User: <span className="font-medium">{userName}</span> ({userEmail})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="Minimal 6 karakter"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="Ketik ulang password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? 'Merese t...' : 'Reset Password'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="flex-1 bg-gray-100 text-black py-2 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}