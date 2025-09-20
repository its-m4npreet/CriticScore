import { clerkClient } from "@clerk/express";

/**
 * User Service - Handles all user-related operations
 */
class UserService {
  /**
   * Get user by ID
   * @param {string} userId - Clerk user ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return {
        success: true,
        data: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          emailVerified:
            user.emailAddresses[0]?.verification?.status === "verified",
        },
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        error: "Failed to fetch user information",
      };
    }
  }

  /**
   * Get user profile with additional metadata
   * @param {string} userId - Clerk user ID
   * @returns {Promise<Object>} Extended user profile
   */
  async getUserProfile(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return {
        success: true,
        data: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          emailVerified:
            user.emailAddresses[0]?.verification?.status === "verified",
          phoneNumbers: user.phoneNumbers.map((phone) => ({
            number: phone.phoneNumber,
            verified: phone.verification?.status === "verified",
          })),
          externalAccounts: user.externalAccounts.map((account) => ({
            provider: account.provider,
            emailAddress: account.emailAddress,
          })),
          publicMetadata: user.publicMetadata,
          privateMetadata: user.privateMetadata,
        },
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        error: "Failed to fetch user profile",
      };
    }
  }

  /**
   * Update user metadata
   * @param {string} userId - Clerk user ID
   * @param {Object} updates - Updates to apply
   * @param {Object} updates.publicMetadata - Public metadata updates
   * @param {Object} updates.privateMetadata - Private metadata updates
   * @returns {Promise<Object>} Update result
   */
  async updateUserMetadata(userId, updates) {
    try {
      const updateData = {};

      if (updates.publicMetadata) {
        updateData.publicMetadata = updates.publicMetadata;
      }

      if (updates.privateMetadata) {
        updateData.privateMetadata = updates.privateMetadata;
      }

      const updatedUser = await clerkClient.users.updateUser(
        userId,
        updateData
      );

      return {
        success: true,
        data: {
          id: updatedUser.id,
          publicMetadata: updatedUser.publicMetadata,
          privateMetadata: updatedUser.privateMetadata,
        },
      };
    } catch (error) {
      console.error("Error updating user metadata:", error);
      return {
        success: false,
        error: "Failed to update user metadata",
      };
    }
  }

  /**
   * Get list of users (admin function)
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of users to return (default: 10)
   * @param {number} options.offset - Number of users to skip (default: 0)
   * @param {string} options.emailAddress - Filter by email address
   * @returns {Promise<Object>} List of users
   */
  async getUsers(options = {}) {
    try {
      const { limit = 10, offset = 0, emailAddress } = options;

      const queryParams = {
        limit,
        offset,
      };

      if (emailAddress) {
        queryParams.emailAddress = [emailAddress];
      }

      const users = await clerkClient.users.getUserList(queryParams);

      return {
        success: true,
        data: users.data.map((user) => ({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          emailVerified:
            user.emailAddresses[0]?.verification?.status === "verified",
        })),
        totalCount: users.totalCount,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: "Failed to fetch users",
      };
    }
  }

  /**
   * Ban/unban a user
   * @param {string} userId - Clerk user ID
   * @param {boolean} banned - Whether to ban or unban the user
   * @returns {Promise<Object>} Ban operation result
   */
  async banUser(userId, banned = true) {
    try {
      const updatedUser = await clerkClient.users.updateUser(userId, {
        banned,
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          banned: updatedUser.banned,
        },
      };
    } catch (error) {
      console.error("Error updating user ban status:", error);
      return {
        success: false,
        error: "Failed to update user ban status",
      };
    }
  }

  /**
   * Delete a user
   * @param {string} userId - Clerk user ID
   * @returns {Promise<Object>} Delete operation result
   */
  async deleteUser(userId) {
    try {
      await clerkClient.users.deleteUser(userId);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: "Failed to delete user",
      };
    }
  }
}

// Export a singleton instance
export default new UserService();
