import axios from "axios";

// 🔧 URL base desde variable de entorno
export const API_URL = import.meta.env.VITE_API_URL || "http://192.168.10.10:2000";

// 🌐 Instancia de axios configurada
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔧 Interceptor - Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('🔧 Interceptor - URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Header Authorization agregado');
    } else {
      console.log('⚠️ No hay token para agregar');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 📡 Endpoints organizados
export const endpoints = {
  funcionarios: "/api/funcionarios",
  ganadores: "/api/ganadores",
  registrarGanador: "/api/registrar_ganador",
};

// 🎯 Funciones de API (opcional, para más organización)
export const apiFunctions = {
  getFuncionarios: () => api.get(endpoints.funcionarios),
  getGanadores: () => api.get(endpoints.ganadores),
  registrarGanador: (data) => api.post(endpoints.registrarGanador, data),
};