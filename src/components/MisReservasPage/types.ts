/**
 * types.ts
 *
 * Tipos e interfaces compartidas para la sección de Mis Reservas.
 */

/**
 * Modelo de reserva consumido desde el backend.
 * Algunos campos son opcionales porque pueden variar según tu DTO actual.
 */
export interface Reserva {
  id: number;
  espacioId: number;
  nombreEspacio?: string;
  direccionEspacio?: string;
  imagenUrlEspacio?: string;
  precioTotal?: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string; // PENDIENTE / CONFIRMADA / CANCELADA
}
