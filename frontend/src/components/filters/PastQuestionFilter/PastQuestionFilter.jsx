// src/components/filters/PastQuestionFilter/PastQuestionFilter.jsx
import React from 'react'
import Input from '../../ui/Input/Input'
import Button from '../../ui/Button/Button'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import styles from './PastQuestionFilter.module.css'

export default function PastQuestionFilter({
  filters = {},
  onFilterChange,
  onReset,
  courses = [],
  academicYears = [],
  className = ''
}) {
  const {
    search = '',
    level = '',
    semester = '',
    course = '',
    academicYear = '',
    fileType = '',
    sort = '-createdAt'
  } = filters

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const hasActiveFilters = level || semester || course || academicYear || fileType || search

  return (
    <div className={`${styles.filter} ${className}`}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>
          <FaFilter className={styles.filterIcon} />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="small"
            leftIcon={<FaTimes />}
            onClick={onReset}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className={styles.filterContent}>
        {/* Search */}
        <div className={styles.filterGroup}>
          <Input
            placeholder="Search past questions..."
            value={search}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<FaSearch />}
            fullWidth
          />
        </div>

        {/* Filters Grid */}
        <div className={styles.filtersGrid}>
          {/* Level */}
          <div className={styles.filterField}>
            <label className={styles.label}>Level</label>
            <select
              className={styles.select}
              value={level}
              onChange={(e) => handleChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
            </select>
          </div>

          {/* Semester */}
          <div className={styles.filterField}>
            <label className={styles.label}>Semester</label>
            <select
              className={styles.select}
              value={semester}
              onChange={(e) => handleChange('semester', e.target.value)}
            >
              <option value="">All Semesters</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
            </select>
          </div>

          {/* Course */}
          <div className={styles.filterField}>
            <label className={styles.label}>Course</label>
            <select
              className={styles.select}
              value={course}
              onChange={(e) => handleChange('course', e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id || c} value={c.code || c}>
                  {c.name || c} ({c.code || ''})
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div className={styles.filterField}>
            <label className={styles.label}>Academic Year</label>
            <select
              className={styles.select}
              value={academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
            >
              <option value="">All Years</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* File Type */}
          <div className={styles.filterField}>
            <label className={styles.label}>File Type</label>
            <select
              className={styles.select}
              value={fileType}
              onChange={(e) => handleChange('fileType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="doc">Document</option>
            </select>
          </div>

          {/* Sort */}
          <div className={styles.filterField}>
            <label className={styles.label}>Sort By</label>
            <select
              className={styles.select}
              value={sort}
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
              <option value="-views">Most Views</option>
              <option value="-downloads">Most Downloads</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

