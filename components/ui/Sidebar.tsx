'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  console.log('🔥 SIDEBAR RENDER - userRole:', userRole)
  console.log('🔥 should show admin:', userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')

  const menuItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Assets', href: '/assets', icon: Package },
    { title: 'Peminjaman', href: '/loans', icon: ClipboardList }
  ]

  const isActive = (path: string) => pathname === path

  if (!mounted) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`
        fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-200 w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Asset Manager</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm">
              <div>Role: <span className="font-bold text-blue-600">{userRole}</span></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg
                        ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}

              {/* TEST ADMIN MENU - HARUSNYA KELIATAN */}
              {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <li>
                  <div className="px-4 py-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 font-bold mb-2">
                    ⚡ ADMIN MENU (Role: {userRole})
                  </div>
                  <Link
                    href="/admin/users"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 ml-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Users className="w-5 h-5" />
                    <span>Manajemen User</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/api/auth/signout'}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}