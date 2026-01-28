/* eslint-disable no-undef */
// src/components/ErrorBoundary/ErrorBoundary.jsx
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button/Button'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'
import styles from './ErrorBoundary.module.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorMessage}>
              We're sorry, but an unexpected error occurred. Please try again.
            </p>
            <div className={styles.errorActions}>
              <Button
                variant="primary"
                leftIcon={<FaHome />}
                onClick={this.handleReset}
              >
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className={styles.errorDetails}>
                <h3>Error Details:</h3>
                <pre>{this.state.error.toString()}</pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary