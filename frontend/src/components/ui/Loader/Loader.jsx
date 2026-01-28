// src/components/ui/Loader/Loader.jsx
import React from 'react'
import styles from './Loader.module.css'

export default function Loader({ fullScreen = false, size = 'medium', text = 'Loading...' }) {
  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}>
          <div className={styles.spinnerSegment}></div>
          <div className={styles.spinnerSegment}></div>
          <div className={styles.spinnerSegment}></div>
          <div className={styles.spinnerSegment}></div>
        </div>
      </div>
      {text && <p className={styles.loaderText}>{text}</p>}
    </div>
  )
}