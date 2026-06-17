import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Students = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [classes, setClasses] = useState([])
  const [educationLevelFilter, setEducationLevelFilter] = useState('')
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    gender: 'MALE',
    birthDate: '',
    birthPlace: '',
    phone: '',
    address: '',
    parentId: '',
    classId: '',
    parentName: '',
    parentPhone: '',
    parentAddress: '',
    parentOccupation: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [educationLevelFilter])

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false)
        setShowDeleteModal(false)
        setEditingStudent(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const params = educationLevelFilter ? { educationLevel: educationLevelFilter } : {}
      const response = await axios.get('/api/classes', { params })
      setClasses(response.data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const filteredStudents = students.filter(
    (student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.includes(searchTerm)
      const matchesEducationLevel =
        !educationLevelFilter ||
        (student.class && student.class.educationLevel === educationLevelFilter)

      if (educationLevelFilter) {
        console.log('Filter:', educationLevelFilter, 'Student:', student.name, 'Class:', student.class?.educationLevel, 'Matches:', matchesEducationLevel)
      }

      return matchesSearch && matchesEducationLevel
    }
  )

  const generateEmail = (nis) => {
    return `${nis}@cahayailmu.sch.id`
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const email = generateEmail(formData.nis)
      const studentData = {
        nis: formData.nis,
        nisn: formData.nisn,
        name: formData.name,
        gender: formData.gender,
        birthDate: new Date(formData.birthDate).toISOString(),
        birthPlace: formData.birthPlace,
        phone: formData.phone,
        address: formData.address,
        classId: formData.classId,
        parent: {
          phone: formData.parentPhone,
          address: formData.parentAddress,
          occupation: formData.parentOccupation,
          user: {
            email: email,
            name: formData.parentName,
            password: formData.nis, // Default password is NIS
            role: 'PARENT',
          },
        },
      }

      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent.id}`, studentData)
        setSuccessMessage('Data siswa berhasil diperbarui')
      } else {
        await axios.post('/api/students', studentData)
        setSuccessMessage('Siswa baru berhasil ditambahkan')
      }

      fetchStudents()
      setShowModal(false)
      setEditingStudent(null)

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
      setFormData({
        nis: '',
        nisn: '',
        name: '',
        gender: 'MALE',
        birthDate: '',
        birthPlace: '',
        phone: '',
        address: '',
        parentId: '',
        classId: '',
        parentName: '',
        parentPhone: '',
        parentAddress: '',
        parentOccupation: '',
      })
    } catch (error) {
      console.error('Error saving student:', error)
      setErrorMessage(error.response?.data?.error || 'Gagal menyimpan data siswa. Silakan coba lagi.')
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      nis: student.nis,
      nisn: student.nisn || '',
      name: student.name,
      gender: student.gender,
      birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
      birthPlace: student.birthPlace || '',
      phone: student.phone || '',
      address: student.address || '',
      parentId: student.parentId || '',
      classId: student.classId || '',
      parentName: student.parent.user.name,
      parentPhone: student.parent.phone || '',
      parentAddress: student.parent.address || '',
      parentOccupation: student.parent.occupation || '',
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingStudent(null)
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      gender: 'MALE',
      birthDate: '',
      birthPlace: '',
      phone: '',
      address: '',
      parentId: '',
      classId: '',
      parentName: '',
      parentPhone: '',
      parentAddress: '',
      parentOccupation: '',
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Manajemen Siswa</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama atau NIS..."
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
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data siswa</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || educationLevelFilter
                ? 'Tidak ada siswa yang sesuai dengan pencarian atau filter.'
                : 'Belum ada data siswa. Mulai dengan menambahkan siswa baru.'}
            </p>
            {!searchTerm && !educationLevelFilter && (
              <button
                onClick={openAddModal}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama</th>
                <th className="hidden sm:table-cell">Gender</th>
                <th>Kelas</th>
                <th className="hidden md:table-cell">Jenjang</th>
                <th className="hidden lg:table-cell">Orang Tua</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium">{student.nis}</td>
                  <td className="font-medium">{student.name}</td>
                  <td className="hidden sm:table-cell">{student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td>{student.class?.name || '-'}</td>
                  <td className="hidden md:table-cell">{student.class?.educationLevel || '-'}</td>
                  <td className="hidden lg:table-cell">{student.parent.user.name}</td>
                  <td>
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => {
                          setEditingStudent(student)
                          setShowModal(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
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
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIS (Nomor Induk Siswa)
                  </label>
                  <input
                    type="text"
                    name="nis"
                    value={formData.nis}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Contoh: 2024001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email orang tua akan dibuat otomatis: {formData.nis ? generateEmail(formData.nis) : 'nis@cahayailmu.sch.id'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Contoh: 0012345678"
                  />
                </div>
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
                  placeholder="Nama lengkap siswa"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Tempat lahir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.academicYear}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon Siswa
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
                  Alamat Siswa
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="2"
                  placeholder="Alamat lengkap siswa"
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Data Orang Tua</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Orang Tua
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Nama lengkap orang tua"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon Orang Tua
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      name="parentOccupation"
                      value={formData.parentOccupation}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Pekerjaan orang tua"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Orang Tua
                  </label>
                  <textarea
                    name="parentAddress"
                    value={formData.parentAddress}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="2"
                    placeholder="Alamat lengkap orang tua"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingStudent(null)
                    setFormData({
                      nis: '',
                      nisn: '',
                      name: '',
                      gender: 'MALE',
                      birthDate: '',
                      birthPlace: '',
                      phone: '',
                      address: '',
                      parentId: '',
                      classId: '',
                      parentName: '',
                      parentPhone: '',
                      parentAddress: '',
                      parentOccupation: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingStudent ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setStudentToDelete(null)
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

  async function handleDelete(id) {
    setStudentToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/students/${studentToDelete}`)
      fetchStudents()
      setShowDeleteModal(false)
      setStudentToDelete(null)
      setSuccessMessage('Data siswa berhasil dihapus')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting student:', error)
      setErrorMessage('Gagal menghapus data siswa. Silakan coba lagi.')
    }
  }
}

export default Students
