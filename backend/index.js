import "dotenv/config";
import express from "express";
import {
  clerkMiddleware,
  requireAuth,
  getAuth,
  clerkClient,
} from "@clerk/express";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(clerkMiddleware());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("OK");
});

// Public route: Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// User routes
app.use("/api/users", userRoutes);

// Legacy protected route (kept for backward compatibility)
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
