const fs = require('fs');
const path = require('path');

// Error logging utility
class ErrorLogger {
    static logError(error, req = null, additionalInfo = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            request: req ? {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                user: req.user?.username || 'Anonymous'
            } : null,
            additionalInfo
        };
        
        // Always log to console in all environments
        // Vercel and other serverless platforms capture console output
        console.error('Error occurred:', JSON.stringify(logEntry, null, 2));
    }
}

// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error
    ErrorLogger.logError(err, req);
    
    // Set default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong!';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(val => val.message);
        message = `Invalid input data: ${errors.join('. ')}`;
    }
    
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
    }
    
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }
    
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // Don't leak sensitive information in production
    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        message = 'Something went wrong!';
    }
    
    // Send error response based on request type
    if (req.xhr || req.get('Content-Type') === 'application/json') {
        // API request - send JSON response
        res.status(statusCode).json({
            status: 'error',
            statusCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    } else {
        // Web request - redirect with flash message
        req.flash('error', message);
        
        // Determine redirect URL based on error type
        let redirectUrl = '/';
        
        if (statusCode === 401) {
            redirectUrl = '/login';
        } else if (statusCode === 403) {
            redirectUrl = req.get('referer') || '/';
        } else if (statusCode === 404) {
            redirectUrl = '/';
        } else {
            redirectUrl = req.get('referer') || '/';
        }
        
        res.redirect(redirectUrl);
    }
};

// 404 Not Found handler
const notFoundHandler = (req, res, next) => {
    const err = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(err);
};

// Async error wrapper
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Unhandled rejection handler
const unhandledRejectionHandler = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        ErrorLogger.logError(new Error('Unhandled Rejection'), null, { reason, promise });
        
        // Close server gracefully
        process.exit(1);
    });
};

// Uncaught exception handler
const uncaughtExceptionHandler = () => {
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        ErrorLogger.logError(error, null, { type: 'UncaughtException' });
        
        // Close server gracefully
        process.exit(1);
    });
};

module.exports = {
    ErrorLogger,
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    errorHandler,
    notFoundHandler,
    asyncErrorHandler,
    unhandledRejectionHandler,
    uncaughtExceptionHandler
};