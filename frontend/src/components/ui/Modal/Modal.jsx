// src/components/ui/Modal/Modal.jsx
import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import styles from './Modal.module.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {showCloseButton && (
            <button className={styles.closeButton} onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}