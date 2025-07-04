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
const rateLimit = require('express-rate-limit');
const configureRoutes = require('./routes.config.js');
const { errorHandler } = require('./middlewares/error.middleware');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger-output.json");

const app = express();

// ===== Environment Configuration =====
const isProduction = process.env.NODE_ENV === 'production';

// ===== Rate Limiting =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit each IP to requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// ===== Enhanced CORS Configuration =====
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : [
      'http://localhost:5173', 
      'http://localhost:4173', 
      'https://engineering-resource-management-system.vercel.app'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin && !isProduction) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || 
        allowedOrigins.some(allowed => origin?.endsWith(allowed.replace('https://', '')))) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  credentials: true,
  maxAge: isProduction ? 86400 : 0,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ===== Enhanced Security Headers =====
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "cdn.swagger.io",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "fonts.googleapis.com", 
        "cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "validator.swagger.io",
        "https://*.githubusercontent.com"
      ],
      fontSrc: [
        "'self'", 
        "fonts.gstatic.com",
        "cdn.jsdelivr.net"
      ],
      connectSrc: [
        "'self'", 
        "https://engineering-resource-management-system-oiua.onrender.com"
      ]
    }
  } : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: isProduction ? {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// ===== Enhanced Logging =====
app.use(morgan(isProduction ? 'combined' : 'dev', {
  skip: (req) => req.path === '/health' // Skip logging for health checks
}));

// ===== Body Parsing =====
app.use(express.json({ 
  limit: '16kb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // For webhook verification
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '16kb',
  parameterLimit: 50 
}));

// ===== Static Files with Cache Control =====
const staticOptions = {
  maxAge: isProduction ? '1y' : '0',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-store');
    }
  }
};

app.use('/uploads/images', express.static(path.join(__dirname, '..', 'uploads', 'images'), staticOptions));
app.use('/public', express.static(path.join(__dirname, '..', 'public'), staticOptions);

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// ===== Enhanced Health Check =====
app.get("/health", (req, res) => {
  const healthcheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    dbStatus: "Connected", // Add your DB status check here
    env: process.env.NODE_ENV || 'development'
  };
  res.status(200).json(healthcheck);
});

// ===== API Documentation =====
app.use("/api/docs", 
  swaggerUi.serve, 
  (req, res, next) => {
    swaggerDocument.host = req.get('host');
    swaggerDocument.schemes = [req.protocol];
    next();
  },
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "Resource Management API Docs",
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

// ===== Main Endpoint =====
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Engineering Resource Management API",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    docs: "/api/docs",
    health: "/health"
  });
});

// ===== Routes Configuration =====
configureRoutes(app);

// ===== 404 Handler =====
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// ===== Error Handling =====
app.use(errorHandler);

module.exports = app;