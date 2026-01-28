import app from './app.js';
import connectDB from './config/database.js';
import { validateCloudinaryConfig } from './config/cloudinary.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = process.env.PORT || 5001;

// Display startup banner
const displayBanner = () => {
    console.clear();
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀  PHAMSAG Backend API                               ║
║   📅  ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}                      ║
║   🌐  Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
};

// Check YouTube API configuration
const checkYouTubeConfig = () => {
    if (!process.env.YOUTUBE_API_KEY) {
        console.log('\x1b[33m⚠️  YouTube API key not configured. Video search will not work.\x1b[0m');
        console.log('\x1b[36m💡  To enable YouTube search:\x1b[0m');
        console.log('   1. Get API key from: https://console.cloud.google.com/');
        console.log('   2. Enable YouTube Data API v3');
        console.log('   3. Add to .env: YOUTUBE_API_KEY=your_key_here');
        console.log('   4. Test: GET /api/videos/config');
        return false;
    }
    
    if (process.env.YOUTUBE_API_KEY.startsWith('your_') || process.env.YOUTUBE_API_KEY === '') {
        console.log('\x1b[33m⚠️  YouTube API key needs to be updated in .env file\x1b[0m');
        return false;
    }
    
    // Test the API key
    console.log('\x1b[36m🔑  Testing YouTube API key...\x1b[0m');
    const keyPreview = process.env.YOUTUBE_API_KEY;
    console.log(`   Key: ${keyPreview.substring(0, 4)}...${keyPreview.substring(keyPreview.length - 4)}`);
    console.log('\x1b[32m✅  YouTube API configured and ready\x1b[0m');
    return true;
};

