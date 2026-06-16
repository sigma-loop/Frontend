import api from "./api";
import type { JSendResponse, User, UserPreferences } from "../types/api";

/**
 * Account-settings API. Backed by the /users/* endpoints (all authenticated).
 * Email delivery isn't wired up yet — notification toggles are stored and will
 * be respected once a sender exists.
 */
export const userService = {
  // PATCH /users/profile — update the display name.
  updateProfile: async (name: string): Promise<User> => {
    const response = await api.patch<JSendResponse<{ user: User }>>(
      "/users/profile",
      { name }
    );
    if (!response.data.data) throw new Error("Failed to update profile");
    return response.data.data.user;
  },

  // PATCH /users/password — change password after verifying the current one.
  updatePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.patch("/users/password", { currentPassword, newPassword });
  },

  // PATCH /users/preferences — partial update of notification/privacy flags.
  updatePreferences: async (
    prefs: Partial<UserPreferences>
  ): Promise<UserPreferences> => {
    const response = await api.patch<
      JSendResponse<{ preferences: UserPreferences }>
    >("/users/preferences", prefs);
    if (!response.data.data) throw new Error("Failed to update preferences");
    return response.data.data.preferences;
  },

  // GET /users/export — full account bundle (for download).
  exportData: async (): Promise<unknown> => {
    const response =
      await api.get<JSendResponse<{ export: unknown }>>("/users/export");
    return response.data.data?.export ?? null;
  },

  // DELETE /users/me — permanently delete the account (password-confirmed).
  deleteAccount: async (password: string): Promise<void> => {
    await api.delete("/users/me", { data: { password } });
  },
};

export default userService;
