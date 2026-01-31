// src/pages/Home/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout/Layout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import CourseCard from '../../components/cards/CourseCard/CourseCard'
import { useCourses } from '../../hooks/useCourses'
import {
  FaSearch,
  FaBookMedical,
  FaVideo,
  FaUsers
} from 'react-icons/fa'
import styles from './Home.module.css'

export default function Home() {
  const { data: courses = [], isLoading, error } = useCourses({ limit: 6 })

  const features = [
    {
      icon: <FaBookMedical aria-hidden />,
      title: 'Comprehensive Past Questions',
      description:
        'Access past exam papers from all pharmacy levels and courses'
    },
    {
      icon: <FaVideo aria-hidden />,
      title: 'Educational Videos',
      description:
        'Learn from curated pharmacy tutorials and lectures'
    },
    {
      icon: <FaSearch aria-hidden />,
      title: 'Advanced Search',
      description:
        'Quickly find resources by course, year, or keyword'
    },
    {
      icon: <FaUsers aria-hidden />,
      title: 'Community Driven',
      description:
        'Contribute and help fellow pharmacy students succeed'
    }
  ]

  return (
    <Layout>
      <main className={styles.home}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Welcome to <span className={styles.highlight}>Pharmssag</span>
            </h1>

            <p className={styles.heroSubtitle}>
              A calm, reliable space for pharmacy past questions,
              study materials, and academic resources.
            </p>

            <div className={styles.heroActions}>
              <Button
                variant="primary"
                size="large"
                as={Link}
                to="/courses"
              >
                Browse Courses
              </Button>

              <Button
                variant="outline"
                size="large"
                as={Link}
                to="/past-questions"
              >
                View Past Questions
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Why Choose Pharmssag?
            </h2>
            <p className={styles.sectionSubtitle}>
              Designed for focus, speed, and academic success
            </p>
          </header>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <article key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>
                  {feature.title}
                </h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Courses */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Popular Courses
            </h2>
            <p className={styles.sectionSubtitle}>
              Most accessed pharmacy courses
            </p>
          </header>

          {error && (
            <div
              className={styles.stateMessage}
              role="alert"
            >
              Unable to load courses. Please try again later.
            </div>
          )}

          {!error && (
            <>
              <div className={styles.coursesGrid}>
                {isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.courseSkeleton} />
                  ))}

                {!isLoading && courses.length === 0 && (
                  <div className={styles.stateMessage}>
                    No courses available yet.
                  </div>
                )}

                {!isLoading &&
                  courses.map(course => (
                    <Link
                      key={course._id || course.id}
                      to={`/courses/${course.slug || course._id}`}
                      className={styles.courseLink}
                      aria-label={`View ${course.title} course`}
                    >
                      <CourseCard course={course} />
                    </Link>
                  ))}
              </div>


              {courses.length > 0 && (
                <div className={styles.centerAction}>
                  <Button
                    variant="primary"
                    size="large"
                    as={Link}
                    to="/courses"
                  >
                    View All Courses
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Stats */}
        <section className={styles.statsSection}>
          <Card className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <strong>500+</strong>
                <span>Past Questions</span>
              </div>
              <div className={styles.stat}>
                <strong>100+</strong>
                <span>Courses</span>
              </div>
              <div className={styles.stat}>
                <strong>50+</strong>
                <span>Video Tutorials</span>
              </div>
              <div className={styles.stat}>
                <strong>1000+</strong>
                <span>Students</span>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </Layout>
  )
}
