// src/components/ui/Input/Input.jsx
import React, { forwardRef } from 'react'
import styles from './Input.module.css'

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  variant = 'outlined', // Added support for variants
  size = 'medium',      // Added support for sizes
  ...props
}, ref) {
  const { id, disabled } = props

  return (
    <div className={`
      ${styles.inputGroup}
      ${styles[size]}
      ${styles[variant]}
      ${fullWidth ? styles.fullWidth : ''}
      ${error ? styles.hasError : ''}
      ${disabled ? styles.isDisabled : ''}
      ${className}
    `}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.leftIcon}>
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          className={`
            ${styles.input}
            ${leftIcon ? styles.withLeftIcon : ''}
            ${rightIcon ? styles.withRightIcon : ''}
          `}
          {...props}
        />
        
        {rightIcon && (
          <span className={styles.rightIcon}>
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <p className={`
          ${styles.helperText}
          ${error ? styles.errorText : styles.defaultText}
        `}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Input