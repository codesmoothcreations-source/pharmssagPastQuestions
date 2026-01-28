// src/pages/Courses/CourseDetail/CourseDetail.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import PastQuestionCard from '../../../components/cards/PastQuestionCard/PastQuestionCard'
import { useCourses } from '../../../hooks/useCourses'
import { usePastQuestions } from '../../../hooks/usePastQuestions'
import { FaArrowLeft, FaBook, FaCalendar, FaUsers, FaFileAlt } from 'react-icons/fa'
import styles from './CourseDetail.module.css'

export default function CourseDetail() {
  const { id } = useParams()
  const { data: courses, isLoading: courseLoading } = useCourses()
  const { data: questions, isLoading: questionsLoading } = usePastQuestions({
    course: id,
    limit: 10
  })

  // Find the specific course by ID
  const course = courses?.find(c => c._id === id || c.code === id)

  if (courseLoading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonContent}></div>
        </div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout>
        <div className={styles.notFound}>
          <h2>Course not found</h2>
          <p>The requested course could not be found.</p>
          <Link to="/courses">
            <Button variant="primary">
              <FaArrowLeft /> Back to Courses
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.courseDetail}>
        {/* Back Navigation */}
        <div className={styles.backNavigation}>
          <Link to="/courses" className={styles.backLink}>
            <FaArrowLeft className={styles.backIcon} />
            Back to Courses
          </Link>
        </div>

        {/* Course Header */}
        <Card className={styles.courseHeader}>
          <div className={styles.headerContent}>
            <div className={styles.courseInfo}>
              <div className={styles.courseMeta}>
                <span className={`${styles.levelBadge} ${styles[`level${course.level}`]}`}>
                  Level {course.level}
                </span>
                <span className={styles.semesterBadge}>
                  {course.semester} Semester
                </span>
                <span className={styles.codeBadge}>
                  {course.code}
                </span>
              </div>
              <h1 className={styles.courseTitle}>{course.name}</h1>
              <p className={styles.courseDescription}>
                {course.description || 'Comprehensive pharmacy course covering essential topics and concepts.'}
              </p>
            </div>
            
            <div className={styles.courseStats}>
              <div className={styles.stat}>
                <FaFileAlt className={styles.statIcon} />
                <div>
                  <span className={styles.statNumber}>{course.totalQuestions || 0}</span>
                  <span className={styles.statLabel}>Past Questions</span>
                </div>
              </div>
              <div className={styles.stat}>
                <FaUsers className={styles.statIcon} />
                <div>
                  <span className={styles.statNumber}>{course.totalViews || 0}</span>
                  <span className={styles.statLabel}>Total Views</span>
                </div>
              </div>
              <div className={styles.stat}>
                <FaCalendar className={styles.statIcon} />
                <div>
                  <span className={styles.statNumber}>{course.academicYears?.length || 1}</span>
                  <span className={styles.statLabel}>Academic Years</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Course Content */}
        <div className={styles.courseContent}>
          {/* Past Questions Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaBook className={styles.sectionIcon} />
                Past Questions
              </h2>
              <Link to="/past-questions">
                <Button variant="outline" size="small">
                  View All
                </Button>
              </Link>
            </div>
            
            {questionsLoading ? (
              <div className={styles.questionsLoading}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.questionSkeleton}></div>
                ))}
              </div>
            ) : questions?.length === 0 ? (
              <Card className={styles.emptyState}>
                <div className={styles.emptyContent}>
                  <FaBook className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No Past Questions Yet</h3>
                  <p className={styles.emptyDescription}>
                    Be the first to upload past questions for this course
                  </p>
                </div>
              </Card>
            ) : (
              <div className={styles.questionsGrid}>
                {questions?.slice(0, 6).map(question => (
                  <PastQuestionCard key={question._id} question={question} />
                ))}
              </div>
            )}
          </div>

          {/* Course Details Section */}
          <div className={styles.sidebar}>
            <Card className={styles.detailsCard}>
              <h3 className={styles.detailsTitle}>Course Details</h3>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Course Code:</span>
                  <span className={styles.detailValue}>{course.code}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Level:</span>
                  <span className={styles.detailValue}>Level {course.level}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Semester:</span>
                  <span className={styles.detailValue}>{course.semester} Semester</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Credits:</span>
                  <span className={styles.detailValue}>{course.credits || 'N/A'}</span>
                </div>
                {course.department && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Department:</span>
                    <span className={styles.detailValue}>{course.department}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Academic Years */}
            {course.academicYears?.length > 0 && (
              <Card className={styles.yearsCard}>
                <h3 className={styles.yearsTitle}>Available Years</h3>
                <div className={styles.yearsList}>
                  {course.academicYears.map((year, index) => (
                    <span key={index} className={styles.yearBadge}>
                      {year}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Related Resources */}
            <Card className={styles.resourcesCard}>
              <h3 className={styles.resourcesTitle}>Related Resources</h3>
              <div className={styles.resourcesList}>
                <Link to="/videos" className={styles.resourceLink}>
                  <span className={styles.resourceText}>Video Tutorials</span>
                  <span className={styles.resourceIcon}>▶️</span>
                </Link>
                <Link to="/past-questions" className={styles.resourceLink}>
                  <span className={styles.resourceText}>All Past Questions</span>
                  <span className={styles.resourceIcon}>📚</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}