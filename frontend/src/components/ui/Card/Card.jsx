// src/components/ui/Card/Card.jsx - Enhanced Version
import React from 'react'
import styles from './Card.module.css'

export default function Card({
  children,
  padding = 'medium',
  hoverable = false,
  className = '',
  loading = false,
  glass = false,
  elevation = 2,
  onClick,
  ...props
}) {
  return (
    <div
      className={`
        ${styles.card}
        ${styles[padding]}
        ${hoverable ? styles.hoverable : ''}
        ${loading ? styles.loading : ''}
        ${glass ? styles.glass : ''}
        ${styles[`elevation-${elevation}`]}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '', divider = true }) {
  return (
    <div className={`${styles.header} ${!divider ? styles.noDivider : ''} ${className}`}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className = '', flush = false }) {
  return (
    <div className={`${styles.body} ${flush ? styles.flush : ''} ${className}`}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '', divider = true }) {
  return (
    <div className={`${styles.footer} ${!divider ? styles.noDivider : ''} ${className}`}>
      {children}
    </div>
  )
}

// Additional components
Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`${styles.title} ${className}`}>
      {children}
    </h3>
  )
}

Card.Subtitle = function CardSubtitle({ children, className = '' }) {
  return (
    <p className={`${styles.subtitle} ${className}`}>
      {children}
    </p>
  )
}

Card.Actions = function CardActions({ children, className = '' }) {
  return (
    <div className={`${styles.actions} ${className}`}>
      {children}
    </div>
  )
}