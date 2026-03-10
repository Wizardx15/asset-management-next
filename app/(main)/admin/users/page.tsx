import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Edit, Trash2, Shield, UserCog, Key } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'
import ResetPasswordButton from './ResetPasswordButton'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Hanya SUPER_ADMIN yang bisa akses
  if (session.user?.role !== 'SUPER_ADMIN') {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Manage Users</h1>
          <p className="text-black mt-1">Kelola semua pengguna sistem</p>
        </div>
        <Link 
          href="/admin/users/create"
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Jabatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Bergabung</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-black font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-black">{user.email}</td>
                    <td className="px-4 py-3 text-black">{user.jabatan || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : ''}
                        ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : ''}
                        ${user.role === 'USER' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-black">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Tombol Reset Password - UNTUK SEMUA USER (termasuk diri sendiri) */}
                        <ResetPasswordButton 
                          userId={user.id} 
                          userName={user.name} 
                          userEmail={user.email}
                        />
                        
                        {/* Tombol Edit */}
                        <Link 
                          href={`/admin/users/edit/${user.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        {/* Tombol Hapus (kecuali diri sendiri) */}
                        {user.email !== session.user?.email && (
                          <DeleteUserButton userId={user.id} userName={user.name} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-black">
                    Belum ada data user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}