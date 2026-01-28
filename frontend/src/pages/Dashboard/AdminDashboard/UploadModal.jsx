// src/pages/Dashboard/AdminDashboard/UploadModal.jsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../../components/ui/Modal/Modal'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pastQuestionsApi } from '../../../api/pastQuestionsApi'
import toast from 'react-hot-toast'
import styles from './UploadModal.module.css'

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  course: z.string().min(1, 'Course is required'),
  level: z.number().min(100).max(400),
  semester: z.enum(['1st', '2nd']),
  academicYear: z.string().min(4, 'Academic year is required'),
  description: z.string().optional(),
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine((file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type), 
      'File must be PDF, JPEG, or PNG')
})

export default function UploadModal({ onClose }) {
  const [file, setFile] = useState(null)
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(uploadSchema)
  })

  const uploadMutation = useMutation({
    mutationFn: (data) => pastQuestionsApi.create(data),
    onSuccess: () => {
      toast.success('Past question uploaded successfully!')
      queryClient.invalidateQueries(['recent-questions'])
      queryClient.invalidateQueries(['past-questions'])
      reset()
      setFile(null)
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    }
  })

  const onSubmit = async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    
    if (file) {
      formData.append('file', file)
    }

    await uploadMutation.mutateAsync(formData)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Past Question">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          <Input
            label="Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Enter question title"
            required
          />

          <Input
            label="Course"
            {...register('course')}
            error={errors.course?.message}
            placeholder="e.g., Pharmacology"
            required
          />

          <div className={styles.selectGroup}>
            <label className={styles.label}>Level</label>
            <select
              {...register('level', { valueAsNumber: true })}
              className={`${styles.select} ${errors.level ? styles.error : ''}`}
              required
            >
              <option value="">Select Level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
            </select>
            {errors.level && (
              <p className={styles.errorText}>{errors.level.message}</p>
            )}
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Semester</label>
            <select
              {...register('semester')}
              className={`${styles.select} ${errors.semester ? styles.error : ''}`}
              required
            >
              <option value="">Select Semester</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
            </select>
            {errors.semester && (
              <p className={styles.errorText}>{errors.semester.message}</p>
            )}
          </div>

          <Input
            label="Academic Year"
            {...register('academicYear')}
            error={errors.academicYear?.message}
            placeholder="e.g., 2022/2023"
            required
          />

          <div className={styles.textareaGroup}>
            <label className={styles.label}>Description (Optional)</label>
            <textarea
              {...register('description')}
              className={styles.textarea}
              placeholder="Add description or instructions..."
              rows="3"
            />
          </div>

          <div className={styles.fileUpload}>
            <label className={styles.label}>Upload File</label>
            <div className={styles.uploadArea}>
              <input
                type="file"
                id="file"
                className={styles.fileInput}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <label htmlFor="file" className={styles.uploadLabel}>
                {file ? (
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>📁</div>
                    <div className={styles.uploadText}>
                      <span className={styles.uploadTitle}>Click to upload</span>
                      <span className={styles.uploadSubtitle}>PDF, JPG, PNG up to 10MB</span>
                    </div>
                  </>
                )}
              </label>
            </div>
            {errors.file && (
              <p className={styles.errorText}>{errors.file.message}</p>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploadMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={uploadMutation.isLoading}
            disabled={uploadMutation.isLoading}
          >
            Upload Question
          </Button>
        </div>
      </form>
    </Modal>
  )
}