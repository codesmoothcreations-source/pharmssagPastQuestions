/* eslint-disable no-undef */
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useAuth } from '../../../contexts/AuthContext'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFlask } from 'react-icons/fa'
import styles from './Login.module.css'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginLoading } = useAuth()
  
  const from = location.state?.from?.pathname || '/dashboard'
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  })

  const onSubmit = async (data) => {
    try {
      setLoginError('')
      await login(data)
      navigate(from)
    } catch (error) {
      setLoginError(error.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.')
    }
  }

  const handleQuickFill = () => {
    setValue('email', 'admin@pharmssage.com')
    setValue('password', 'password123')
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.gridContainer}>
        
        {/* Left Side: Branding & Value Proposition */}
        <section className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logoHeader}>
              <span className={styles.pillIcon}>💊</span>
              <span className={styles.logoName}>Pharmssage</span>
            </div>
            
            <h1 className={styles.heroText}>
              The Smart Way to <br />
              <span>Master Pharmacy.</span>
            </h1>
            
            <p className={styles.heroSubtext}>
              Join thousands of pharmacy students using our premium past questions, 
              video tutorials, and real-time progress analytics.
            </p>

            <ul className={styles.valueList}>
              <li><FaCheckCircle /> <span>5,000+ Exam Questions</span></li>
              <li><FaCheckCircle /> <span>Detailed Video Solutions</span></li>
              <li><FaCheckCircle /> <span>Offline Access Capability</span></li>
            </ul>
          </div>
          <div className={styles.brandingFooter}>
            © 2026 Pharmssage Platform. All rights reserved.
          </div>
        </section>

        {/* Right Side: Simple & Clean Auth Form */}
        <section className={styles.formSide}>
          <div className={styles.formWrapper}>
            <Card className={styles.authCard}>
              <header className={styles.authHeader}>
                <h2>Welcome Back</h2>
                <p>Please enter your credentials to access your dashboard.</p>
              </header>

              {loginError && <div className={styles.errorBanner}>{loginError}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.mainForm}>
                <Input
                  label="Email Address"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder="name@university.edu"
                  leftIcon={<FaUser />}
                  autoFocus
                />

                <div className={styles.passwordSection}>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="••••••••"
                    leftIcon={<FaLock />}
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
                    <span>Keep me logged in</span>
                  </label>
                  <Link to="/forgot-password" className={styles.forgotLink}>
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  loading={loginLoading}
                  fullWidth
                  className={styles.submitBtn}
                >
                  Sign In to Dashboard
                </Button>

                {/* Developer Tool: Styled as a Demo Mode button */}
                {import.meta.env.DEV && (
                  <button type="button" onClick={handleQuickFill} className={styles.demoMode}>
                    <FaFlask /> Try with Demo Account
                  </button>
                )} 

                <div className={styles.divider}>
                  <span>New to Pharmssage?</span>
                </div>

                <Link to="/register" className={styles.createAccountBtn}>
                  Create Student Account
                </Link>
              </form>
            </Card>
            
            <footer className={styles.formFooter}>
              Secure connection verified. <Link to="/privacy">Privacy Policy</Link>
            </footer>
          </div>
        </section>
      </div>
    </div>
  )
}