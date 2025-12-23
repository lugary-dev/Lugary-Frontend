import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import AuthRequiredModal from "../components/AuthRequiredModal";
import { BookingCalendar } from "../components/espacios/BookingCalendar";
import { ImageLightbox } from "../components/ImageLightbox";
import { useScrollLock } from "../hooks/useScrollLock";
import { useShare } from "../hooks/useShare";
import ShareModal from "../components/ShareModal";
import Mapa from "../components/Mapa";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  LuWifi, LuSnowflake, LuMusic, LuTv, LuUtensils, LuMapPin, LuUsers, LuShare2, LuHeart, LuBan, LuVolume2,
  LuFlame, LuArmchair, LuToyBrick, LuAccessibility, LuSparkles, LuZap, LuShieldCheck, LuDog, LuCigaretteOff, LuStar,
  LuDollarSign, LuTrash2, LuCircleAlert, LuMoon, LuPartyPopper, LuCircleCheck, LuInfo,
} from "react-icons/lu";
import { TbGrill, TbPool, TbAirConditioning, TbParking, TbTable } from "react-icons/tb";

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Tipo que representa un espacio tal como lo devuelve el backend.
 */
interface Espacio {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  capacidadMaxima: number;
  precio: number;
  unidadPrecio: string;
  tipo: string | string[];
  activo?: boolean;
  estado?: string;
  imagenUrl: string;
  imagenes?: string[]; // [NUEVO] Galería de imágenes completa
  servicios: string[];
  reglas: string[];
  calificacion?: number;
  resenas?: number;
  latitud?: number;
  longitud?: number;
  horaCheckIn?: string;
  horaCheckOut?: string;
  estadiaMinima?: number;
  precioFinDeSemana?: number;
  montoDeposito?: number;
  cargoLimpieza?: number;
  avisoMinimo?: number;
  anticipacionMaxima?: number;
  diasBloqueados?: string[];
}

// [NUEVO] Helper simple para manejar favoritos en LocalStorage
const STORAGE_KEY = "lugary_favoritos";

