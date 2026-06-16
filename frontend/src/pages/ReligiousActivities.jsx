import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ReligiousActivities = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [filterAudience, setFilterAudience] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityType: 'JUMAT',
    date: '',
    location: '',
    organizer: '',
    isMandatory: false,
    targetAudience: 'ALL',
  })

  useEffect(() => {
    fetchActivities()
  }, [filterType, filterAudience])

  const fetchActivities = async () => {
    try {
      const params = {}
      if (filterType) params.activityType = filterType
      if (filterAudience) params.targetAudience = filterAudience
      const response = await axios.get('/api/religious-activities', { params })
      setActivities(response.data)
    } catch (error) {
      console.error('Error fetching religious activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityTypeLabel = (type) => {
    const types = {
      'JUMAT': 'Jumat',
      'PENGAJIAN': 'Pengajian',
      'RAMADHAN': 'Ramadhan',
      'EID': 'Hari Raya',
      'OTHER': 'Lainnya',
    }
    return types[type] || type
  }

  const getActivityTypeColor = (type) => {
    const colors = {
      'JUMAT': 'bg-islamic-100 text-islamic-800',
      'PENGAJIAN': 'bg-blue-100 text-blue-800',
      'RAMADHAN': 'bg-green-100 text-green-800',
      'EID': 'bg-purple-100 text-purple-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
      const activityData = {
        ...formData,
        date: formData.date ? new Date(formData.date) : null,
      }

      if (editingActivity) {
        await axios.put(`/api/religious-activities/${editingActivity.id}`, activityData)
      } else {
        await axios.post('/api/religious-activities', activityData)
      }

      fetchActivities()
      setShowModal(false)
      setEditingActivity(null)
      setFormData({
        title: '',
        description: '',
        activityType: 'JUMAT',
        date: '',
        location: '',
        organizer: '',
        isMandatory: false,
        targetAudience: 'ALL',
      })
    } catch (error) {
      console.error('Error saving religious activity:', error)
      alert('Gagal menyimpan kegiatan keagamaan')
    }
  }

  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activityType: activity.activityType,
      date: activity.date ? activity.date.split('T')[0] : '',
      location: activity.location || '',
      organizer: activity.organizer || '',
      isMandatory: activity.isMandatory,
      targetAudience: activity.targetAudience,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setActivityToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/religious-activities/${activityToDelete}`)
      fetchActivities()
      setShowDeleteModal(false)
      setActivityToDelete(null)
    } catch (error) {
      console.error('Error deleting religious activity:', error)
    }
  }

  const openAddModal = () => {
    setEditingActivity(null)
    setFormData({
      title: '',
      description: '',
      activityType: 'JUMAT',
      date: '',
      location: '',
      organizer: '',
      isMandatory: false,
      targetAudience: 'ALL',
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data kegiatan keagamaan...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">Kegiatan Keagamaan</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Kegiatan</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Jenis</option>
            <option value="JUMAT">Jumat</option>
            <option value="PENGAJIAN">Pengajian</option>
            <option value="RAMADHAN">Ramadhan</option>
            <option value="EID">Hari Raya</option>
            <option value="OTHER">Lainnya</option>
          </select>
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Sasaran</option>
            <option value="ALL">Semua</option>
            <option value="STUDENTS">Siswa</option>
            <option value="TEACHERS">Guru</option>
            <option value="PARENTS">Orang Tua</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className={`px-2 py-1 rounded-full text-xs mb-2 inline-block ${getActivityTypeColor(activity.activityType)}`}>
                  {getActivityTypeLabel(activity.activityType)}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(activity.date).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {activity.location && (
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{activity.location}</span>
                  </div>
                )}
                {activity.organizer && (
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{activity.organizer}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(activity)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(activity.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {activity.description && (
              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
            )}
            
            <div className="flex items-center space-x-3">
              {activity.isMandatory && (
                <div className="flex items-center space-x-1">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Wajib</span>
                </div>
              )}
              <span className="text-xs text-gray-500">
                Sasaran: {activity.targetAudience}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingActivity ? 'Edit Kegiatan Keagamaan' : 'Tambah Kegiatan Keagamaan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Kegiatan
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Judul kegiatan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Deskripsi kegiatan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kegiatan
                </label>
                <select
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="JUMAT">Jumat</option>
                  <option value="PENGAJIAN">Pengajian</option>
                  <option value="RAMADHAN">Ramadhan</option>
                  <option value="EID">Hari Raya</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: Masjid Utama"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: DKM Masjid"
                />
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isMandatory"
                  checked={formData.isMandatory}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Wajib Hadir
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingActivity(null)
                    setFormData({
                      title: '',
                      description: '',
                      activityType: 'JUMAT',
                      date: '',
                      location: '',
                      organizer: '',
                      isMandatory: false,
                      targetAudience: 'ALL',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingActivity ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus kegiatan keagamaan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setActivityToDelete(null)
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

export default ReligiousActivities
