import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database";
import { generalLimiter } from "./middleware/rateLimiting";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import subUserRoutes from "./routes/subUsers";
import linkRoutes from "./routes/links";
import productRoutes from "./routes/products";
import collectionRoutes from "./routes/collections";
import uploadRoutes from "./routes/upload";
import redirectRoutes from "./routes/redirect";
import metadataRoutes from "./routes/metadata";
import themeRoutes from "./routes/theme";
import roleRoutes from "./routes/roles";
import analyticsRoutes from "./routes/analytics";
import shopSettingsRoutes from "./routes/shopSettings";
import dataParsingRoutes from "./routes/dataParsing";
import winston from "winston";
import LokiTransport from "winston-loki";
import { cronScheduler } from "./jobs/cronScheduler";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    dotfiles: "deny",
    index: false,
    setHeaders: (res, filePath) => {
      res.set("x-content-type-options", "nosniff");
    },
  })
);

app.use(generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sub-users", subUserRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/shop", shopSettingsRoutes);
app.use("/api/data-parsing", dataParsingRoutes);
app.use("/", redirectRoutes);

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new LokiTransport({
      labels: { app: "creon-backend" },
      host: process.env.LOKI_URL || "",
    }),
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Creon API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Global error handler:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  logger.info(`Creon API server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:5174"}`
  );
  
  // Start cron jobs
  cronScheduler.startAll();
  logger.info('Cron scheduler initialized');
});
