import axios, { AxiosError } from 'axios';

// Base URL for Flask API - empty to use Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session cookies
  timeout: 30000, // 30 second timeout
});

// Request interceptor for caching
api.interceptors.request.use(
  (config) => {
    // Only cache GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = config.url + JSON.stringify(config.params);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached response
        return Promise.reject({
          cached: true,
          data: cached.data,
          config
        });
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET requests
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error: any) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve({ data: error.data, config: error.config });
    }
    
    // Only log errors that aren't 401 (authentication errors are expected)
    if (error.response) {
      if (error.response.status !== 401) {
        console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Function to clear cache
export const clearCache = () => {
  cache.clear();
};

// Function to clear specific cache entry (clears all variations of the URL)
export const clearCacheEntry = (url: string) => {
  // Clear exact match
  cache.delete(url);
  
  // Also clear all cache entries that start with this URL
  // This handles cases where params are appended
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.startsWith(url)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
  
  console.log(`Cleared cache for: ${url} (${keysToDelete.length} entries)`);
};

export default api;