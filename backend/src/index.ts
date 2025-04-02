import connectDB from "./database/databaseConn";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5001;

// Start Server **AFTER** MongoDB is connected
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });
