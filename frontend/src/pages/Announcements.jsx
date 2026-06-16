import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Bell, AlertTriangle, Info, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Announcements = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    targetAudience: 'ALL',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isActive: true,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [filterCategory, filterPriority])

  const fetchAnnouncements = async () => {
    try {
      const params = {}
      if (filterCategory) params.category = filterCategory
      if (filterPriority) params.priority = filterPriority
      const response = await axios.get('/api/announcements', { params })
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'RELIGIOUS':
        return <Bell className="w-5 h-5" />
      case 'URGENT':
        return <AlertTriangle className="w-5 h-5" />
      case 'EVENT':
        return <Calendar className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'RELIGIOUS':
        return 'bg-islamic-100 text-islamic-800'
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'EVENT':
        return 'bg-purple-100 text-purple-800'
      case 'ACADEMIC':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const announcementData = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : new Date(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
      }

      if (editingAnnouncement) {
        await axios.put(`/api/announcements/${editingAnnouncement.id}`, announcementData)
      } else {
        await axios.post('/api/announcements', announcementData)
      }

      fetchAnnouncements()
      setShowModal(false)
      setEditingAnnouncement(null)
      setFormData({
        title: '',
        content: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        targetAudience: 'ALL',
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        isActive: true,
      })
    } catch (error) {
      console.error('Error saving announcement:', error)
      alert('Gagal menyimpan pengumuman')
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      publishDate: announcement.publishDate ? announcement.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : '',
      isActive: announcement.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setAnnouncementToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/announcements/${announcementToDelete}`)
      fetchAnnouncements()
      setShowDeleteModal(false)
      setAnnouncementToDelete(null)
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const openAddModal = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      targetAudience: 'ALL',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      isActive: true,
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data pengumuman...</div>
  }

  // Role-based access control
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengumuman</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Pengumuman</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex space-x-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Kategori</option>
            <option value="GENERAL">Umum</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="RELIGIOUS">Keagamaan</option>
            <option value="EVENT">Event</option>
            <option value="URGENT">Penting</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Prioritas</option>
            <option value="HIGH">Tinggi</option>
            <option value="MEDIUM">Sedang</option>
            <option value="LOW">Rendah</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Prioritas</th>
              <th>Sasaran</th>
              <th>Tanggal Publish</th>
              <th>Tanggal Expired</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td className="font-medium">{announcement.title}</td>
                <td>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(announcement.category)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </td>
                <td>{announcement.targetAudience}</td>
                <td className="text-sm">
                  {new Date(announcement.publishDate).toLocaleDateString('id-ID')}
                </td>
                <td className="text-sm">
                  {announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString('id-ID') : '-'}
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {announcement.isActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(announcement)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(announcement.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Judul pengumuman"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Isi Pengumuman
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  rows="5"
                  placeholder="Isi pengumuman lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="GENERAL">Umum</option>
                    <option value="ACADEMIC">Akademik</option>
                    <option value="RELIGIOUS">Keagamaan</option>
                    <option value="EVENT">Event</option>
                    <option value="URGENT">Penting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="HIGH">Tinggi</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="LOW">Rendah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sasaran
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="ALL">Semua</option>
                  <option value="STUDENTS">Siswa</option>
                  <option value="TEACHERS">Guru</option>
                  <option value="PARENTS">Orang Tua</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Publish
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Expired (Opsional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAnnouncement(null)
                    setFormData({
                      title: '',
                      content: '',
                      category: 'GENERAL',
                      priority: 'MEDIUM',
                      targetAudience: 'ALL',
                      publishDate: new Date().toISOString().split('T')[0],
                      expiryDate: '',
                      isActive: true,
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingAnnouncement ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setAnnouncementToDelete(null)
                }}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
              <button onClick={confirmDelete} className="btn-danger flex-1">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Announcements
