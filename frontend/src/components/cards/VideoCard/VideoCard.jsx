// src/components/cards/VideoCard/VideoCard.jsx - Updated for backend YouTube API
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaEye, FaClock, FaCalendar } from 'react-icons/fa'
import styles from './VideoCard.module.css'

export default function VideoCard({ video }) {
  const navigate = useNavigate()
  
  // Extract video properties from backend response
  const videoId = video?.id || video?.videoId || ''
  const title = video?.title || 'Untitled Video'
  
  // Get thumbnail - backend returns thumbnail object with medium/high
  const thumbnail = video?.thumbnail?.medium || 
                   video?.thumbnail?.high || 
                   video?.thumbnail?.default ||
                   video?.thumbnail ||
                   (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '')
  
  const channelTitle = video?.channelTitle || 'Unknown Channel'
  const publishedAt = video?.publishedAt || ''
  
  // Backend returns statistics object
  const viewCount = video?.statistics?.viewCount || 
                   video?.viewCount || 
                   video?.views || 
                   0
  
  // Backend returns duration in ISO 8601 format (PT15M30S)
  const duration = video?.contentDetails?.duration || 
                  video?.duration || 
                  ''
  
  const description = video?.description || ''

  const formatDuration = (duration) => {
    if (!duration) return ''
    
    // Parse ISO 8601 duration format (PT15M30S, PT1H2M30S, etc.)
    if (typeof duration === 'string' && duration.startsWith('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const hours = parseInt(match[1] || 0)
        const minutes = parseInt(match[2] || 0)
        const seconds = parseInt(match[3] || 0)
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    }
    
    // If duration is in seconds (number)
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const secs = duration % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
    
    return duration
  }

  const formatViewCount = (count) => {
    if (!count) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return dateString
    }
  }

  const handleClick = () => {
    if (videoId) {
      navigate(`/videos/${videoId}`)
    }
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
    }
  }

  return (
    <div className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.thumbnail}>
        <img
          src={thumbnail || 'https://via.placeholder.com/320x180?text=Video+Thumbnail'}
          alt={title}
          className={styles.thumbnailImage}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail'
          }}
        />
        <div className={styles.overlay}>
          <button className={styles.playButton} onClick={handlePlay}>
            <FaPlay />
          </button>
          {duration && (
            <span className={styles.duration}>
              <FaClock className={styles.durationIcon} />
              {formatDuration(duration)}
            </span>
          )}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        
        <div className={styles.channel}>
          <div className={styles.channelFallback}>
            {channelTitle.charAt(0).toUpperCase()}
          </div>
          <span className={styles.channelName}>{channelTitle}</span>
        </div>
        
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <FaEye className={styles.metaIcon} />
            <span>{formatViewCount(viewCount)} views</span>
          </div>
          <div className={styles.metaItem}>
            <FaCalendar className={styles.metaIcon} />
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>
        
        {description && (
          <p className={styles.description}>
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description}
          </p>
        )}
      </div>
    </div>
  )
}