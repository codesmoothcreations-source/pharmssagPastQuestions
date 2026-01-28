import axios from 'axios';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

// YouTube API configuration
const YOUTUBE_API_URL = process.env.YOUTUBE_API_URL || 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Check if YouTube API is configured
const isYouTubeConfigured = () => {
    return !!YOUTUBE_API_KEY;
};

// Get YouTube configuration status
const getYouTubeConfigStatus = () => {
    if (!YOUTUBE_API_KEY) {
        return {
            configured: false,
            message: 'YouTube API key is not configured in environment variables'
        };
    }
    
    if (YOUTUBE_API_KEY.startsWith('your_') || YOUTUBE_API_KEY === '') {
        return {
            configured: false,
            message: 'YouTube API key is not properly set. Please add your actual API key to .env file'
        };
    }
    
    return {
        configured: true,
        message: 'YouTube API is configured and ready'
    };
};

// @desc    Search pharmacy-related YouTube videos
// @route   GET /api/videos/search
// @access  Public
export const searchVideos = asyncHandler(async (req, res) => {
    const { q = 'pharmacy', page = 1, maxResults = 20 } = req.query;

    // Check YouTube configuration
    const configStatus = getYouTubeConfigStatus();
    if (!configStatus.configured) {
        logger.warn('YouTube API not configured:', configStatus.message);
        
        // Return sample data for development
        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API not configured)',
                configStatus,
                query: q,
                count: 5,
                data: getSampleVideos(),
                pagination: {
                    page: parseInt(page),
                    maxResults: parseInt(maxResults),
                    totalResults: 5,
                    resultsPerPage: 5,
                    nextPageToken: null,
                    prevPageToken: null,
                    hasNext: false,
                    hasPrev: false
                }
            });
        }
        
        return res.status(503).json({
            success: false,
            message: 'YouTube API is not configured',
            details: configStatus.message,
            documentation: 'Please add YOUTUBE_API_KEY to your .env file'
        });
    }

    try {
        const searchQuery = `pharmacy ${q}`.trim();
        const startIndex = (parseInt(page) - 1) * parseInt(maxResults) + 1;

        const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                part: 'snippet',
                q: searchQuery,
                key: YOUTUBE_API_KEY,
                maxResults: Math.min(parseInt(maxResults), 50),
                type: 'video',
                videoEmbeddable: 'true',
                videoSyndicated: 'true',
                relevanceLanguage: 'en',
                safeSearch: 'moderate',
                startIndex: startIndex <= 0 ? 1 : startIndex
            },
            timeout: 10000
        });

        const { items, pageInfo, nextPageToken, prevPageToken } = response.data;

        if (!items || items.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No videos found',
                query: searchQuery,
                count: 0,
                data: []
            });
        }

        // Extract relevant video data
        const videos = items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            thumbnail: {
                default: item.snippet.thumbnails.default?.url,
                medium: item.snippet.thumbnails.medium?.url,
                high: item.snippet.thumbnails.high?.url,
                standard: item.snippet.thumbnails.standard?.url,
                maxres: item.snippet.thumbnails.maxres?.url
            },
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
        }));

        // Try to get statistics for videos
        try {
            const videoIds = videos.map(video => video.id).join(',');
            const statsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
                params: {
                    part: 'statistics,contentDetails',
                    id: videoIds,
                    key: YOUTUBE_API_KEY
                },
                timeout: 5000
            });

            // Combine videos with statistics
            const videosWithStats = videos.map((video, index) => {
                const stats = statsResponse.data.items[index]?.statistics || {};
                const contentDetails = statsResponse.data.items[index]?.contentDetails || {};
                
                return {
                    ...video,
                    statistics: {
                        viewCount: parseInt(stats.viewCount) || 0,
                        likeCount: parseInt(stats.likeCount) || 0,
                        commentCount: parseInt(stats.commentCount) || 0
                    },
                    duration: contentDetails.duration || 'PT0S'
                };
            });

            logger.info('YouTube videos fetched successfully', {
                query: searchQuery,
                count: videosWithStats.length
            });

            return res.status(200).json({
                success: true,
                message: 'Videos fetched successfully',
                query: searchQuery,
                count: videosWithStats.length,
                pagination: {
                    page: parseInt(page),
                    maxResults: parseInt(maxResults),
                    totalResults: pageInfo?.totalResults || 0,
                    resultsPerPage: pageInfo?.resultsPerPage || 0,
                    nextPageToken,
                    prevPageToken,
                    hasNext: !!nextPageToken,
                    hasPrev: !!prevPageToken
                },
                data: videosWithStats
            });

        } catch (statsError) {
            logger.warn('Could not fetch video statistics:', statsError.message);
            
            // Return videos without statistics
            return res.status(200).json({
                success: true,
                message: 'Videos fetched (statistics unavailable)',
                query: searchQuery,
                count: videos.length,
                pagination: {
                    page: parseInt(page),
                    maxResults: parseInt(maxResults),
                    totalResults: pageInfo?.totalResults || 0,
                    resultsPerPage: pageInfo?.resultsPerPage || 0,
                    nextPageToken,
                    prevPageToken,
                    hasNext: !!nextPageToken,
                    hasPrev: !!prevPageToken
                },
                data: videos
            });
        }

    } catch (error) {
        logger.error('YouTube API error:', {
            message: error.message,
            query: q,
            status: error.response?.status,
            errorCode: error.response?.data?.error?.code
        });

        // Handle specific YouTube API errors
        if (error.response?.status === 403) {
            const errorMessage = error.response?.data?.error?.message;
            if (errorMessage?.includes('quota')) {
                return res.status(429).json({
                    success: false,
                    message: 'YouTube API quota exceeded',
                    details: 'The daily quota for YouTube API has been exceeded. Please try again tomorrow.',
                    errorCode: 'QUOTA_EXCEEDED'
                });
            }
            return res.status(403).json({
                success: false,
                message: 'YouTube API access denied',
                details: 'The API key may be invalid or restricted.',
                errorCode: 'ACCESS_DENIED'
            });
        }
        
        if (error.response?.status === 400) {
            return res.status(400).json({
                success: false,
                message: 'Invalid search parameters',
                details: error.response?.data?.error?.message || 'Bad request to YouTube API'
            });
        }
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: 'YouTube API request timeout',
                details: 'The request to YouTube API took too long.'
            });
        }

        // For development, return sample data on API failure
        if (process.env.NODE_ENV === 'development') {
            logger.info('Falling back to sample data due to API error');
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API error occurred)',
                originalError: error.message,
                query: q,
                count: 5,
                data: getSampleVideos(),
                pagination: {
                    page: parseInt(page),
                    maxResults: parseInt(maxResults),
                    totalResults: 5,
                    resultsPerPage: 5,
                    nextPageToken: null,
                    prevPageToken: null,
                    hasNext: false,
                    hasPrev: false
                }
            });
        }

        return res.status(502).json({
            success: false,
            message: 'Failed to fetch videos from YouTube',
            details: 'YouTube API service is temporarily unavailable.',
            errorCode: 'SERVICE_UNAVAILABLE'
        });
    }
});

