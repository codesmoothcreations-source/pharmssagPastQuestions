// src/components/cards/CourseCard/CourseCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FaBook, FaEye, FaFileAlt } from 'react-icons/fa'
import styles from './CourseCard.module.css'

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.code}>{course.code}</span>
        <span className={`${styles.level} ${styles[`level${course.level}`]}`}>
          Level {course.level}
        </span>
      </div>
      
      <h3 className={styles.title}>{course.name}</h3>
      
      <div className={styles.meta}>
        <span className={styles.semester}>
          <FaBook className={styles.icon} />
          {course.semester} Semester
        </span>
        {course.credits && (
          <span className={styles.credits}>
            {course.credits} Credits
          </span>
        )}
      </div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <FaFileAlt className={styles.statIcon} />
          <div>
            <span className={styles.statNumber}>
              {course.stats?.totalQuestions || 0}
            </span>
            <span className={styles.statLabel}>Questions</span>
          </div>
        </div>
      </div>
    </Link>
  )
}