// Axios instance configured to attach JWT Bearer token to every request

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach token from localStorage before each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/index.html';
    }
    return Promise.reject(err);
  }
);
