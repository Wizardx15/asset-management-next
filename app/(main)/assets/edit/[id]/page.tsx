import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import EditAssetForm from './EditAssetForm'

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: asset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (!asset) {
    redirect('/assets')
  }

  return <EditAssetForm asset={asset} />
}