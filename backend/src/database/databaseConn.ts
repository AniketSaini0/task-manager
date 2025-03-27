import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME || "defaultDB";

const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !!  DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error in connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;
