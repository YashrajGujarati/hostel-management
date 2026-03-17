const API_URL = import.meta.env.VITE_API_URL || 
  (['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:5000/api' : '/api');

export default API_URL;
