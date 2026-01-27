import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";

const DB_NAME = "videotube";

const clearDatabase = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    
    await mongoose.connect(`${mongodbUri}/${DB_NAME}`);
    console.log("Connected to MongoDB");

    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from the database`);

    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

clearDatabase();
