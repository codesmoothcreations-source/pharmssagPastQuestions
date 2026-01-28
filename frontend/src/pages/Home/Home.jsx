// src/pages/Home/Home.jsx - Updated for backend
import React, { useMemo } from 'react' // Add useMemo if using it
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout/Layout'
import Card from '../../components/ui/Card/Card'
import Button from '../../components/ui/Button/Button'
import CourseCard from '../../components/cards/CourseCard/CourseCard'
import { useCourses } from '../../hooks/useCourses'
import { FaSearch, FaBookMedical, FaVideo, FaUsers } from 'react-icons/fa'
import styles from './Home.module.css'

export default function Home() {
  const { data: courses = [], isLoading, error } = useCourses({ limit: 6 })

  const features = [
    {
      icon: <FaBookMedical />,
      title: 'Comprehensive Past Questions',
      description: 'Access past exam papers from all pharmacy levels and courses'
    },
    {
      icon: <FaVideo />,
      title: 'Educational Videos',
      description: 'Learn from curated pharmacy tutorials and lectures'
    },
    {
      icon: <FaSearch />,
      title: 'Advanced Search',
      description: 'Quickly find resources by course, year, or keyword'
    },
    {
      icon: <FaUsers />,
      title: 'Community Driven',
      description: 'Contribute and help fellow pharmacy students succeed'
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.highlight}>Pharmssage</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your comprehensive platform for pharmacy past questions, 
            study materials, and educational resources
          </p>
          <div className={styles.heroButtons}>
            <Button size="large" variant="primary" as={Link} to="/courses">
              Browse Courses
            </Button>
            <Button size="large" variant="outline" as={Link} to="/past-questions">
              View Past Questions
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose Pharmssage?</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to excel in your pharmacy studies
          </p>
        </div>
        <div className={styles.features}>
          {features.map((feature, index) => (
            <div key={index} className={styles.feature}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular Courses</h2>
          <p className={styles.sectionSubtitle}>
            Browse our most accessed pharmacy courses
          </p>
        </div>
        
        {error ? (
          <div className={styles.errorMessage}>
            <p>Unable to load courses. Please try again later.</p>
          </div>
        ) : (
          <>
            <div className={styles.coursesGrid}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.courseSkeleton}>
                    <div className={styles.skeletonHeader}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonMeta}></div>
                    <div className={styles.skeletonStats}></div>
                  </div>
                ))
              ) : courses.length === 0 ? (
                <div className={styles.noCourses}>
                  <p>No courses available yet. Check back soon!</p>
                </div>
              ) : (
                courses.slice(0, 6).map(course => (
                  <CourseCard key={course._id || course.id} course={course} />
                ))
              )}
            </div>
            
            {courses.length > 0 && (
              <div className={styles.centered}>
                <Button variant="primary" size="large" as={Link} to="/courses">
                  View All Courses
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <Card className={styles.statsCard}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Past Questions</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100+</span>
              <span className={styles.statLabel}>Courses</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>Video Tutorials</span>
            </div>
            {(
              <div className={styles.stat}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Students</span>
              </div>
            )}
          </div>
        </Card>
      </section>
    </Layout>
  )
}