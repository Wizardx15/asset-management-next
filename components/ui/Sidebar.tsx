'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  Boxes,
  Shield,
  Users
} from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Menu untuk semua user
  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { href: "/assets", label: "Assets", icon: Package, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { href: "/loans", label: "Peminjaman", icon: ClipboardList, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  ]

  // Menu khusus admin dan super admin
  const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: Shield, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { href: "/admin/users", label: "Manage Users", icon: Users, roles: ['SUPER_ADMIN'] },
  ]

  // Filter menu berdasarkan role user
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(session?.user?.role || '')
  )

  const filteredAdminMenu = adminItems.filter(item => 
    item.roles.includes(session?.user?.role || '')
  )
  
  if (!session) return null

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
      </button>
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'}
        bg-white border-r border-gray-200 shadow-sm
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <Boxes className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-xl text-black">Asset<span className="text-blue-600">MS</span></h1>
                <p className="text-xs text-black">Management System</p>
              </div>
            </div>
          ) : (
            <Boxes className="w-8 h-8 text-blue-600" />
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${!isOpen ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{session.user?.name}</p>
                <p className="text-xs text-black truncate">
                  <span className={`
                    px-2 py-0.5 rounded-full
                    ${session.user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : ''}
                    ${session.user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : ''}
                    ${session.user?.role === 'USER' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {session.user?.role}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Main Menu */}
        <nav className="p-3">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-black hover:bg-gray-100'
                  }
                  ${!isOpen && 'justify-center'}
                `}
              >
                <Icon className={`w-5 h-5 ${isOpen && 'mr-3'}`} />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Admin Menu - hanya untuk admin dan super admin */}
        {filteredAdminMenu.length > 0 && (
          <>
            {/* Divider */}
            <div className="px-3 py-2">
              {isOpen && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Admin
                </p>
              )}
              {filteredAdminMenu.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'text-black hover:bg-gray-100'
                      }
                      ${!isOpen && 'justify-center'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isOpen && 'mr-3'}`} />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-3 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className={`
              flex items-center w-full px-3 py-2.5 rounded-lg
              text-red-600 hover:bg-red-50 transition-colors
              ${!isOpen && 'justify-center'}
            `}
          >
            <LogOut className={`w-5 h-5 ${isOpen && 'mr-3'}`} />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}