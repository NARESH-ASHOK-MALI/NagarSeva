// =================================================================
// 1. REQUIRE PACKAGES
// =================================================================
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const morgan = require('morgan');

// --- Models ---
const User = require('./models/user.js');
const Listing = require("./models/listing.js");
const Authority = require('./models/authority.js');

// --- Security Middleware ---
const { 
    rateLimiters, 
    accountLockout, 
    csrfProtection, 
    securityHeaders, 
    trackLoginAttempt,
    requestLogger 
} = require('./middleware/security.js');

const { validationRules, handleValidationErrors } = require('./middleware/validation.js');

const { 
    errorHandler, 
    notFoundHandler, 
    asyncErrorHandler,
    unhandledRejectionHandler,
    uncaughtExceptionHandler,
    AuthenticationError,
    AuthorizationError
} = require('./middleware/errorHandler.js');

// --- Cloudinary ---
const { storage, cloudinary } = require('./cloudinary');
const upload = multer({ storage });


// =================================================================
// 2. DATABASE CONNECTION & SERVER START
// =================================================================
const dbUrl = "mongodb://127.0.0.1:27017/DBMS";
const secret = process.env.SECRET || 'a-super-secret-string';

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connected to DB");
        app.listen(8080, () => {
            console.log("Server is listening on port 8080");
        });
    })
    .catch(err => console.log("DB CONNECTION ERROR:", err));


// =================================================================
// 3. APP CONFIGURATION & MIDDLEWARE
// =================================================================
const app = express();

// Setup error handlers for unhandled exceptions/rejections
unhandledRejectionHandler();
uncaughtExceptionHandler();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com", "https://{s}.tile.openstreetmap.org"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://tile.openstreetmap.org", "https://{s}.tile.openstreetmap.org", "https://unpkg.com", "https:"] ,
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    }
}));

app.use(securityHeaders);
app.use(mongoSanitize());
app.use(requestLogger);

// Rate limiting
app.use('/login', rateLimiters.auth);
app.use('/signup', rateLimiters.signup);
app.use(rateLimiters.general);

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
}

// --- Session Store Configuration ---
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret
    },
    touchAfter: 24 * 3600 // Resave session only once every 24 hours unless it's changed
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: false, // Changed to false for security
    cookie: {
        httpOnly: true,
        secure: false, // Disable secure for local development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Session debugging middleware
app.use((req, res, next) => {
    console.log('Session Debug:', {
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        userInSession: !!req.session.passport,
        user: req.user ? req.user.username : 'none',
        url: req.url
    });
    
    // Clean up corrupted sessions
    if (req.session.passport && req.session.passport.user) {
        const userId = req.session.passport.user;
        // If user ID is not a valid ObjectId format, clear the session
        if (typeof userId === 'string' && userId.length !== 24) {
            console.log('Clearing corrupted session with invalid user ID:', userId);
            req.session.destroy((err) => {
                if (err) console.log('Session destroy error:', err);
            });
            return res.redirect('/login');
        }
    }
    
    next();
});

// CSRF Protection - Temporarily disabled for debugging
// app.use(csrfProtection);

// --- Passport Authentication Setup ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// Custom serialization with error handling
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user._id);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user ID:', id);
        
        // Check if id is a valid ObjectId
        if (!id || typeof id !== 'string' || id.length !== 24) {
            console.log('Invalid user ID format:', id);
            return done(null, false);
        }
        
        const user = await User.findById(id);
        console.log('Found user:', user ? user.username : 'none');
        done(null, user);
    } catch (err) {
        console.log('Deserialization error:', err);
        done(null, false); // Return false instead of error to prevent crashes
    }
});

// --- Global Middleware for Flash Messages & User Info ---
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});


// =================================================================
// 4. MIDDLEWARE FUNCTIONS
// =================================================================
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        throw new AuthorizationError('Admin access required');
    }
    next();
};

const isOwner = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new NotFoundError('Complaint not found');
    }
    if (!listing.author || !req.user || !listing.author.equals(req.user._id)) {
        throw new AuthorizationError('You do not have permission to do that');
    }
    next();
});


