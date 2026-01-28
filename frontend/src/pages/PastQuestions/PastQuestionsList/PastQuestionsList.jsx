// src/pages/PastQuestions/PastQuestionsList/PastQuestionsList.jsx
import React, { useState } from 'react'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import PastQuestionCard from '../../../components/cards/PastQuestionCard/PastQuestionCard'
import { usePastQuestions } from '../../../hooks/usePastQuestions'
import { useAuth } from '../../../contexts/AuthContext'
import useDebounce from '../../../hooks/useDebounce'
import { FaSearch, FaFilter, FaSort } from 'react-icons/fa'
import styles from './PastQuestionsList.module.css'

export default function PastQuestionsList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    level: '',
    semester: '',
    course: '',
    academicYear: '',
    sortBy: '-createdAt'
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedSearch = useDebounce(search, 500)
  
  const { data: questions, isLoading } = usePastQuestions({
    search: debouncedSearch,
    ...filters
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      level: '',
      semester: '',
      course: '',
      academicYear: '',
      sortBy: '-createdAt'
    })
    setSearch('')
  }

  return (
    <Layout>
      <div className={styles.pastQuestions}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Past Questions</h1>
            <p className={styles.subtitle}>
              Access past exam papers from all pharmacy levels and courses
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button variant="primary" size="large">
              Upload Question
            </Button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <Card className={styles.searchCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Search past questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                fullWidth
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<FaFilter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {showFilters ? '▲' : '▼'}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={styles.filters}>
              <div className={styles.filterGrid}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Level</label>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Levels</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Semester</label>
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Semesters</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Course</label>
                  <select
                    value={filters.course}
                    onChange={(e) => handleFilterChange('course', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Courses</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pharmaceutics">Pharmaceutics</option>
                    <option value="Pharmaceutical Chemistry">Pharmaceutical Chemistry</option>
                    <option value="Pharmacognosy">Pharmacognosy</option>
                    <option value="Clinical Pharmacy">Clinical Pharmacy</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Academic Year</label>
                  <select
                    value={filters.academicYear}
                    onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Years</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                    <option value="2021/2022">2021/2022</option>
                    <option value="2020/2021">2020/2021</option>
                    <option value="2019/2020">2019/2020</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="-views">Most Views</option>
                    <option value="-downloads">Most Downloads</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterActions}>
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          {isLoading ? (
            <div className={styles.loadingText}>Loading past questions...</div>
          ) : (
            <>
              <span className={styles.resultsCount}>
                {questions?.length || 0} {questions?.length === 1 ? 'question' : 'questions'} found
              </span>
              {search && (
                <span className={styles.searchTerm}>
                  for "{search}"
                </span>
              )}
            </>
          )}
        </div>

        {/* Past Questions Grid */}
        <div className={styles.questionsGrid}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.questionSkeleton}>
                <div className={styles.skeletonHeader}></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonMeta}></div>
                <div className={styles.skeletonActions}></div>
              </div>
            ))
          ) : questions?.length === 0 ? (
            <Card className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>📚</div>
                <h3 className={styles.emptyTitle}>No past questions found</h3>
                <p className={styles.emptyDescription}>
                  {search ? 'Try adjusting your search or filters' : 'Check back later for new uploads'}
                </p>
                {search && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Search & Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            questions?.map(question => (
              <PastQuestionCard key={question._id} question={question} />
            ))
          )}
        </div>

        {/* Pagination - Will be implemented with backend pagination */}
        {questions?.length > 0 && (
          <div className={styles.pagination}>
            <Button variant="outline" disabled>
              Previous
            </Button>
            <span className={styles.pageInfo}>Page 1 of 1</span>
            <Button variant="outline" disabled>
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}