import React from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import Loader from '../../../components/ui/Loader/Loader'
import VideoCard from '../../../components/cards/VideoCard/VideoCard'
import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../../../api/videosApi'
import { FaArrowLeft, FaYoutube, FaCalendar, FaEye, FaThumbsUp } from 'react-icons/fa'
import styles from './VideoDetail.module.css'

export default function VideoDetail() {
  const { id } = useParams()

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.getById(id),
    enabled: !!id
  })

  const { data: relatedVideosData } = useQuery({
    queryKey: ['related-videos'],
    queryFn: () => videosApi.getTrending(),
    enabled: !!video
  })

  const relatedVideos = relatedVideosData?.videos || relatedVideosData?.data || []

  // Logic to handle external redirect
  const handleExternalRedirect = (videoId) => {
    if (!videoId) return;
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  }

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader text="Loading video..." />
        </div>
      </Layout>
    )
  }

  if (error || !video) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h2>Video Not Found</h2>
          <p>The requested video could not be found.</p>
          <Link to="/videos">
            <Button variant="primary">
              <FaArrowLeft /> Back to Videos
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const videoId = video?.id || id
  const title = video?.title || 'Untitled Video'
  const description = video?.description || ''
  const channelTitle = video?.channelTitle || 'Unknown Channel'
  const publishedAt = video?.publishedAt || ''
  const statistics = video?.statistics || {}

  return (
    <Layout>
      <div className={styles.videoDetail}>
        <div className={styles.backNavigation}>
          <Link to="/videos" className={styles.backLink}>
            <FaArrowLeft className={styles.backIcon} />
            Back to Videos
          </Link>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.videoColumn}>
            <Card className={styles.videoCard}>
              <div className={styles.videoWrapper}>
                <iframe
                  className={styles.videoPlayer}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={title} // Fixed: was snippet.title
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className={styles.videoInfo}>
                <h1 className={styles.videoTitle}>{title}</h1>

                <div className={styles.videoMeta}>
                  <div className={styles.metaItem}>
                    <FaCalendar className={styles.metaIcon} />
                    <span>
                      {publishedAt ? new Date(publishedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {statistics.viewCount && (
                    <div className={styles.metaItem}>
                      <FaEye className={styles.metaIcon} />
                      <span>{parseInt(statistics.viewCount).toLocaleString()} views</span>
                    </div>
                  )}
                  {statistics.likeCount && (
                    <div className={styles.metaItem}>
                      <FaThumbsUp className={styles.metaIcon} />
                      <span>{parseInt(statistics.likeCount).toLocaleString()} likes</span>
                    </div>
                  )}
                </div>

                {description && (
                  <div className={styles.description}>
                    <h3 className={styles.descriptionTitle}>Description</h3>
                    <p className={styles.descriptionText}>{description}</p>
                  </div>
                )}

                <div className={styles.channelInfo}>
                  <div className={styles.channelAvatar}>
                    <FaYoutube />
                  </div>
                  <div className={styles.channelDetails}>
                    <h4 className={styles.channelName}>{channelTitle}</h4>
                    <p className={styles.channelSubtitle}>YouTube Channel</p>
                  </div>
                  <Button variant="outline" size="small">
                    Subscribe
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.relatedColumn}>
            <Card className={styles.relatedCard}>
              <h3 className={styles.relatedTitle}>Related Videos</h3>
              <div className={styles.relatedList}>
                {relatedVideos.slice(0, 5).map((relatedVideo, index) => {
                  const rId = relatedVideo.id || relatedVideo.videoId
                  return (
                    <div
                      key={rId || `related-${index}`}
                      className={styles.relatedItem}
                      onClick={() => handleExternalRedirect(rId)}
                      role="button"
                      aria-label={`Watch ${relatedVideo.title} on YouTube`}
                    >
                      <VideoCard video={relatedVideo} />
                    </div>
                  )
                })}
              </div>
              <Link to="/videos" className={styles.viewAllLink}>
                View All Videos →
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}