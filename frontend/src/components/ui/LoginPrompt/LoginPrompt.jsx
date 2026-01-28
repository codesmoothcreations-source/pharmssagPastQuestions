// src/components/ui/LoginPrompt/LoginPrompt.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import Button from '../Button/Button'
import { FaLock, FaBook, FaVideo } from 'react-icons/fa'
import styles from './LoginPrompt.module.css'

export default function LoginPrompt({ message = "Login to access this feature" }) {
  return (
    <Card className={styles.loginPrompt}>
      <div className={styles.content}>
        <FaLock className={styles.lockIcon} />
        <h3 className={styles.title}>Authentication Required</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Link to="/login">
            <Button variant="primary">
              Login Now
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">
              Create Account
            </Button>
          </Link>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <FaBook className={styles.featureIcon} />
            <span>Access all past questions</span>
          </div>
          <div className={styles.feature}>
            <FaVideo className={styles.featureIcon} />
            <span>Watch video tutorials</span>
          </div>
        </div>
      </div>
    </Card>
  )
}