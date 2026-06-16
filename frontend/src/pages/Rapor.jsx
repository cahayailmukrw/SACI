import { useEffect, useState } from 'react'
import axios from 'axios'
import { FileText, Plus, Edit, Trash2, Search, Filter, Download, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Rapor = () => {
  const { user } = useAuth()
  const [reportCards, setReportCards] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterAcademicYear, setFilterAcademicYear] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [formData, setFormData] = useState({
    studentId: '',
    semester: '',
    academicYear: '2024/2025',
    classId: '',
    classRank: '',
    gradeAverage: '',
    behaviorGrade: 'A',
    behaviorNotes: '',
    attendanceRate: '',
    totalAbsence: '',
    principalNotes: '',
    parentNotes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [reportCardsRes, studentsRes, classesRes] = await Promise.all([
        axios.get('/api/report-cards'),
        axios.get('/api/students'),
        axios.get('/api/classes')
      ])
      setReportCards(reportCardsRes.data)
      setStudents(studentsRes.data)
      setClasses(classesRes.data)
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
      if (filterSemester) params.semester = filterSemester
      if (filterAcademicYear) params.academicYear = filterAcademicYear
      if (filterClass) params.classId = filterClass

      const response = await axios.get('/api/report-cards', { params })
      setReportCards(response.data)
    } catch (error) {
      console.error('Error searching report cards:', error)
    }
  }

  const handleAdd = () => {
    setSelectedReportCard(null)
    setFormData({
      studentId: '',
      semester: '',
      academicYear: '2024/2025',
      classId: '',
      classRank: '',
      gradeAverage: '',
      behaviorGrade: 'A',
      behaviorNotes: '',
      attendanceRate: '',
      totalAbsence: '',
      principalNotes: '',
      parentNotes: ''
    })
    setShowModal(true)
  }

  const handleEdit = (reportCard) => {
    setSelectedReportCard(reportCard)
    setFormData({
      studentId: reportCard.studentId,
      semester: reportCard.semester,
      academicYear: reportCard.academicYear,
      classId: reportCard.classId || '',
      classRank: reportCard.classRank || '',
      gradeAverage: reportCard.gradeAverage || '',
      behaviorGrade: reportCard.behaviorGrade || 'A',
      behaviorNotes: reportCard.behaviorNotes || '',
      attendanceRate: reportCard.attendanceRate || '',
      totalAbsence: reportCard.totalAbsence || '',
      principalNotes: reportCard.principalNotes || '',
      parentNotes: reportCard.parentNotes || ''
    })
    setShowModal(true)
  }

  const handleView = (reportCard) => {
    setSelectedReportCard(reportCard)
    setShowViewModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rapor ini?')) return

    try {
      await axios.delete(`/api/report-cards/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting report card:', error)
    }
  }

  const handlePublish = async (id) => {
    try {
      await axios.patch(`/api/report-cards/${id}/publish`)
      fetchData()
    } catch (error) {
      console.error('Error publishing report card:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedReportCard) {
        await axios.put(`/api/report-cards/${selectedReportCard.id}`, formData)
      } else {
        await axios.post('/api/report-cards', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving report card:', error)
    }
  }

  const filteredReportCards = reportCards.filter(rc => {
    const student = students.find(s => s.id === rc.studentId)
    const studentName = student ? student.name.toLowerCase() : ''
    const searchLower = searchTerm.toLowerCase()
    
    return (
      studentName.includes(searchLower) ||
      rc.academicYear.toLowerCase().includes(searchLower)
    ) && (!filterSemester || rc.semester === parseInt(filterSemester)) &&
           (!filterAcademicYear || rc.academicYear === filterAcademicYear) &&
           (!filterClass || rc.classId === filterClass)
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
        <h1 className="text-3xl font-bold text-gray-900">Rapor</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Rapor</span>
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
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select
            value={filterAcademicYear}
            onChange={(e) => setFilterAcademicYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Tahun Ajaran</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Semua Kelas</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
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
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Semester</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tahun Ajaran</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Kelas</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rata-rata</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Perilaku</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredReportCards.map((reportCard) => {
              const student = students.find(s => s.id === reportCard.studentId)
              const cls = classes.find(c => c.id === reportCard.classId)
              return (
                <tr key={reportCard.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{student?.name || '-'}</td>
                  <td className="py-3 px-4">Semester {reportCard.semester}</td>
                  <td className="py-3 px-4">{reportCard.academicYear}</td>
                  <td className="py-3 px-4">{cls?.name || '-'}</td>
                  <td className="py-3 px-4">{reportCard.gradeAverage || '-'}</td>
                  <td className="py-3 px-4">{reportCard.behaviorGrade || '-'}</td>
                  <td className="py-3 px-4">
                    {reportCard.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Diterbitkan</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Draft</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(reportCard)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Lihat"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => handleEdit(reportCard)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {!reportCard.isPublished && (
                            <button
                              onClick={() => handlePublish(reportCard.id)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Terbitkan"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(reportCard.id)}
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
              {selectedReportCard ? 'Edit Rapor' : 'Tambah Rapor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peringkat Kelas</label>
                  <input
                    type="number"
                    value={formData.classRank}
                    onChange={(e) => setFormData({...formData, classRank: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rata-rata Nilai</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gradeAverage}
                    onChange={(e) => setFormData({...formData, gradeAverage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Perilaku</label>
                  <select
                    value={formData.behaviorGrade}
                    onChange={(e) => setFormData({...formData, behaviorGrade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="A">A (Sangat Baik)</option>
                    <option value="B">B (Baik)</option>
                    <option value="C">C (Cukup)</option>
                    <option value="D">D (Kurang)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Persentase Kehadiran</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.attendanceRate}
                    onChange={(e) => setFormData({...formData, attendanceRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Ketidakhadiran</label>
                  <input
                    type="number"
                    value={formData.totalAbsence}
                    onChange={(e) => setFormData({...formData, totalAbsence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Perilaku</label>
                <textarea
                  value={formData.behaviorNotes}
                  onChange={(e) => setFormData({...formData, behaviorNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Kepala Sekolah</label>
                <textarea
                  value={formData.principalNotes}
                  onChange={(e) => setFormData({...formData, principalNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Orang Tua</label>
                <textarea
                  value={formData.parentNotes}
                  onChange={(e) => setFormData({...formData, parentNotes: e.target.value})}
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

      {showViewModal && selectedReportCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Rapor</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                const student = students.find(s => s.id === selectedReportCard.studentId)
                const cls = classes.find(c => c.id === selectedReportCard.classId)
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Nama Siswa</p>
                        <p className="font-semibold">{student?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Semester</p>
                        <p className="font-semibold">Semester {selectedReportCard.semester}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tahun Ajaran</p>
                        <p className="font-semibold">{selectedReportCard.academicYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kelas</p>
                        <p className="font-semibold">{cls?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Peringkat Kelas</p>
                        <p className="font-semibold">{selectedReportCard.classRank || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                        <p className="font-semibold">{selectedReportCard.gradeAverage || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nilai Perilaku</p>
                        <p className="font-semibold">{selectedReportCard.behaviorGrade || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Persentase Kehadiran</p>
                        <p className="font-semibold">{selectedReportCard.attendanceRate ? `${selectedReportCard.attendanceRate}%` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Ketidakhadiran</p>
                        <p className="font-semibold">{selectedReportCard.totalAbsence || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-semibold">
                          {selectedReportCard.isPublished ? 'Diterbitkan' : 'Draft'}
                        </p>
                      </div>
                    </div>
                    {selectedReportCard.behaviorNotes && (
                      <div>
                        <p className="text-sm text-gray-600">Catatan Perilaku</p>
                        <p className="font-semibold">{selectedReportCard.behaviorNotes}</p>
                      </div>
                    )}
                    {selectedReportCard.principalNotes && (
                      <div>
                        <p className="text-sm text-gray-600">Catatan Kepala Sekolah</p>
                        <p className="font-semibold">{selectedReportCard.principalNotes}</p>
                      </div>
                    )}
                    {selectedReportCard.parentNotes && (
                      <div>
                        <p className="text-sm text-gray-600">Catatan Orang Tua</p>
                        <p className="font-semibold">{selectedReportCard.parentNotes}</p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rapor
