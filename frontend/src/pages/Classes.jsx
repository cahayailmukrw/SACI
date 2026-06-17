import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Classes = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [classToDelete, setClassToDelete] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [educationLevelFilter, setEducationLevelFilter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: 1,
    educationLevel: 'SD',
    academicYear: '',
    homeroomTeacherId: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchTeachers()
  }, [educationLevelFilter])

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false)
        setShowDeleteModal(false)
        setEditingClass(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const fetchClasses = async () => {
    try {
      const params = educationLevelFilter ? { educationLevel: educationLevelFilter } : {}
      const response = await axios.get('/api/classes', { params })
      setClasses(response.data)
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers')
      setTeachers(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClass) {
        await axios.put(`/api/classes/${editingClass.id}`, formData)
        setSuccessMessage('Data kelas berhasil diperbarui')
      } else {
        await axios.post('/api/classes', formData)
        setSuccessMessage('Kelas baru berhasil ditambahkan')
      }

      fetchClasses()
      setShowModal(false)
      setEditingClass(null)

      setTimeout(() => setSuccessMessage(''), 5000)
      setFormData({
        name: '',
        gradeLevel: 1,
        educationLevel: 'SD',
        academicYear: '',
        homeroomTeacherId: '',
      })
    } catch (error) {
      console.error('Error saving class:', error)
      setErrorMessage(error.response?.data?.error || 'Gagal menyimpan data kelas. Silakan coba lagi.')
    }
  }

  const handleEdit = (classData) => {
    setEditingClass(classData)
    setFormData({
      name: classData.name,
      gradeLevel: classData.gradeLevel,
      educationLevel: classData.educationLevel || 'SD',
      academicYear: classData.academicYear,
      homeroomTeacherId: classData.homeroomTeacherId || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setClassToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/classes/${classToDelete}`)
      fetchClasses()
      setShowDeleteModal(false)
      setClassToDelete(null)
      setSuccessMessage('Data kelas berhasil dihapus')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting class:', error)
      setErrorMessage('Gagal menghapus data kelas. Silakan coba lagi.')
    }
  }

  const openAddModal = () => {
    setEditingClass(null)
    setFormData({
      name: '',
      gradeLevel: 1,
      educationLevel: 'SD',
      academicYear: '',
      homeroomTeacherId: '',
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="card">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Manajemen Kelas</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
          <button onClick={openAddModal} className="btn-primary flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data kelas</h3>
            <p className="text-gray-500 mb-4">
              {educationLevelFilter
                ? 'Tidak ada kelas yang sesuai dengan filter jenjang.'
                : 'Belum ada data kelas. Mulai dengan menambahkan kelas baru.'}
            </p>
            {!educationLevelFilter && (
              <button
                onClick={openAddModal}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas</span>
              </button>
            )}
          </div>
        ) : (
          classes.map((classData) => (
            <div key={classData.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{classData.name}</h3>
                  <p className="text-sm text-gray-600">{classData.educationLevel} - Kelas {classData.gradeLevel}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(classData)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(classData.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Tahun Ajaran:</span>
                  <span className="ml-2 font-medium">{classData.academicYear}</span>
                </div>
                <div>
                  <span className="text-gray-600">Wali Kelas:</span>
                  <span className="ml-2 font-medium">
                    {classData.homeroomTeacher?.user.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah Siswa:</span>
                  <span className="ml-2 font-medium">{classData.students.length}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingClass ? 'Edit Kelas' : 'Tambah Kelas'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: Kelas 1A"
                />
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
                  Tingkat Kelas
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  {formData.educationLevel === 'SD' ? [1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>
                      Kelas {level}
                    </option>
                  )) : formData.educationLevel === 'SMP' ? [7, 8, 9].map((level) => (
                    <option key={level} value={level}>
                      Kelas {level}
                    </option>
                  )) : [10, 11, 12].map((level) => (
                    <option key={level} value={level}>
                      Kelas {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: 2024/2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wali Kelas
                </label>
                <select
                  name="homeroomTeacherId"
                  value={formData.homeroomTeacherId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Pilih Wali Kelas</option>
                  {teachers
                    .filter(t => !formData.educationLevel || t.educationLevel === formData.educationLevel)
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.user.name} ({t.educationLevel})
                      </option>
                    ))}
                </select>
                {formData.educationLevel && (
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya menampilkan guru jenjang {formData.educationLevel}
                  </p>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingClass(null)
                    setFormData({
                      name: '',
                      gradeLevel: 1,
                      educationLevel: 'SD',
                      academicYear: '',
                      homeroomTeacherId: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingClass ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setClassToDelete(null)
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

export default Classes
