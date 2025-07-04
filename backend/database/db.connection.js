const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

let connection;

const dbConnect = async () => {
    if (connection) return;
    try {
        connection = await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("Connected to db");
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
};

module.exports = dbConnect;
