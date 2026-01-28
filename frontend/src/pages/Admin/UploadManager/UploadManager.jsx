// src/pages/Admin/UploadManager/UploadManager.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Loader from '../../../components/ui/Loader/Loader'
import PastQuestionCard from '../../../components/cards/PastQuestionCard/PastQuestionCard'
import { useAuth } from '../../../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pastQuestionsApi } from '../../../api/pastQuestionsApi'
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './UploadManager.module.css'

export default function UploadManager() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Fetch all past questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-questions', filter],
    queryFn: () => pastQuestionsApi.getAll({
      limit: 50,
      sort: '-createdAt',
      ...(filter !== 'all' && { status: filter })
    }),
    enabled: isAdmin
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => pastQuestionsApi.delete(id),
    onSuccess: () => {
      toast.success('Question deleted successfully')
      queryClient.invalidateQueries(['admin-questions'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete question')
    }
  })

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this past question?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/edit-question/${id}`)
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className={styles.unauthorized}>
          <Card>
            <div className={styles.unauthorizedContent}>
              <FaUserShield className={styles.unauthorizedIcon} />
              <h2>Admin Access Required</h2>
              <p>You need administrator privileges to access this page.</p>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  const questionsList = questions?.data || questions || []

  return (
    <Layout>
      <div className={styles.uploadManager}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <FaCloudUploadAlt className={styles.titleIcon} />
              Upload Manager
            </h1>
            <p className={styles.subtitle}>
              Manage all past question uploads ({questionsList.length} total)
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="primary"
              leftIcon={<FaCloudUploadAlt />}
              onClick={() => navigate('/upload-question')}
            >
              Upload New
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className={styles.filtersCard}>
          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All Questions
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
              onClick={() => setFilter('approved')}
            >
              <FaCheckCircle /> Approved
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'rejected' ? styles.active : ''}`}
              onClick={() => setFilter('rejected')}
            >
              <FaTimesCircle /> Rejected
            </button>
          </div>
        </Card>

        {/* Questions List */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader text="Loading questions..." />
          </div>
        ) : questionsList.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyState}>
              <FaFileAlt className={styles.emptyIcon} />
              <h3>No Questions Found</h3>
              <p>There are no past questions matching your filters.</p>
              <Button
                variant="primary"
                leftIcon={<FaCloudUploadAlt />}
                onClick={() => navigate('/upload-question')}
              >
                Upload First Question
              </Button>
            </div>
          </Card>
        ) : (
          <div className={styles.questionsGrid}>
            {questionsList.map((question) => (
              <div key={question._id} className={styles.questionWrapper}>
                <PastQuestionCard question={question} />
                <div className={styles.questionActions}>
                  <Button
                    size="small"
                    variant="outline"
                    leftIcon={<FaEdit />}
                    onClick={() => handleEdit(question._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    leftIcon={<FaTrash />}
                    onClick={() => handleDelete(question._id)}
                    loading={deleteMutation.isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