// Display endpoints table
const displayEndpoints = () => {
    console.log('\n' + '='.repeat(70));
    console.log('🎯  AVAILABLE ENDPOINTS');
    console.log('='.repeat(70));
    
    const endpoints = [
        { method: 'GET', path: '/', description: 'Welcome page' },
        { method: 'GET', path: '/api/health', description: 'Health check' },
        { method: 'GET', path: '/api-docs', description: 'API documentation' },
        { method: 'GET', path: '/api/videos/config', description: 'Check YouTube API status' },
        { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
        { method: 'POST', path: '/api/auth/login', description: 'Login user' },
        { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
        { method: 'GET', path: '/api/auth/me', description: 'Get current user' },
        { method: 'GET', path: '/api/users/count', description: 'User stats (Admin only)' },
        { method: 'GET', path: '/api/courses', description: 'Get all courses' },
        { method: 'GET', path: '/api/courses/:level/:semester', description: 'Courses by level & semester' },
        { method: 'GET', path: '/api/courses/levels', description: 'Get all levels with stats' },
        { method: 'GET', path: '/api/past-questions', description: 'Get past questions' },
        { method: 'GET', path: '/api/past-questions/search', description: 'Search past questions' },
        { method: 'GET', path: '/api/past-questions/:id', description: 'Get single past question' },
        { method: 'POST', path: '/api/past-questions', description: 'Upload past question (Admin only)' },
        { method: 'GET', path: '/api/videos/search', description: 'Search YouTube videos' },
        { method: 'GET', path: '/api/videos/trending', description: 'Get trending pharmacy videos' },
        { method: 'GET', path: '/api/videos/playlists', description: 'Get pharmacy playlists' }
    ];

    endpoints.forEach((ep, index) => {
        const methodColor = getMethodColor(ep.method);
        console.log(`📌  ${index + 1}. ${methodColor}${ep.method.padEnd(7)}\x1b[0m ${ep.path.padEnd(40)} ${ep.description}`);
    });
    
    console.log('='.repeat(70));
    console.log(`\n🌐  Server URL: \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`📚  API Documentation: \x1b[36mhttp://localhost:${PORT}/api-docs\x1b[0m`);
    console.log(`❤️   Health Check: \x1b[36mhttp://localhost:${PORT}/api/health\x1b[0m`);
    console.log(`🎬  YouTube API Test: \x1b[36mhttp://localhost:${PORT}/api/videos/config\x1b[0m`);
    console.log('='.repeat(70) + '\n');
};

function getMethodColor(method) {
    switch(method) {
        case 'GET': return '\x1b[32m'; // Green
        case 'POST': return '\x1b[34m'; // Blue
        case 'PUT': return '\x1b[33m'; // Yellow
        case 'DELETE': return '\x1b[31m'; // Red
        default: return '\x1b[0m';
    }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n\x1b[33m⚠️  ${signal} received. Starting graceful shutdown...\x1b[0m`);
    
    try {
        // Close database connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('\x1b[32m✅  Database connection closed\x1b[0m');
        }
        
        // Close server
        if (server) {
            server.close(() => {
                console.log('\x1b[32m✅  Server closed\x1b[0m');
                console.log('\n' + '='.repeat(60));
                console.log('\x1b[35m👋  Server shutdown complete. Goodbye!\x1b[0m');
                console.log('='.repeat(60) + '\n');
                process.exit(0);
            });
            
            // Force close after 10 seconds
            setTimeout(() => {
                console.log('\x1b[31m❌  Could not close connections in time, forcefully shutting down\x1b[0m');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.log('\x1b[31m❌  Error during graceful shutdown:\x1b[0m', error.message);
        process.exit(1);
    }
};

// Main startup function
const startServer = async () => {
    try {
        // Display banner
        displayBanner();
        
        console.log('\x1b[36m🔧  Starting server initialization...\x1b[0m');
        
        // Connect to database
        console.log('\x1b[36m🗄️   Connecting to MongoDB...\x1b[0m');
        await connectDB();
        console.log('\x1b[32m✅  Database connected successfully\x1b[0m');
        
        // Validate Cloudinary configuration
        console.log('\x1b[36m☁️   Checking Cloudinary configuration...\x1b[0m');
        try {
            validateCloudinaryConfig();
            console.log('\x1b[32m✅  Cloudinary configured successfully\x1b[0m');
        } catch (error) {
            console.log('\x1b[33m⚠️  Cloudinary not configured. File uploads will not work.\x1b[0m');
            console.log('\x1b[36m💡  To enable file uploads:\x1b[0m');
            console.log('   1. Sign up at https://cloudinary.com/');
            console.log('   2. Get your Cloud Name, API Key, and API Secret');
            console.log('   3. Add to .env file:');
            console.log('      CLOUDINARY_CLOUD_NAME=your_cloud_name');
            console.log('      CLOUDINARY_API_KEY=your_api_key');
            console.log('      CLOUDINARY_API_SECRET=your_api_secret');
        }
        
        // Check YouTube API
        console.log('\x1b[36m🎬  Checking YouTube API configuration...\x1b[0m');
        checkYouTubeConfig();
        
        // Start server
        console.log('\x1b[36m🚀  Starting server...\x1b[0m');
        const server = app.listen(PORT, () => {
            console.log('\x1b[32m✅  Server running on port\x1b[0m', PORT);
            
            // Display endpoints after a short delay
            setTimeout(() => {
                console.log('\n');
                displayEndpoints();
                
                // Display additional info
                console.log('\x1b[36m📊  SERVER INFORMATION:\x1b[0m');
                console.log(`   Node Version: ${process.version}`);
                console.log(`   Platform: ${process.platform}`);
                console.log(`   PID: ${process.pid}`);
                console.log(`   Uptime: ${process.uptime().toFixed(2)}s`);
                console.log(`   Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
                console.log(`   Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
                console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log('');
                
                // Quick status check
                console.log('\x1b[36m📋  QUICK STATUS CHECK:\x1b[0m');
                console.log(`   Database: ${mongoose.connection.readyState === 1 ? '\x1b[32m✓ Connected\x1b[0m' : '\x1b[31m✗ Disconnected\x1b[0m'}`);
                console.log(`   YouTube API: ${process.env.YOUTUBE_API_KEY && !process.env.YOUTUBE_API_KEY.startsWith('your_') ? '\x1b[32m✓ Configured\x1b[0m' : '\x1b[33m⚠ Not Configured\x1b[0m'}`);
                console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '\x1b[32m✓ Configured\x1b[0m' : '\x1b[33m⚠ Not Configured\x1b[0m'}`);
                console.log(`   JWT Secret: ${process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET !== 'your_super_secret_access_key_change_in_production' ? '\x1b[32m✓ Set\x1b[0m' : '\x1b[33m⚠ Using Default\x1b[0m'}`);
                console.log('');
                
                console.log('\x1b[35m🎉  PHAMSAG Backend is ready! Happy coding! 🚀\x1b[0m\n');
            }, 300);
        });
        
        return server;
    } catch (error) {
        console.log('\n\x1b[31m❌  Server startup failed:\x1b[0m', error.message);
        console.log('\x1b[33mStack trace:\x1b[0m');
        console.log(error.stack);
        process.exit(1);
    }
};

// Start the server
let server;
startServer().then(s => {
    server = s;
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.log('\n\x1b[31m🔥  UNHANDLED PROMISE REJECTION:\x1b[0m');
        console.log('\x1b[33mMessage:\x1b[0m', err.message);
        console.log('\x1b[33mStack:\x1b[0m', err.stack?.split('\n')[0]);
        console.log('\x1b[36m💡  This error was not caught by async/await or .catch()\x1b[0m');
        
        // Don't crash in development
        if (process.env.NODE_ENV === 'production') {
            server?.close(() => process.exit(1));
        }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.log('\n\x1b[31m💥  UNCAUGHT EXCEPTION:\x1b[0m');
        console.log('\x1b[33mMessage:\x1b[0m', err.message);
        console.log('\x1b[33mStack:\x1b[0m', err.stack?.split('\n')[0]);
        console.log('\x1b[36m💡  This error was not caught by any try/catch block\x1b[0m');
        
        // Don't crash in development
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });
    
    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle process exit
    process.on('exit', (code) => {
        if (code === 0) {
            console.log('\x1b[32m✅  Process exited successfully\x1b[0m');
        } else {
            console.log(`\x1b[31m❌  Process exited with code ${code}\x1b[0m`);
        }
    });
}).catch(error => {
    console.log('\x1b[31m❌  Failed to start server:\x1b[0m', error);
    process.exit(1);
});

// Export for testing
export { startServer };