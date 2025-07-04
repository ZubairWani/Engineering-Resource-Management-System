// src/socket/socket.js

import { Server } from 'socket.io';

let io;

export const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Replace with frontend URL if needed
            methods: ["GET", "POST"]
        }
    });
    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
