/**
 * README.md - MisReservasPage Components
 *
 * # Componentes de Mis Reservas
 *
 * Esta carpeta contiene los componentes modularizados para la página "Mis Reservas".
 * Cada componente tiene una responsabilidad clara y bien definida.
 *
 * ## Estructura
 *
 * - **types.ts** - Interfaces y tipos compartidos (Reserva)
 * - **ReservaCard.tsx** - Tarjeta individual de reserva
 * - **CancelacionModal.tsx** - Modal para confirmar cancelación
 * - **EmptyState.tsx** - Estado vacío (sin reservas)
 * - **LoadingState.tsx** - Estado de carga
 * - **ErrorState.tsx** - Estado de error
 *
 * ## Componentes
 *
 * ### ReservaCard
 * Renderiza una tarjeta de reserva con todos sus detalles.
 *
 * **Props:**
 * ```typescript
 * {
 *   reserva: Reserva;           // Datos de la reserva
 *   procesandoId: number | null; // ID de la reserva en proceso de cancelación
 *   onCancelar: (reserva: Reserva) => void;    // Callback al cancelar
 *   onVerEspacio: (espacioId: number) => void; // Callback para ver espacio
 * }
 * ```
 *
 * **Características:**
 * - Foto del espacio con fallback
 * - Badge de estado (Confirmada, Pendiente, etc.)
 * - Nombre, dirección y ubicación del espacio\n * - Fechas de entrada y salida formateadas\n * - Precio total de la reserva\n * - Botones: Cancelar y Ver Espacio\n * - Dark mode completo\n *\n * ### CancelacionModal\n * Modal de confirmación con animaciones para cancelar una reserva.\n *\n * **Props:**\n * ```typescript\n * {\n *   visible: boolean;          // Visibilidad del modal\n *   reserva: Reserva | null;   // Reserva a cancelar\n *   procesandoId: number | null; // ID en proceso\n *   onConfirmar: () => void;   // Callback de confirmación\n *   onCancelar: () => void;    // Callback para cerrar\n * }\n * ```\n *\n * **Características:**\n * - Backdrop con blur\n * - Animaciones de entrada/salida\n * - Icono de advertencia\n * - Descripción clara de la acción\n * - Botones de confirmación y cancelación\n * - Dark mode completo\n *\n * ### EmptyState\n * Componente para mostrar cuando no hay reservas activas.\n *\n * **Características:**\n * - Icono de calendario\n * - Mensaje claro y amigable\n * - Centrado y con buen espaciado\n * - Dark mode completo\n *\n * ### LoadingState\n * Muestra un spinner mientras se cargan las reservas.\n *\n * **Características:**\n * - Spinner animado\n * - Texto de información\n * - Altura de página completa\n * - Dark mode completo\n *\n * ### ErrorState\n * Muestra errores con opción de reintentar.\n *\n * **Props:**\n * ```typescript\n * {\n *   mensaje: string;        // Mensaje de error a mostrar\n *   onReintentar: () => void; // Callback para reintentar\n * }\n * ```\n *\n * **Características:**\n * - Icono de error\n * - Mensaje personalizable\n * - Botón de reintento\n * - Dark mode completo\n *\n * ## Uso\n *\n * ```tsx\n * import ReservaCard from './ReservaCard';\n * import CancelacionModal from './CancelacionModal';\n * import EmptyState from './EmptyState';\n * import LoadingState from './LoadingState';\n * import ErrorState from './ErrorState';\n * import { Reserva } from './types';\n *\n * export default function MisReservasPage() {\n *   const [reservas, setReservas] = useState<Reserva[]>([]);\n *   const [cargando, setCargando] = useState(true);\n *   const [error, setError] = useState<string | null>(null);\n *   const [modalVisible, setModalVisible] = useState(false);\n *   const [reservaParaCancelar, setReservaParaCancelar] = useState<Reserva | null>(null);\n *   const [procesandoId, setProcesandoId] = useState<number | null>(null);\n *\n *   // ... lógica de carga y cancelación ...\n *\n *   if (cargando) return <LoadingState />;\n *   if (error) return <ErrorState mensaje={error} onReintentar={cargarReservas} />;\n *   if (reservas.length === 0) return <EmptyState />;\n *\n *   return (\n *     <div>\n *       <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n *         {reservas.map(reserva => (\n *           <ReservaCard\n *             key={reserva.id}\n *             reserva={reserva}\n *             procesandoId={procesandoId}\n *             onCancelar={iniciarCancelacion}\n *             onVerEspacio={handleVerEspacio}\n *           />\n *         ))}\n *       </div>\n *       <CancelacionModal\n *         visible={modalVisible}\n *         reserva={reservaParaCancelar}\n *         procesandoId={procesandoId}\n *         onConfirmar={ejecutarCancelacion}\n *         onCancelar={cerrarModal}\n *       />\n *     </div>\n *   );\n * }\n * ```\n *\n * ## Patrones de Diseño\n *\n * - **Single Responsibility**: Cada componente tiene una única razón para cambiar\n * - **Reusable Props**: Las props son genéricas y reutilizables\n * - **Type Safety**: TypeScript en todos los componentes\n * - **Dark Mode**: Todos los componentes soportan modo oscuro\n * - **Accessibility**: Uso de aria-labels y roles semánticos\n * - **Animations**: Transiciones suaves con Tailwind CSS\n */\n\nexport {};\n