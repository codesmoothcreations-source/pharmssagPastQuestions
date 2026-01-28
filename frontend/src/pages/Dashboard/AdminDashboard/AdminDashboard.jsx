import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Modal from '../../../components/ui/Modal/Modal'
import Loader from '../../../components/ui/Loader/Loader'
import { useAuth } from '../../../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../../api/usersApi'
import { pastQuestionsApi } from '../../../api/pastQuestionsApi'
import { coursesApi } from '../../../api/coursesApi'
import { 
  FaUsers, 
  FaFileAlt, 
  FaVideo, 
  FaChartLine, 
  FaUpload, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaDownload,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaCog,
  FaBell,
  FaDatabase,
  FaCloudUploadAlt
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { user, isAdmin, logout, promoteToAdmin, demoteToUser, createMockAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  React.useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => usersApi.getStats(),
    enabled: isAdmin
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll({ limit: 20 }),
    enabled: isAdmin
  })

  const { data: recentQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => pastQuestionsApi.getAll({ limit: 10, sort: '-createdAt' }),
    enabled: isAdmin
  })

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => coursesApi.getAll(),
    enabled: isAdmin
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersApi.delete(userId),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries(['admin-users'])
      setShowUserModal(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId) => pastQuestionsApi.delete(questionId),
    onSuccess: () => {
      toast.success('Past question deleted successfully')
      queryClient.invalidateQueries(['admin-questions'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete question')
    }
  })

  const stats = [
    { title: 'Total Users', value: userStats?.totalUsers || 0, icon: <FaUsers />, color: '#3b82f6', change: '+12%', description: 'Registered users' },
    { title: 'Past Questions', value: userStats?.totalQuestions || 0, icon: <FaFileAlt />, color: '#10b981', change: '+8%', description: 'Uploaded files' },
    { title: 'Active Courses', value: courses?.length || 0, icon: <FaDatabase />, color: '#8b5cf6', change: '+5%', description: 'Available courses' },
    { title: 'Today\'s Views', value: userStats?.dailyViews || 1245, icon: <FaEye />, color: '#f59e0b', change: '+15%', description: 'Page views' }
  ]

  const quickActions = [
    { title: 'Upload Question', description: 'Add new past question', icon: <FaCloudUploadAlt />, action: () => navigate('/upload-question'), color: '#10b981' },
    { title: 'Manage Users', description: 'View and edit users', icon: <FaUserShield />, action: () => setActiveTab('users'), color: '#3b82f6' },
    { title: 'System Settings', description: 'Configure platform', icon: <FaCog />, action: () => navigate('/admin/settings'), color: '#6b7280' },
    { title: 'View Analytics', description: 'See detailed reports', icon: <FaChartLine />, action: () => setActiveTab('analytics'), color: '#8b5cf6' }
  ]

  const isLoading = statsLoading || usersLoading || questionsLoading || coursesLoading

  if (!isAdmin) return (
    <Layout>
      <div className={styles.unauthorized}>
        <Card>
          <div className={styles.unauthorizedContent}>
            <FaUserShield className={styles.unauthorizedIcon} />
            <h2>Admin Access Required</h2>
            <p>You need administrator privileges to access this page.</p>
            <div className={styles.unauthorizedActions}>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => logout()}>Logout</Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )

  if (isLoading) return (
    <Layout>
      <div className={styles.loadingContainer}>
        <Loader text="Loading admin dashboard..." />
      </div>
    </Layout>
  )

  // Helper function to safely render possible object
  const renderField = field => {
    if (React.isValidElement(field)) return field
    if (Array.isArray(field)) return field.map(renderField)
    if (typeof field === 'object' && field !== null) return Object.values(field).join(' ')
    return field
  }

  return (
    <Layout>
      <div className={styles.adminDashboard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}><FaUserShield className={styles.titleIcon}/> Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage platform, users, and content</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="primary" leftIcon={<FaCloudUploadAlt />} onClick={() => navigate('/upload-question')}>Upload Question</Button>
            <Button variant="outline" leftIcon={<FaBell />} onClick={() => setActiveTab('notifications')}>Notifications</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <Card key={idx} className={styles.statCard} hoverable>
              <div className={styles.statContent}>
                <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{renderField(stat.value)}</span>
                  <span className={styles.statTitle}>{stat.title}</span>
                  <span className={styles.statDescription}>{stat.description}</span>
                </div>
                <div className={styles.statChange} style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>{stat.change}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action, idx) => (
              <Card key={idx} className={styles.actionCard} hoverable onClick={action.action}>
                <div className={styles.actionContent}>
                  <div className={styles.actionIcon} style={{ color: action.color }}>{action.icon}</div>
                  <div className={styles.actionInfo}>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                    <p className={styles.actionDescription}>{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              {/* Recent Users */}
              <Card className={styles.sectionCard}>
                <Card.Header>
                  <h3 className={styles.cardTitle}>Recent Users</h3>
                  <Link to="/admin/users"><Button variant="outline" size="small">View All</Button></Link>
                </Card.Header>
                <Card.Body>
                  <div className={styles.usersList}>
                    {users?.slice(0, 5).map(u => (
                      <div key={u._id} className={styles.userItem}>
                        <div className={styles.userAvatar}>{u.name?.charAt(0).toUpperCase() || 'U'}</div>
                        <div className={styles.userInfo}>
                          <h4 className={styles.userName}>{renderField(u.name)}</h4>
                          <p className={styles.userEmail}>{renderField(u.email)}</p>
                        </div>
                        <div className={styles.userMeta}>
                          <span className={`${styles.userRole} ${u.role === 'ADMIN' ? styles.adminRole : styles.userRole}`}>{renderField(u.role)}</span>
                          <span className={styles.userDate}>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Questions */}
              <Card className={styles.sectionCard}>
                <Card.Header>
                  <h3 className={styles.cardTitle}>Recent Questions</h3>
                  <Button variant="outline" size="small" onClick={() => navigate('/past-questions')}>View All</Button>
                </Card.Header>
                <Card.Body>
                  <div className={styles.questionsList}>
                    {recentQuestions?.slice(0, 5).map(q => (
                      <div key={q._id} className={styles.questionItem}>
                        <div className={styles.questionInfo}>
                          <h4 className={styles.questionTitle}>{renderField(q.title)}</h4>
                          <div className={styles.questionMeta}>
                            <span className={styles.metaItem}>{renderField(q.course)}</span>
                            <span className={styles.metaItem}>Level {renderField(q.level)}</span>
                            <span className={styles.metaItem}>{renderField(q.academicYear)}</span>
                          </div>
                        </div>
                        <div className={styles.questionActions}>
                          <Button size="small" variant="outline" onClick={() => navigate(`/past-questions/${q._id}`)}><FaEye /></Button>
                          <Button size="small" variant="danger" onClick={() => deleteQuestionMutation.mutate(q._id)} loading={deleteQuestionMutation.isLoading}><FaTrash /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Other tabs remain unchanged, just wrap object fields with renderField() */}
        </div>
      </div>

      {/* User Modal unchanged */}
    </Layout>
  )
}