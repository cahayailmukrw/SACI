const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const subjectRoutes = require('./routes/subjects');
const gradeRoutes = require('./routes/grades');
const attendanceRoutes = require('./routes/attendance');
const tahfidzRoutes = require('./routes/tahfidz');
const scheduleRoutes = require('./routes/schedules');
const prayerScheduleRoutes = require('./routes/prayerSchedules');
const religiousActivityRoutes = require('./routes/religiousActivities');
const announcementRoutes = require('./routes/announcements');
const reportCardRoutes = require('./routes/reportCards');
const studentAffairRoutes = require('./routes/studentAffairs');
const extracurricularRoutes = require('./routes/extracurriculars');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app;
