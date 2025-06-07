import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGO_URL;

export async function connect() {
    try {
        if (!MONGODB_URL) {
            throw new Error("MongoDB connection URL is not defined in environment variables");
        }

        // Check if we're already connected
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to MongoDB");
            return;
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        await mongoose.connect(MONGODB_URL, options);
        
        const connection = mongoose.connection;
        
        connection.on("connected", () => {
            console.log("MongoDB connected successfully");
        });

        connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
            // Attempt to reconnect
            setTimeout(() => {
                connect();
            }, 5000);
        });

        connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
            // Attempt to reconnect
            setTimeout(() => {
                connect();
            }, 5000);
        });

        // Handle process termination
        process.on("SIGINT", async () => {
            try {
                await mongoose.connection.close();
                console.log("MongoDB connection closed through app termination");
                process.exit(0);
            } catch (err) {
                console.error("Error closing MongoDB connection:", err);
                process.exit(1);
            }
        });

    } catch (error: any) {
        console.error("Error connecting to MongoDB:", error.message);
        // Attempt to reconnect
        setTimeout(() => {
            connect();
        }, 5000);
        throw error;
    }
} 