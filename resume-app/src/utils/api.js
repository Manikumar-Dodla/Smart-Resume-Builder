import axios from 'axios';
import { mockGenerateResume, mockHealthCheck } from './mockService';

// Get API URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Check if we should use mock services (for development or when API is down)
const USE_MOCK_SERVICES = import.meta.env.VITE_USE_MOCK_API === 'true' || false;

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds for PDF generation
  headers: {
    'Content-Type': 'application/json'
  }
});

// Maximum retry attempts
const MAX_RETRIES = 2;

// Add a request interceptor with retry logic
api.interceptors.request.use(
  config => {
    // Add retry count to config if it doesn't exist
    if (config.retryCount === undefined) {
      config.retryCount = 0;
    }
    console.log(`Connecting to API at: ${config.baseURL}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor with retry logic
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // If we haven't reached max retries and the error is network related
    if (originalRequest.retryCount < MAX_RETRIES && 
        (error.code === 'ECONNABORTED' || !error.response)) {
      
      originalRequest.retryCount += 1;
      console.log(`Retrying request (${originalRequest.retryCount}/${MAX_RETRIES})...`);
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    
    // Handle errors based on type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoint functions with fallbacks to mock services
const resumeApi = {
  // Health check to see if server is running
  checkHealth: async () => {
    if (USE_MOCK_SERVICES) {
      console.log("Using mock health check");
      return mockHealthCheck();
    }
    
    try {
      return await api.get('/health', { timeout: 5000 });
    } catch (error) {
      console.warn("Health check failed, using mock service:", error.message);
      return mockHealthCheck();
    }
  },
  
  // Generate resume
  generateResume: (formData) => {
    return api.post('/resume/generate', formData);
  },
  
  // Download resume as PDF
  downloadResume: (resumeData) => {
    return api.post('/resume/download', { resumeData }, { 
      responseType: 'blob' 
    });
  },

  // Generate optimized resume with AI
  generateAIResume: async (resumeText, jobDescription, customPrompt = '') => {
    if (USE_MOCK_SERVICES) {
      console.log("Using mock AI resume generator");
      return mockGenerateResume(resumeText, jobDescription, customPrompt);
    }
    
    try {
      return await api.post('/resume/create', {
        resume: resumeText,
        jobdescription: jobDescription,
        customprompt: customPrompt
      });
    } catch (error) {
      console.warn("AI Resume generation failed:", error.message);
      
      // If server is down in development mode, use mock service as fallback
      if (import.meta.env.DEV) {
        console.log("Falling back to mock service in development mode");
        return mockGenerateResume(resumeText, jobDescription, customPrompt);
      }
      
      throw error;
    }
  },
  
  // Download resume as PDF directly
  downloadResumePDF: (latexCode) => {
    return api.post('/resume/download', { latexCode }, { 
      responseType: 'blob' 
    });
  },

  // Get server status and info
  getServerInfo: () => {
    return api.get('/api/status', { timeout: 3000 })
      .catch(() => {
        // Return fake success response if server is unreachable during development
        if (import.meta.env.DEV) {
          console.warn('Using mock API response in development mode');
          return { 
            data: { 
              status: 'ok', 
              version: 'dev', 
              message: 'API server mock (development mode)' 
            } 
          };
        }
        throw new Error('Cannot connect to server');
      });
  }
};

export default resumeApi;
