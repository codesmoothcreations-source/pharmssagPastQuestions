import { NotFoundError } from '../utils/errors.js';

/**
 * Middleware to handle 404 routes
 */
const notFound = (req, res, next) => {
    // Create a more helpful error message
    const suggestions = [];
    
    // Suggest similar routes based on the request
    const availableRoutes = [
        '/api/auth',
        '/api/users',
        '/api/courses', 
        '/api/past-questions',
        '/api/videos',
        '/api/health',
        '/api-docs'
    ];
    
    const requestedPath = req.originalUrl.toLowerCase();
    
    availableRoutes.forEach(route => {
        if (requestedPath.includes(route.split('/')[2])) {
            suggestions.push(route);
        }
    });
    
    const errorMessage = `Cannot ${req.method} ${req.originalUrl} on this server`;
    
    const error = new NotFoundError(errorMessage);
    error.suggestions = suggestions.length > 0 ? suggestions : availableRoutes;
    error.documentation = '/api-docs';
    
    next(error);
};

export default notFound;