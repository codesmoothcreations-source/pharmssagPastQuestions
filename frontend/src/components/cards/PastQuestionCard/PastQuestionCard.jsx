import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import Button from '../../ui/Button/Button'
import { FaDownload, FaEye, FaFilePdf, FaFileImage } from 'react-icons/fa'
import styles from './PastQuestionCard.module.css'

export default function PastQuestionCard({ question }) {
  const { isAdmin } = useAuth()

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FaFilePdf className={styles.pdfIcon} />
    if (fileType === 'image') return <FaFileImage className={styles.imageIcon} />
    return <FaFilePdf className={styles.pdfIcon} />
  }

  const getFileTypeText = (fileType) => {
    if (fileType === 'pdf') return 'PDF'
    if (fileType === 'image') return 'Image'
    return 'File'
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    console.log('Downloading:', question?._id)
  }

  // ✅ SAFELY EXTRACT VALUES (THIS FIXES THE ERROR)
  const courseCode =
    typeof question?.course === 'object' ? question.course.code : null

  const courseName =
    typeof question?.course === 'object' ? question.course.name : null

  const semester =
    typeof question?.semester === 'string' || typeof question?.semester === 'number'
      ? question.semester
      : question?.semester?.name || 'N/A'

  const level =
    typeof question?.level === 'number' || typeof question?.level === 'string'
      ? question.level
      : 'N/A'

  const academicYear =
    typeof question?.academicYear === 'string'
      ? question.academicYear
      : question?.academicYear?.year || 'N/A'

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.fileType}>
          {getFileIcon(question?.fileType)}
          <span className={styles.fileTypeText}>
            {getFileTypeText(question?.fileType)}
          </span>
        </div>

        <span className={`${styles.level} ${styles[`level${level}`]}`}>
          Level {level}
        </span>
      </div>

      <div className={styles.cardBody}>
        <Link to={`/past-questions/${question?._id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{question?.title || 'Untitled'}</h3>
        </Link>

        <div className={styles.courseInfo}>
          <span className={styles.courseName}>
            {courseCode && courseName
              ? `${courseCode} – ${courseName}`
              : 'Unknown Course'}
          </span>

          <span className={styles.separator}>•</span>

          <span className={styles.semester}>{semester} Semester</span>
        </div>

        {question?.description && (
          <p className={styles.description}>{question.description}</p>
        )}

        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Year:</span>
            <span className={styles.metaValue}>{academicYear}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Size:</span>
            <span className={styles.metaValue}>
              {question?.fileSize
                ? (question.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
                : 'N/A'}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Pages:</span>
            <span className={styles.metaValue}>
              {question?.metadata?.pages || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <FaEye className={styles.statIcon} />
            <span className={styles.statNumber}>{question?.views || 0}</span>
          </div>

          {isAdmin && (
            <div className={styles.stat}>
              <FaDownload className={styles.statIcon} />
              <span className={styles.statNumber}>
                {question?.downloads || 0}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            size="small"
            variant="outline"
            className={styles.previewBtn}
            as={Link}
            to={`/past-questions/${question?._id}`}
          >
            Preview
          </Button>

          <Button
            size="small"
            variant="primary"
            leftIcon={<FaDownload />}
            className={styles.downloadBtn}
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
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
