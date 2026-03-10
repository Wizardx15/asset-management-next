'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DeleteButtonProps {
  assetId: string
  assetName: string
}

export default function DeleteButton({ assetId, assetName }: DeleteButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus asset "${assetName}"?`)) {
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', assetId)

        if (error) throw error

        toast.success('Asset berhasil dihapus')
        router.refresh()
      } catch (error) {
        toast.error('Gagal menghapus asset')
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
      title="Hapus Asset"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}