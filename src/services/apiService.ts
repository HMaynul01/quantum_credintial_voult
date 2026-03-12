// A simple wrapper for fetch to call our Netlify functions

const api = {
  get: async (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`/api/${endpoint}`, window.location.origin);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint: string, body: Record<string, any>) => {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    return response.json();
  },
};

export default api;
