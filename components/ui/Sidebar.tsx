'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCog
} from 'lucide-react'

interface SidebarProps {
  userRole?: string;  // Menerima props dari layout
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Assets',
      href: '/assets',
      icon: Package
    },
    {
      title: 'Peminjaman',
      href: '/loans',
      icon: ClipboardList
    }
  ]

  const isActive = (path: string) => pathname === path

  // Debug: cek nilai userRole di console (bisa dihapus nanti)
  console.log('Sidebar userRole:', userRole)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Asset Manager</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User</p>
                <p className="text-xs text-gray-500 truncate capitalize">{userRole || 'user'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {/* Main Menu */}
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                        ${isActive(item.href) 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Admin Menu - untuk ADMIN dan SUPER_ADMIN (case sensitive) */}
              {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <li>
                  <button
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAdminOpen && (
                    <ul className="mt-2 ml-4 space-y-2">
                      {/* Manajemen User - untuk semua admin */}
                      <li>
                        <Link
                          href="/admin/users"
                          onClick={() => setIsOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                            ${isActive('/admin/users') 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Users className="w-5 h-5" />
                          <span>Manajemen User</span>
                        </Link>
                      </li>
                      
                      {/* Settings - hanya untuk SUPER_ADMIN */}
                      {userRole === 'SUPER_ADMIN' && (
                        <li>
                          <Link
                            href="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                              ${isActive('/admin/settings') 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.href = '/api/auth/signout'
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}