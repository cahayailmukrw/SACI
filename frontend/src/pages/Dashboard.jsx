import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, GraduationCap, BookOpen, Calendar, Bell } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, subjectsRes, announcementsRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/teachers'),
        axios.get('/api/classes'),
        axios.get('/api/subjects'),
        axios.get('/api/announcements'),
      ])

      setStats({
        students: studentsRes.data.length,
        teachers: teachersRes.data.length,
        classes: classesRes.data.length,
        subjects: subjectsRes.data.length,
      })

      // Filter pengumuman: hanya yang aktif, belum expired, dan urutkan berdasarkan publishDate terbaru
      const today = new Date()
      const filteredAnnouncements = announcementsRes.data
        .filter(announcement => {
          // Cek apakah pengumuman aktif
          if (!announcement.isActive) return false

          // Cek apakah publishDate sudah lewat atau hari ini
          const publishDate = new Date(announcement.publishDate)
          if (publishDate > today) return false

          // Cek apakah expiryDate belum lewat atau tidak ada expiryDate
          if (announcement.expiryDate) {
            const expiryDate = new Date(announcement.expiryDate)
            if (expiryDate < today) return false
          }

          return true
        })
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
        .slice(0, 3)

      setAnnouncements(filteredAnnouncements)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Siswa',
      value: stats.students,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Guru',
      value: stats.teachers,
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      title: 'Total Kelas',
      value: stats.classes,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Mata Pelajaran',
      value: stats.subjects,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">{card.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-2 sm:p-3 rounded-full`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {announcements.length > 0 && (
        <div className="card mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center space-x-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-islamic-600" />
            <span>Pengumuman Terbaru</span>
          </h2>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{announcement.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{announcement.content.substring(0, 100)}{announcement.content.length > 100 ? '...' : ''}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(announcement.publishDate).toLocaleDateString('id-ID')}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full ${announcement.priority === 'HIGH' ? 'bg-red-100 text-red-800' : announcement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {announcement.priority}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs self-start sm:self-auto ${announcement.category === 'RELIGIOUS' ? 'bg-islamic-100 text-islamic-800' :
                    announcement.category === 'URGENT' ? 'bg-red-100 text-red-800' :
                      announcement.category === 'EVENT' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {announcement.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Selamat Datang di Sistem Akademik Cahaya Ilmu</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Sistem manajemen akademik untuk Sekolah Islam Terpadu. Kelola data siswa, guru, kelas, nilai, absensi, dan tahfidz Quran dalam satu platform terintegrasi.
        </p>
        <div className="p-3 sm:p-4 bg-islamic-50 rounded-lg border border-islamic-200">
          <h3 className="font-semibold text-islamic-800 mb-2 text-sm sm:text-base">Fitur Utama</h3>
          <ul className="text-xs sm:text-sm text-islamic-700 space-y-1">
            <li>• Manajemen Multi-Jenjang (SD, SMP, SMA)</li>
            <li>• Manajemen Siswa & Guru</li>
            <li>• Jadwal Pelajaran & Sholat</li>
            <li>• Kegiatan Keagamaan</li>
            <li>• Program Tahfidz Quran</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
