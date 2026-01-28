// src/routes/AppRoutes.jsx - Updated
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Loader from '../components/ui/Loader/Loader'

// Lazy load all pages
const Home = React.lazy(() => import('../pages/Home/Home'))
const Login = React.lazy(() => import('../pages/Auth/Login/Login'))
const Register = React.lazy(() => import('../pages/Auth/Register/Register'))
const ForgotPassword = React.lazy(() => import('../pages/Auth/ForgotPassword/ForgotPassword'))
const CoursesList = React.lazy(() => import('../pages/Courses/CoursesList/CoursesList'))
const CourseDetail = React.lazy(() => import('../pages/Courses/CourseDetail/CourseDetail'))
const PastQuestionsList = React.lazy(() => import('../pages/PastQuestions/PastQuestionsList/PastQuestionsList'))
const PastQuestionDetail = React.lazy(() => import('../pages/PastQuestions/PastQuestionDetail/PastQuestionDetail'))
const UploadPastQuestion = React.lazy(() => import('../pages/PastQuestions/UploadPastQuestion/UploadPastQuestion'))
const VideosList = React.lazy(() => import('../pages/Videos/VideosList/VideosList'))
const VideoDetail = React.lazy(() => import('../pages/Videos/VideoDetail/VideoDetail'))
const StudentDashboard = React.lazy(() => import('../pages/Dashboard/StudentDashboard/StudentDashboard'))
const AdminDashboard = React.lazy(() => import('../pages/Dashboard/AdminDashboard/AdminDashboard'))
const AdminUsers = React.lazy(() => import('../pages/Admin/Users/UsersList'))
const AdminAnalytics = React.lazy(() => import('../pages/Admin/Analytics/Analytics'))
const AdminUploadManager = React.lazy(() => import('../pages/Admin/UploadManager/UploadManager'))
const Profile = React.lazy(() => import('../pages/Dashboard/Profile/Profile'))
const NotFound = React.lazy(() => import('../pages/Error/NotFound/NotFound'))

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes (no login required) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected routes (login required but don't auto-logout on 401) */}
      <Route path="/courses" element={
        <ProtectedRoute>
          <CoursesList />
        </ProtectedRoute>
      } />
      
      <Route path="/courses/:id" element={
        <ProtectedRoute>
          <CourseDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/past-questions" element={
        <ProtectedRoute>
          <PastQuestionsList />
        </ProtectedRoute>
      } />
      
      <Route path="/past-questions/:id" element={
        <ProtectedRoute>
          <PastQuestionDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/videos" element={
        <ProtectedRoute>
          <VideosList />
        </ProtectedRoute>
      } />
      
      <Route path="/videos/:id" element={
        <ProtectedRoute>
          <VideoDetail />
        </ProtectedRoute>
      } />
      
      {/* Dashboard routes - require auth */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Admin only routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly>
          <AdminUsers />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/analytics" element={
        <ProtectedRoute adminOnly>
          <AdminAnalytics />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/uploads" element={
        <ProtectedRoute adminOnly>
          <AdminUploadManager />
        </ProtectedRoute>
      } />
      
      <Route path="/upload-question" element={
        <ProtectedRoute adminOnly>
          <UploadPastQuestion />
        </ProtectedRoute>
      } />
      
      {/* Error routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}