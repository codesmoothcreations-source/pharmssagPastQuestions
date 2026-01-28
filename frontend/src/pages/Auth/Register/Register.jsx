// thanks for the login i really liked it but for the next one look the register is really difficult and rigid i will like to use this for mat example@gmail.com and the pasword can be any thing they want  and the student id is also optional pls i really need this to be flexible to all users and how they are and keep the password stenght indecator it's really cool "// src/pages/Auth/Register/Register.jsx - UPDATED
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useAuth } from '../../../contexts/AuthContext'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserGraduate, FaPhone } from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './Register.module.css'

// Update schema to match backend exactly
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long')
    .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email')
    .endsWith('@phamsag.edu', 'Email must end with @phamsag.edu'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number'),
  studentId: z.string()
    .min(5, 'Student ID must be at least 5 characters')
    .regex(/^PHM\/\d{4}\/\d{3}$/, 'Student ID must be in format: PHM/YYYY/001'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const { register: registerUser, registerLoading } = useAuth()
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
      studentId: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      setServerError('')
      
      console.log('📤 Sending registration data:', data)
      
      // Remove confirmPassword before sending (if backend doesn't want it)
      const { confirmPassword, ...registrationData } = data
      
      // Or keep it if backend expects it (based on your backend format)
      const registrationDataWithConfirm = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone.trim(),
        studentId: data.studentId.trim()
      }
      
      console.log('📦 Final registration payload:', registrationDataWithConfirm)
      
      await registerUser(registrationDataWithConfirm)
      toast.success('Registration successful! Welcome to Pharmssage.')
      reset()
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      
      // Extract error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed. Please try again.'
      
      setServerError(errorMessage)
      toast.error(errorMessage)
    }
  }

  // Watch password for real-time validation feedback
  const password = watch('password', '')

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None' }
    
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    return { score, label: labels[score] }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Side - Branding */}
          <div className={styles.branding}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>💊</span>
              <h1 className={styles.logoText}>Pharmssage</h1>
            </div>
            <h2 className={styles.welcomeTitle}>Join Our Pharmacy Community</h2>
            <p className={styles.welcomeSubtitle}>
              Create your account to access thousands of pharmacy resources
            </p>
            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>📚</div>
                <div className={styles.benefitText}>
                  <h4>Free Access</h4>
                  <p>Access all past questions and study materials</p>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>🎓</div>
                <div className={styles.benefitText}>
                  <h4>For Pharmacy Students</h4>
                  <p>Designed specifically for pharmacy curriculum</p>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>🤝</div>
                <div className={styles.benefitText}>
                  <h4>Community Support</h4>
                  <p>Connect with fellow pharmacy students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <Card className={styles.registerCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Create Account</h2>
              <p className={styles.cardSubtitle}>
                Fill in your details to get started
              </p>
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className={styles.serverError}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorContent}>
                  <strong>Registration Error:</strong>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="Full Name"
                type="text"
                {...register('name')}
                error={errors.name?.message}
                placeholder="John Doe"
                leftIcon={<FaUser />}
                required
                autoFocus
              />

              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="john@email.com"
                leftIcon={<FaEnvelope />}
//                 helperText="Must end with @phamsag.edu"
                required
              />

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Input
                    label="Phone Number"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="08012345678"
                    leftIcon={<FaPhone />}
                  />
                </div>
                <div className={styles.formGroup}>
                  <Input
                    label="Student ID"
                    type="text"
                    {...register('studentId')}
                    error={errors.studentId?.message}
                    placeholder="PHM/2024/001"
                    leftIcon={<FaUserGraduate />}
                    helperText="Format: PHM/YYYY/001"
                  />
                </div>
              </div>

              <div className={styles.passwordSection}>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={errors.password?.message}
                  placeholder="Create a strong password"
                  leftIcon={<FaLock />}
                  rightIcon={
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                  required
                />
                
                {/* Password Strength Meter */}
                {password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthLabel}>
                      Password Strength: <span className={styles[`strength${passwordStrength.score}`]}>{passwordStrength.label}</span>
                    </div>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div
                          key={index}
                          className={`${styles.strengthSegment} ${
                            index <= passwordStrength.score ? styles[`strength${passwordStrength.score}`] : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="Confirm your password"
                leftIcon={<FaLock />}
                rightIcon={
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
                required
              />

              <div className={styles.passwordRequirements}>
                <p className={styles.requirementsTitle}>Password Requirements:</p>
                <ul className={styles.requirementsList}>
                  <li className={password.length >= 8 ? styles.requirementMet : styles.requirementUnmet}>
                    • At least 8 characters {password.length >= 8 ? '✓' : '✗'}
                  </li>
                  <li className={/[A-Z]/.test(password) ? styles.requirementMet : styles.requirementUnmet}>
                    • One uppercase letter {/[A-Z]/.test(password) ? '✓' : '✗'}
                  </li>
                  <li className={/[a-z]/.test(password) ? styles.requirementMet : styles.requirementUnmet}>
                    • One lowercase letter {/[a-z]/.test(password) ? '✓' : '✗'}
                  </li>
                  <li className={/[0-9]/.test(password) ? styles.requirementMet : styles.requirementUnmet}>
                    • One number {/[0-9]/.test(password) ? '✓' : '✗'}
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? styles.requirementMet : styles.requirementUnmet}>
                    • One special character {/[^A-Za-z0-9]/.test(password) ? '✓' : '✗'}
                  </li>
                </ul>
              </div>

              <div className={styles.terms}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    required
                    className={styles.checkbox}
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/" className={styles.termsLink}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/" className={styles.termsLink}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={registerLoading}
                disabled={registerLoading}
                fullWidth
                className={styles.submitButton}
              >
                {registerLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className={styles.divider}>
                <span>Already have an account?</span>
              </div>

              <Link to="/login">
                <Button
                  type="button"
                  variant="outline"
                  size="large"
                  fullWidth
                >
                  Sign In Instead
                </Button>
              </Link>
            </form>

            <div className={styles.cardFooter}>
              <p className={styles.footerText}>
                By creating an account, you agree to our academic integrity policy.
                All students must use their official @phamsag.edu email.
              </p>
              
              {/* Demo Credentials for Testing */}
              <div className={styles.demoCredentials}>
                <p className={styles.demoTitle}>For Testing:</p>
                <div className={styles.demoRow}>
                  <span>Email:</span>
                  <code>test@phamsag.edu</code>
                </div>
                <div className={styles.demoRow}>
                  <span>Password:</span>
                  <code>Test@1234</code>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={() => {
                    reset({
                      name: 'Test User',
                      email: 'test@phamsag.edu',
                      phone: '08012345678',
                      studentId: 'PHM/2024/001',
                      password: 'Test@1234',
                      confirmPassword: 'Test@1234'
                    })
                    toast.success('Demo credentials filled!')
                  }}
                >
                  Fill Demo Credentials
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}