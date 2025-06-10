const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      signup: `${API_BASE_URL}/api/auth/signup`,
    },
    content: {
      // Public endpoints
      search: `${API_BASE_URL}/api/content/public/search`,
      getById: (id) => `${API_BASE_URL}/api/content/public/${id}`,

      // Creator endpoints
      upload: `${API_BASE_URL}/api/content/creator/upload`,
      creatorContent: `${API_BASE_URL}/api/content/creator/my-content`,
      creatorContentFiltered: `${API_BASE_URL}/api/content/creator/my-content-filtered`,
      creatorStats: `${API_BASE_URL}/api/content/creator/stats`,
      updateContent: (id) => `${API_BASE_URL}/api/content/creator/${id}`,
      deleteContent: (id) => `${API_BASE_URL}/api/content/creator/${id}`,

      // Admin endpoints
      adminContent: `${API_BASE_URL}/api/content/admin/all`,
      updateStatus: (id) => `${API_BASE_URL}/api/content/admin/${id}/status`,

      // Content access endpoints for private S3 files
      access: {
        view: (contentId) =>
          `${API_BASE_URL}/api/content/access/${contentId}/view`,
        download: (contentId, fileId) =>
          `${API_BASE_URL}/api/content/access/${contentId}/download/${fileId}`,
        preview: (contentId) =>
          `${API_BASE_URL}/api/content/access/${contentId}/preview`,
        check: (contentId) =>
          `${API_BASE_URL}/api/content/access/${contentId}/check`,
        thumbnail: (contentId) =>
          `${API_BASE_URL}/api/content/access/${contentId}/thumbnail`,
      },
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
