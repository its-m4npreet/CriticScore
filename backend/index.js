import "dotenv/config";
import express from "express";
import {
  clerkMiddleware,
  requireAuth,
  getAuth,
  clerkClient,
} from "@clerk/express";
import connectDB from "./config/database.js";
import { checkSuperAdmin } from "./utils/superAdmin.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import devRoutes from "./routes/devRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
checkSuperAdmin();

app.use(clerkMiddleware());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CriticScore API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/api/users",
      movies: "/api/movies",
      admin: "/api/admin",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/admin", adminRoutes);

if (process.env.NODE_ENV === "development") {
  app.use("/dev", devRoutes);
}

app.get("/protected", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: {
      health: "/health",
      users: "/api/users",
      movies: "/api/movies",
      admin: "/api/admin",
    },
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