const getFavoritos = (): Espacio[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const toggleFavoritoStorage = (espacio: Espacio): boolean => {
  const favoritos = getFavoritos();
  const index = favoritos.findIndex((f) => f.id === espacio.id);

  if (index >= 0) {
    // Si ya existe, lo sacamos (Remove)
    favoritos.splice(index, 1);
  } else {
    // Si no existe, lo agregamos (Add)
    favoritos.push(espacio);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  return index === -1; // Retorna true si se agregó (ahora es fav), false si se quitó
};

const isFavoritoStorage = (id: number): boolean => {
  const favoritos = getFavoritos();
  return favoritos.some((f) => f.id === id);
};

// ---------------- Render: Icons SVG ----------------
// [REFACTOR] Se mueven los componentes de íconos fuera del componente principal
// para evitar que se re-creen en cada render, mejorando el rendimiento.

const featureIcons: { [key: string]: React.JSX.Element } = {
  // Servicios
  wifi: <LuWifi className="w-5 h-5" />,
  parrilla: <TbGrill className="w-5 h-5" />,
  pileta: <TbPool className="w-5 h-5" />,
  freezer: <LuSnowflake className="w-5 h-5" />,
  'aire acondicionado': <TbAirConditioning className="w-5 h-5" />,
  calefaccion: <LuFlame className="w-5 h-5" />,
  estacionamiento: <TbParking className="w-5 h-5" />,
  vajilla: <LuUtensils className="w-5 h-5" />,
  mesas: <TbTable className="w-5 h-5" />,
  sillas: <LuArmchair className="w-5 h-5" />,
  'equipo de musica': <LuMusic className="w-5 h-5" />,
  tv: <LuTv className="w-5 h-5" />,
  'juegos infantiles': <LuToyBrick className="w-5 h-5" />,
  accesible: <LuAccessibility className="w-5 h-5" />,
  limpieza: <LuSparkles className="w-5 h-5" />,
  'grupo electrogeno': <LuZap className="w-5 h-5" />,
  seguridad: <LuShieldCheck className="w-5 h-5" />,
  'pet friendly': <LuDog className="w-5 h-5" />,
  // Reglas
  'no fumar adentro': <LuCigaretteOff className="w-5 h-5" />,
  'no se permiten mascotas': <LuBan className="w-5 h-5" />,
  'musica moderada': <LuVolume2 className="w-5 h-5" />,
  'capacidad maxima': <LuUsers className="w-5 h-5" />,
  'seña': <LuDollarSign className="w-5 h-5" />,
  'garantia': <LuDollarSign className="w-5 h-5" />,
  basura: <LuTrash2 className="w-5 h-5" />,
  'mayores de': <LuCircleAlert className="w-5 h-5" />,
  pirotecnia: <LuBan className="w-5 h-5" />,
  familiares: <LuUsers className="w-5 h-5" />,
  'no fiestas': <LuPartyPopper className="w-5 h-5" />,
  nocturnas: <LuMoon className="w-5 h-5" />,
  // Defaults
  defaultService: <LuCircleCheck className="w-5 h-5" />,
  defaultRule: <LuInfo className="w-5 h-5" />,
};

const getFeatureIcon = (text: string, type: 'service' | 'rule') => {
  // [FIX] Normaliza el texto: minúsculas, sin acentos, sin espacios.
  // Esto asegura que "Música" coincida con la clave "musica".
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, '');
    
  const colorClass = type === 'service' 
    ? "text-blue-600 dark:text-blue-400" 
    : "text-red-600 dark:text-red-400";

  let iconElement = type === 'service' ? featureIcons.defaultService : featureIcons.defaultRule;

  for (const key in featureIcons) {
    if (key.startsWith('default')) continue;

    if (normalizedText.includes(key.replace(/ /g, ''))) {
      iconElement = featureIcons[key];
      break;
    }
  }
  // Clonamos el elemento para inyectarle la clase de color
  return React.cloneElement(iconElement, { className: `${iconElement.props.className} ${colorClass}` });
};

const FeatureList = ({ title, items, type }: { title: string; items: string[], type: 'service' | 'rule' }) => {
  if (!items || items.length === 0) return null;

  // [NUEVO] Clases de color dinámicas para el fondo del ícono, según el tipo.
  const iconBgClass = type === 'service'
    ? 'bg-blue-50 dark:bg-blue-900/30'
    : 'bg-red-50 dark:bg-red-900/30';

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <span className={`flex-shrink-0 p-2 rounded-lg ${iconBgClass}`}>
                {getFeatureIcon(item, type)}
            </span>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const GalleryImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ src, alt, className = '', onClick, children }) => (
  <div className={`relative group cursor-pointer bg-slate-200 dark:bg-slate-800 overflow-hidden ${className}`} onClick={onClick}>
    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
    {children}
  </div>
);

// [NUEVO] Helper para renderizar texto con negritas usando **texto**
const renderDescriptionWithBold = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// [REFACTOR] Componente para renderizar estrellas de calificación con nuevo estilo
const StarRating = ({ rating, className = '' }: { rating: number; className?: string }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <LuStar
        key={i}
        className={`w-3 h-3 ${i <= rating ? 'fill-slate-900 text-slate-900 dark:fill-white dark:text-white' : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600'}`}
      />
    );
  }
  return <div className={`flex items-center gap-0.5 ${className}`}>{stars}</div>;
};

// --- COMPONENTE: INFORMACIÓN DEL ANFITRIÓN ---
const HostInfo = () => (
  <div className="flex items-center gap-4 py-6 border-b border-slate-200 dark:border-slate-800">
    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
      {/* Placeholder de avatar (puedes poner la foto real del user luego) */}
      <img 
        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" 
        alt="Enzo" 
        className="w-full h-full object-cover"
      />
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
        Anfitrionado por Enzo
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Se unió en mayo de 2023
      </p>
    </div>
  </div>
);

