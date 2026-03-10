import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import EditUserForm from './EditUserForm'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Hanya SUPER_ADMIN yang bisa akses
  if (session.user?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!user) {
    redirect('/admin/users')
  }

  return <EditUserForm user={user} />
}