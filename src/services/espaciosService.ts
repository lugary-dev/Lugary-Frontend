import api from "../api/client";

/**
 * Obtiene los espacios de un usuario específico.
 * Normaliza la respuesta para manejar tanto paginación como arrays simples.
 */
export const obtenerEspaciosUsuario = async (userId: string) => {
  const resp = await api.get<any>(`/espacios?usuarioId=${encodeURIComponent(userId)}`);
  
  if (resp.data && Array.isArray(resp.data.content)) {
    return resp.data.content;
  } else if (Array.isArray(resp.data)) {
    return resp.data;
  } else {
    return [];
  }
};

export const pausarEspacio = async (espacioId: number, userId: string) => {
  const response = await api.patch(`/espacios/${espacioId}/pausar?usuarioId=${encodeURIComponent(userId)}`);
  return response.data;
};

export const publicarEspacio = async (espacioId: number, userId: string) => {
  // Nota: Usamos 'publicar' para reactivar un espacio pausado
  const response = await api.patch(`/espacios/${espacioId}/publicar?usuarioId=${encodeURIComponent(userId)}`);
  return response.data;
};

export const eliminarEspacio = async (espacioId: number, userId: string): Promise<any> => {
  const response = await api.delete(`/espacios/${espacioId}?usuarioId=${encodeURIComponent(userId)}`);
  return response.data;
};