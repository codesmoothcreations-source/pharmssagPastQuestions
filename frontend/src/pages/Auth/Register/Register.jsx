/* eslint-disable no-undef */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserGraduate, FaPhone, FaArrowRight, FaLeaf } from 'react-icons/fa'
import toast from 'react-hot-toast'

import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useAuth } from '../../../contexts/AuthContext'
import styles from './Register.module.css'

// FLEXIBLE SCHEMA: No domain restriction, optional ID, simple password
const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email (e.g. name@gmail.com)'),
  password: z.string().min(6, 'Password should be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  studentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { register: registerUser, registerLoading } = useAuth()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '', studentId: '' }
  })

  const password = watch('password', '')

  const onSubmit = async (data) => {
    try {
      // Clean data: Ensure optional fields are handled
      const registrationData = {
        ...data,
        email: data.email.toLowerCase().trim(),
        studentId: data.studentId || 'Not Provided',
      }
      
      await registerUser(registrationData)
      toast.success('Welcome to Pharmssage!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  // Cool Password Strength Logic
  const getStrength = (pass) => {
    if (!pass) return 0
    let score = 0
    if (pass.length > 6) score++
    if (pass.length > 10) score++
    if (/[0-9]/.test(pass)) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score // 0 to 5
  }

  const score = getStrength(password)
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']

  return (
    <div className={styles.registerPage}>
      <div className={styles.gridContainer}>
        
        {/* Branding Section */}
        <section className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logoHeader}>
              <div className={styles.logoIcon}><FaLeaf /></div>
              <span className={styles.logoName}>Pharmssage</span>
            </div>
            <h1 className={styles.heroText}>Start Your <br /><span>Academic Growth.</span></h1>
            <p className={styles.heroSubtext}>Access the largest pharmacy student network with just a few clicks.</p>
          </div>
          <div className={styles.brandingFooter}>© 2026 Professional Pharmacy Portal</div>
        </section>

        {/* Form Section */}
        <section className={styles.formSide}>
        {/* Mobile Branding (only shows on mobile) */}
        <div className={styles.mobileBrand}>
            <div className={styles.mobileLogo}>
            <FaLeaf className={styles.mobileLogoIcon} />
            <span className={styles.mobileLogoName}>Pharmssage</span>
            </div>
            <h2>Start Your Academic Journey</h2>
            <p>Create your account in seconds</p>
        </div>
  
          <div className={styles.formWrapper}>
            <Card className={styles.glassCard}>
              <header className={styles.header}>
                <h2>Create Account</h2>
                <p>Register with any email to get started.</p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.row}>
                  <Input 
                    label="Full Name" 
                    {...register('name')} 
                    error={errors.name?.message} 
                    placeholder="John Doe" 
                    leftIcon={<FaUser className={styles.greenIcon}/>} 
                  />
                  <Input 
                    label="Email Address" 
                    {...register('email')} 
                    error={errors.email?.message} 
                    placeholder="example@gmail.com" 
                    leftIcon={<FaEnvelope className={styles.greenIcon}/>} 
                  />
                </div>

                <div className={styles.row}>
                  <Input 
                    label="Phone (Optional)" 
                    {...register('phone')} 
                    placeholder="080..." 
                    leftIcon={<FaPhone className={styles.greenIcon}/>} 
                  />
                  <Input 
                    label="Student ID (Optional)" 
                    {...register('studentId')} 
                    placeholder="Optional" 
                    leftIcon={<FaUserGraduate className={styles.greenIcon}/>} 
                  />
                </div>

                <div className={styles.passwordArea}>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="At least 6 characters"
                    leftIcon={<FaLock className={styles.greenIcon}/>}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.eyeBtn}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    }
                  />
                  
                  {password && (
                    <div className={styles.strengthMeter}>
                      <div className={styles.meterMeta}>
                        <span>Strength: <strong>{labels[score]}</strong></span>
                      </div>
                      <div className={styles.meterBarContainer}>
                        <div 
                          className={styles.meterBar} 
                          style={{ 
                            width: `${(score / 5) * 100}%`,
                            backgroundColor: score < 3 ? '#ef4444' : '#10b981'
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  placeholder="Repeat your password"
                  leftIcon={<FaLock className={styles.greenIcon}/>}
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  loading={registerLoading} 
                  className={styles.submitBtn}
                >
                  Create Account <FaArrowRight />
                </Button>

                <p className={styles.switch}>
                  Already have an account? <Link to="/login">Sign In</Link>
                </p>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}