// @desc    Get YouTube API configuration status
// @route   GET /api/videos/config
// @access  Public
export const getConfigStatus = asyncHandler(async (req, res) => {
    const configStatus = getYouTubeConfigStatus();
    
    // Test the API key if configured
    let testResult = { success: false, message: 'Not tested' };
    
    if (configStatus.configured) {
        try {
            // Simple test request to verify API key
            const testResponse = await axios.get(`${YOUTUBE_API_URL}/search`, {
                params: {
                    part: 'snippet',
                    q: 'pharmacy',
                    key: YOUTUBE_API_KEY,
                    maxResults: 1,
                    type: 'video'
                },
                timeout: 5000
            });
            
            testResult = {
                success: true,
                message: 'API key is valid and working',
                testedAt: new Date().toISOString()
            };
            
        } catch (testError) {
            testResult = {
                success: false,
                message: testError.response?.data?.error?.message || testError.message,
                status: testError.response?.status,
                errorCode: testError.response?.data?.error?.code
            };
        }
    }

    res.status(200).json({
        success: true,
        configured: configStatus.configured,
        configuration: configStatus,
        testResult,
        environment: process.env.NODE_ENV,
        instructions: configStatus.configured ? null : {
            steps: [
                '1. Go to https://console.cloud.google.com/',
                '2. Create a new project or select existing one',
                '3. Enable YouTube Data API v3',
                '4. Create API credentials',
                '5. Copy the API key',
                '6. Add to .env file: YOUTUBE_API_KEY=your_key_here'
            ],
            documentation: 'https://developers.google.com/youtube/v3/getting-started'
        }
    });
});

