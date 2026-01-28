// Updated Sidebar.jsx with toggle functionality
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { FaHome, FaBook, FaFileAlt, FaVideo, FaUser, FaChartLine, FaBars, FaTimes } from 'react-icons/fa'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { user, isAdmin } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  const studentLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/courses', label: 'Courses', icon: <FaBook /> },
    { path: '/past-questions', label: 'Past Questions', icon: <FaFileAlt /> },
    { path: '/videos', label: 'Videos', icon: <FaVideo /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Admin Dashboard', icon: <FaChartLine /> },
    { path: '/upload-question', label: 'Upload Questions', icon: <FaFileAlt /> },
  ]

  const allLinks = isAdmin ? [...studentLinks, ...adminLinks] : studentLinks

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const sidebarClass = isMobile 
    ? `${styles.sidebar} ${isMobileOpen ? styles.open : ''}`
    : `${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`

  return (
    <>
      <button
        className={`${styles.toggleButton} ${isCollapsed || !isMobileOpen ? styles.collapsed : ''}`}
        onClick={toggleSidebar}
        aria-label={isCollapsed || !isMobileOpen ? "Open sidebar" : "Close sidebar"}
      >
        <span>{isCollapsed || !isMobileOpen ? <FaBars /> : <FaTimes />}</span>
      </button>

      {isMobileOpen && (
        <div 
          className={`${styles.overlay} ${isMobileOpen ? styles.show : ''}`}
          onClick={closeMobileSidebar}
        />
      )}

      <aside className={sidebarClass}>
        <div className={styles.sidebarContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name || 'User'}</span>
              <span className={styles.userRole}>
                {isAdmin ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>

          <nav className={styles.nav}>
            {allLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={isMobile ? closeMobileSidebar : undefined}
              >
                <span className={styles.navIcon}>{link.icon}</span>
                <span className={styles.navLabel}>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}