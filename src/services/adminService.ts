import api from "./api";
import type { JSendResponse, CurriculumJob, User } from "../types/api";

/**
 * ADMIN-only operations: user management and curriculum-job inspection.
 * There is no content CRUD — all courses/lessons/challenges are
 * AI-generated through the curriculum pipeline.
 */

export interface AdminUser extends User {
  _id?: string;
  createdAt?: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  role?: "STUDENT" | "ADMIN";
  name?: string;
}

export interface UserUpdatePayload {
  email?: string;
  role?: "STUDENT" | "ADMIN";
  profileData?: Record<string, unknown>;
}

export interface AdminJob extends Omit<CurriculumJob, "id"> {
  id: string;
  user: { id: string; email: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const adminService = {
  // ============ Users ============
  getUsers: async (
    page = 1,
    limit = 10
  ): Promise<{ users: AdminUser[]; pagination: Pagination }> => {
    const response = await api.get<
      JSendResponse<{ users: AdminUser[]; pagination: Pagination }>
    >("/admin/users", { params: { page, limit } });
    return (
      response.data.data || {
        users: [],
        pagination: { page: 1, limit, total: 0, pages: 0 },
      }
    );
  },

  createUser: async (payload: UserCreatePayload): Promise<void> => {
    await api.post("/admin/users", payload);
  },

  updateUser: async (
    userId: string,
    payload: UserUpdatePayload
  ): Promise<void> => {
    await api.put(`/admin/users/${userId}`, payload);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // ============ Curriculum Jobs ============
  getJobs: async (status?: string): Promise<AdminJob[]> => {
    const response = await api.get<JSendResponse<{ jobs: AdminJob[] }>>(
      "/admin/jobs",
      { params: status ? { status } : undefined }
    );
    return response.data.data?.jobs || [];
  },
};
