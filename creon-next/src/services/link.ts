import { axiosInstance } from "./index";

export const linkService = {
  createLink: async (data: object) => {
    console.log("🚀 NEW API-SIMPLE createLink called!");
    console.log("📝 Creating link with data:", data);
    console.log("🔍 axiosInstance exists:", !!axiosInstance);

    try {
      const response = await axiosInstance.post("/links", data);
      console.log("✅ Link created successfully:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Create link error:", error);
      throw error;
    }
  },

  getLinks: async (params?: object) => {
    console.log("📋 Getting links with params:", params);
    try {
      const response = await axiosInstance.get("/links", { params });
      console.log("✅ Links retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get links error:", error);
      throw error;
    }
  },

  updateLink: async (id: string, data: object) => {
    console.log("📝 Updating link:", id, data);
    try {
      const response = await axiosInstance.put(`/links/${id}`, data);
      console.log("✅ Link updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update link error:", error);
      throw error;
    }
  },

  deleteLink: async (id: string) => {
    console.log("🗑️ Deleting link:", id);
    try {
      const response = await axiosInstance.delete(`/links/${id}`);
      console.log("✅ Link deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Delete link error:", error);
      throw error;
    }
  },

  reorderLinks: async (linkOrders: Array<{ id: string; order: number }>) => {
    console.log("📊 Reordering links:", linkOrders);
    try {
      const response = await axiosInstance.post("/links/reorder", {
        linkOrders,
      });
      console.log("✅ Links reordered successfully");
      return response;
    } catch (error) {
      console.error("❌ Reorder links error:", error);
      throw error;
    }
  },

  fetchUrlMetadata: async (url: string) => {
    console.log("🔍 Fetching URL metadata:", url);
    try {
      const response = await axiosInstance.post("/metadata/fetch", { url });
      console.log("✅ URL metadata retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Fetch URL metadata error:", error);
      throw error;
    }
  },

  fetchParsedData: async (url: string) => {
    console.log("🔎 Fetching parsed data for URL:", url);
    try {
      // First, try to fetch HTML from client-side
      console.log("📄 Attempting client-side HTML fetch...");
      let html = "";

      try {
        // Try direct fetch first (may fail due to CORS)
        const htmlResponse = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          mode: "cors",
        });

        if (htmlResponse.ok) {
          html = await htmlResponse.text();
          console.log(
            "✅ Client-side fetch successful, HTML length:",
            html.length
          );
        } else {
          throw new Error(`HTTP ${htmlResponse.status}`);
        }
      } catch (corsError) {
        const errorMessage =
          corsError instanceof Error ? corsError.message : String(corsError);
        console.log(
          "⚠️ Direct fetch failed (likely CORS):",
          errorMessage,
          "- trying CORS proxy..."
        );

        // Try with a CORS proxy as fallback
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            url
          )}`;
          const proxyResponse = await fetch(proxyUrl);

          if (proxyResponse.ok) {
            html = await proxyResponse.text();
            console.log(
              "✅ CORS proxy fetch successful, HTML length:",
              html.length
            );
          } else {
            throw new Error(`Proxy HTTP ${proxyResponse.status}`);
          }
        } catch (proxyError) {
          console.log("❌ CORS proxy also failed:", proxyError);
          // Fall back to sending just URL (old method)
          console.log("🔄 Falling back to server-side fetch...");
          const response = await axiosInstance.post(
            "/data-parsing/fetch-response",
            { url },
            { timeout: 0 }
          );
          console.log("✅ Server-side fallback successful");
          return response;
        }
      }

      // Send HTML to server for LLM parsing
      console.log("🤖 Sending HTML to server for LLM parsing...");
      const response = await axiosInstance.post(
        "/data-parsing/fetch-response",
        { html, url }, // Send both HTML and URL (URL for caching)
        { timeout: 0 }
      );
      console.log("✅ Parsed data fetched successfully");
      return response;
    } catch (error) {
      console.error("❌ Fetch parsed data error:", error);
      throw error;
    }
  },

  retestLinks: async () => {
    console.log("🔄 Retesting links");
    try {
      const response = await axiosInstance.post("/links/retest");
      console.log("✅ Links retested successfully");
      return response;
    } catch (error) {
      console.error("❌ Retest links error:", error);
      throw error;
    }
  },
};
