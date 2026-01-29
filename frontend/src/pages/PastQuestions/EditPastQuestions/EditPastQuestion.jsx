import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSave, FaArrowLeft, FaFileAlt, FaCloudUploadAlt, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

import Layout from '../../../components/layout/Layout/Layout';
import Card from '../../../components/ui/Card/Card';
import Button from '../../../components/ui/Button/Button';
import { usePastQuestionById, useUpdatePastQuestion } from '../../../hooks/usePastQuestions';
import { useCourses } from '../../../hooks/useCourses';
import styles from './EditPastQuestion.module.css';

const editSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  course: z.string().min(1, 'Course is required'),
  level: z.string().min(1, 'Level is required'),
  semester: z.enum(['1st', '2nd']),
  academicYear: z.string().min(4, 'Academic year is required'),
  description: z.string().max(500).optional(),
});

export default function EditPastQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: question, isLoading: isFetching } = usePastQuestionById(id);
  const { data: courses = [] } = useCourses();
  const updateMutation = useUpdatePastQuestion();
  
  const [newFile, setNewFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
  });

  // Pre-fill form when data arrives
  useEffect(() => {
    if (question) {
      reset({
        title: question.title,
        course: question.course?._id || question.course,
        level: question.level,
        semester: question.semester,
        academicYear: question.academicYear,
        description: question.description || '',
      });
    }
  }, [question, reset]);

  const onUpdate = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    
    if (newFile) {
      formData.append('file', newFile);
    }

    const toastId = toast.loading('Updating record...');

    updateMutation.mutate({ id, data: formData }, {
      onSuccess: () => {
        toast.success('Question updated successfully!', { id: toastId });
        navigate(`/past-questions/${id}`);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
      }
    });
  };

  if (isFetching) return <div className={styles.loader}>Healing the data...</div>;

  return (
    <Layout>
      <div className={styles.editContainer}>
        <header className={styles.header}>
          <Button 
            variant="ghost" 
            leftIcon={<FaArrowLeft />} 
            onClick={() => navigate(-1)}
            className={styles.backBtn}
          >
            Back
          </Button>
          <div className={styles.titleArea}>
            <FaLeaf className={styles.leafIcon} />
            <h1>Edit Past Question</h1>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <form onSubmit={handleSubmit(onUpdate)} className={styles.formSection}>
            <Card className={styles.editCard}>
              <div className={styles.inputGroup}>
                <label>Question Title</label>
                <input {...register('title')} className={errors.title ? styles.errorInput : ''} />
                {errors.title && <p className={styles.errorText}>{errors.title.message}</p>}
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Course</label>
                  <select {...register('course')}>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Level</label>
                  <select {...register('level')}>
                    {['100', '200', '300', '400', '500'].map(l => <option key={l} value={l}>{l} Level</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Semester</label>
                  <select {...register('semester')}>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Academic Year</label>
                  <input {...register('academicYear')} placeholder="e.g. 2023/2024" />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description (Notes for students)</label>
                <textarea {...register('description')} rows="4" />
              </div>

              <div className={styles.fileSection}>
                <label>Attached Document</label>
                <div className={styles.currentFile}>
                  <FaFileAlt />
                  <span>{newFile ? newFile.name : 'Current: ' + (question?.title || 'Document')}</span>
                </div>
                <label htmlFor="file-replace" className={styles.replaceBtn}>
                  <FaCloudUploadAlt /> Replace File
                  <input 
                    id="file-replace" 
                    type="file" 
                    hidden 
                    onChange={(e) => setNewFile(e.target.files[0])} 
                  />
                </label>
              </div>

              <div className={styles.actions}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  leftIcon={<FaSave />}
                  loading={updateMutation.isLoading}
                  className={styles.saveBtn}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>

          <aside className={styles.infoSidebar}>
            <Card className={styles.tipCard}>
              <h3>Pro-Tip</h3>
              <p>Updating the course or academic year helps students find this question faster in the search filter!</p>
            </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
}