/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFlask, FaArrowRight, FaLeaf } from 'react-icons/fa'

import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useAuth } from '../../../contexts/AuthContext'
import styles from './Login.module.css'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  
  const { login, loginLoading, user } = useAuth()
  
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  })

  const onSubmit = async (data) => {
    try {
      setLoginError('')
      await login(data)
      navigate(from, { replace: true })
    } catch (error) {
      console.error("Login Error:", error)
      const message = error.response?.data?.message || 
                      (error.response?.status === 401 ? 'Invalid email or password' : 'Connection error. Please try again.')
      setLoginError(message)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.gridContainer}>
        
        {/* Mobile Branding Header (only shows on mobile) */}
        <div className={styles.mobileBrand}>
          <div className={styles.mobileLogo}>
            <FaLeaf className={styles.mobileLogoIcon} />
            <span className={styles.mobileLogoName}>Pharmssag</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your journey</p>
        </div>

        {/* Form Section */}
        <section className={styles.formSide}>
          <div className={styles.formWrapper}>
            <Card className={styles.glassCard}>
              <header className={styles.header}>
                <h2>Welcome Back</h2>
                <p>Sign in to continue your journey</p>
              </header>

              {loginError && (
                <div className={styles.errorBanner}>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Input
                  label="Email Address"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder="name@university.edu"
                  leftIcon={<FaUser className={styles.greenIcon} />}
                  autoFocus
                />

                <div className={styles.passwordWrapper}>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="••••••••"
                    leftIcon={<FaLock className={styles.greenIcon} />}
                    rightIcon={
                      <button 
                        type="button" 
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    }
                  />
                </div>

                <div className={styles.formMeta}>
                  <label className={styles.rememberBox}>
                    <input type="checkbox" {...register('rememberMe')} />
                    <span className={styles.checkmark}></span>
                    <span className={styles.label}>Keep me logged in</span>
                  </label>
                  <Link to="/forgot-password" className={styles.forgotLink}>
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loginLoading}
                  fullWidth
                  className={styles.submitBtn}
                >
                  Sign In <FaArrowRight className={styles.btnIcon} />
                </Button>

                <div className={styles.divider}>
                  <span>OR</span>
                </div>

                <Link to="/register" className={styles.createAccountBtn}>
                  Create Student Account
                </Link>
              </form>
            </Card>
          </div>
        </section>

        {/* Branding Section (hidden on mobile, shows on tablet+) */}
        <section className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logoHeader}>
              <div className={styles.logoIcon}>
                <FaLeaf />
              </div>
              <span className={styles.logoName}>Pharmssag</span>
            </div>
            
            <h1 className={styles.heroText}>
              Elevating <br />
              <span>Pharmacy Education.</span>
            </h1>
            
            <p className={styles.heroSubtext}>
              Access the most comprehensive database of pharmaceutical past questions, 
              expert-led tutorials, and precision analytics.
            </p>

            <ul className={styles.valueList}>
              <li><FaCheckCircle className={styles.check} /> <span>5,000+ Exam Questions</span></li>
              <li><FaCheckCircle className={styles.check} /> <span>Detailed Video Solutions</span></li>
              <li><FaCheckCircle className={styles.check} /> <span>Offline Access Capability</span></li>
            </ul>
          </div>
          <div className={styles.brandingFooter}>
            © 2026 Pharmssag Platform. Precision in Learning.
          </div>
        </section>
      </div>
    </div>
  )
}