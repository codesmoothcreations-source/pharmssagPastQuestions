// src/pages/Auth/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'
import styles from './ForgotPassword.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Reset password requested for:', email)
      setSubmitted(true)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Link to="/login" className={styles.backLink}>
            <FaArrowLeft /> Back to Login
          </Link>

          <Card className={styles.forgotCard}>
            {submitted ? (
              <div className={styles.successContent}>
                <div className={styles.successIcon}>
                  <FaCheckCircle />
                </div>
                <h2 className={styles.successTitle}>Check Your Email</h2>
                <p className={styles.successMessage}>
                  If an account exists with <strong>{email}</strong>, you will receive 
                  password reset instructions shortly.
                </p>
                <div className={styles.successActions}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false)
                      setEmail('')
                    }}
                  >
                    Try Another Email
                  </Button>
                  <Link to="/login">
                    <Button variant="primary">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Forgot Password</h2>
                  <p className={styles.cardSubtitle}>
                    Enter your email address and we'll send you instructions to reset your password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    leftIcon={<FaEnvelope />}
                    required
                    autoFocus
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    loading={isLoading}
                    disabled={isLoading || !email}
                    fullWidth
                    className={styles.submitButton}
                  >
                    Send Reset Instructions
                  </Button>
                </form>

                <div className={styles.cardFooter}>
                  <p className={styles.footerText}>
                    Remember your password?{' '}
                    <Link to="/login" className={styles.link}>
                      Back to Login
                    </Link>
                  </p>
                </div>
              </>
            )}
          </Card>

          <div className={styles.helpText}>
            <p>
              If you're still having trouble, please contact our support team at{' '}
              <a href="mailto:support@pharmssage.com" className={styles.supportLink}>
                support@pharmssage.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}