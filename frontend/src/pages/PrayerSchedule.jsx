import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PrayerSchedule = () => {
  const { user } = useAuth()
  const [prayerSchedules, setPrayerSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPrayerSchedule, setEditingPrayerSchedule] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prayerScheduleToDelete, setPrayerScheduleToDelete] = useState(null)
  const [formData, setFormData] = useState({
    prayerName: 'SUBUH',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    isActive: true,
  })

  useEffect(() => {
    fetchPrayerSchedules()
  }, [])

  const fetchPrayerSchedules = async () => {
    try {
      const response = await axios.get('/api/prayer-schedules')
      setPrayerSchedules(response.data)
    } catch (error) {
      console.error('Error fetching prayer schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPrayerLabel = (prayerName) => {
    const prayers = {
      'SUBUH': 'Subuh',
      'DHUHA': 'Dhuha',
      'ZUHUR': 'Zuhur',
      'ASHAR': 'Ashar',
      'MAGHRIB': 'Maghrib',
      'ISYA': 'Isya',
    }
    return prayers[prayerName] || prayerName
  }

  const getPrayerOrder = (prayerName) => {
    const order = {
      'SUBUH': 1,
      'DHUHA': 2,
      'ZUHUR': 3,
      'ASHAR': 4,
      'MAGHRIB': 5,
      'ISYA': 6,
    }
    return order[prayerName] || 99
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
      if (editingPrayerSchedule) {
        await axios.put(`/api/prayer-schedules/${editingPrayerSchedule.id}`, formData)
      } else {
        await axios.post('/api/prayer-schedules', formData)
      }

      fetchPrayerSchedules()
      setShowModal(false)
      setEditingPrayerSchedule(null)
      setFormData({
        prayerName: 'SUBUH',
        startTime: '',
        endTime: '',
        location: '',
        notes: '',
        isActive: true,
      })
    } catch (error) {
      console.error('Error saving prayer schedule:', error)
      alert('Gagal menyimpan jadwal sholat')
    }
  }

  const handleEdit = (prayerSchedule) => {
    setEditingPrayerSchedule(prayerSchedule)
    setFormData({
      prayerName: prayerSchedule.prayerName,
      startTime: prayerSchedule.startTime,
      endTime: prayerSchedule.endTime || '',
      location: prayerSchedule.location || '',
      notes: prayerSchedule.notes || '',
      isActive: prayerSchedule.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setPrayerScheduleToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/prayer-schedules/${prayerScheduleToDelete}`)
      fetchPrayerSchedules()
      setShowDeleteModal(false)
      setPrayerScheduleToDelete(null)
    } catch (error) {
      console.error('Error deleting prayer schedule:', error)
    }
  }

  const openAddModal = () => {
    setEditingPrayerSchedule(null)
    setFormData({
      prayerName: 'SUBUH',
      startTime: '',
      endTime: '',
      location: '',
      notes: '',
      isActive: true,
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data jadwal sholat...</div>
  }

  // Role-based access control
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  const sortedPrayerSchedules = [...prayerSchedules].sort((a, b) => 
    getPrayerOrder(a.prayerName) - getPrayerOrder(b.prayerName)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jadwal Sholat</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPrayerSchedules.map((prayerSchedule) => (
          <div key={prayerSchedule.id} className={`card ${!prayerSchedule.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-islamic-800 mb-2">
                  {getPrayerLabel(prayerSchedule.prayerName)}
                </h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{prayerSchedule.startTime}</span>
                  {prayerSchedule.endTime && <span>- {prayerSchedule.endTime}</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(prayerSchedule)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(prayerSchedule.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {prayerSchedule.location && (
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{prayerSchedule.location}</span>
              </div>
            )}
            
            {prayerSchedule.notes && (
              <p className="text-sm text-gray-600 mb-3">{prayerSchedule.notes}</p>
            )}
            
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${prayerSchedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {prayerSchedule.isActive ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPrayerSchedule ? 'Edit Jadwal Sholat' : 'Tambah Jadwal Sholat'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sholat
                </label>
                <select
                  name="prayerName"
                  value={formData.prayerName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="SUBUH">Subuh</option>
                  <option value="DHUHA">Dhuha</option>
                  <option value="ZUHUR">Zuhur</option>
                  <option value="ASHAR">Ashar</option>
                  <option value="MAGHRIB">Maghrib</option>
                  <option value="ISYA">Isya</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Selesai (Opsional)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
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
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Catatan tambahan"
                />
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
                    setEditingPrayerSchedule(null)
                    setFormData({
                      prayerName: 'SUBUH',
                      startTime: '',
                      endTime: '',
                      location: '',
                      notes: '',
                      isActive: true,
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingPrayerSchedule ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus jadwal sholat ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setPrayerScheduleToDelete(null)
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

export default PrayerSchedule