// --- COMPONENTE: SECCIÓN DE RESEÑAS ---
const ReviewsSection = () => {
  // Datos mock para la UI mejorada de reseñas. En una app real, esto vendría del backend.
  const ratingBreakdown = [
    { stars: 5, count: 10 },
    { stars: 4, count: 2 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  const totalReviews = ratingBreakdown.reduce((acc, item) => acc + item.count, 0);
  const averageRating = totalReviews > 0 ? (ratingBreakdown.reduce((acc, item) => acc + item.stars * item.count, 0) / totalReviews).toFixed(1) : "0.0";

  const subCategoryRatings = [
    { label: "Limpieza", val: 5.0 },
    { label: "Veracidad", val: 4.9 },
    { label: "Comunicación", val: 5.0 },
    { label: "Ubicación", val: 4.8 },
    { label: "Llegada", val: 5.0 },
    { label: "Calidad-precio", val: 4.9 },
  ];

  const mockReviews = [
    {
      name: "Lucas M.",
      date: "Octubre 2024",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      text: "El lugar es increíble, tal cual se ve en las fotos. La pileta estaba impecable y el quincho muy cómodo. Volveremos seguro.",
    },
    {
      name: "Mariana G.",
      date: "Septiembre 2024",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit-crop&w=100&q=80",
      rating: 5,
      text: "Excelente atención de Enzo. Todo funcionaba perfecto, el wifi vuela. Muy recomendable para pasar el día en familia.",
    },
  ];

  return (
    <div className="pt-10 border-t border-slate-200 dark:border-slate-800">
      {/* Encabezado con Icono Estrella */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
          <LuStar className="w-6 h-6 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {averageRating} · {totalReviews} reseñas
        </h2>
      </div>

      {/* Grid de Métricas y Desglose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mb-12">
        {/* Columna 1: Métricas Detalladas (Limpieza, etc.) */}
        <div className="space-y-4">
          {subCategoryRatings.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between group">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{stat.label}</span>
              <div className="flex items-center gap-3 w-1/2 justify-end">
                {/* Barra de progreso estilo Airbnb: Fina y Negra */}
                <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-800 dark:bg-slate-200 rounded-full"
                    style={{ width: `${(stat.val / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-slate-900 dark:text-white font-semibold text-xs w-6 text-right">{stat.val.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Columna 2: Distribución de Estrellas - [MEJORA] Sin título para alinear con la columna izquierda */}
        <div className="space-y-3">
          {ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs group cursor-default">
                  <span className="font-medium text-slate-600 dark:text-slate-400 w-3">{row.stars}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      {/* Barra con color sutil pero visible */}
                      <div 
                          className="h-full bg-slate-800 dark:bg-slate-300 rounded-full transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white" 
                          style={{ width: totalReviews > 0 ? `${(row.count / totalReviews) * 100}%` : '0%' }}
                      ></div>
                  </div>
                  <span className="text-slate-500 dark:text-slate-500 w-4 text-right tabular-nums">{row.count}</span>
              </div>
          ))}
        </div>
      </div>

      {/* Grid de Comentarios (Doble Columna) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockReviews.map((review, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={review.avatar} alt={review.name} 
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</p>
                <p className="text-xs text-slate-500">{review.date}</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-2">
                <StarRating rating={review.rating} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>
      
      <button className="mt-10 px-6 py-2.5 border border-slate-900 dark:border-slate-100 rounded-lg text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        Mostrar las {totalReviews} reseñas
      </button>
    </div>
  );
};

/**
 * Pantalla de detalle de un espacio.
 * Estilo: Dashboard moderno, limpio, luminoso (Airbnb/Booking style) con soporte Dark Mode.
 */
export default function EspacioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [espacio, setEspacio] = useState<Espacio | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  // [NUEVO] Estados para el visor de imágenes
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const { share, isModalOpen, setModalOpen } = useShare();

  // [NUEVO] Estado para el corazón
  const [isFavorito, setIsFavorito] = useState(false);

  // [NUEVO] Estado para mostrar todos los servicios
  const [showAllServices, setShowAllServices] = useState(false);

  // [NUEVO] Estado para mostrar todas las reglas
  const [showAllRules, setShowAllRules] = useState(false);

  // Bloquear scroll cuando el modal de auth está abierto
  useScrollLock(showAuthModal);

  // [NUEVO] Prepara las imágenes para la galería, usando 'imagenes' si existe, o 'imagenUrl' como fallback.
  const galleryImages = useMemo(() => {
    if (espacio?.imagenes && espacio.imagenes.length > 0) {
      return espacio.imagenes;
    }
    if (espacio?.imagenUrl) {
      return [espacio.imagenUrl];
    }
    return [];
  }, [espacio]);

  const openLightbox = (index: number) => {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  // [NUEVO] Efecto para chequear si es favorito cuando carga el espacio
  useEffect(() => {
    if (espacio) {
      setIsFavorito(isFavoritoStorage(espacio.id));
      setShowAllServices(false);
    }
  }, [espacio]);

  // [NUEVO] Manejador del click en el corazón
  const handleToggleFavorito = () => {
    if (!espacio) return;
    const nuevoEstado = toggleFavoritoStorage(espacio);
    setIsFavorito(nuevoEstado);
  };

  // ---------------- Carga de espacio ----------------
  useEffect(() => {
    const cargarEspacio = async () => {
      if (!id) {
        setErrorMensaje("No se especificó el espacio.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<Espacio>(`/espacios/${id}`);
        const espacioData = response.data;
        setEspacio(espacioData);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404) {
          setErrorMensaje("El espacio solicitado no existe.");
        } else {
          setErrorMensaje("No fue posible obtener la información del espacio.");
        }
      } finally {
        setLoading(false);
      }
    };
    cargarEspacio();
  }, [id]);

  // ---------------- Render: Estados de Carga/Error ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (errorMensaje || !espacio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-xl p-8 text-center border border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            No encontramos el espacio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {errorMensaje || "Ocurrió un error inesperado."}
          </p>
          <button
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Render: UI Principal ----------------
  // Lógica de visualización de servicios (primeros 6 o todos)
  const displayedServices = showAllServices ? espacio?.servicios : espacio?.servicios?.slice(0, 6);

  // [CORRECCIÓN] Lógica de visualización de reglas que faltaba
  const displayedRules = showAllRules
    ? espacio?.reglas
    : espacio?.reglas?.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {isLightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          startIndex={lightboxStartIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {espacio && <ShareModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} espacio={espacio} />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado del Título */}
        <section className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {espacio.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <LuMapPin className="w-4 h-4" />
                  {espacio.direccion}
                </span>
                <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <LuUsers className="w-4 h-4" />
                  Hasta {espacio.capacidadMaxima} personas
                </span>
                <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full text-xs border border-emerald-100 dark:border-emerald-800">
                  {(espacio.activo || espacio.estado === 'PUBLICADO') ? "Disponible" : "Pausado"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => share({ 
                  title: espacio.nombre, 
                  text: `Mirá este lugar en Lugary: ${espacio.nombre}`, 
                  url: window.location.href 
                })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition"
              >
                <LuShare2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
              {/* [MODIFICADO] Botón Guardar / Favorito */}
              <button
                onClick={handleToggleFavorito}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border active:scale-95 ${
                  isFavorito
                    ? "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400"
                    : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <LuHeart
                  className={`w-4 h-4 transition-all duration-300 ${isFavorito ? "fill-current scale-110" : "scale-100"}`}
                />
                <span className="hidden sm:inline">
                  {isFavorito ? "Guardado" : "Guardar"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Galería de Imágenes (Grid Layout) */}
        <section className="mb-8">
          {(() => {
            const imageCount = galleryImages.length;
            if (imageCount === 0) return (
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                <span>No hay imágenes disponibles</span>
              </div>
            );
            if (imageCount === 1) return (
              <div className="aspect-video rounded-2xl overflow-hidden">
                <GalleryImage src={galleryImages[0]} alt={espacio.nombre} onClick={() => openLightbox(0)} />
              </div>
            );
            if (imageCount >= 2 && imageCount <= 4) {
              const gridClasses = { 2: 'grid-cols-2', 3: 'grid-cols-2', 4: 'grid-cols-2 grid-rows-2' }[imageCount] || '';
              return (
                <div className={`grid ${gridClasses} gap-2 h-[250px] sm:h-[400px] md:h-[480px] rounded-2xl overflow-hidden`}>
                  {galleryImages.map((img, index) => (
                    <GalleryImage key={index} src={img} alt={`${espacio.nombre} ${index + 1}`} className={imageCount === 3 && index === 0 ? 'row-span-2' : ''} onClick={() => openLightbox(index)} />
                  ))}
                </div>
              );
            }
            // Layout para 5 o más imágenes
            return (
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[250px] sm:h-[400px] md:h-[480px] rounded-2xl overflow-hidden">
                <GalleryImage src={galleryImages[0]} alt={`${espacio.nombre} 1`} className="col-span-2 row-span-2" onClick={() => openLightbox(0)} />
                <GalleryImage src={galleryImages[1]} alt={`${espacio.nombre} 2`} onClick={() => openLightbox(1)} />
                <GalleryImage src={galleryImages[2]} alt={`${espacio.nombre} 3`} onClick={() => openLightbox(2)} />
                <GalleryImage src={galleryImages[3]} alt={`${espacio.nombre} 4`} onClick={() => openLightbox(3)} />
                <GalleryImage src={galleryImages[4]} alt={`${espacio.nombre} 5`} onClick={() => openLightbox(4)}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
                    className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-slate-800 transition"
                  >
                    Ver todas las fotos
                  </button>
                </GalleryImage>
              </div>
            );
          })()}
        </section>

        {/* Layout de Contenido (Dos Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-12">
          {/* ----------------- COLUMNA IZQUIERDA (Reorganizada) ----------------- */}
          <div className="space-y-8">

            {/* 1. INFORMACIÓN DEL ANFITRIÓN */}
            <HostInfo />

            {/* 2. DESCRIPCIÓN */}
            <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Sobre este espacio
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-line text-base">
                {espacio.descripcion ? renderDescriptionWithBold(espacio.descripcion) : "El propietario no ha proporcionado una descripción detallada."}
              </p>
            </div>

            {/* 3. SERVICIOS */}
            {(espacio.servicios && espacio.servicios.length > 0) && (
              <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                <FeatureList title="Lo que ofrece este lugar" items={displayedServices || []} type="service" />
                {espacio.servicios.length > 6 && (
                  <button onClick={() => setShowAllServices(!showAllServices)} className="mt-4 px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    {showAllServices ? "Mostrar menos" : `Mostrar todos servicios`}
                  </button>
                )}
              </div>
            )}

            {/* 4. REGLAS */}
            {(espacio.reglas && espacio.reglas.length > 0) && (
              <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
                <FeatureList title="Reglas del lugar" items={displayedRules || []} type="rule" />
                {espacio.reglas.length > 6 && (
                  <button onClick={() => setShowAllRules(!showAllRules)} className="mt-4 px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    {showAllRules ? "Mostrar menos" : `Mostrar todas las reglas`}
                  </button>
                )}
              </div>
            )}

            {/* 5. MAPA (Ahora interactivo) */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Dónde vas a estar</h2>
              {espacio.latitud && espacio.longitud ? (
                <div className="h-64 w-full rounded-xl overflow-hidden z-0 border border-slate-200 dark:border-slate-800">
                    <MapContainer center={[espacio.latitud, espacio.longitud]} zoom={15} style={{ height: '100%', width: '100%' }} dragging={false} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[espacio.latitud, espacio.longitud]} />
                    </MapContainer>
                </div>
              ) : (
                <Mapa direccion={espacio.direccion} />
              )}
              <p className="text-xs text-slate-500 mt-3">La dirección exacta se compartirá una vez confirmada la reserva.</p>
            </div>

            {/* 6. RESEÑAS */}
            <ReviewsSection />
          </div>

          {/* COLUMNA DERECHA: Panel de Reserva (Sticky) */}
          <div className="relative">
            <div className="sticky top-24">
              <BookingCalendar 
                precio={espacio.precio}
                calificacion={espacio.calificacion || 4.9} // Mock
                resenas={espacio.resenas || 12} // Mock
                nombre={espacio.nombre}
                ciudad={espacio.direccion.split(',').slice(-2, -1)[0]?.trim() || ''}
                provincia={espacio.direccion.split(',').slice(-1)[0]?.trim() || ''}
                cargoLimpieza={espacio.cargoLimpieza || 0}
                config={{
                  unidadPrecio: (espacio.unidadPrecio as "DIA" | "HORA") || "DIA",
                  avisoMinimoHoras: espacio.avisoMinimo || 24,
                  anticipacionMaximaMeses: espacio.anticipacionMaxima || 3,
                  estadiaMinima: espacio.estadiaMinima || 1,
                  horaCheckIn: espacio.horaCheckIn || '14:00',
                  horaCheckOut: espacio.horaCheckOut || '10:00',
                  diasBloqueados: espacio.diasBloqueados || [],
                  permiteReservasInvitado: false // O mapear si existe en el backend
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}