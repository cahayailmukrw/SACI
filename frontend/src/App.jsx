import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import Grades from './pages/Grades'
import Attendance from './pages/Attendance'
import Tahfidz from './pages/Tahfidz'
import Schedule from './pages/Schedule'
import PrayerSchedule from './pages/PrayerSchedule'
import ReligiousActivities from './pages/ReligiousActivities'
import Announcements from './pages/Announcements'
import ChangePassword from './pages/ChangePassword'
import Rapor from './pages/Rapor'
import StudentAffairs from './pages/StudentAffairs'
import Extracurricular from './pages/Extracurricular'
import Layout from './components/Layout'
import { useAuth } from './contexts/AuthContext'
import { AuthProvider } from './contexts/AuthContext'

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/students"
          element={
            isAuthenticated ? (
              <Layout>
                <Students />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/teachers"
          element={
            isAuthenticated ? (
              <Layout>
                <Teachers />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/classes"
          element={
            isAuthenticated ? (
              <Layout>
                <Classes />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/subjects"
          element={
            isAuthenticated ? (
              <Layout>
                <Subjects />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/grades"
          element={
            isAuthenticated ? (
              <Layout>
                <Grades />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/attendance"
          element={
            isAuthenticated ? (
              <Layout>
                <Attendance />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/tahfidz"
          element={
            isAuthenticated ? (
              <Layout>
                <Tahfidz />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/schedule"
          element={
            isAuthenticated ? (
              <Layout>
                <Schedule />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/prayer-schedule"
          element={
            isAuthenticated ? (
              <Layout>
                <PrayerSchedule />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/religious-activities"
          element={
            isAuthenticated ? (
              <Layout>
                <ReligiousActivities />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/announcements"
          element={
            isAuthenticated ? (
              <Layout>
                <Announcements />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            isAuthenticated ? (
              <Layout>
                <ChangePassword />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/report-cards"
          element={
            isAuthenticated ? (
              <Layout>
                <Rapor />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/student-affairs"
          element={
            isAuthenticated ? (
              <Layout>
                <StudentAffairs />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/extracurriculars"
          element={
            isAuthenticated ? (
              <Layout>
                <Extracurricular />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