// =================================================================
// 5. ROUTES
// =================================================================

// --- General Routes ---
app.get("/", (req, res) => {
    res.render("listings/home.ejs");
});

// --- Listing Routes ---

// Index Route (Show all complaints)
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({}).sort({ date: -1 });
    res.render("listings/index.ejs", { allListings });
});

// New Route (Show form to create a new complaint)
app.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Create Route (Handle creation of a new complaint)
app.post("/listings", isLoggedIn, upload.single('listing[image]'), async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.author = req.user._id;
    if (req.file && req.file.path) {
        newListing.image = req.file.path;
    }
    await newListing.save();
    req.flash('success', 'New complaint registered!');
    res.redirect("/listings");
});

// Show Route (Show details of a single complaint)
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('author');
    if (!listing) {
        req.flash('error', 'Cannot find that complaint!');
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", { listing });
});

// Edit Route (Show form to edit a complaint)
app.get("/listings/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Cannot find that complaint!');
        return res.redirect('/listings');
    }
    res.render("listings/edit.ejs", { listing });
});

// Update Route (Handle update of a complaint)
app.put("/listings/:id", isLoggedIn, isOwner, upload.single('listing[image]'), async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (req.file) {
        updatedListing.image = req.file.path;
        await updatedListing.save();
    }
    req.flash('success', 'Complaint successfully updated.');
    res.redirect(`/listings/${id}`);
});

// Delete Route (Handle deletion of a complaint)
app.delete("/listings/:id", isLoggedIn, isOwner, async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (listing && listing.image) {
        try {
            const publicId = listing.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
        }
    }
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Complaint successfully deleted.');
    res.redirect("/listings");
});

// Report/Endorse Route
app.post('/listings/:id/report', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Cannot find that complaint!');
      return res.redirect('/listings');
    }
    const userId = req.user._id;
    if (!Array.isArray(listing.reports)) {
      listing.reports = [];
    }
    const reportIndex = listing.reports.findIndex((reporterId) => reporterId.equals(userId));
    if (reportIndex === -1) {
      listing.reports.push(userId);
    } else {
      listing.reports.splice(reportIndex, 1);
    }
    await listing.save();
    res.redirect(`/listings/${id}`);
});

// --- Authentication Routes ---

// Show signup form
app.get('/signup', (req, res) => {
    res.render('users/signup.ejs', { 
        csrfToken: req.csrfToken ? req.csrfToken() : '' 
    });
});

// Handle signup logic
app.post('/signup', 
    (req, res, next) => {
        console.log('Signup attempt:', {
            username: req.body.username,
            email: req.body.email,
            signupType: req.body.signupType,
            hasPassword: !!req.body.password
        });
        next();
    },
    validationRules.userRegistration,
    handleValidationErrors,
    asyncErrorHandler(async (req, res, next) => {
        const { username, email, password, signupType } = req.body;
        const newUser = new User({ email, username });
        
        // Assign role based on signup type
        if (signupType === 'admin') {
            newUser.role = 'admin';
        } else {
            newUser.role = 'user';
        }
        
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            
            // Log successful registration
            console.log(`New user registered - Username: ${registeredUser.username}, Role: ${registeredUser.role}, IP: ${req.ip}`);
            
            // Save session before redirect
            req.session.save((err) => {
                if (err) {
                    console.log('Session save error:', err);
                    return next(err);
                }
                
                // Redirect based on role
                if (registeredUser.role === 'admin') {
                    req.flash('success', 'Welcome Admin to NagarSeva!');
                    res.redirect('/admin/dashboard');
                } else {
                    req.flash('success', 'Welcome to NagarSeva!');
                    const redirectUrl = req.session.returnTo || '/listings';
                    delete req.session.returnTo;
                    res.redirect(redirectUrl);
                }
            });
        });
    })
);

// Show login form
app.get('/login', (req, res) => {
    res.render('users/login.ejs', { 
        csrfToken: req.csrfToken ? req.csrfToken() : '' 
    });
});

