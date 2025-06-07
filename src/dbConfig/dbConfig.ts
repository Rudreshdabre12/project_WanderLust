import mongoose from "mongoose";

declare global {
    var mongoose: any;
}

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGO_URL;

if (!MONGODB_URL) {
    throw new Error(
        "Please define the MONGODB_URL environment variable inside .env.local"
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connect() {
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        // We can safely assert MONGODB_URL is string here since we check it above
        const mongoUrl = MONGODB_URL as string;
        cached.promise = mongoose.connect(mongoUrl, opts).then((mongoose) => {
            console.log("MongoDB connected successfully");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error: any) {
        cached.promise = null;
        console.error("MongoDB connection error:", error);
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
}

// Handle connection events
mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
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