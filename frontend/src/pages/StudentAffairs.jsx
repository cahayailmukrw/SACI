import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Plus, Edit, Trash2, Search, Filter, CheckCircle, AlertTriangle, Award, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const StudentAffairs = () => {
  const { user } = useAuth()
  const [studentAffairs, setStudentAffairs] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterResolved, setFilterResolved] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAffair, setSelectedAffair] = useState(null)
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'VIOLATION',
    category: 'BEHAVIOR',
    title: '',
    description: '',
    severity: 'MEDIUM',
    points: '',
    actionTaken: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [affairsRes, studentsRes] = await Promise.all([
        axios.get('/api/student-affairs'),
        axios.get('/api/students')
      ])
      setStudentAffairs(affairsRes.data)
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
      if (searchTerm) params.studentId = searchTerm
      if (filterType) params.type = filterType
      if (filterCategory) params.category = filterCategory
      if (filterSeverity) params.severity = filterSeverity
      if (filterResolved !== '') params.resolved = filterResolved === 'true'

      const response = await axios.get('/api/student-affairs', { params })
      setStudentAffairs(response.data)
    } catch (error) {
      console.error('Error searching student affairs:', error)
    }
  }

  const handleAdd = () => {
    setSelectedAffair(null)
    setFormData({
      studentId: '',
      type: 'VIOLATION',
      category: 'BEHAVIOR',
      title: '',
      description: '',
      severity: 'MEDIUM',
      points: '',
      actionTaken: ''
    })
    setShowModal(true)
  }

  const handleEdit = (affair) => {
    setSelectedAffair(affair)
    setFormData({
      studentId: affair.studentId,
      type: affair.type,
      category: affair.category,
      title: affair.title,
      description: affair.description,
      severity: affair.severity,
      points: affair.points || '',
      actionTaken: affair.actionTaken || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return

    try {
      await axios.delete(`/api/student-affairs/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting student affair:', error)
    }
  }

  const handleResolve = async (id) => {
    try {
      await axios.patch(`/api/student-affairs/${id}/resolve`, { resolvedBy: user?.name || 'Admin' })
      fetchData()
    } catch (error) {
      console.error('Error resolving student affair:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedAffair) {
        await axios.put(`/api/student-affairs/${selectedAffair.id}`, formData)
      } else {
        await axios.post('/api/student-affairs', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving student affair:', error)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return <Award className="w-5 h-5 text-green-600" />
      case 'VIOLATION':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'COMMENDATION':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return 'Prestasi'
      case 'VIOLATION':
        return 'Pelanggaran'
      case 'WARNING':
        return 'Peringatan'
      case 'COMMENDATION':
        return 'Pujian'
      default:
        return type
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'ACADEMIC':
        return 'Akademik'
      case 'BEHAVIOR':
        return 'Perilaku'
      case 'DISCIPLINE':
        return 'Disiplin'
      case 'ATTENDANCE':
        return 'Kehadiran'
      default:
        return category
    }
  }

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'LOW':
        return 'Rendah'
      case 'MEDIUM':
        return 'Sedang'
      case 'HIGH':
        return 'Tinggi'
      case 'CRITICAL':
        return 'Kritis'
      default:
        return severity
    }
  }

  const filteredAffairs = studentAffairs.filter(affair => {
    const student = students.find(s => s.id === affair.studentId)
    const studentName = student ? student.name.toLowerCase() : ''
    const searchLower = searchTerm.toLowerCase()
    
    return (
      studentName.includes(searchLower) ||
      affair.title.toLowerCase().includes(searchLower)
    ) && (!filterType || affair.type === filterType) &&
           (!filterCategory || affair.category === filterCategory) &&
           (!filterSeverity || affair.severity === filterSeverity) &&
           (filterResolved === '' || affair.resolved === (filterResolved === 'true'))
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
        <h1 className="text-3xl font-bold text-gray-900">Kesiswaan</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Data</span>
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
                placeholder="Cari siswa atau judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Tipe</option>
            <option value="ACHIEVEMENT">Prestasi</option>
            <option value="VIOLATION">Pelanggaran</option>
            <option value="WARNING">Peringatan</option>
            <option value="COMMENDATION">Pujian</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            <option value="ACADEMIC">Akademik</option>
            <option value="BEHAVIOR">Perilaku</option>
            <option value="DISCIPLINE">Disiplin</option>
            <option value="ATTENDANCE">Kehadiran</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Tingkat</option>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
            <option value="CRITICAL">Kritis</option>
          </select>
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="false">Belum Selesai</option>
            <option value="true">Selesai</option>
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

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Siswa</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipe</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Judul</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tingkat</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Poin</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAffairs.map((affair) => {
              const student = students.find(s => s.id === affair.studentId)
              return (
                <tr key={affair.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{student?.name || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(affair.type)}
                      <span>{getTypeLabel(affair.type)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getCategoryLabel(affair.category)}</td>
                  <td className="py-3 px-4">{affair.title}</td>
                  <td className="py-3 px-4">{getSeverityLabel(affair.severity)}</td>
                  <td className="py-3 px-4">{affair.points || '-'}</td>
                  <td className="py-3 px-4">{new Date(affair.date).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4">
                    {affair.resolved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Selesai</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Belum Selesai</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {user?.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => handleEdit(affair)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {!affair.resolved && (
                            <button
                              onClick={() => handleResolve(affair.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Selesaikan"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(affair.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedAffair ? 'Edit Data Kesiswaan' : 'Tambah Data Kesiswaan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Siswa</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="ACHIEVEMENT">Prestasi</option>
                    <option value="VIOLATION">Pelanggaran</option>
                    <option value="WARNING">Peringatan</option>
                    <option value="COMMENDATION">Pujian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="ACADEMIC">Akademik</option>
                    <option value="BEHAVIOR">Perilaku</option>
                    <option value="DISCIPLINE">Disiplin</option>
                    <option value="ATTENDANCE">Kehadiran</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi</option>
                    <option value="CRITICAL">Kritis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poin</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tindakan yang Diambil</label>
                <textarea
                  value={formData.actionTaken}
                  onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                />
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
    </div>
  )
}

export default StudentAffairs
