// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');
// const configureRoutes = require('./routes.config.js');
// const { errorHandler } = require('./middlewares/error.middleware');
// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("../swagger-output.json");

// const app = express();

// const corsOptions = {
//     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// app.use(morgan('dev'));

// app.use(express.json({ limit: '16kb' }));
// app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// app.use('/uploads/images', express.static(path.join(__dirname, '..', 'uploads', 'images')));
// app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '..', 'views'));

// app.get("/", (req, res) => {
//     res.status(200).json({ status: "OK", message: "Billing and Inventory API is running." });
// });

// app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// configureRoutes(app);

// app.use(errorHandler);

// module.exports = app;







const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const configureRoutes = require('./routes.config.js');
const { errorHandler } = require('./middlewares/error.middleware');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger-output.json");

const app = express();

// ===== Enhanced CORS Configuration =====
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:5173', 'https://your-production-frontend.com'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours for preflight cache
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// ===== Security Headers =====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.swagger.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
      fontSrc: ["'self'", "fonts.gstatic.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// ===== Logging =====
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ===== Body Parsing =====
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ===== Static Files =====
app.use('/uploads/images', express.static(path.join(__dirname, '..', 'uploads', 'images')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// ===== Health Check Endpoint =====
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// ===== Main Endpoint =====
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "API is running",
    version: "1.0.0",
    docs: "/api/docs"
  });
});

// ===== API Documentation =====
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===== Routes Configuration =====
configureRoutes(app);

// ===== Error Handling =====
app.use(errorHandler);

module.exports = app;