import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path, { dirname } from "path";
import { config } from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import pastQuestionRoutes from './routes/pastQuestion.routes.js';
import videoRoutes from './routes/video.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import requestLogger from './middleware/requestLogger.js';

// Load environment variables
config();

const app = express();

// Security middleware
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "connect-src": ["'self'", "https://res.cloudinary.com", "http://localhost:5000"],
          "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Root route

// this is where the frontend will be served 



// app.get('/', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: '🚀 Welcome to PHAMSAG Backend API',
//         version: '1.0.0',
//         documentation: '/api-docs',
//         endpoints: {
//             auth: '/api/auth',
//             users: '/api/users',
//             courses: '/api/courses',
//             pastQuestions: '/api/past-questions',
//             videos: '/api/videos',
//             health: '/api/health'
//         },
//         status: 'operational',
//         timestamp: new Date().toISOString()
//     });
// });

// API Documentation route
app.get('/api-docs', (req, res) => {
    res.status(200).json({
        success: true,
        message: '📚 PHAMSAG API Documentation',
        version: '1.0.0',
        endpoints: [
            {
                group: 'Authentication',
                routes: [
                    { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
                    { method: 'POST', path: '/api/auth/login', description: 'Login user' },
                    { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
                    { method: 'GET', path: '/api/auth/me', description: 'Get current user' }
                ]
            },
            {
                group: 'Courses',
                routes: [
                    { method: 'GET', path: '/api/courses', description: 'Get all courses' },
                    { method: 'GET', path: '/api/courses/:level/:semester', description: 'Get courses by level & semester' },
                    { method: 'GET', path: '/api/courses/levels', description: 'Get all levels with stats' },
                    { method: 'GET', path: '/api/courses/search', description: 'Search courses' }
                ]
            },
            {
                group: 'Past Questions',
                routes: [
                    { method: 'GET', path: '/api/past-questions', description: 'Get all past questions' },
                    { method: 'GET', path: '/api/past-questions/:id', description: 'Get single past question' },
                    { method: 'POST', path: '/api/past-questions', description: 'Upload past question (Admin)' },
                    { method: 'PUT', path: '/api/past-questions/:id', description: 'Update past question (Admin)' },
                    { method: 'DELETE', path: '/api/past-questions/:id', description: 'Delete past question (Admin)' }
                ]
            },
            {
                group: 'Videos',
                routes: [
                    { method: 'GET', path: '/api/videos/search', description: 'Search YouTube videos' },
                    { method: 'GET', path: '/api/videos/trending', description: 'Get trending pharmacy videos' },
                    { method: 'GET', path: '/api/videos/playlists', description: 'Get pharmacy playlists' }
                ]
            },
            {
                group: 'Users (Admin Only)',
                routes: [
                    { method: 'GET', path: '/api/users/count', description: 'Get user statistics' },
                    { method: 'GET', path: '/api/users', description: 'Get all users' }
                ]
            }
        ]
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const health = {
        success: true,
        message: '✅ PHAMSAG Backend is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(health);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/past-questions', pastQuestionRoutes);
app.use('/api/videos', videoRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {

    const buildPath = path.join(__dirname, "frontend", "dist");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    })
}

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;