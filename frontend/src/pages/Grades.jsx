import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Filter, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Grades = () => {
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedYear, setSelectedYear] = useState('2024/2025')
  const [showModal, setShowModal] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState(null)
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    teacherId: '',
    semester: '1',
    academicYear: '2024/2025',
    midExam: '',
    finalExam: '',
    assignment: '',
    project: '',
    participation: '',
  })

  useEffect(() => {
    fetchGrades()
    fetchStudents()
    fetchSubjects()
    fetchTeachers()
  }, [selectedSemester, selectedYear])

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/api/grades', {
        params: {
          semester: selectedSemester,
          academicYear: selectedYear,
        },
      })
      setGrades(response.data)
    } catch (error) {
      console.error('Error fetching grades:', error)
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

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects')
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
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

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800'
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800'
      case 'B':
        return 'bg-blue-100 text-blue-800'
      case 'C':
        return 'bg-yellow-100 text-yellow-800'
      case 'D':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const gradeData = {
        ...formData,
        midExam: formData.midExam ? parseFloat(formData.midExam) : null,
        finalExam: formData.finalExam ? parseFloat(formData.finalExam) : null,
        assignment: formData.assignment ? parseFloat(formData.assignment) : null,
        project: formData.project ? parseFloat(formData.project) : null,
        participation: formData.participation ? parseFloat(formData.participation) : null,
      }

      if (editingGrade) {
        await axios.put(`/api/grades/${editingGrade.id}`, gradeData)
      } else {
        await axios.post('/api/grades', gradeData)
      }

      fetchGrades()
      setShowModal(false)
      setEditingGrade(null)
      setFormData({
        studentId: '',
        subjectId: '',
        teacherId: '',
        semester: '1',
        academicYear: '2024/2025',
        midExam: '',
        finalExam: '',
        assignment: '',
        project: '',
        participation: '',
      })
    } catch (error) {
      console.error('Error saving grade:', error)
      alert('Gagal menyimpan data nilai')
    }
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setFormData({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      teacherId: grade.teacherId || '',
      semester: grade.semester,
      academicYear: grade.academicYear,
      midExam: grade.midExam || '',
      finalExam: grade.finalExam || '',
      assignment: grade.assignment || '',
      project: grade.project || '',
      participation: grade.participation || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setGradeToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/grades/${gradeToDelete}`)
      fetchGrades()
      setShowDeleteModal(false)
      setGradeToDelete(null)
    } catch (error) {
      console.error('Error deleting grade:', error)
    }
  }

  const openAddModal = () => {
    setEditingGrade(null)
    setFormData({
      studentId: '',
      subjectId: '',
      teacherId: '',
      semester: selectedSemester,
      academicYear: selectedYear,
      midExam: '',
      finalExam: '',
      assignment: '',
      project: '',
      participation: '',
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data nilai...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Nilai</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Input Nilai</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input-field w-32"
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Tahun Ajaran:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input-field w-40"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Mata Pelajaran</th>
              <th>UTS</th>
              <th>UAS</th>
              <th>Tugas</th>
              <th>Proyek</th>
              <th>Partisipasi</th>
              <th>Nilai Akhir</th>
              <th>Grade</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="font-mono text-sm">{grade.student.nis}</td>
                <td className="font-medium">{grade.student.name}</td>
                <td>{grade.subject.name}</td>
                <td>{grade.midExam || '-'}</td>
                <td>{grade.finalExam || '-'}</td>
                <td>{grade.assignment || '-'}</td>
                <td>{grade.project || '-'}</td>
                <td>{grade.participation || '-'}</td>
                <td className="font-semibold">{grade.finalScore?.toFixed(2) || '-'}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade)}`}>
                    {grade.grade || '-'}
                  </span>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(grade)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(grade.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingGrade ? 'Edit Nilai' : 'Input Nilai'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Mata Pelajaran
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guru
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UTS (0-100)
                  </label>
                  <input
                    type="number"
                    name="midExam"
                    value={formData.midExam}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UAS (0-100)
                  </label>
                  <input
                    type="number"
                    name="finalExam"
                    value={formData.finalExam}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tugas (0-100)
                  </label>
                  <input
                    type="number"
                    name="assignment"
                    value={formData.assignment}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyek (0-100)
                  </label>
                  <input
                    type="number"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partisipasi (0-100)
                  </label>
                  <input
                    type="number"
                    name="participation"
                    value={formData.participation}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input-field"
                    placeholder="0-100"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingGrade(null)
                    setFormData({
                      studentId: '',
                      subjectId: '',
                      teacherId: '',
                      semester: '1',
                      academicYear: '2024/2025',
                      midExam: '',
                      finalExam: '',
                      assignment: '',
                      project: '',
                      participation: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingGrade ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus nilai ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setGradeToDelete(null)
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

export default Grades
