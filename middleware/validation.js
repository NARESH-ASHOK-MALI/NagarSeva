const { body, validationResult } = require('express-validator');
const { InputSanitizer, PasswordSecurity } = require('./security');

// Validation Rules
const validationRules = {
    
    // User registration validation - IMPROVED SECURITY
    userRegistration: [
        body('username')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username can only contain letters, numbers, underscore and hyphen')
            .trim(),
            
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
            
        body('password')
            .isLength({ min: 8, max: 128 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain: lowercase letter, uppercase letter, number, and special character (@$!%*?&)')
            .custom((value) => {
                // Check for common weak patterns
                const weakPatterns = [
                    /password/i,
                    /123456/,
                    /qwerty/i,
                    /admin/i,
                    /letmein/i,
                    /welcome/i,
                    /monkey/i,
                    /dragon/i
                ];
                
                for (let pattern of weakPatterns) {
                    if (pattern.test(value)) {
                        throw new Error('Password contains common weak patterns. Please choose a more unique password.');
                    }
                }
                
                return true;
            })
    ],
    
    // User login validation
    userLogin: [
        body('username')
            .notEmpty()
            .withMessage('Username is required')
            .trim()
            .escape(),
            
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ max: 128 })
            .withMessage('Password too long'),
            
        body('loginType')
            .isIn(['user', 'admin'])
            .withMessage('Invalid login type')
    ],
    
    // Complaint validation
    complaint: [
        body('listing.title')
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be between 5 and 200 characters')
            .trim()
            .escape()
            .custom((value) => {
                const sanitized = InputSanitizer.sanitizeText(value, 200);
                if (sanitized !== value) {
                    throw new Error('Title contains invalid characters');
                }
                return true;
            }),
            
        body('listing.description')
            .optional()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters')
            .trim()
            .escape(),
            
        body('listing.city')
            .notEmpty()
            .withMessage('City is required')
            .isLength({ max: 100 })
            .withMessage('City name too long')
            .trim()
            .escape(),
            
        body('listing.address')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Address too long')
            .trim()
            .escape()
    ]
};

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        req.flash('error', errorMessages);
        
        // Log validation errors for security monitoring
        console.log(`Validation Error - IP: ${req.ip}, User: ${req.user?.username || 'Anonymous'}, Errors: ${errorMessages.join(', ')}`);
        
        // Redirect back to the form
        const referer = req.get('referer') || '/';
        return res.redirect(referer);
    }
    
    next();
};

module.exports = {
    validationRules,
    handleValidationErrors
};