// @desc    Get pharmacy-related playlists
// @route   GET /api/videos/playlists
// @access  Public
export const getPlaylists = asyncHandler(async (req, res) => {
    const configStatus = getYouTubeConfigStatus();
    
    if (!configStatus.configured) {
        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API not configured)',
                configStatus,
                count: 3,
                data: getSamplePlaylists()
            });
        }
        
        return res.status(503).json({
            success: false,
            message: 'YouTube API is not configured',
            details: configStatus.message
        });
    }

    try {
        // Search for pharmacy-related playlists
        const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                part: 'snippet',
                q: 'pharmacy education playlist',
                key: YOUTUBE_API_KEY,
                maxResults: 20,
                type: 'playlist'
            },
            timeout: 10000
        });

        const playlists = response.data.items.map(item => ({
            id: item.id.playlistId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails?.medium?.url,
            url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`
        }));

        logger.info('YouTube playlists fetched', { count: playlists.length });

        res.status(200).json({
            success: true,
            count: playlists.length,
            data: playlists
        });

    } catch (error) {
        logger.error('YouTube API error for playlists:', error.message);
        
        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API error)',
                error: error.message,
                count: 3,
                data: getSamplePlaylists()
            });
        }
        
        return res.status(502).json({
            success: false,
            message: 'Failed to fetch playlists',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get trending pharmacy videos
// @route   GET /api/videos/trending
// @access  Public
export const getTrendingVideos = asyncHandler(async (req, res) => {
    const configStatus = getYouTubeConfigStatus();
    
    if (!configStatus.configured) {
        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API not configured)',
                configStatus,
                count: 5,
                data: getSampleVideos()
            });
        }
        
        return res.status(503).json({
            success: false,
            message: 'YouTube API is not configured',
            details: configStatus.message
        });
    }

    try {
        // Get trending videos in education category
        const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: {
                part: 'snippet,statistics',
                chart: 'mostPopular',
                videoCategoryId: '27', // Education
                regionCode: 'US',
                maxResults: 20,
                key: YOUTUBE_API_KEY
            },
            timeout: 10000
        });

        // Filter for pharmacy-related content
        const pharmacyKeywords = [
            'pharmacy', 'pharmacology', 'medication', 'drug', 'dosage',
            'prescription', 'pharmacist', 'clinical', 'therapeutics',
            'medicine', 'pharmaceutical', 'healthcare'
        ];

        const filteredVideos = response.data.items
            .filter(item => {
                const title = item.snippet.title.toLowerCase();
                const description = item.snippet.description.toLowerCase();
                
                return pharmacyKeywords.some(keyword => 
                    title.includes(keyword) || description.includes(keyword)
                );
            })
            .map(item => ({
                id: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                channelTitle: item.snippet.channelTitle,
                channelId: item.snippet.channelId,
                publishedAt: item.snippet.publishedAt,
                thumbnail: {
                    default: item.snippet.thumbnails.default?.url,
                    medium: item.snippet.thumbnails.medium?.url,
                    high: item.snippet.thumbnails.high?.url
                },
                statistics: {
                    viewCount: parseInt(item.statistics.viewCount) || 0,
                    likeCount: parseInt(item.statistics.likeCount) || 0,
                    commentCount: parseInt(item.statistics.commentCount) || 0
                },
                url: `https://www.youtube.com/watch?v=${item.id}`,
                embedUrl: `https://www.youtube.com/embed/${item.id}`
            }));

        logger.info('Trending pharmacy videos fetched', { count: filteredVideos.length });

        res.status(200).json({
            success: true,
            count: filteredVideos.length,
            data: filteredVideos
        });

    } catch (error) {
        logger.error('YouTube API error for trending videos:', error.message);
        
        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API error)',
                error: error.message,
                count: 5,
                data: getSampleVideos()
            });
        }
        
        return res.status(502).json({
            success: false,
            message: 'Failed to fetch trending videos',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const configStatus = getYouTubeConfigStatus();

    if (!configStatus.configured) {
        if (process.env.NODE_ENV === 'development') {
            // Find sample video by ID or return first one
            const sampleVideos = getSampleVideos();
            const video = sampleVideos.find(v => v.id === id) || sampleVideos[0];
            
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API not configured)',
                configStatus,
                data: video
            });
        }
        
        return res.status(503).json({
            success: false,
            message: 'YouTube API is not configured',
            details: configStatus.message
        });
    }

    try {
        const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: {
                part: 'snippet,statistics,contentDetails',
                id: id,
                key: YOUTUBE_API_KEY
            },
            timeout: 10000
        });

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Video not found',
                videoId: id
            });
        }

        const video = response.data.items[0];
        const videoData = {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            publishedAt: video.snippet.publishedAt,
            thumbnail: {
                default: video.snippet.thumbnails.default?.url,
                medium: video.snippet.thumbnails.medium?.url,
                high: video.snippet.thumbnails.high?.url,
                standard: video.snippet.thumbnails.standard?.url,
                maxres: video.snippet.thumbnails.maxres?.url
            },
            statistics: {
                viewCount: parseInt(video.statistics.viewCount) || 0,
                likeCount: parseInt(video.statistics.likeCount) || 0,
                commentCount: parseInt(video.statistics.commentCount) || 0
            },
            contentDetails: {
                duration: video.contentDetails.duration,
                dimension: video.contentDetails.dimension,
                definition: video.contentDetails.definition,
                caption: video.contentDetails.caption === 'true'
            },
            url: `https://www.youtube.com/watch?v=${video.id}`,
            embedUrl: `https://www.youtube.com/embed/${video.id}`
        };

        logger.info('YouTube video fetched by ID', { videoId: id });

        res.status(200).json({
            success: true,
            data: videoData
        });

    } catch (error) {
        logger.error('YouTube API error for video by ID:', error.message);
        
        if (process.env.NODE_ENV === 'development') {
            const sampleVideos = getSampleVideos();
            const video = sampleVideos.find(v => v.id === id) || sampleVideos[0];
            
            return res.status(200).json({
                success: true,
                message: 'Using sample data (YouTube API error)',
                error: error.message,
                data: video
            });
        }
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Video not found',
                videoId: id
            });
        }
        
        return res.status(502).json({
            success: false,
            message: 'Failed to fetch video details',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// Sample data for development/testing
const getSampleVideos = () => {
    return [
        {
            id: 'dQw4w9WgXcQ',
            title: 'Introduction to Pharmacology - Basic Concepts',
            description: 'Learn the basic concepts of pharmacology in this introductory video.',
            channelTitle: 'Pharmacy Education',
            channelId: 'UC123456789',
            publishedAt: '2023-01-15T10:30:00Z',
            thumbnail: {
                default: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
                medium: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                high: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
            },
            statistics: {
                viewCount: 125000,
                likeCount: 4500,
                commentCount: 230
            },
            duration: 'PT15M30S',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isSample: true
        },
        {
            id: 'xQ4w9WgXdCQ',
            title: 'Dosage Calculations for Pharmacy Students',
            description: 'Step-by-step guide to dosage calculations with examples.',
            channelTitle: 'Medical Education',
            channelId: 'UC987654321',
            publishedAt: '2023-02-20T14:45:00Z',
            thumbnail: {
                default: 'https://img.youtube.com/vi/xQ4w9WgXdCQ/default.jpg',
                medium: 'https://img.youtube.com/vi/xQ4w9WgXdCQ/mqdefault.jpg',
                high: 'https://img.youtube.com/vi/xQ4w9WgXdCQ/hqdefault.jpg'
            },
            statistics: {
                viewCount: 89000,
                likeCount: 3200,
                commentCount: 150
            },
            duration: 'PT22M15S',
            url: 'https://www.youtube.com/watch?v=xQ4w9WgXdCQ',
            embedUrl: 'https://www.youtube.com/embed/xQ4w9WgXdCQ',
            isSample: true
        },
        {
            id: 'yR5w9WgXeCQ',
            title: 'Medication Administration Routes Explained',
            description: 'Understanding different routes of medication administration.',
            channelTitle: 'Nursing & Pharmacy',
            channelId: 'UC456789123',
            publishedAt: '2023-03-10T09:15:00Z',
            thumbnail: {
                default: 'https://img.youtube.com/vi/yR5w9WgXeCQ/default.jpg',
                medium: 'https://img.youtube.com/vi/yR5w9WgXeCQ/mqdefault.jpg',
                high: 'https://img.youtube.com/vi/yR5w9WgXeCQ/hqdefault.jpg'
            },
            statistics: {
                viewCount: 156000,
                likeCount: 5800,
                commentCount: 310
            },
            duration: 'PT18M45S',
            url: 'https://www.youtube.com/watch?v=yR5w9WgXeCQ',
            embedUrl: 'https://www.youtube.com/embed/yR5w9WgXeCQ',
            isSample: true
        },
        {
            id: 'zS6w9WgXfCQ',
            title: 'Common Drug Interactions in Pharmacy Practice',
            description: 'Learn about common drug interactions and how to avoid them.',
            channelTitle: 'Clinical Pharmacy',
            channelId: 'UC789123456',
            publishedAt: '2023-04-05T16:20:00Z',
            thumbnail: {
                default: 'https://img.youtube.com/vi/zS6w9WgXfCQ/default.jpg',
                medium: 'https://img.youtube.com/vi/zS6w9WgXfCQ/mqdefault.jpg',
                high: 'https://img.youtube.com/vi/zS6w9WgXfCQ/hqdefault.jpg'
            },
            statistics: {
                viewCount: 210000,
                likeCount: 7200,
                commentCount: 420
            },
            duration: 'PT25M10S',
            url: 'https://www.youtube.com/watch?v=zS6w9WgXfCQ',
            embedUrl: 'https://www.youtube.com/embed/zS6w9WgXfCQ',
            isSample: true
        },
        {
            id: 'aT7w9WgXgCQ',
            title: 'Pharmacy Law and Ethics - Complete Guide',
            description: 'Comprehensive guide to pharmacy law and ethical considerations.',
            channelTitle: 'Pharmacy Professional',
            channelId: 'UC321654987',
            publishedAt: '2023-05-12T11:30:00Z',
            thumbnail: {
                default: 'https://img.youtube.com/vi/aT7w9WgXgCQ/default.jpg',
                medium: 'https://img.youtube.com/vi/aT7w9WgXgCQ/mqdefault.jpg',
                high: 'https://img.youtube.com/vi/aT7w9WgXgCQ/hqdefault.jpg'
            },
            statistics: {
                viewCount: 95000,
                likeCount: 3800,
                commentCount: 190
            },
            duration: 'PT30M20S',
            url: 'https://www.youtube.com/watch?v=aT7w9WgXgCQ',
            embedUrl: 'https://www.youtube.com/embed/aT7w9WgXgCQ',
            isSample: true
        }
    ];
};

// Sample playlists for development
const getSamplePlaylists = () => {
    return [
        {
            id: 'PL123456789',
            title: 'Pharmacy School Complete Course',
            description: 'Complete playlist covering all pharmacy school topics.',
            channelTitle: 'Pharmacy Education Hub',
            channelId: 'UC123456789',
            publishedAt: '2023-01-01T00:00:00Z',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            url: 'https://www.youtube.com/playlist?list=PL123456789',
            isSample: true
        },
        {
            id: 'PL987654321',
            title: 'Pharmacology Made Easy',
            description: 'Simplified pharmacology concepts for students.',
            channelTitle: 'Medical Simplified',
            channelId: 'UC987654321',
            publishedAt: '2023-02-01T00:00:00Z',
            thumbnail: 'https://img.youtube.com/vi/xQ4w9WgXdCQ/mqdefault.jpg',
            url: 'https://www.youtube.com/playlist?list=PL987654321',
            isSample: true
        },
        {
            id: 'PL456789123',
            title: 'Clinical Pharmacy Practice',
            description: 'Real-world clinical pharmacy scenarios and case studies.',
            channelTitle: 'Clinical Pharmacy Guide',
            channelId: 'UC456789123',
            publishedAt: '2023-03-01T00:00:00Z',
            thumbnail: 'https://img.youtube.com/vi/yR5w9WgXeCQ/mqdefault.jpg',
            url: 'https://www.youtube.com/playlist?list=PL456789123',
            isSample: true
        }
    ];
};