import mongoose from "mongoose";

export async function connect() {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
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
        };

        await mongoose.connect(process.env.MONGODB_URL, options);
        console.log("MongoDB connected successfully");

        // Handle connection errors
        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        // Handle disconnection
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

    } catch (error: any) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
} 