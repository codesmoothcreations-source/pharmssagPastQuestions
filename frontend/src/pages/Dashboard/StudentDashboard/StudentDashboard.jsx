import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import { useAuth } from '../../../contexts/AuthContext'
import { usePastQuestions } from '../../../hooks/usePastQuestions'
import { useCourses } from '../../../hooks/useCourses'
import { FaHistory, FaBook, FaDownload, FaChartLine, FaArrowRight } from 'react-icons/fa'
import styles from './StudentDashboard.module.css'

export default function StudentDashboard() {
  const { user } = useAuth()

  const { data: recentQuestionsRaw = [] } = usePastQuestions({ limit: 4, sort: '-createdAt' })
  const { data: coursesRaw = [] } = useCourses({ limit: 4 })

  
  
  // Remove _id and id from objects
  const recentQuestions = recentQuestionsRaw.map(({ _id, id, ...rest }) => rest)
  const courses = coursesRaw.map(({ _id, id, ...rest }) => rest)

  // Helper to safely render strings from objects
  const renderField = field => {
    if (React.isValidElement(field)) return field
    if (Array.isArray(field)) return field.map(renderField)
    if (field && typeof field === 'object') {
      // Try to display the most important property
      return field.name || field.title || field.code || JSON.stringify(field)
    }
    return field ?? ''
  }

  const stats = [
    { icon: <FaBook />, label: 'Courses Enrolled', value: courses.length },
    { icon: <FaDownload />, label: 'Downloads', value: user?.stats?.downloads ?? 74 },
    { icon: <FaHistory />, label: 'Questions Viewed', value: user?.stats?.questionsViewed ?? 82 },
    { icon: <FaChartLine />, label: 'Study Hours', value: user?.stats?.studyHours ?? 10 }
  ]
  
  const MAX_COURSES_TO_SHOW = 5
  const visibleCourses = courses.slice(0, MAX_COURSES_TO_SHOW)

  return (
    <Layout>
      <div className={styles.dashboard}>
        {/* Welcome Section */}
        <Card className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <div>
              <h1 className={styles.welcomeTitle}>
                Welcome back, <span className={styles.userName}>{renderField(user?.name) || 'Student'}</span>!
              </h1>
              <p className={styles.welcomeSubtitle}>
                Continue your pharmacy learning journey with personalized resources
              </p>
            </div>
            <div className={styles.userAvatar}>
              <span>{renderField(user?.name?.charAt(0))?.toUpperCase() || 'S'}</span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{renderField(stat.value)}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Past Questions */}
        <Card className={styles.recentCard}>
          <Card.Header>
            <h3 className={styles.sectionTitle}>Recent Past Questions</h3>
            <Link to="/past-questions">
              <Button variant="outline" size="small">
                View All <FaArrowRight />
              </Button>
            </Link>
          </Card.Header>
          <Card.Body>
            {recentQuestions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No recent past questions. Start exploring!</p>
                <Link to="/past-questions">
                  <Button variant="outline">Browse Past Questions</Button>
                </Link>
              </div>
            ) : (
              <div className={styles.recentList}>
                {recentQuestions.map((q, index) => (
                  <div key={index} className={styles.recentItem}>
                    <div className={styles.recentInfo}>
                      <h4 className={styles.recentTitle}>{renderField(q.title)}</h4>
                      <div className={styles.recentMeta}>
                        <span>{renderField(q.course)}</span>
                        <span>•</span>
                        <span>Level {renderField(q.level)}</span>
                        <span>•</span>
                        <span>{renderField(q.academicYear)}</span>
                      </div>
                    </div>
                    <Link to="/past-questions">
                      <Button size="small" variant="outline">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Recommended Courses */}
        <Card className={styles.recommendationsCard}>
          <Card.Header>
            <h3 className={styles.sectionTitle}>Your Courses</h3>
            <Link to="/courses">
              <Button variant="outline" size="small">Browse All</Button>
            </Link>
          </Card.Header>

          <Card.Body>
            {courses.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No courses enrolled yet.</p>
                <Link to="/courses">
                  <Button variant="outline">Explore Courses</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.coursesGrid}>
                  {visibleCourses.map((course, index) => (
                    <Link key={index} to="/courses" className={styles.courseLink}>
                      <div className={styles.courseItem}>
                        <div className={styles.courseHeader}>
                          <span className={styles.courseCode}>
                            {renderField(course.code)}
                          </span>

                          <span
                            className={`${styles.courseLevel} ${styles[`level${renderField(course.level)}`]}`}
                          >
                            L{renderField(course.level)}
                          </span>
                        </div>

                        <h4 className={styles.courseName}>
                          {renderField(course.name)}
                        </h4>

                        <div className={styles.courseStats}>
                          <span>
                            {renderField(course.stats?.totalQuestions) || 0} questions
                          </span>
                          <span>•</span>
                          <span>
                            {renderField(course.stats?.totalViews) || 0} views
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <br />
                {courses.length > MAX_COURSES_TO_SHOW && (
                  <div className={styles.viewAllWrapper}>
                    <Link to="/courses">
                      <Button variant="outline">View All Courses</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

      </div>
    </Layout>
  )
}
