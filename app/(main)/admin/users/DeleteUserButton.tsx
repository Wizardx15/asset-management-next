'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DeleteUserButtonProps {
  userId: string
  userName: string
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus user "${userName}"?`)) {
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId)

        if (error) throw error

        toast.success('User berhasil dihapus')
        router.refresh()
      } catch (error) {
        toast.error('Gagal menghapus user')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
      title="Hapus User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}