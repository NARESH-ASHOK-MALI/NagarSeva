const bcrypt = require('bcrypt');
const validator = require('validator');
const zxcvbn = require('zxcvbn');
const crypto = require('crypto');

// Password Security Utilities
class PasswordSecurity {
    
    // Check password strength using zxcvbn
    static checkPasswordStrength(password) {
        const result = zxcvbn(password);
        return {
            score: result.score, // 0-4 scale
            feedback: result.feedback,
            crackTime: result.crack_times_display,
            isStrong: result.score >= 3
        };
    }
    
    // Common password breach check (simplified - in production use HaveIBeenPwned API)
    static async checkPasswordBreach(password) {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            'dragon', 'master', 'shadow', 'login', 'passw0rd'
        ];
        
        return commonPasswords.includes(password.toLowerCase());
    }
    
    // Validate password complexity
    static validatePasswordComplexity(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            noCommonPatterns: !/(.)\1{2,}/.test(password) // No 3+ repeated chars
        };
        
        const passed = Object.values(requirements).filter(Boolean).length;
        const total = Object.keys(requirements).length;
        
        return {
            requirements,
            score: passed / total,
            isValid: passed >= 5 // At least 5 out of 6 requirements
        };
    }
}

// Input Sanitization Utilities
class InputSanitizer {
    
    // Sanitize and validate email
    static sanitizeEmail(email) {
        if (!email) return null;
        const sanitized = validator.normalizeEmail(email);
        return validator.isEmail(sanitized) ? sanitized : null;
    }
    
    // Sanitize username
    static sanitizeUsername(username) {
        if (!username) return null;
        // Remove special characters except underscore and hyphen
        return username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
    }
    
    // Sanitize text input
    static sanitizeText(text, maxLength = 1000) {
        if (!text) return '';
        return validator.escape(text).slice(0, maxLength);
    }
    
    // Validate and sanitize URL
    static sanitizeURL(url) {
        if (!url) return null;
        return validator.isURL(url) ? url : null;
    }
}

// Rate Limiting Utilities
class SecurityLimiter {
    
    // Account lockout tracking
    static accounts = new Map();
    
    // Track failed login attempts
    static trackFailedLogin(identifier) {
        const now = Date.now();
        const key = identifier.toLowerCase();
        
        if (!this.accounts.has(key)) {
            this.accounts.set(key, { attempts: 0, lockUntil: null });
        }
        
        const account = this.accounts.get(key);
        account.attempts++;
        
        // Lock account after 5 failed attempts for 15 minutes
        if (account.attempts >= 5) {
            account.lockUntil = now + (15 * 60 * 1000); // 15 minutes
        }
        
        return account;
    }
    
    // Check if account is locked
    static isAccountLocked(identifier) {
        const key = identifier.toLowerCase();
        const account = this.accounts.get(key);
        
        if (!account) return false;
        
        if (account.lockUntil && Date.now() < account.lockUntil) {
            return true;
        }
        
        // Reset if lock period expired
        if (account.lockUntil && Date.now() >= account.lockUntil) {
            account.attempts = 0;
            account.lockUntil = null;
        }
        
        return false;
    }
    
    // Reset failed attempts on successful login
    static resetFailedAttempts(identifier) {
        const key = identifier.toLowerCase();
        this.accounts.delete(key);
    }
}

// CSRF Token Utilities
class CSRFProtection {
    static generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    static validateToken(sessionToken, bodyToken) {
        return sessionToken && bodyToken && sessionToken === bodyToken;
    }
}

// Security Headers Utility
class SecurityHeaders {
    static getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: https: https://res.cloudinary.com https://*.tile.openstreetmap.org; font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://nominatim.openstreetmap.org https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com https:;"
        };
    }
}

module.exports = {
    PasswordSecurity,
    InputSanitizer,
    SecurityLimiter,
    CSRFProtection,
    SecurityHeaders
};