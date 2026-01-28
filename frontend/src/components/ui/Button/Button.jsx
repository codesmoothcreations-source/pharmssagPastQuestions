// src/components/ui/Button/Button.jsx - Simplified Enhanced Version
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  href,
  to,
  icon,
  leftIcon,
  rightIcon,
  iconPosition = 'left',
  onClick,
  as: Component = 'button',
  ...props
}) {
  const isButton = Component === 'button'
  const isLink = to || href
  const Tag = to ? Link : (href ? 'a' : Component)
  
  const leftIconElement = leftIcon || (icon && iconPosition === 'left' ? icon : null)
  const rightIconElement = rightIcon || (icon && iconPosition === 'right' ? icon : null)
  
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <Tag
      type={isButton && !isLink ? type : undefined}
      href={href}
      to={to}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.dot} />
          ))}
        </span>
      )}
      
      {leftIconElement && (
        <span className={styles.icon}>{leftIconElement}</span>
      )}
      
      <span className={styles.content}>{children}</span>
      
      {rightIconElement && (
        <span className={styles.icon}>{rightIconElement}</span>
      )}
    </Tag>
  )
}

// Quick access variants
Button.Primary = (props) => <Button variant="primary" {...props} />
Button.Secondary = (props) => <Button variant="secondary" {...props} />
Button.Outline = (props) => <Button variant="outline" {...props} />
Button.Ghost = (props) => <Button variant="ghost" {...props} />
Button.Danger = (props) => <Button variant="danger" {...props} />