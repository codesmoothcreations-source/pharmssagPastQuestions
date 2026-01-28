// src/pages/Error/NotFound/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button/Button'
import { FaHome, FaSearch, FaBook } from 'react-icons/fa'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.message}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className={styles.actions}>
            <Link to="/">
              <Button variant="primary" leftIcon={<FaHome />}>
                Go Home
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" leftIcon={<FaBook />}>
                Browse Courses
              </Button>
            </Link>
            <Link to="/past-questions">
              <Button variant="outline" leftIcon={<FaSearch />}>
                Find Past Questions
              </Button>
            </Link>
          </div>

          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>You might be looking for:</h3>
            <div className={styles.suggestionsList}>
              <Link to="/courses" className={styles.suggestionLink}>
                <FaBook className={styles.suggestionIcon} />
                <span>All Courses</span>
              </Link>
              <Link to="/past-questions" className={styles.suggestionLink}>
                <FaSearch className={styles.suggestionIcon} />
                <span>Past Questions</span>
              </Link>
              <Link to="/videos" className={styles.suggestionLink}>
                <FaSearch className={styles.suggestionIcon} />
                <span>Video Tutorials</span>
              </Link>
              <Link to="/login" className={styles.suggestionLink}>
                <FaSearch className={styles.suggestionIcon} />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}