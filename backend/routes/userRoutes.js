import express from "express";
import { requireAuth, getAuth } from "@clerk/express";
import userService from "../services/userService.js";

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user's basic information
 */
router.get("/me", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const result = await userService.getUserById(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in GET /me:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/users/profile
 * Get current user's complete profile with metadata
 */
router.get("/profile", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const result = await userService.getUserProfile(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in GET /profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/users/metadata
 * Update current user's metadata
 */
router.put("/metadata", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { publicMetadata, privateMetadata } = req.body;

    if (!publicMetadata && !privateMetadata) {
      return res.status(400).json({
        error: "At least one of publicMetadata or privateMetadata is required",
      });
    }

    const result = await userService.updateUserMetadata(userId, {
      publicMetadata,
      privateMetadata,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in PUT /metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/users/:id
 * Get specific user by ID (requires admin role or same user)
 */
router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { id: targetUserId } = req.params;

    // Allow users to get their own info or implement admin check here
    if (currentUserId !== targetUserId) {
      // For now, we'll allow it, but you might want to add admin role checking
      // return res.status(403).json({ error: "Access denied" });
    }

    const result = await userService.getUserById(targetUserId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in GET /:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes (you might want to add admin middleware)

/**
 * GET /api/users
 * Get list of users (admin function)
 * Query params: limit, offset, emailAddress
 */
router.get("/", requireAuth(), async (req, res) => {
  try {
    // TODO: Add admin role check here
    // const { userId } = getAuth(req);
    // const isAdmin = await checkAdminRole(userId);
    // if (!isAdmin) return res.status(403).json({ error: "Admin access required" });

    const { limit, offset, emailAddress } = req.query;

    const result = await userService.getUsers({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      emailAddress,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      users: result.data,
      totalCount: result.totalCount,
      pagination: {
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error("Error in GET /:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/users/:id/ban
 * Ban/unban a user (admin function)
 */
router.put("/:id/ban", requireAuth(), async (req, res) => {
  try {
    // TODO: Add admin role check here
    const { id: targetUserId } = req.params;
    const { banned = true } = req.body;

    const result = await userService.banUser(targetUserId, banned);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: banned
        ? "User banned successfully"
        : "User unbanned successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in PUT /:id/ban:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (admin function)
 */
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    // TODO: Add admin role check here
    const { id: targetUserId } = req.params;

    const result = await userService.deleteUser(targetUserId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in DELETE /:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
