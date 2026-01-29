import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Modal from '../../../components/ui/Modal/Modal'
import { usePastQuestionById } from '../../../hooks/usePastQuestions'
import { useAuth } from '../../../contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pastQuestionsApi } from '../../../api/pastQuestionsApi'
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaBook,
  FaUser
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from './PastQuestionDetail.module.css'

export default function PastQuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const queryClient = useQueryClient()
  const { data: question, isLoading, error } = usePastQuestionById(id)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (question && id) {
      console.log(`Incrementing view count for question ${id}`)
    }
  }, [question, id])

  // Get the actual file URL
  const getFileLink = () => {
    if (!question) return null
    if (question.cloudinaryUrl) return question.cloudinaryUrl
    if (question.fileInfo?.url) return question.fileInfo.url
    return null
  }

  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(
    question?.fileType?.toLowerCase()
  )

  const handleDownload = async () => {
    const fileLink = getFileLink()
    if (!fileLink) {
      toast.error('No file available for preview')
      return
    }

    setIsDownloading(true)
    try {
      const link = document.createElement('a')
      const extension = question.fileType || 'pdf'
      link.href = fileLink
      link.download = `${question.title || 'past-question'}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Loading preview!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: () => pastQuestionsApi.delete(id),
    onSuccess: () => {
      toast.success('Past question deleted successfully!')
      queryClient.invalidateQueries(['past-questions'])
      navigate('/past-questions')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete past question')
    }
  })

  const handleDelete = () => {
    deleteMutation.mutate()
    setShowDeleteModal(false)
  }

  if (isLoading) return <Layout><div className={styles.loadingContainer} /></Layout>
  if (error || !question) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h2>Past Question Not Found</h2>
          <Link to="/past-questions">
            <Button variant="primary"><FaArrowLeft /> Back to Past Questions</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const courseName = question.course?.name || 'Unknown Course'
  const courseCode = question.course?.code || ''

  return (
    <Layout>
      <div className={styles.pastQuestionDetail}>
        <div className={styles.backNavigation}>
          <Link to="/past-questions" className={styles.backLink}><FaArrowLeft /> Back</Link>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.detailsColumn}>
            <Card className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <div className={styles.questionMeta}>
                  <span className={styles.levelBadge}>Level {question.level}</span>
                  <span className={styles.semesterBadge}>{question.semester} Semester</span>
                  <span className={styles.courseBadge}>{courseCode} {courseName}</span>
                </div>

                <h1 className={styles.questionTitle}>{question.title}</h1>

                <div className={styles.questionStats}>
                  <div className={styles.stat}><FaEye /> {question.views || 0} views</div>
                  {isAdmin && <div className={styles.stat}><FaDownload /> {question.downloads || 0} downloads</div>}
                  <div className={styles.stat}><FaCalendar /> {question.academicYear}</div>
                </div>
              </div>

              <div className={styles.questionBody}>
                {question.description && (
                  <>
                    <h3>Description</h3>
                    <p>{question.description}</p>
                  </>
                )}

                <div className={styles.detailsGrid}>
                  <div><strong>Course:</strong> {courseName}</div>
                  <div><strong>Level:</strong> {question.level}</div>
                  <div><strong>Semester:</strong> {question.semester}</div>
                  <div><strong>Academic Year:</strong> {question.academicYear}</div>
                  <div><strong>File Type:</strong> {question.fileType?.toUpperCase() || 'PDF'}</div>
                </div>

                {question.uploadedBy && (
                  <div className={styles.uploaderSection}>
                    <FaUser /> <span>{question.uploadedBy.name}</span>
                  </div>
                )}
              </div>

              <div className={styles.actionButtons}>
              <Button
                variant="primary"
                leftIcon={<FaDownload />}
                onClick={async () => {
                  const fileUrl = question.cloudinaryUrl || question.fileInfo?.url
                  if (!fileUrl) return toast.error('No file to download!')

                  try {
                    const response = await fetch(fileUrl)
                    const blob = await response.blob()
                    const link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = question.title || 'past-question'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    toast.success('Download started!')
                  } catch (err) {
                    console.error(err)
                    toast.error('Failed to download file')
                  }
                }}
              >
                Download File
              </Button>

                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      leftIcon={<FaEdit />}
                      /* Navigates to the route you specified using the question's ID */
                      onClick={() => navigate(`/edit-questions/${question?._id || id}`)}
                      className={styles.pharmacyEditBtn}
                    >
                      Edit Question
                    </Button>

                    <Button
                      variant="danger"
                      leftIcon={<FaTrash />}
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className={styles.previewColumn}>
            <Card className={styles.previewCard}>
              <h3 className={styles.previewTitle}>Question Preview</h3>

              <div className={styles.mediaContainer}>
                {/* Logic: Try to get URL from cloudinary or fileInfo */}
                {(() => {
                  const url = question.cloudinaryUrl || question.fileInfo?.url;
                  
                  // Auto-detect type if question.fileType is missing
                  const detectedType = (question.fileType || url?.split('.').pop() || '').toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(detectedType);
                  const isPdf = detectedType === 'pdf';

                  if (!url) {
                    return (
                      <div className={styles.noFile}>
                        <span>No document attached</span>
                      </div>
                    );
                  }

                  if (isImage) {
                    return (
                      <img
                        src={url}
                        alt={question.title}
                        className={styles.previewImage}
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  }

                  if (isPdf) {
                    return (
                      <iframe
                        src={`${url}#toolbar=0`}
                        className={styles.previewIframe}
                        title={question.title}
                      />
                    );
                  }

                  return <div className={styles.noFile}>Preview not available for {detectedType} or view full screen</div>;
                })()}
              </div>

              {/* Download / Full Preview Button */}
              <div className={styles.actionBox}>
                <Button
                  variant="primary"
                  className={styles.greenPreviewBtn}
                  leftIcon={<FaEye />}
                  onClick={handleDownload}
                  loading={isDownloading}
                  fullWidth
                >
                  View Full Screen
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Past Question">
        <p>Are you sure you want to delete this past question?</p>
        <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isLoading}>Delete</Button>
      </Modal>
    </Layout>
  )
}
