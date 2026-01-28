// src/pages/Dashboard/Profile/Profile.jsx
import React, { useState } from 'react'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useAuth } from '../../../contexts/AuthContext'
import { FaUser, FaEnvelope, FaCalendar, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import styles from './Profile.module.css'

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    yearOfStudy: user?.yearOfStudy || ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // API call to update profile would go here
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      yearOfStudy: user?.yearOfStudy || ''
    })
    setIsEditing(false)
  }

  return (
    <Layout>
      <div className={styles.profile}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <div className={styles.headerActions}>
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  leftIcon={<FaTimes />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<FaSave />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                leftIcon={<FaEdit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* Left Column - Profile Info */}
          <div className={styles.leftColumn}>
            <Card className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.profileInfo}>
                  <h2 className={styles.userName}>{user?.name || 'User'}</h2>
                  <p className={styles.userEmail}>{user?.email}</p>
                  <span className={styles.userRole}>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Student'}
                  </span>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <FaUser className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Full Name</span>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.detailValue}>{user?.name}</span>
                    )}
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <FaEnvelope className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Email Address</span>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.detailValue}>{user?.email}</span>
                    )}
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <FaCalendar className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Member Since</span>
                    <span className={styles.detailValue}>
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>📱</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Phone Number</span>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          className={styles.editInput}
                        />
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>🏫</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Department</span>
                        <Input
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="Enter department"
                          className={styles.editInput}
                        />
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailIcon}>📚</div>
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Year of Study</span>
                        <select
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleInputChange}
                          className={styles.editSelect}
                        >
                          <option value="">Select Year</option>
                          <option value="100">100 Level</option>
                          <option value="200">200 Level</option>
                          <option value="300">300 Level</option>
                          <option value="400">400 Level</option>
                          <option value="500">500 Level</option>
                          <option value="graduate">Graduate</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className={styles.rightColumn}>
            {/* <Card className={styles.statsCard}>
              <h3 className={styles.statsTitle}>My Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>📚</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Courses</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>📄</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>47</span>
                    <span className={styles.statLabel}>Downloads</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>👁️</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>156</span>
                    <span className={styles.statLabel}>Views</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>⏱️</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>28.5</span>
                    <span className={styles.statLabel}>Study Hours</span>
                  </div>
                </div>
              </div>
            </Card> */}

            <Card className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Recent Activity</h3>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>📥</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      Downloaded Pharmacology past questions
                    </span>
                    <span className={styles.activityTime}>2 hours ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>👁️</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      Viewed Pharmaceutical Chemistry questions
                    </span>
                    <span className={styles.activityTime}>1 day ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>⭐</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityText}>
                      Bookmarked Clinical Pharmacy resources
                    </span>
                    <span className={styles.activityTime}>2 days ago</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}