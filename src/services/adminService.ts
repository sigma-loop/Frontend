import api from "./api";
import type {
  JSendResponse,
  CurriculumJob,
  User,
  AdminListResult,
  AdminRecord,
  AdminRecordResult,
  AdminAncestor,
  AdminResourceCatalogEntry,
  AdminMetrics,
  AdminUserOverview,
  AppSetting,
} from "../types/api";

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

  // ============ GOD panel: metrics command center ============
  getMetrics: async (): Promise<AdminMetrics | undefined> => {
    const response =
      await api.get<JSendResponse<AdminMetrics>>("/admin/metrics");
    return response.data.data;
  },

  getUserOverview: async (
    userId: string
  ): Promise<AdminUserOverview | undefined> => {
    const response = await api.get<JSendResponse<AdminUserOverview>>(
      `/admin/users/${userId}/overview`
    );
    return response.data.data;
  },

  // ============ GOD panel: generic CRUD over every collection ============
  getCatalog: async (): Promise<AdminResourceCatalogEntry[]> => {
    const response =
      await api.get<JSendResponse<{ resources: AdminResourceCatalogEntry[] }>>(
        "/admin/resources"
      );
    return response.data.data?.resources ?? [];
  },

  listResource: async (
    resource: string,
    params: Record<string, string> = {}
  ): Promise<AdminListResult> => {
    const response = await api.get<JSendResponse<AdminListResult>>(
      `/admin/data/${resource}`,
      { params }
    );
    return (
      response.data.data ?? {
        resource,
        items: [],
        pagination: { page: 1, perPage: 25, total: 0, pages: 0 },
      }
    );
  },

  getRecord: async (
    resource: string,
    id: string
  ): Promise<AdminRecordResult | undefined> => {
    const response = await api.get<
      JSendResponse<{ item: AdminRecord; ancestors?: AdminAncestor[] }>
    >(`/admin/data/${resource}/${id}`);
    const data = response.data.data;
    if (!data?.item) return undefined;
    return { item: data.item, ancestors: data.ancestors ?? [] };
  },

  createRecord: async (
    resource: string,
    body: Record<string, unknown>
  ): Promise<AdminRecord | undefined> => {
    const response = await api.post<JSendResponse<{ item: AdminRecord }>>(
      `/admin/data/${resource}`,
      body
    );
    return response.data.data?.item;
  },

  updateRecord: async (
    resource: string,
    id: string,
    body: Record<string, unknown>
  ): Promise<AdminRecord | undefined> => {
    const response = await api.patch<JSendResponse<{ item: AdminRecord }>>(
      `/admin/data/${resource}/${id}`,
      body
    );
    return response.data.data?.item;
  },

  deleteRecord: async (resource: string, id: string): Promise<void> => {
    await api.delete(`/admin/data/${resource}/${id}`);
  },

  // ============ Runtime app settings (env override layer) ============
  getSettings: async (): Promise<{
    settings: AppSetting[];
    groups: string[];
  }> => {
    const response =
      await api.get<
        JSendResponse<{ settings: AppSetting[]; groups: string[] }>
      >("/admin/settings");
    return response.data.data ?? { settings: [], groups: [] };
  },

  updateSettings: async (
    updates: Array<{ key: string; value: unknown }>
  ): Promise<AppSetting[]> => {
    const response = await api.put<JSendResponse<{ settings: AppSetting[] }>>(
      "/admin/settings",
      { updates }
    );
    return response.data.data?.settings ?? [];
  },

  resetSetting: async (key: string): Promise<AppSetting[]> => {
    const response = await api.delete<
      JSendResponse<{ settings: AppSetting[] }>
    >(`/admin/settings/${encodeURIComponent(key)}`);
    return response.data.data?.settings ?? [];
  },
};
