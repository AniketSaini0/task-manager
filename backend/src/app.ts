import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import errorHandler from "./utils/errorHandler";

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();
const app = express();

// logger
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: Number(message.split(" ")[2]),
          responseTime: message.split(" ")[3],
        };
        if (logObject.status < 400) {
          logger.info(JSON.stringify(logObject));
        } else {
          logger.error(JSON.stringify(logObject));
        }
      },
    },
  })
);

// common middleware
app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

// Cors policy
app.use(
  cors({
    // process.env.CORS_ORIGIN
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/healthCheck", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Error handler should be the last middleware
app.use(errorHandler);

// const PORT = process.env.PORT;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
