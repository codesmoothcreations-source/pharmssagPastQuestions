// src/components/layout/Navbar/Navbar.jsx (update with proper imports)
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import Button from '../../ui/Button/Button'
import { FaUser, FaSignOutAlt, FaMoon, FaSun, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'
import logoImage from './pharmssag.jpeg'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDesktopMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setMobileMenuOpen(false)
      setDesktopMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Essential navigation links only
  const mainNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/past-questions', label: 'Past Questions' },
    { path: '/videos', label: 'Videos' },
  ]

  // User menu items (Dashboard, Profile, Admin links)
  const userMenuItems = []
  if (user) {
    userMenuItems.push({ path: '/dashboard', label: 'Dashboard' })
    userMenuItems.push({ path: '/profile', label: 'Profile' })
    
    if (isAdmin) {
      userMenuItems.push({ path: '/admin', label: 'Admin Dashboard' })
      userMenuItems.push({ path: '/upload-question', label: 'Upload Question' })
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src={logoImage} alt="Pharmssage Logo" className={styles.logoImage} />
          <span className={styles.logoText}>Pharmssage</span>
        </Link>

        {/* Desktop Navigation - Only essential links */}
        <div className={styles.navLinks}>
          {mainNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={styles.navLink}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {/* User Menu */}
          {user ? (
            <div className={styles.userMenuContainer} ref={menuRef}>
              <button
                className={styles.userMenuButton}
                onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                aria-label="User menu"
              >
                <FaUser className={styles.userIcon} />
                <span className={styles.userName}>{user.name || 'User'}</span>
                <FaChevronDown className={`${styles.chevron} ${desktopMenuOpen ? styles.chevronOpen : ''}`} />
              </button>
              
              {desktopMenuOpen && (
                <div className={styles.userDropdown}>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={styles.dropdownLink}
                      onClick={() => setDesktopMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className={styles.dropdownDivider}></div>
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Button
                variant="outline"
                size="small"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user && userMenuItems.length > 0 && (
              <>
                <div className={styles.mobileDivider}></div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={styles.mobileLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className={styles.mobileDivider}></div>
                <button
                  onClick={handleLogout}
                  className={styles.mobileLogout}
                >
                  Logout
                </button>
              </>
            )}
            
            {!user && (
              <>
                <div className={styles.mobileDivider}></div>
                <Link
                  to="/login"
                  className={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}