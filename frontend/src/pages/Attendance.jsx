import { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, Check, X, Clock, FileText, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Attendance = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    notes: '',
  })

  useEffect(() => {
    fetchAttendance()
    fetchStudents()
    fetchTeachers()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance', {
        params: { date: selectedDate },
      })
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
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

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers')
      setTeachers(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Check className="w-5 h-5 text-green-600" />
      case 'ABSENT':
        return <X className="w-5 h-5 text-red-600" />
      case 'LATE':
        return <Clock className="w-5 h-5 text-orange-600" />
      case 'EXCUSED':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'SICK':
        return <FileText className="w-5 h-5 text-purple-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'Hadir'
      case 'ABSENT':
        return 'Tidak Hadir'
      case 'LATE':
        return 'Terlambat'
      case 'EXCUSED':
        return 'Izin'
      case 'SICK':
        return 'Sakit'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800'
      case 'ABSENT':
        return 'bg-red-100 text-red-800'
      case 'LATE':
        return 'bg-orange-100 text-orange-800'
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800'
      case 'SICK':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const attendanceData = {
        studentId: formData.studentId,
        teacherId: formData.teacherId,
        date: formData.date,
        status: formData.status,
        notes: formData.notes,
      }
      await axios.post('/api/attendance', attendanceData)
      fetchAttendance()
      setShowModal(false)
      setFormData({
        studentId: '',
        teacherId: user?.role === 'TEACHER' ? teachers.find(t => t.userId === user.id)?.id : '',
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        notes: '',
      })
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Gagal menyimpan data absensi')
    }
  }

  const openAddModal = () => {
    setFormData({
      studentId: '',
      teacherId: user?.role === 'TEACHER' ? teachers.find(t => t.userId === user.id)?.id : '',
      date: selectedDate,
      status: 'PRESENT',
      notes: '',
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data absensi...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Absensi Siswa</h1>
        {['ADMIN', 'TEACHER'].includes(user?.role) && (
          <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Absensi</span>
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Tanggal:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Guru</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td className="font-mono text-sm">{record.student.nis}</td>
                <td className="font-medium">{record.student.name}</td>
                <td>{record.teacher.user.name}</td>
                <td>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                </td>
                <td className="text-sm text-gray-600">{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Tambah Absensi</h2>
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
                  Guru
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  disabled={user?.role === 'TEACHER'}
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </option>
                  ))}
                </select>
                {user?.role === 'TEACHER' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Guru otomatis diisi berdasarkan akun yang login
                  </p>
                )}
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
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="PRESENT">Hadir</option>
                  <option value="ABSENT">Tidak Hadir</option>
                  <option value="LATE">Terlambat</option>
                  <option value="EXCUSED">Izin</option>
                  <option value="SICK">Sakit</option>
                </select>
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
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({
                      studentId: '',
                      teacherId: user?.role === 'TEACHER' ? teachers.find(t => t.userId === user.id)?.id : '',
                      date: new Date().toISOString().split('T')[0],
                      status: 'PRESENT',
                      notes: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
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

export default Attendance
