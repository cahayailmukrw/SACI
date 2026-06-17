import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Teachers = () => {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [educationLevelFilter, setEducationLevelFilter] = useState('')
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    subject: '',
    phone: '',
    address: '',
    educationLevel: 'SD',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [educationLevelFilter])

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false)
        setShowDeleteModal(false)
        setEditingTeacher(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const fetchTeachers = async () => {
    try {
      const params = educationLevelFilter ? { educationLevel: educationLevelFilter } : {}
      const response = await axios.get('/api/teachers', { params })
      setTeachers(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nip?.includes(searchTerm)
  )

  const generateEmail = (nip) => {
    return `${nip}@cahayailmu.sch.id`
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const email = generateEmail(formData.nip)
      const teacherData = {
        nip: formData.nip,
        subject: formData.subject,
        phone: formData.phone,
        address: formData.address,
        user: {
          email: email,
          name: formData.name,
          password: formData.nip, // Default password is NIP
          role: 'TEACHER',
        },
      }

      if (editingTeacher) {
        await axios.put(`/api/teachers/${editingTeacher.id}`, teacherData)
        setSuccessMessage('Data guru berhasil diperbarui')
      } else {
        await axios.post('/api/teachers', teacherData)
        setSuccessMessage('Guru baru berhasil ditambahkan')
      }

      fetchTeachers()
      setShowModal(false)
      setEditingTeacher(null)

      setTimeout(() => setSuccessMessage(''), 5000)
      setFormData({
        nip: '',
        name: '',
        subject: '',
        phone: '',
        address: '',
        educationLevel: 'SD',
      })
    } catch (error) {
      console.error('Error saving teacher:', error)
      setErrorMessage(error.response?.data?.error || 'Gagal menyimpan data guru. Silakan coba lagi.')
    }
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      nip: teacher.nip || '',
      name: teacher.user.name,
      subject: teacher.subject || '',
      phone: teacher.phone || '',
      address: teacher.address || '',
      educationLevel: teacher.educationLevel || 'SD',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setTeacherToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/teachers/${teacherToDelete}`)
      fetchTeachers()
      setShowDeleteModal(false)
      setTeacherToDelete(null)
      setSuccessMessage('Data guru berhasil dihapus')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting teacher:', error)
      setErrorMessage('Gagal menghapus data guru. Silakan coba lagi.')
    }
  }

  const openAddModal = () => {
    setEditingTeacher(null)
    setFormData({
      nip: '',
      name: '',
      subject: '',
      phone: '',
      address: '',
      educationLevel: 'SD',
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
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
  if (user?.role !== 'ADMIN') {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Manajemen Guru</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center justify-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Guru</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari guru berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
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
        </div>
      </div>

      <div className="card overflow-x-auto">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data guru</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || educationLevelFilter
                ? 'Tidak ada guru yang sesuai dengan pencarian atau filter.'
                : 'Belum ada data guru. Mulai dengan menambahkan guru baru.'}
            </p>
            {!searchTerm && !educationLevelFilter && (
              <button
                onClick={openAddModal}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru</span>
              </button>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>NIP</th>
                <th>Nama</th>
                <th className="hidden sm:table-cell">Email</th>
                <th>Jenjang</th>
                <th className="hidden md:table-cell">Mata Pelajaran</th>
                <th className="hidden lg:table-cell">Telepon</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="font-medium">{teacher.nip || '-'}</td>
                  <td className="font-medium">{teacher.user.name}</td>
                  <td className="hidden sm:table-cell">{teacher.user.email}</td>
                  <td>{teacher.educationLevel || '-'}</td>
                  <td className="hidden md:table-cell">{teacher.subject || '-'}</td>
                  <td className="hidden lg:table-cell">{teacher.phone || '-'}</td>
                  <td>
                    <div className="flex space-x-1 sm:space-x-2">
                      <button onClick={() => handleEdit(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTeacher ? 'Edit Guru' : 'Tambah Guru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Contoh: 198001012005011001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email akan dibuat otomatis: {formData.nip ? generateEmail(formData.nip) : 'nip@cahayailmu.sch.id'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Nama lengkap guru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: Matematika, Bahasa Indonesia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Alamat lengkap guru"
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
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTeacher(null)
                    setFormData({
                      nip: '',
                      name: '',
                      subject: '',
                      phone: '',
                      address: '',
                      educationLevel: 'SD',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTeacher ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus guru ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setTeacherToDelete(null)
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

export default Teachers
