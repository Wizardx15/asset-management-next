'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoanActions({ loan }: { loan: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Setujui peminjaman ini?')) return
    
    setIsLoading(true)
    try {
      // Update status loan
      const { error: loanError } = await supabase
        .from('asset_loans')
        .update({ status: 'APPROVED' })
        .eq('id', loan.id)

      if (loanError) throw loanError

      // Update status asset
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'DIPINJAM' })
        .eq('id', loan.asset_id)

      if (assetError) throw assetError

      toast.success('Peminjaman disetujui')
      router.refresh()
    } catch (error) {
      toast.error('Gagal menyetujui')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Tolak peminjaman ini?')) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('asset_loans')
        .update({ status: 'DITOLAK' })
        .eq('id', loan.id)

      if (error) throw error

      toast.success('Peminjaman ditolak')
      router.refresh()
    } catch (error) {
      toast.error('Gagal menolak')
    } finally {
      setIsLoading(false)
    }
  }

  if (loan.status !== 'PENDING') return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="p-1 text-green-600 hover:bg-green-50 rounded"
        title="Setujui"
      >
        <CheckCircle className="w-4 h-4" />
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
        title="Tolak"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  )
}