const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      signup: `${API_BASE_URL}/api/auth/signup`,
    },
    content: {
      upload: `${API_BASE_URL}/api/content/creator/upload`,
      creatorContent: `${API_BASE_URL}/api/content/creator/my-content`,
      search: `${API_BASE_URL}/api/content/public/search`,
    },
    admin: {
      creators: `${API_BASE_URL}/api/admin/creators`,
      creatorsPending: `${API_BASE_URL}/api/admin/creators/pending`,
      approveCreator: (id) =>
        `${API_BASE_URL}/api/admin/creators/${id}/approve`,
      rejectCreator: (id) => `${API_BASE_URL}/api/admin/creators/${id}/reject`,
    },
  },
};

export default apiConfig;
