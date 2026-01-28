// src/components/filters/CourseFilter/CourseFilter.jsx
import React from 'react'
import Input from '../../ui/Input/Input'
import Button from '../../ui/Button/Button'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import styles from './CourseFilter.module.css'

export default function CourseFilter({
  filters = {},
  onFilterChange,
  onReset,
  className = ''
}) {
  const { search = '', level = '', semester = '', sort = 'name' } = filters

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const hasActiveFilters = level || semester || search

  return (
    <div className={`${styles.filter} ${className}`}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>
          <FaFilter className={styles.filterIcon} />
          Filter Courses
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="small"
            leftIcon={<FaTimes />}
            onClick={onReset}
          >
            Clear
          </Button>
        )}
      </div>

      <div className={styles.filterContent}>
        <div className={styles.filterGroup}>
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<FaSearch />}
            fullWidth
          />
        </div>

        <div className={styles.filtersGrid}>
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

          <div className={styles.filterField}>
            <label className={styles.label}>Sort By</label>
            <select
              className={styles.select}
              value={sort}
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="code">Code A-Z</option>
              <option value="-code">Code Z-A</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

