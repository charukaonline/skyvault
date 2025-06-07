const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for file uploads
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      signup: `${API_BASE_URL}/api/auth/signup`,
    },
    content: {
      upload: `${API_BASE_URL}/api/content/creator/upload`,
      creatorContent: `${API_BASE_URL}/api/content/creator/my-content`,
      creatorContentFiltered: `${API_BASE_URL}/api/content/creator/my-content-filtered`,
      creatorStats: `${API_BASE_URL}/api/content/creator/stats`,
      search: `${API_BASE_URL}/api/content/public/search`,
      updateContent: (id) => `${API_BASE_URL}/api/content/creator/${id}`,
      deleteContent: (id) => `${API_BASE_URL}/api/content/creator/${id}`,
    },
    admin: {
      creators: `${API_BASE_URL}/api/admin/creators`,
      creatorsPending: `${API_BASE_URL}/api/admin/creators/pending`,
      approveCreator: (id) =>
        `${API_BASE_URL}/api/admin/creators/${id}/approve`,
      rejectCreator: (id) => `${API_BASE_URL}/api/admin/creators/${id}/reject`,
    },
    test: {
      connection: `${API_BASE_URL}/api/test-db`,
    },
  },
};

// Test connection utility
export const testConnection = async () => {
  try {
    const response = await fetch(apiConfig.endpoints.test.connection, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export default apiConfig;
