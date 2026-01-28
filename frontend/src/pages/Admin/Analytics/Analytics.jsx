// src/pages/Admin/Analytics/Analytics.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Loader from '../../../components/ui/Loader/Loader'
import { useAuth } from '../../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../../api/usersApi'
import { pastQuestionsApi } from '../../../api/pastQuestionsApi'
import {
  FaChartLine,
  FaUsers,
  FaFileAlt,
  FaEye,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaDatabase,
  FaUserShield
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './Analytics.module.css'

export default function Analytics() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Fetch analytics data
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => usersApi.getStats(),
    enabled: isAdmin
  })

  const { data: questionStats, isLoading: questionsLoading } = useQuery({
    queryKey: ['admin-question-stats'],
    queryFn: () => pastQuestionsApi.getStats(),
    enabled: isAdmin
  })

  const isLoading = statsLoading || questionsLoading

  if (!isAdmin) {
    return (
      <Layout>
        <div className={styles.unauthorized}>
          <Card>
            <div className={styles.unauthorizedContent}>
              <FaUserShield className={styles.unauthorizedIcon} />
              <h2>Admin Access Required</h2>
              <p>You need administrator privileges to access this page.</p>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader text="Loading analytics..." />
        </div>
      </Layout>
    )
  }

  const stats = [
    {
      title: 'Total Users',
      value: userStats?.total || 0,
      change: '+12%',
      trend: 'up',
      icon: <FaUsers />,
      color: '#3b82f6',
      description: 'Registered users'
    },
    {
      title: 'Active Users',
      value: userStats?.active || 0,
      change: '+8%',
      trend: 'up',
      icon: <FaUsers />,
      color: '#10b981',
      description: 'Active in last 30 days'
    },
    {
      title: 'Past Questions',
      value: questionStats?.total || 0,
      change: '+15%',
      trend: 'up',
      icon: <FaFileAlt />,
      color: '#8b5cf6',
      description: 'Total uploaded'
    },
    {
      title: 'Total Views',
      value: questionStats?.totalViews || 0,
      change: '+23%',
      trend: 'up',
      icon: <FaEye />,
      color: '#f59e0b',
      description: 'All time views'
    },
    {
      title: 'Total Downloads',
      value: questionStats?.totalDownloads || 0,
      change: '+18%',
      trend: 'up',
      icon: <FaDownload />,
      color: '#ef4444',
      description: 'All time downloads'
    },
    {
      title: 'Recent Registrations',
      value: userStats?.recentRegistrations || 0,
      change: userStats?.registrationRate || '0%',
      trend: 'up',
      icon: <FaDatabase />,
      color: '#06b6d4',
      description: 'Last 30 days'
    }
  ]

  const roleDistribution = userStats?.byRole || {}
  const topStats = [
    {
      label: 'User Growth Rate',
      value: userStats?.registrationRate || '0%',
      description: 'New users this month'
    },
    {
      label: 'Activity Rate',
      value: userStats?.activityRate || '0%',
      description: 'Active users percentage'
    },
    {
      label: 'Average Views per Question',
      value: questionStats?.totalQuestions
        ? Math.round((questionStats.totalViews || 0) / questionStats.totalQuestions)
        : 0,
      description: 'Engagement metric'
    }
  ]

  return (
    <Layout>
      <div className={styles.analytics}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <FaChartLine className={styles.titleIcon} />
              Platform Analytics
            </h1>
            <p className={styles.subtitle}>
              Comprehensive insights into platform performance
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} className={styles.statCard} hoverable>
              <div className={styles.statContent}>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
                  <span className={styles.statTitle}>{stat.title}</span>
                  <span className={styles.statDescription}>{stat.description}</span>
                </div>
                <div
                  className={`${styles.statChange} ${
                    stat.trend === 'up' ? styles.trendUp : styles.trendDown
                  }`}
                >
                  {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  {stat.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* User Distribution */}
          <Card className={styles.chartCard}>
            <Card.Header>
              <h3 className={styles.cardTitle}>User Distribution by Role</h3>
            </Card.Header>
            <Card.Body>
              <div className={styles.roleDistribution}>
                {Object.entries(roleDistribution).map(([role, count]) => (
                  <div key={role} className={styles.roleItem}>
                    <div className={styles.roleInfo}>
                      <span className={styles.roleName}>{role}</span>
                      <span className={styles.roleCount}>{count} users</span>
                    </div>
                    <div className={styles.roleBar}>
                      <div
                        className={styles.roleBarFill}
                        style={{
                          width: `${(count / (userStats?.total || 1)) * 100}%`,
                          backgroundColor:
                            role === 'ADMIN' ? '#3b82f6' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Key Metrics */}
          <Card className={styles.chartCard}>
            <Card.Header>
              <h3 className={styles.cardTitle}>Key Performance Metrics</h3>
            </Card.Header>
            <Card.Body>
              <div className={styles.metricsList}>
                {topStats.map((metric, index) => (
                  <div key={index} className={styles.metricItem}>
                    <div className={styles.metricLabel}>{metric.label}</div>
                    <div className={styles.metricValue}>{metric.value}</div>
                    <div className={styles.metricDescription}>{metric.description}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className={styles.additionalStats}>
          <Card>
            <Card.Header>
              <h3 className={styles.cardTitle}>Platform Overview</h3>
            </Card.Header>
            <Card.Body>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>Inactive Users</div>
                  <div className={styles.overviewValue}>
                    {userStats?.inactive || 0}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>Active Recently</div>
                  <div className={styles.overviewValue}>
                    {userStats?.activeRecently || 0}
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewLabel}>Last Updated</div>
                  <div className={styles.overviewValue}>
                    {userStats?.updatedAt
                      ? new Date(userStats.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

