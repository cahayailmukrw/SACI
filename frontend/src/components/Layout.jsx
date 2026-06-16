import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  Trophy
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

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
              <GraduationCap className="w-8 h-8" />
              <span className="text-xl font-bold">SACI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.name}</span>
              <span className="px-3 py-1 bg-primary-700 rounded-full text-xs">
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-primary-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-lg overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
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

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
