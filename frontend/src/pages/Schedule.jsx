import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Edit, Trash2, Clock, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Schedule = () => {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState(null)
  const [filterClass, setFilterClass] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    day: 'MONDAY',
    startTime: '',
    endTime: '',
    room: '',
    academicYear: '2024/2025',
  })

  useEffect(() => {
    fetchSchedules()
    fetchClasses()
    fetchSubjects()
    fetchTeachers()
  }, [filterClass, filterDay])

  const fetchSchedules = async () => {
    try {
      const params = {}
      if (filterClass) params.classId = filterClass
      if (filterDay) params.day = filterDay
      const response = await axios.get('/api/schedules', { params })
      setSchedules(response.data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes')
      setClasses(response.data)
    } catch (error) {
      console.error('Error fetching classes:', error)
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

  const getDayLabel = (day) => {
    const days = {
      'MONDAY': 'Senin',
      'TUESDAY': 'Selasa',
      'WEDNESDAY': 'Rabu',
      'THURSDAY': 'Kamis',
      'FRIDAY': 'Jumat',
      'SATURDAY': 'Sabtu',
    }
    return days[day] || day
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSchedule) {
        await axios.put(`/api/schedules/${editingSchedule.id}`, formData)
      } else {
        await axios.post('/api/schedules', formData)
      }

      fetchSchedules()
      setShowModal(false)
      setEditingSchedule(null)
      setFormData({
        classId: '',
        subjectId: '',
        teacherId: '',
        day: 'MONDAY',
        startTime: '',
        endTime: '',
        room: '',
        academicYear: '2024/2025',
      })
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Gagal menyimpan jadwal pelajaran')
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      teacherId: schedule.teacherId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room || '',
      academicYear: schedule.academicYear,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    setScheduleToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/schedules/${scheduleToDelete}`)
      fetchSchedules()
      setShowDeleteModal(false)
      setScheduleToDelete(null)
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const openAddModal = () => {
    setEditingSchedule(null)
    setFormData({
      classId: '',
      subjectId: '',
      teacherId: '',
      day: 'MONDAY',
      startTime: '',
      endTime: '',
      room: '',
      academicYear: '2024/2025',
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data jadwal pelajaran...</div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jadwal Pelajaran</h1>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex space-x-4">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.educationLevel})
              </option>
            ))}
          </select>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Hari</option>
            <option value="MONDAY">Senin</option>
            <option value="TUESDAY">Selasa</option>
            <option value="WEDNESDAY">Rabu</option>
            <option value="THURSDAY">Kamis</option>
            <option value="FRIDAY">Jumat</option>
            <option value="SATURDAY">Sabtu</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Kelas</th>
              <th>Hari</th>
              <th>Waktu</th>
              <th>Mata Pelajaran</th>
              <th>Guru</th>
              <th>Ruangan</th>
              <th>Tahun Ajaran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="font-medium">{schedule.class.name}</td>
                <td>{getDayLabel(schedule.day)}</td>
                <td>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </td>
                <td>{schedule.subject.name}</td>
                <td>{schedule.teacher.user.name}</td>
                <td>{schedule.room || '-'}</td>
                <td>{schedule.academicYear}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(schedule)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(schedule.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSchedule ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      {cls.name} ({cls.educationLevel})
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
                      {subject.name} ({subject.educationLevel})
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
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name} ({teacher.educationLevel})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hari
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="MONDAY">Senin</option>
                  <option value="TUESDAY">Selasa</option>
                  <option value="WEDNESDAY">Rabu</option>
                  <option value="THURSDAY">Kamis</option>
                  <option value="FRIDAY">Jumat</option>
                  <option value="SATURDAY">Sabtu</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruangan
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: R.101"
                />
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
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSchedule(null)
                    setFormData({
                      classId: '',
                      subjectId: '',
                      teacherId: '',
                      day: 'MONDAY',
                      startTime: '',
                      endTime: '',
                      room: '',
                      academicYear: '2024/2025',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSchedule ? 'Update' : 'Simpan'}
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
              Apakah Anda yakin ingin menghapus jadwal pelajaran ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setScheduleToDelete(null)
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

export default Schedule
