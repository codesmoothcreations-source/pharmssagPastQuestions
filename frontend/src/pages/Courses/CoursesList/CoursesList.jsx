// src/pages/Courses/CoursesList/CoursesList.jsx
import React, { useState } from 'react'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import CourseCard from '../../../components/cards/CourseCard/CourseCard'
import { useCourses, useCourseLevels } from '../../../hooks/useCourses'
import { useAuth } from '../../../contexts/AuthContext'
import useDebounce from '../../../hooks/useDebounce'
import { FaSearch, FaFilter } from 'react-icons/fa'
import CourseFilter from '../../../components/filters/CourseFilter/CourseFilter'
import styles from './CoursesList.module.css'

export default function CoursesList() {
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const { isAdmin } = useAuth()
  
  const debouncedSearch = useDebounce(search, 500)
  
  const { data: courses, isLoading } = useCourses({
    search: debouncedSearch,
    level: selectedLevel,
    semester: selectedSemester
  })

  const { data: levels } = useCourseLevels()

  const clearFilters = () => {
    setSelectedLevel('')
    setSelectedSemester('')
    setSearch('')
  }

  const hasActiveFilters = selectedLevel || selectedSemester || search

  return (
    <Layout>
      <div className={styles.courses}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Pharmacy Courses</h1>
            <p className={styles.subtitle}>
              Browse all pharmacy courses with available study materials
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <Card className={styles.filterCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search courses by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filter by Level</label>
              <div className={styles.levelButtons}>
                <button
                  key="all-levels"
                  className={`${styles.levelButton} ${!selectedLevel ? styles.active : ''}`}
                  onClick={() => setSelectedLevel('')}
                >
                  All Levels
                </button>
                {levels?.map(level => (
                  <button
                    key={level._id || `level-${level._id}`}
                    className={`${styles.levelButton} ${selectedLevel === level._id ? styles.active : ''}`}
                    onClick={() => setSelectedLevel(level._id)}
                  >
                    Level {level._id}
                    <span className={styles.levelCount}>({level.courseCount})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filter by Semester</label>
              <div className={styles.semesterButtons}>
                <button
                  key="all-semesters"
                  className={`${styles.semesterButton} ${!selectedSemester ? styles.active : ''}`}
                  onClick={() => setSelectedSemester('')}
                >
                  All Semesters
                </button>
                <button
                  key="1st-semester"
                  className={`${styles.semesterButton} ${selectedSemester === '1st' ? styles.active : ''}`}
                  onClick={() => setSelectedSemester('1st')}
                >
                  1st Semester
                </button>
                <button
                  key="2nd-semester"
                  className={`${styles.semesterButton} ${selectedSemester === '2nd' ? styles.active : ''}`}
                  onClick={() => setSelectedSemester('2nd')}
                >
                  2nd Semester
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className={styles.filterActions}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Overview */}
        {levels && (
          <div className={styles.statsOverview}>
            {levels.map(level => (
              <div key={level._id} className={styles.levelStat}>
                <div className={styles.levelStatHeader}>
                  <span className={`${styles.levelBadge} ${styles[`level${level._id}`]}`}>
                    Level {level._id}
                  </span>
                  <span className={styles.courseCount}>{level.courseCount} courses</span>
                </div>
                <div className={styles.levelStatDetails}>
                  <div className={styles.statDetail}>
                    <span className={styles.statLabel}>Questions:</span>
                    <span className={styles.statValue}>{level.totalQuestions}</span>
                  </div>
                  <div className={styles.statDetail}>
                    <span className={styles.statLabel}>Views:</span>
                    <span className={styles.statValue}>{level.totalViews}</span>
                  </div>
                  {isAdmin && (
                    <div className={styles.statDetail}>
                      <span className={styles.statLabel}>Downloads:</span>
                      <span className={styles.statValue}>{level.totalDownloads}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        <div className={styles.coursesGrid}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.courseSkeleton}>
                <div className={styles.skeletonHeader}></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonMeta}></div>
                <div className={styles.skeletonStats}></div>
              </div>
            ))
          ) : courses?.length === 0 ? (
            <Card className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>📚</div>
                <h3 className={styles.emptyTitle}>No courses found</h3>
                <p className={styles.emptyDescription}>
                  {search ? 'Try adjusting your search or filters' : 'No courses available yet'}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            courses?.map(course => (
              <CourseCard key={course._id} course={course} />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}