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

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [educationLevelFilter])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
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
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.includes(searchTerm)
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
      } else {
        await axios.post('/api/students', studentData)
      }

      fetchStudents()
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
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Gagal menyimpan data siswa')
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
    return <div className="text-center py-8">Memuat data siswa...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Siswa</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      <div className="card mb-6">
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
        <div className="mt-4">
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
        <table className="table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>NISN</th>
              <th>Nama</th>
              <th>Gender</th>
              <th>Kelas</th>
              <th>Jenjang</th>
              <th>Orang Tua</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.nis}</td>
                <td>{student.nisn || '-'}</td>
                <td className="font-medium">{student.name}</td>
                <td>{student.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</td>
                <td>{student.class?.name || '-'}</td>
                <td>{student.class?.educationLevel || '-'}</td>
                <td>{student.parent.user.name}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingStudent(student)
                        setShowModal(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }
}

export default Students
