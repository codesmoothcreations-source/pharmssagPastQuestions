// src/components/layout/Footer/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FaGithub, FaTwitter, FaFacebook, FaLinkedin, FaHeart } from 'react-icons/fa'
import logoImage from '../Navbar/pharmssag.jpeg'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/past-questions', label: 'Past Questions' },
    { path: '/videos', label: 'Videos' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
  ]

  const socialLinks = [
    { icon: <FaGithub />, url: 'https://github.com' },
    { icon: <FaTwitter />, url: 'https://twitter.com' },
    { icon: <FaFacebook />, url: 'https://facebook.com' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com' },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img src={logoImage} alt="Pharmssage Logo" className={styles.logoImage} />
              <span className={styles.logoText}>Pharmssag</span>
            </Link>
            <p className={styles.tagline}>
              Your comprehensive platform for pharmacy education
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`Follow us on ${social.url}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <div className={styles.links}>
              {links.slice(0, 4).map((link) => (
                <Link key={link.path} to={link.path} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contact Us</h3>
            <div className={styles.contactInfo}>
              <p className={styles.contactItem}>
                📧 koomsonezra6@gmail.com
              </p>
              <p className={styles.contactItem}>
                📞 +233 055 160 3553
              </p>
              <p className={styles.contactItem}>
                🏛️ Pharmaceutical Sciences
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            © {currentYear} Pharmssag. Made with <FaHeart className={styles.heartIcon} /> for pharmacy students.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}