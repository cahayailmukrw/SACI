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

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/classes', classRoutes);
app.use('/subjects', subjectRoutes);
app.use('/grades', gradeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/tahfidz', tahfidzRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/prayer-schedules', prayerScheduleRoutes);
app.use('/religious-activities', religiousActivityRoutes);
app.use('/announcements', announcementRoutes);
app.use('/report-cards', reportCardRoutes);
app.use('/student-affairs', studentAffairRoutes);
app.use('/extracurriculars', extracurricularRoutes);

app.get('/health', (req, res) => {
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
