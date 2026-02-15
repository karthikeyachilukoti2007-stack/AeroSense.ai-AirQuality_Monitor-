import app from './app';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { initJobs } from './jobs/aqiSnapshots';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // 1. Database Connections
    await connectDB();
    await connectRedis();

    // 2. Initialize Background Jobs
    initJobs();

    // 3. Start Listener
    app.listen(PORT, () => {
        console.log(`
🚀 AeroSense.ai Server started!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
        `);
    });
};

startServer();
