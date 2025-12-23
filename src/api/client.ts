import axios from "axios";

/**
 * Cliente HTTP centralizado para interactuar con el backend.
 *
 * - Configura la URL base de la API.
 * - Adjunta el token JWT (si existe) en cada petición.
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;