import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trophy, Plus, Edit, Trash2, Search, Filter, Users, DollarSign, Clock, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Extracurricular = () => {
  const { user } = useAuth()
  const [extracurriculars, setExtracurriculars] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedExtracurricular, setSelectedExtracurricular] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'SPORTS',
    description: '',
    schedule: '',
    instructor: '',
    fee: '',
    maxStudents: ''
  })
  const [enrollFormData, setEnrollFormData] = useState({
    studentId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [extracurricularsRes, studentsRes] = await Promise.all([
        axios.get('/api/extracurriculars'),
        axios.get('/api/students')
      ])
      setExtracurriculars(extracurricularsRes.data)
      setStudents(studentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      const params = {}
      if (searchTerm) params.name = searchTerm
      if (filterCategory) params.category = filterCategory
      if (filterActive !== '') params.isActive = filterActive === 'true'

      const response = await axios.get('/api/extracurriculars', { params })
      setExtracurriculars(response.data)
    } catch (error) {
      console.error('Error searching extracurriculars:', error)
    }
  }

  const handleAdd = () => {
    setSelectedExtracurricular(null)
    setFormData({
      name: '',
      category: 'SPORTS',
      description: '',
      schedule: '',
      instructor: '',
      fee: '',
      maxStudents: ''
    })
    setShowModal(true)
  }

  const handleEdit = (extracurricular) => {
    setSelectedExtracurricular(extracurricular)
    setFormData({
      name: extracurricular.name,
      category: extracurricular.category,
      description: extracurricular.description || '',
      schedule: extracurricular.schedule || '',
      instructor: extracurricular.instructor || '',
      fee: extracurricular.fee || '',
      maxStudents: extracurricular.maxStudents || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return

    try {
      await axios.delete(`/api/extracurriculars/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting extracurricular:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedExtracurricular) {
        await axios.put(`/api/extracurriculars/${selectedExtracurricular.id}`, formData)
      } else {
        await axios.post('/api/extracurriculars', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving extracurricular:', error)
    }
  }

  const handleEnroll = (extracurricular) => {
    setSelectedExtracurricular(extracurricular)
    setEnrollFormData({ studentId: '' })
    setShowEnrollModal(true)
  }

  const handleEnrollSubmit = async (e) => {
    e.preventDefault()

    try {
      await axios.post(`/api/extracurriculars/${selectedExtracurricular.id}/enroll`, enrollFormData)
      setShowEnrollModal(false)
      fetchData()
    } catch (error) {
      console.error('Error enrolling student:', error)
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'SPORTS':
        return 'Olahraga'
      case 'ARTS':
        return 'Seni'
      case 'ACADEMIC':
        return 'Akademik'
      case 'RELIGIOUS':
        return 'Keagamaan'
      case 'SKILLS':
        return 'Keterampilan'
      default:
        return category
    }
  }

  const filteredExtracurriculars = extracurriculars.filter(extracurricular => {
    const searchLower = searchTerm.toLowerCase()
    return (
      extracurricular.name.toLowerCase().includes(searchLower) ||
      (extracurricular.description && extracurricular.description.toLowerCase().includes(searchLower))
    ) && (!filterCategory || extracurricular.category === filterCategory) &&
           (filterActive === '' || extracurricular.isActive === (filterActive === 'true'))
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ekstrakurikuler</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Kegiatan</span>
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            <option value="SPORTS">Olahraga</option>
            <option value="ARTS">Seni</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="RELIGIOUS">Keagamaan</option>
            <option value="SKILLS">Keterampilan</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExtracurriculars.map((extracurricular) => (
          <div key={extracurricular.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Trophy className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{extracurricular.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${extracurricular.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {extracurricular.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">Kategori:</span>
                <span>{getCategoryLabel(extracurricular.category)}</span>
              </div>
              {extracurricular.description && (
                <p className="text-sm text-gray-600">{extracurricular.description}</p>
              )}
              {extracurricular.schedule && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{extracurricular.schedule}</span>
                </div>
              )}
              {extracurricular.instructor && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{extracurricular.instructor}</span>
                </div>
              )}
              {extracurricular.fee && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Rp {parseFloat(extracurricular.fee).toLocaleString('id-ID')}</span>
                </div>
              )}
              {extracurricular.maxStudents && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Maksimal {extracurricular.maxStudents} siswa</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{extracurricular.enrollments?.length || 0} siswa terdaftar</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => handleEdit(extracurricular)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(extracurricular.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </>
              )}
              <button
                onClick={() => handleEnroll(extracurricular)}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Daftar Siswa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedExtracurricular ? 'Edit Kegiatan Ekstrakurikuler' : 'Tambah Kegiatan Ekstrakurikuler'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="SPORTS">Olahraga</option>
                  <option value="ARTS">Seni</option>
                  <option value="ACADEMIC">Akademik</option>
                  <option value="RELIGIOUS">Keagamaan</option>
                  <option value="SKILLS">Keterampilan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Contoh: Senin, 15:00-17:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instruktur</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (Rp)</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal Siswa</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEnrollModal && selectedExtracurricular && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Daftar Siswa ke {selectedExtracurricular.name}</h2>
            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa</label>
                <select
                  value={enrollFormData.studentId}
                  onChange={(e) => setEnrollFormData({...enrollFormData, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Siswa</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Extracurricular
