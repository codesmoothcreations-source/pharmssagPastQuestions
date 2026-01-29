import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '../../../components/layout/Layout/Layout';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import { useCreatePastQuestion } from '../../../hooks/usePastQuestions';
import { useCourses } from '../../../hooks/useCourses';
import { useAuth } from '../../../contexts/AuthContext';
import { FaUpload, FaFilePdf, FaImage, FaTimes, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './UploadModal.module.css';

// File validation
const fileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => [
        'application/pdf', 
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'image/jpeg', 
        'image/png', 
        'image/jpg'
      ].includes(file.type),
      'Only PDF, Word documents, and Images are allowed'
    )
});

// Form schema
const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  course: z.string().min(1, 'Course is required'), // Simplified to allow both ID and Code
  level: z.string().min(1, 'Level is required'),
  semester: z.enum(['1st', '2nd']),
  academicYear: z.string().min(4, 'Academic year is required'),
  description: z.string().max(500).optional(),
});

export default function UploadPastQuestion() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState('');
  const { data: courses = [] } = useCourses();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      semester: '1st',
      level: '100'
    }
  });

  const createMutation = useCreatePastQuestion();

  // Force refetch when component mounts
  // useEffect(() => {
  //   refetch(); // If your useCourses hook provides a refetch function
  // }, []);

  // Check if user is admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');
    
    if (selectedFile) {
      try {
        fileSchema.parse({ file: selectedFile });
        setFile(selectedFile);
        toast.success(`File selected: ${selectedFile.name}`);
      } catch (error) {
        const errorMsg = error.errors[0].message;
        setFileError(errorMsg);
        setFile(null);
        e.target.value = '';
        toast.error(errorMsg);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
    document.getElementById('file-upload').value = '';
  };

  const onSubmit = async (data) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
  
    // Debugging: Log file size to console
    console.log(`📤 Uploading: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
    const formData = new FormData();
    // Ensure these field names match your backend EXACTLY
    formData.append('title', data.title);
    formData.append('course', data.course); 
    formData.append('level', data.level);
    formData.append('semester', data.semester);
    formData.append('academicYear', data.academicYear);
    formData.append('file', file); // The key MUST be 'file'
  
    const toastId = toast.loading('Sending to server (this may take a minute)...');
  
    createMutation.mutate(formData, {
      onSuccess: (response) => {
        toast.success('Uploaded successfully!', { id: toastId });
        navigate('/past-questions');
      },
      onError: (error) => {
        console.error("Full Axios Error Object:", error);
        const msg = error.response?.data?.error || "Server timeout - check file size";
        toast.error(msg, { id: toastId });
      }
    });
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload />;
    if (file.type === 'application/pdf') return <FaFilePdf />;
    if (file.type.includes('word') || file.type.includes('officedocument')) return <FaFileWord />; // Add FaFileWord
    if (file.type.includes('image')) return <FaImage />;
    return <FaUpload />;
  };

  const getFileTypeColor = () => {
    if (!file) return '#6c757d';
    if (file.type === 'application/pdf') return '#e11d48'; // Medical Red
    if (file.type.includes('word')) return '#2563eb'; // Doc Blue
    if (file.type.includes('image')) return '#059669'; // Pharmacy Green
    return '#6c757d';
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <Layout>
        <div className={styles.unauthorized}>
          <Card>
            <div className={styles.unauthorizedContent}>
              <h2>Authentication Required</h2>
              <p>You must be logged in to upload past questions.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
              >
                Login to Continue
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show unauthorized message for non-admins
  if (!isAdmin) {
    return (
      <Layout>
        <div className={styles.unauthorized}>
          <Card>
            <div className={styles.unauthorizedContent}>
              <h2>Access Denied</h2>
              <p>
                You need to be an administrator to upload past questions.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/past-questions')}
              >
                Browse Past Questions
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.uploadPage}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Upload Past Question</h1>
            <p className={styles.subtitle}>
              Share past questions with the pharmacy community
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainContent}>
            <Card className={styles.uploadCard}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Title *
                    </label>
                    <input
                      {...register('title')}
                      className={`${styles.input} ${errors.title ? styles.error : ''}`}
                      placeholder="e.g., Pharmacology Final Exam 2023"
                    />
                    {errors.title && (
                      <span className={styles.errorMessage}>{errors.title.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Course *
                    </label>
                    <select
                      {...register('course')}
                      className={`${styles.select} ${errors.course ? styles.error : ''}`}
                    >
                      <option value="">Select Course</option>
                      <option value="6960c248a659216a84b50d13">Dispensing Techniques Practicals I (DISPP1001)</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id || course.code}> {/* USE course.code NOT course._id */}
                          {course.name} ({course._id || course.code})
                        </option>
                      ))}
                    </select>
                    {errors.course && (
                      <span className={styles.errorMessage}>{errors.course.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Level *
                    </label>
                    <select
                      {...register('level')}
                      className={`${styles.select} ${errors.level ? styles.error : ''}`}
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                    </select>
                    {errors.level && (
                      <span className={styles.errorMessage}>{errors.level.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Semester *
                    </label>
                    <select
                      {...register('semester')}
                      className={`${styles.select} ${errors.semester ? styles.error : ''}`}
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                    {errors.semester && (
                      <span className={styles.errorMessage}>{errors.semester.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Academic Year *
                    </label>
                    <select
                      {...register('academicYear')}
                      className={`${styles.select} ${errors.academicYear ? styles.error : ''}`}
                    >
                      <option value="">Select Year</option>
                      <option value="2023/2024">2023/2024</option>
                      <option value="2022/2023">2022/2023</option>
                      <option value="2021/2022">2021/2022</option>
                      <option value="2020/2021">2020/2021</option>
                      <option value="2019/2020">2019/2020</option>
                    </select>
                    {errors.academicYear && (
                      <span className={styles.errorMessage}>{errors.academicYear.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Description (Optional)</label>
                    <textarea
                      {...register('description')}
                      className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                      placeholder="Add any additional information about this past question..."
                      rows="3"
                    />
                    {errors.description && (
                      <span className={styles.errorMessage}>{errors.description.message}</span>
                    )}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fileUpload}`}>
                    <label className={styles.label}>
                      Upload File *
                    </label>
                    <div className={styles.uploadArea}>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        id="file-upload"
                        name="file" // Name attribute for clarity
                        className={styles.fileInput}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }} // Hide the default ugly button
                      />
                      
                      {file ? (
                        <div className={styles.fileInfo}>
                          <div className={styles.fileIcon} style={{ color: getFileTypeColor() }}>
                            {getFileIcon()}
                          </div>
                          <div className={styles.fileDetails}>
                            <span className={styles.fileName}>{file.name}</span>
                            <div className={styles.fileMeta}>
                              <span className={styles.fileType}>
                                {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                              </span>
                              <span className={styles.fileSize}>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.removeFile}
                            onClick={removeFile}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="file-upload" className={styles.uploadPrompt}>
                          <div className={styles.uploadIcon}>
                            <FaUpload />
                          </div>
                          <div className={styles.uploadText}>
                            <span className={styles.uploadTitle}>Click to select file</span>
                            <span className={styles.uploadSubtitle}>
                              PDF, JPG, PNG up to 10MB
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/past-questions')}
                    disabled={createMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<FaUpload />}
                    loading={createMutation.isLoading}
                    disabled={createMutation.isLoading || !file}
                  >
                    {createMutation.isLoading ? 'Uploading...' : 'Upload Question'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <Card className={styles.guidelinesCard}>
              <h3 className={styles.guidelinesTitle}>
                <FaCheckCircle /> Upload Guidelines
              </h3>
              <ul className={styles.guidelinesList}>
                <li>Only upload pharmacy-related past questions</li>
                <li>Ensure files are clear and readable</li>
                <li>Use descriptive titles</li>
                <li>Select the correct course and level</li>
                <li>Maximum file size: 10MB</li>
                <li>Allowed formats: PDF, JPG, PNG</li>
                <li>No spam or inappropriate content</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}