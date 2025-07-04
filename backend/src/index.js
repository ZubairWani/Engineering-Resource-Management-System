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

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(morgan('dev'));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use('/uploads/images', express.static(path.join(__dirname, '..', 'uploads', 'images')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.get("/", (req, res) => {
    res.status(200).json({ status: "OK", message: "Billing and Inventory API is running." });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

configureRoutes(app);

app.use(errorHandler);

module.exports = app;