
import API from "./axiosInstance";

/**
 * Global Search API
 *
 * GET /api/search
 * Parameters:
 * q     - Search text
 * type  - all | category | course
 * limit - Maximum results per type
 */

export const searchGlobal = async ({
  q,
  type = "all",
  limit = 10,
}) => {
  const response = await API.get("/api/search", {
    params: {
      q: q.trim(),
      type,
      limit,
    },
    requiresAuth: true,
  });

  return response.data;
};

export default searchGlobal;
