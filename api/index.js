const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('../backend/src/routes/auth');
const studentRoutes = require('../backend/src/routes/students');
const teacherRoutes = require('../backend/src/routes/teachers');
const classRoutes = require('../backend/src/routes/classes');
const subjectRoutes = require('../backend/src/routes/subjects');
const gradeRoutes = require('../backend/src/routes/grades');
const attendanceRoutes = require('../backend/src/routes/attendance');
const tahfidzRoutes = require('../backend/src/routes/tahfidz');
const scheduleRoutes = require('../backend/src/routes/schedules');
const prayerScheduleRoutes = require('../backend/src/routes/prayerSchedules');
const religiousActivityRoutes = require('../backend/src/routes/religiousActivities');
const announcementRoutes = require('../backend/src/routes/announcements');
const reportCardRoutes = require('../backend/src/routes/reportCards');
const studentAffairRoutes = require('../backend/src/routes/studentAffairs');
const extracurricularRoutes = require('../backend/src/routes/extracurriculars');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tahfidz', tahfidzRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/prayer-schedules', prayerScheduleRoutes);
app.use('/api/religious-activities', religiousActivityRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/report-cards', reportCardRoutes);
app.use('/api/student-affairs', studentAffairRoutes);
app.use('/api/extracurriculars', extracurricularRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistem Akademik Cahaya Ilmu API is running' });
});

module.exports = app;
