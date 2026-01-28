import React, { useState, useEffect } from 'react' // Add useEffect
import Layout from '../../../components/layout/Layout/Layout'
import Card from '../../../components/ui/Card/Card'
import Button from '../../../components/ui/Button/Button'
import VideoCard from '../../../components/cards/VideoCard/VideoCard'
import { useVideoSearch, useTrendingVideos, useVideoPlaylists } from '../../../hooks/useVideos'
import useDebounce from '../../../hooks/useDebounce'
import { FaSearch, FaYoutube, FaFire } from 'react-icons/fa'
import styles from './VideosList.module.css'

export default function VideosList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('trending')
  const [hasSearched, setHasSearched] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  const { data: searchResults, isLoading: searchLoading } = useVideoSearch(debouncedSearch)
  const { data: trendingVideos, isLoading: trendingLoading } = useTrendingVideos()

  // Reset search flag when query is cleared
  useEffect(() => {
    if (!searchQuery) {
      setHasSearched(false)
    }
  }, [searchQuery])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveTab('search')
      setHasSearched(true)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isLoading = searchLoading || trendingLoading

  const getActiveVideos = () => {
    if (activeTab === 'search' && searchQuery && hasSearched) {
      return searchResults?.videos || searchResults?.data || []
    }
    return trendingVideos?.videos || trendingVideos?.data || []
  }

  const videos = getActiveVideos()

  return (
    <Layout>
      <div className={styles.videosPage}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FaYoutube className={styles.titleIcon} />
              Pharmacy Videos
            </h1>
            <p className={styles.subtitle}>
              Educational videos, lectures, and tutorials for pharmacy students
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card className={styles.searchCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search pharmacy videos (e.g., pharmacology, clinical pharmacy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.searchInput}
              />
            </div>
            <Button
              variant="primary"
              leftIcon={<FaSearch />}
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'trending' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('trending')
              setSearchQuery('')
              setHasSearched(false)
            }}
          >
            <FaFire className={styles.tabIcon} />
            Trending Videos
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
            disabled={!hasSearched}
          >
            <FaSearch className={styles.tabIcon} />
            Search Results
            {searchQuery && hasSearched && (
              <span className={styles.searchCount}>
                {Array.isArray(videos) ? videos.length : 0}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <>
            {/* Results Info */}
            <div className={styles.resultsInfo}>
              {isLoading ? (
                <div className={styles.loadingText}>Loading videos...</div>
              ) : (
                <>
                  <span className={styles.resultsCount}>
                    {Array.isArray(videos) ? videos.length : 0} {Array.isArray(videos) && videos.length === 1 ? 'video' : 'videos'} found
                  </span>
                  {activeTab === 'search' && searchQuery && (
                    <span className={styles.searchTerm}>
                      for "{searchQuery}"
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Videos Grid */}
            <div className={styles.videosGrid}>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.videoSkeleton}>
                    <div className={styles.skeletonThumbnail}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonChannel}></div>
                    <div className={styles.skeletonMeta}></div>
                  </div>
                ))
              ) : !Array.isArray(videos) || videos.length === 0 ? (
                <Card className={styles.emptyState}>
                  <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>📺</div>
                    <h3 className={styles.emptyTitle}>No videos found</h3>
                    <p className={styles.emptyDescription}>
                      {activeTab === 'search' 
                        ? 'Try a different search term' 
                        : 'Check back later for trending videos'}
                    </p>
                    {activeTab === 'search' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setActiveTab('trending')
                          setHasSearched(false)
                        }}
                      >
                        View Trending Videos
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                videos.map((video, index) => (
                  <VideoCard 
                    key={video.id || video.videoId || `video-${index}`} 
                    video={video} 
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {Array.isArray(videos) && videos.length > 0 && (
              <div className={styles.loadMore}>
                <Button
                  variant="outline"
                  disabled={true} // Disabled until backend implements pagination
                >
                  Load More Videos
                </Button>
              </div>
            )}
          </>
        
      </div>
    </Layout>
  )
}