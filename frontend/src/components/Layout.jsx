import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  BookMarked,
  LogOut,
  Clock,
  Bell,
  Star,
  Key,
  FileText,
  Shield,
  Trophy,
  Menu,
  X
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/students', icon: Users, label: 'Siswa', roles: ['ADMIN', 'TEACHER'] },
    { path: '/teachers', icon: GraduationCap, label: 'Guru', roles: ['ADMIN'] },
    { path: '/classes', icon: BookOpen, label: 'Kelas', roles: ['ADMIN', 'TEACHER'] },
    { path: '/subjects', icon: ClipboardList, label: 'Mata Pelajaran', roles: ['ADMIN', 'TEACHER'] },
    { path: '/grades', icon: BookMarked, label: 'Nilai', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/attendance', icon: Calendar, label: 'Absensi', roles: ['ADMIN', 'TEACHER'] },
    { path: '/tahfidz', icon: BookMarked, label: 'Tahfidz', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/report-cards', icon: FileText, label: 'Rapor', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/student-affairs', icon: Shield, label: 'Kesiswaan', roles: ['ADMIN', 'TEACHER'] },
    { path: '/extracurriculars', icon: Trophy, label: 'Ekstrakurikuler', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/schedule', icon: Clock, label: 'Jadwal Pelajaran', roles: ['ADMIN', 'TEACHER'] },
    { path: '/prayer-schedule', icon: Star, label: 'Jadwal Sholat', roles: ['ADMIN', 'TEACHER'] },
    { path: '/religious-activities', icon: Star, label: 'Kegiatan Keagamaan', roles: ['ADMIN', 'TEACHER'] },
    { path: '/announcements', icon: Bell, label: 'Pengumuman', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
    { path: '/change-password', icon: Key, label: 'Ganti Password', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  ]

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-primary-800 text-white shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-primary-700 rounded-lg"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <GraduationCap className="w-8 h-8" />
              <span className="text-xl font-bold">SACI</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm hidden sm:inline">{user?.name}</span>
              <span className="px-2 py-1 sm:px-3 sm:py-1 bg-primary-700 rounded-full text-xs">
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-primary-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
