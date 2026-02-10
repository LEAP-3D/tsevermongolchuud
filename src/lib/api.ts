import { api } from "./apiClient";

export const userApi = {
  create: (data: { email: string; password: string; name?: string | null }) =>
    api.post("/api/user", data).then((r) => r.data),
  list: () => api.get("/api/user").then((r) => r.data),
  update: (data: { id: number; name?: string | null; verified?: boolean }) =>
    api.put("/api/user", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/user", { data: { id } }).then((r) => r.data),
};

export const childApi = {
  create: (data: {
    name: string;
    age: number;
    gender?: string | null;
    pin?: string | null;
    parentId?: number | null;
  }) => api.post("/api/child", data).then((r) => r.data),
  list: (params?: { parentId?: number }) =>
    api.get("/api/child", { params }).then((r) => r.data),
  update: (data: { id: number; name?: string; age?: number; pin?: string }) =>
    api.put("/api/child", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/child", { data: { id } }).then((r) => r.data),
};

export const categoryCatalogApi = {
  create: (data: { name: string }) =>
    api.post("/api/categorycatalog", data).then((r) => r.data),
  list: () => api.get("/api/categorycatalog").then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/categorycatalog", { data: { id } }).then((r) => r.data),
};

export const childCategorySettingApi = {
  upsert: (data: {
    childId: number;
    categoryId: number;
    status?: "ALLOWED" | "BLOCKED" | "LIMITED";
    timeLimit?: number | null;
  }) => api.post("/api/childcategorysetting", data).then((r) => r.data),
  list: (params?: { childId?: number; categoryId?: number }) =>
    api.get("/api/childcategorysetting", { params }).then((r) => r.data),
  remove: (data: { childId: number; categoryId: number }) =>
    api
      .delete("/api/childcategorysetting", { data })
      .then((r) => r.data),
};

export const childUrlSettingApi = {
  upsert: (data: {
    childId: number;
    urlId: number;
    status?: "ALLOWED" | "BLOCKED" | "LIMITED";
    timeLimit?: number | null;
  }) => api.post("/api/childurlsetting", data).then((r) => r.data),
  list: (params?: { childId?: number; urlId?: number }) =>
    api.get("/api/childurlsetting", { params }).then((r) => r.data),
  remove: (data: { childId: number; urlId: number }) =>
    api.delete("/api/childurlsetting", { data }).then((r) => r.data),
};

export const dailyUsageApi = {
  create: (data: {
    childId: number;
    categoryId: number;
    date?: string;
    duration?: number;
  }) => api.post("/api/dailyusage", data).then((r) => r.data),
  list: (params?: { childId?: number; categoryId?: number; date?: string }) =>
    api.get("/api/dailyusage", { params }).then((r) => r.data),
  update: (data: { id: number; duration?: number }) =>
    api.put("/api/dailyusage", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/dailyusage", { data: { id } }).then((r) => r.data),
};

export const historyApi = {
  create: (data: {
    childId: number;
    fullUrl: string;
    domain: string;
    title?: string | null;
    categoryName: string;
    duration: number;
    visitedAt?: string;
    actionTaken: "ALLOWED" | "BLOCKED" | "LIMITED";
    device?: string | null;
  }) => api.post("/api/history", data).then((r) => r.data),
  list: (params?: { childId?: number; categoryName?: string }) =>
    api.get("/api/history", { params }).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/history", { data: { id } }).then((r) => r.data),
};

export const urlCatalogApi = {
  create: (data: {
    domain: string;
    categoryName: string;
    safetyScore: number;
    tags: string[];
  }) => api.post("/api/urlcatalog", data).then((r) => r.data),
  list: () => api.get("/api/urlcatalog").then((r) => r.data),
  update: (data: {
    id: number;
    categoryName?: string;
    safetyScore?: number;
    tags?: string[];
    updatedAt?: string;
  }) => api.put("/api/urlcatalog", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/urlcatalog", { data: { id } }).then((r) => r.data),
};

export const alertApi = {
  create: (data: {
    childId: number;
    type: "DANGEROUS_CONTENT" | "TIME_LIMIT_EXCEEDED" | "SUSPICIOUS_ACTIVITY";
    message: string;
    isSent?: boolean;
  }) => api.post("/api/alert", data).then((r) => r.data),
  list: (params?: { childId?: number; isSent?: boolean }) =>
    api.get("/api/alert", { params }).then((r) => r.data),
  update: (data: {
    id: number;
    isSent?: boolean;
    message?: string;
    type?: "DANGEROUS_CONTENT" | "TIME_LIMIT_EXCEEDED" | "SUSPICIOUS_ACTIVITY";
  }) => api.put("/api/alert", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete("/api/alert", { data: { id } }).then((r) => r.data),
};
