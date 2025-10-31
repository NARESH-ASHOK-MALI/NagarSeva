const rateLimit = require('express-rate-limit');
const { SecurityLimiter, CSRFProtection, SecurityHeaders } = require('../utils/security');

// Rate limiting configurations
const rateLimiters = {
    
    // General API rate limiting
    general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.log(`Rate limit exceeded - IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
            req.flash('error', 'Too many requests. Please try again later.');
            res.redirect('back');
        }
    }),
    
    // Strict rate limiting for authentication endpoints
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 login attempts per windowMs
        skipSuccessfulRequests: true,
        message: {
            error: 'Too many login attempts, please try again later.'
        },
        handler: (req, res) => {
            console.log(`Auth rate limit exceeded - IP: ${req.ip}, Username: ${req.body.username}`);
            req.flash('error', 'Too many login attempts. Please try again in 15 minutes.');
            res.redirect('/login');
        }
    }),
    
    // Account creation rate limiting
    signup: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // Limit each IP to 3 signups per hour
        message: {
            error: 'Too many accounts created from this IP, please try again later.'
        },
        handler: (req, res) => {
            console.log(`Signup rate limit exceeded - IP: ${req.ip}`);
            req.flash('error', 'Too many account creation attempts. Please try again later.');
            res.redirect('/signup');
        }
    })
};

// Account lockout middleware
const accountLockout = (req, res, next) => {
    const identifier = req.body.username || req.body.email;
    
    if (identifier && SecurityLimiter.isAccountLocked(identifier)) {
        console.log(`Locked account access attempt - User: ${identifier}, IP: ${req.ip}`);
        req.flash('error', 'Account temporarily locked due to multiple failed attempts. Please try again later.');
        return res.redirect('/login');
    }
    
    next();
};

// CSRF Protection Middleware
const csrfProtection = (req, res, next) => {
    // Skip CSRF for API endpoints and GET requests
    if (req.method === 'GET' || req.path.startsWith('/api/')) {
        // Generate CSRF token for forms
        if (req.method === 'GET') {
            req.session.csrfToken = CSRFProtection.generateToken();
            res.locals.csrfToken = req.session.csrfToken;
        }
        return next();
    }
    
    // Validate CSRF token for POST requests
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (!CSRFProtection.validateToken(req.session.csrfToken, token)) {
        console.log(`CSRF validation failed - IP: ${req.ip}, User: ${req.user?.username || 'Anonymous'}`);
        req.flash('error', 'Security token validation failed. Please try again.');
        return res.redirect('back');
    }
    
    next();
};

// Security Headers Middleware
const securityHeaders = (req, res, next) => {
    const headers = SecurityHeaders.getSecurityHeaders();
    
    Object.entries(headers).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    
    next();
};

// Login attempt tracking
const trackLoginAttempt = (req, res, next) => {
    const originalSend = res.send;
    const originalRedirect = res.redirect;
    
    res.send = function(data) {
        // Track failed login if redirected with error
        if (res.statusCode === 302 && req.flash('error').length > 0) {
            const identifier = req.body.username || req.body.email;
            if (identifier) {
                SecurityLimiter.trackFailedLogin(identifier);
                console.log(`Failed login attempt - User: ${identifier}, IP: ${req.ip}`);
            }
        }
        return originalSend.call(this, data);
    };
    
    res.redirect = function(url) {
        // Track successful login
        if (req.user && req.body.username) {
            SecurityLimiter.resetFailedAttempts(req.body.username);
            console.log(`Successful login - User: ${req.user.username}, IP: ${req.ip}`);
        }
        return originalRedirect.call(this, url);
    };
    
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            user: req.user?.username || 'Anonymous',
            statusCode: res.statusCode,
            duration: `${duration}ms`
        };
        
        // Log suspicious activity
        if (res.statusCode >= 400 || duration > 5000) {
            console.log(`Suspicious Activity: ${JSON.stringify(logData)}`);
        }
    });
    
    next();
};

module.exports = {
    rateLimiters,
    accountLockout,
    csrfProtection,
    securityHeaders,
    trackLoginAttempt,
    requestLogger
};