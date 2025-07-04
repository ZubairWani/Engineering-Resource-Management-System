require('dotenv').config();
const http = require('http');
const app = require('./src/index.js');
const dbConnect = require('./database/db.connection.js');
const socket = require('./src/socket/socket.js');

const PORT = process.env.BACKEND_PORT || 8000;

const server = http.createServer(app);

const io = socket.init(server);

dbConnect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`✅ Database connected successfully!`);
            console.log(`🚀 Server is running on port: ${PORT}`);
            console.log(`📄 API docs available at http://localhost:${PORT}/api/docs`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed!", err);
        process.exit(1);
    });

module.exports = {
    app,
    server,
    io
};