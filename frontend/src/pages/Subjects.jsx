import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Subjects = () => {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const [educationLevelFilter, setEducationLevelFilter] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'GENERAL',
    educationLevel: 'SD',
    credits: 1,
    description: '',
  })

  useEffect(() => {
    fetchSubjects()
  }, [educationLevelFilter])

  const fetchSubjects = async () => {
    try {
      const params = educationLevelFilter ? { educationLevel: educationLevelFilter } : {}
      const response = await axios.get('/api/subjects', { params })
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ISLAMIC':
        return 'bg-green-100 text-green-800'
      case 'QURAN':
        return 'bg-purple-100 text-purple-800'
      case 'ARABIC':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'ISLAMIC':
        return 'Studi Islam'
      case 'QURAN':
        return 'Quran'
      case 'ARABIC':
        return 'Bahasa Arab'
      default:
        return 'Umum'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const subjectData = {
        ...formData,
        category: formData.category.toUpperCase(),
        credits: parseInt(formData.credits),
      }

      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, subjectData)
      } else {
        await axios.post('/api/subjects', subjectData)
      }

      fetchSubjects()
      setShowModal(false)
      setEditingSubject(null)
      setFormData({
        code: '',
        name: '',
        category: 'GENERAL',
        educationLevel: 'SD',
        credits: 1,
        description: '',
      })
    } catch (error) {
      console.error('Error saving subject:', error)
      console.error('Error response:', error.response?.data)
      alert(`Gagal menyimpan data mata pelajaran: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      code: subject.code,
      name: subject.name,
      category: subject.category,
      educationLevel: subject.educationLevel || 'SD',
      credits: subject.credits,
      description: subject.description || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setSubjectToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/subjects/${subjectToDelete}`)
      fetchSubjects()
      setShowDeleteModal(false)
      setSubjectToDelete(null)
    } catch (error) {
      console.error('Error deleting subject:', error)
    }
  }

  const openAddModal = () => {
    setEditingSubject(null)
    setFormData({
      code: '',
      name: '',
      category: 'GENERAL',
      educationLevel: 'SD',
      credits: 1,
      description: '',
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data mata pelajaran...</div>
  }

  // Role-based access control
  if (!['ADMIN', 'TEACHER'].includes(user?.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Mata Pelajaran</h1>
        <div className="flex space-x-3">
          <select
            value={educationLevelFilter}
            onChange={(e) => setEducationLevelFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>
          <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Jenjang</th>
              <th>Kategori</th>
              <th>SKS</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="font-mono text-sm">{subject.code}</td>
                <td className="font-medium">{subject.name}</td>
                <td>{subject.educationLevel || '-'}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(subject.category)}`}>
                    {getCategoryLabel(subject.category)}
                  </span>
                </td>
                <td>{subject.credits}</td>
                <td className="text-sm text-gray-600">{subject.description || '-'}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(subject)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(subject.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: MTK01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: Matematika"
                />
              </div>
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
                  <option value="ISLAMIC">Studi Islam</option>
                  <option value="QURAN">Quran</option>
                  <option value="ARABIC">Bahasa Arab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenjang Pendidikan
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                  <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKS
                </label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="input-field"
                  placeholder="Contoh: 2"
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
                  placeholder="Deskripsi mata pelajaran"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSubject(null)
                    setFormData({
                      code: '',
                      name: '',
                      category: 'GENERAL',
                      educationLevel: 'SD',
                      credits: 1,
                      description: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSubject ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus mata pelajaran ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSubjectToDelete(null)
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

export default Subjects
