import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, BookOpen, Award, Clock, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Tahfidz = () => {
  const { user } = useAuth()
  const [tahfidz, setTahfidz] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTahfidz, setEditingTahfidz] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tahfidzToDelete, setTahfidzToDelete] = useState(null)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    surah: '',
    ayatFrom: 1,
    ayatTo: 1,
    juz: '',
    status: 'IN_PROGRESS',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetchTahfidz()
    fetchStudents()
  }, [filterStatus])

  const fetchTahfidz = async () => {
    try {
      const response = await axios.get('/api/tahfidz', {
        params: filterStatus ? { status: filterStatus } : {},
      })
      setTahfidz(response.data)
    } catch (error) {
      console.error('Error fetching tahfidz:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const tahfidzData = {
        studentId: formData.studentId,
        surah: formData.surah,
        ayatFrom: parseInt(formData.ayatFrom),
        ayatTo: parseInt(formData.ayatTo),
        juz: formData.juz ? parseInt(formData.juz) : null,
        status: formData.status.toUpperCase(),
        notes: formData.notes,
      }

      if (editingTahfidz) {
        await axios.put(`/api/tahfidz/${editingTahfidz.id}`, tahfidzData)
      } else {
        await axios.post('/api/tahfidz', tahfidzData)
      }

      fetchTahfidz()
      setShowModal(false)
      setEditingTahfidz(null)
      setFormData({
        studentId: '',
        surah: '',
        ayatFrom: 1,
        ayatTo: 1,
        juz: '',
        status: 'IN_PROGRESS',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    } catch (error) {
      console.error('Error saving tahfidz:', error)
      alert('Gagal menyimpan data tahfidz')
    }
  }

  const handleEdit = (record) => {
    setEditingTahfidz(record)
    setFormData({
      studentId: record.studentId,
      surah: record.surah,
      ayatFrom: record.ayatFrom,
      ayatTo: record.ayatTo,
      juz: record.juz || '',
      status: record.status,
      date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setTahfidzToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/tahfidz/${tahfidzToDelete}`)
      fetchTahfidz()
      setShowDeleteModal(false)
      setTahfidzToDelete(null)
    } catch (error) {
      console.error('Error deleting tahfidz:', error)
    }
  }

  const openAddModal = () => {
    setEditingTahfidz(null)
    setFormData({
      studentId: '',
      surah: '',
      ayatFrom: 1,
      ayatTo: 1,
      juz: '',
      status: 'IN_PROGRESS',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setShowModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Award className="w-5 h-5 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'REVIEW':
        return <BookOpen className="w-5 h-5 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai'
      case 'IN_PROGRESS':
        return 'Sedang Menghafal'
      case 'REVIEW':
        return 'Murojaah'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEW':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTahfidz = filterStatus
    ? tahfidz.filter((t) => t.status === filterStatus)
    : tahfidz

  if (loading) {
    return <div className="text-center py-8">Memuat data tahfidz...</div>
  }

  // Role-based access control
  if (!['ADMIN', 'TEACHER', 'PARENT'].includes(user?.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Program Tahfidz Quran</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Input Progress</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-48"
          >
            <option value="">Semua</option>
            <option value="IN_PROGRESS">Sedang Menghafal</option>
            <option value="COMPLETED">Selesai</option>
            <option value="REVIEW">Murojaah</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Surah</th>
              <th>Ayat</th>
              <th>Juz</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTahfidz.map((record) => (
              <tr key={record.id}>
                <td className="font-mono text-sm">{record.student.nis}</td>
                <td className="font-medium">{record.student.name}</td>
                <td className="font-semibold text-islamic-700">{record.surah}</td>
                <td>
                  {record.ayatFrom} - {record.ayatTo}
                </td>
                <td>{record.juz || '-'}</td>
                <td>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                </td>
                <td className="text-sm">{new Date(record.date).toLocaleDateString('id-ID')}</td>
                <td className="text-sm text-gray-600">{record.notes || '-'}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-islamic-50 border-islamic-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-islamic-600" />
            <div>
              <p className="text-sm text-islamic-700">Sedang Menghafal</p>
              <p className="text-2xl font-bold text-islamic-800">
                {tahfidz.filter((t) => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Selesai</p>
              <p className="text-2xl font-bold text-green-800">
                {tahfidz.filter((t) => t.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700">Murojaah</p>
              <p className="text-2xl font-bold text-orange-800">
                {tahfidz.filter((t) => t.status === 'REVIEW').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTahfidz ? 'Edit Progress Tahfidz' : 'Input Progress Tahfidz'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Pilih Siswa</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nis} - {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surah
                </label>
                <input
                  type="text"
                  name="surah"
                  value={formData.surah}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: Al-Fatihah"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ayat Dari
                  </label>
                  <input
                    type="number"
                    name="ayatFrom"
                    value={formData.ayatFrom}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="input-field"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ayat Sampai
                  </label>
                  <input
                    type="number"
                    name="ayatTo"
                    value={formData.ayatTo}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="input-field"
                    placeholder="7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Juz
                </label>
                <input
                  type="number"
                  name="juz"
                  value={formData.juz}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                  className="input-field"
                  placeholder="Contoh: 30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="IN_PROGRESS">Sedang Menghafal</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="REVIEW">Murojaah</option>
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
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTahfidz(null)
                    setFormData({
                      studentId: '',
                      surah: '',
                      ayatFrom: 1,
                      ayatTo: 1,
                      juz: '',
                      status: 'IN_PROGRESS',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTahfidz ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus data tahfidz ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setTahfidzToDelete(null)
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

export default Tahfidz
