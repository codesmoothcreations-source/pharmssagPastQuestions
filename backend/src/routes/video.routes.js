import express from 'express';
import {
    searchVideos,
    getConfigStatus,
    getPlaylists,
    getTrendingVideos,
    getVideoById
} from '../controllers/video.controller.js';

const router = express.Router();

// Check what's actually exported
console.log('Available video exports:', {
    searchVideos: typeof searchVideos,
    getConfigStatus: typeof getConfigStatus,
    getPlaylists: typeof getPlaylists,
    getTrendingVideos: typeof getTrendingVideos,
    getVideoById: typeof getVideoById
});

// Public routes
router.get('/search', searchVideos);
router.get('/config', getConfigStatus);
router.get('/playlists', getPlaylists);
router.get('/trending', getTrendingVideos);
router.get('/:id', getVideoById);

export default router;