// Handle login logic
app.post('/login', 
    (req, res, next) => {
        console.log('Login attempt:', {
            username: req.body.username,
            loginType: req.body.loginType,
            hasPassword: !!req.body.password
        });
        next();
    },
    accountLockout,
    trackLoginAttempt,
    validationRules.userLogin,
    handleValidationErrors,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }), 
    asyncErrorHandler(async (req, res) => {
        const loginType = req.body.loginType;
        
        // Check if login type matches user role
        if (loginType === 'admin' && req.user.role !== 'admin') {
            req.flash('error', 'You are not authorized as admin.');
            req.logout(function(err) {
                if (err) console.log(err);
            });
            return res.redirect('/login');
        }
        
        if (loginType === 'user' && req.user.role === 'admin') {
            req.flash('error', 'Please login as admin.');
            req.logout(function(err) {
                if (err) console.log(err);
            });
            return res.redirect('/login');
        }
        
        // Log successful login
        console.log(`Successful login - User: ${req.user.username}, Role: ${req.user.role}, IP: ${req.ip}`);
        
        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.log('Session save error:', err);
                return next(err);
            }
            
            // Redirect based on role
            if (req.user.role === 'admin') {
                req.flash('success', 'Welcome Admin!');
                res.redirect('/admin/dashboard');
            } else {
                req.flash('success', 'Welcome back!');
                const redirectUrl = req.session.returnTo || '/listings';
                delete req.session.returnTo;
                res.redirect(redirectUrl);
            }
        });
    })
);

// Handle logout
app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'You have been logged out.');
        res.redirect('/listings');
    });
});

// --- User Dashboard Route ---
app.get('/user/dashboard', isLoggedIn, async (req, res) => {
    try {
        // Fetch only complaints created by the logged-in user
        const userComplaints = await Listing.find({ author: req.user._id }).sort({ date: -1 });
        res.render('users/dashboard.ejs', { userComplaints });
    } catch (err) {
        req.flash('error', 'Unable to load your dashboard.');
        res.redirect('/listings');
    }
});

// City stats API
app.get('/api/city-stats', async (req, res) => {
    const resolved = await Listing.aggregate([
        { $unwind: { path: '$tracking', preserveNullAndEmptyArrays: true } },
        { $sort: { 'tracking.updatedAt': 1 } },
        { $group: { _id: '$_id', city: { $first: '$city' }, lastStatus: { $last: '$tracking.status' } } },
        { $match: { lastStatus: 'Resolved' } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    res.json(resolved.map(r => ({ city: r._id || 'Unknown', count: r.count })));
});

// --- Admin Auth Routes ---
// Redirect old admin login to unified login
app.get('/admin/login', (req, res) => {
    res.redirect('/login');
});

// --- Admin Dashboard & Status Management ---
app.get('/admin/dashboard', isLoggedIn, isAdmin, async (req, res) => {
    // Find complaints whose latest tracking status is 'Pending Verification' or with empty tracking
    const listings = await Listing.find({}).sort({ date: -1 });
    const pending = listings.filter(listing => {
        if (!listing.tracking || listing.tracking.length === 0) return true;
        const last = listing.tracking[listing.tracking.length - 1];
        return last.status === 'Pending Verification';
    });
    const authorities = await Authority.find({}).sort({ city: 1, name: 1 });
    res.render('admin/dashboard.ejs', { pending, authorities });
});

app.post('/listings/:id/status', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { newStatus, notes, assignedAuthority } = req.body;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Complaint not found');
        return res.redirect('/admin/dashboard');
    }
    if (!Array.isArray(listing.tracking)) listing.tracking = [];
    if (assignedAuthority) listing.assignedAuthority = assignedAuthority;
    listing.tracking.push({ status: newStatus, notes });
    await listing.save();
    req.flash('success', 'Status updated');
    res.redirect('/admin/dashboard');
});

// Remove old admin login POST route - now handled by unified /login route


// =================================================================
// 6. ERROR HANDLING
// =================================================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);
