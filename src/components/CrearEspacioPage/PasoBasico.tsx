import React, { useRef, useState, useEffect } from "react";
import SearchableSelect from "./CiudadSelector";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Iconos (los mismos del archivo original)
const IconQuincho = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
  </svg>
);

const IconSalon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 12.553z" />
  </svg>
);

const IconParque = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const IconCamping = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const IconCabana = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const IconLoft = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const IconOtro = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const ESPACIO_TYPES_CATEGORIZED = [
  { category: "Eventos", options: [
      { value: "Quincho", label: "Quincho", icon: <IconQuincho /> },
      { value: "Salón de Fiestas", label: "Salón de Fiestas", icon: <IconSalon /> },
  ]},
  { category: "Aire Libre", options: [
      { value: "Casaquinta / Parque", label: "Casaquinta / Parque", icon: <IconParque /> },
      { value: "Camping", label: "Camping", icon: <IconCamping /> },
  ]},
  { category: "Alojamiento", options: [
      { value: "Cabaña", label: "Cabaña", icon: <IconCabana /> },
      { value: "Loft", label: "Loft", icon: <IconLoft /> },
  ]},
  { category: "Otros", options: [
      { value: "Otro", label: "Otro", icon: <IconOtro /> }
  ]}
];

const getInputClasses = (hasError: boolean) => `w-full rounded-lg border ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'} bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm`;

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{children}</label>
);

const TypeSelectorCards = ({ selected, onChange }: { selected: string[], onChange: (value: string[]) => void }) => {
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleToggle = (value: string) => {
    if (safeSelected.includes(value)) {
      onChange(safeSelected.filter(item => item !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  };

  return (
    <div className="space-y-6">
      {ESPACIO_TYPES_CATEGORIZED.map((category, index) => (
        <div key={category.category} className={index > 0 ? "pt-6 border-t border-slate-200 dark:border-slate-700" : ""}>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {category.category}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {category.options.map((option) => {
              const isSelected = safeSelected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={`
                    relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 h-full w-full
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className={`mb-3 transition-colors duration-200 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {React.cloneElement(option.icon as React.ReactElement<{ className?: string }>, { className: "w-10 h-10 stroke-[1.5]" })}
                  </div>
                  <span className="text-sm font-bold text-center leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para manejar el mapa y la geocodificación
const LocationMarker = ({ direccion, ciudad, provincia, latitud, longitud, setLatitud, setLongitud }: any) => {
    const map = useMap();
    const [position, setPosition] = useState<L.LatLng | null>(null);

    // Efecto para actualizar la posición del marcador cuando cambian las coordenadas
    useEffect(() => {
        if (latitud && longitud) {
            const newPos = new L.LatLng(latitud, longitud);
            setPosition(newPos);
            map.setView(newPos, 15);
        }
    }, [latitud, longitud, map]);

    // Efecto para geocodificar la dirección cuando cambia
    useEffect(() => {
        if (direccion && ciudad && provincia) {
             const query = `${direccion}, ${ciudad}, ${provincia}, Argentina`;
             const timer = setTimeout(() => {
                 fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const { lat, lon } = data[0];
                            const newLat = parseFloat(lat);
                            const newLng = parseFloat(lon);
                            
                            if (newLat !== latitud || newLng !== longitud) {
                                setLatitud(newLat);
                                setLongitud(newLng);
                            }
                        }
                    })
                    .catch(err => console.error("Error geocoding:", err));
             }, 1000);
             return () => clearTimeout(timer);
        }
    }, [direccion, ciudad, provincia, setLatitud, setLongitud]);

    useMapEvents({
        click(e) {
            setLatitud(e.latlng.lat);
            setLongitud(e.latlng.lng);
        },
    });

    return position ? (
        <Marker 
            position={position} 
            draggable={true} 
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setLatitud(position.lat);
                    setLongitud(position.lng);
                }
            }} 
        />
    ) : null;
}

interface PasoBasicoProps {
  nombre: string;
  setNombre: (value: string) => void;
  tipos: string[];
  setTipos: (value: string[]) => void;
  descripcion: string;
  setDescripcion: (value: string) => void;
  provincia: string;
  setProvincia: (value: string) => void;
  ciudad: string;
  setCiudad: (value: string) => void;
  direccion: string;
  setDireccion: (value: string) => void;
  referencia: string;
  setReferencia: (value: string) => void;
  latitud: number | null;
  setLatitud: (value: number | null) => void;
  longitud: number | null;
  setLongitud: (value: number | null) => void;
  provinciasDisponibles: string[];
  ciudadesDisponibles: string[];
  cargandoCiudades: boolean;
  errorMensaje: string | null;
  errorField: string | null;
  setErrorField: (value: string | null) => void;
  setErrorMensaje: (value: string | null) => void;
  setIsFormDirty: (value: boolean) => void;
  onContinue: () => void;
  aiLoading: boolean;
  setAiLoading: (value: boolean) => void;
  showBoldHint: boolean;
  setShowBoldHint: (value: boolean) => void;
}

export default function PasoBasico({
  nombre,
  setNombre,
  tipos,
  setTipos,
  descripcion,
  setDescripcion,
  provincia,
  setProvincia,
  ciudad,
  setCiudad,
  direccion,
  setDireccion,
  referencia,
  setReferencia,
  latitud,
  setLatitud,
  longitud,
  setLongitud,
  provinciasDisponibles,
  ciudadesDisponibles,
  cargandoCiudades,
  errorMensaje,
  errorField,
  setErrorField,
  setErrorMensaje,
  setIsFormDirty,
  onContinue,
  aiLoading,
  setAiLoading,
  showBoldHint,
  setShowBoldHint
}: PasoBasicoProps) {
  const nombreRef = useRef<HTMLInputElement>(null);
  const tiposRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const provinciaRef = useRef<HTMLDivElement>(null);
  const ciudadRef = useRef<HTMLDivElement>(null);
  const direccionRef = useRef<HTMLInputElement>(null);
  const isNombreValid = nombre.trim().length >= 5;
  const [highlightProvincia, setHighlightProvincia] = useState(false);

  useEffect(() => {
    if (highlightProvincia) {
      const timer = setTimeout(() => setHighlightProvincia(false), 800);
      return () => clearTimeout(timer);
    }
  }, [highlightProvincia]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [descripcion]);

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const isProvinciaValida = provincia && provinciasDisponibles.some(p => normalizeText(p) === normalizeText(provincia));

  const generarConIA = async () => {
    if (!descripcion.trim()) return;
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8080/api/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ draftText: descripcion })
      });
      const data = await resp.json();
      if (data.generatedDescription) {
        setDescripcion(data.generatedDescription);
        setShowBoldHint(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const validarPaso1 = () => {
    setErrorField(null);
    if (nombre.trim().length === 0) {
      setErrorMensaje("Por favor, ingresá un título para tu anuncio.");
      setErrorField("nombre");
      nombreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nombreRef.current?.focus({ preventScroll: true });
      return false;
    }
    if (nombre.length < 5) {
      setErrorMensaje("El título es muy corto. Debe tener al menos 5 caracteres.");
      setErrorField("nombre");
      nombreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nombreRef.current?.focus({ preventScroll: true });
      return false;
    }
    if (tipos.length === 0) {
      setErrorMensaje("Debés seleccionar al menos un tipo de espacio.");
      setErrorField("tipos");
      tiposRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    if (descripcion.trim().length === 0) {
      setErrorMensaje("La descripción es obligatoria.");
      setErrorField("descripcion");
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textareaRef.current?.focus({ preventScroll: true });
      return false;
    }

    if (provincia.trim().length === 0) {
      setErrorMensaje("Por favor, seleccioná una provincia.");
      setErrorField("provincia");
      provinciaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      provinciaRef.current?.focus({ preventScroll: true });
      return false;
    }
    if (ciudad.trim().length === 0) {
      setErrorMensaje("Por favor, ingresá una ciudad.");
      setErrorField("ciudad");
      ciudadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    if (ciudadesDisponibles.length > 0 && !ciudadesDisponibles.some(c => normalizeText(c) === normalizeText(ciudad))) {
      setErrorMensaje(`La ciudad "${ciudad}" no es válida para la provincia de ${provincia}. Por favor, seleccioná una de la lista o corregí el nombre.`);
      setErrorField("ciudad");
      ciudadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (direccion.trim().length === 0) {
      setErrorMensaje("Por favor, completá la dirección y altura.");
      setErrorField("direccion");
      direccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      direccionRef.current?.focus({ preventScroll: true });
      return false;
    }

    setErrorMensaje(null);
    return true;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white">1. Contanos sobre tu espacio</h2>
      
      <div className="mb-4">
        <FormLabel>Título del anuncio</FormLabel>
        <div className="relative">
          <input 
            ref={nombreRef} 
            type="text" 
            maxLength={60} 
            placeholder="Ej: Quincho soleado con pileta en Maipú" 
            value={nombre} 
            onChange={(e) => {
              setNombre(e.target.value);
              setIsFormDirty(true);
              if (errorField === 'nombre') {
                setErrorField(null);
                setErrorMensaje(null);
              }
            }} 
            className={`${getInputClasses(errorField === 'nombre')} pr-10`} 
          />
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isNombreValid ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          {errorField === 'nombre' ? <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errorMensaje}</p> : <span></span>}
          <div className={`text-right text-xs font-medium transition-colors duration-300 ${nombre.length >= 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {nombre.length} / 60
          </div>
        </div>
      </div>
      
      <div ref={tiposRef} className="mb-4 rounded-xl scroll-mt-24">
        <div className="flex items-center gap-3">
          <FormLabel>¿Qué tipo de lugar es?</FormLabel>
          {errorField === 'tipos' && <p className="text-red-500 text-sm font-medium animate-in slide-in-from-left-1 mb-1">{errorMensaje}</p>}
        </div>
        <TypeSelectorCards 
          selected={tipos} 
          onChange={(val) => {
            setTipos(val);
            setIsFormDirty(true);
            if (errorField === 'tipos') {
              setErrorField(null);
              setErrorMensaje(null);
            }
          }} 
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-2"> {/* Más margen abajo */}
          <FormLabel>Descripción del espacio</FormLabel>
          <button
            type="button"
            onClick={generarConIA}
            disabled={aiLoading || !descripcion.trim()}
            className="text-xs flex items-center gap-1.5 text-purple-600 font-medium hover:text-purple-700 hover:underline transition-all"
          >
            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
            </svg>
            Mejorar con IA
          </button>
        </div>
        <textarea
            ref={textareaRef}
            rows={4}
            maxLength={1500}
            placeholder="Contanos qué hace especial a tu lugar..."
            value={descripcion} 
            onChange={(e) => {
              setIsFormDirty(true);
              setDescripcion(e.target.value);
              if (errorField === 'descripcion') {
                setErrorField(null);
                setErrorMensaje(null);
              }
            }}
            className={`${getInputClasses(errorField === 'descripcion')} resize-none placeholder-slate-500 dark:placeholder-slate-500 overflow-hidden min-h-[120px]`} /> {/* Sin el botón dentro */}
        {showBoldHint && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 animate-in fade-in slide-in-from-top-1">
            <span className="font-bold text-blue-600 dark:text-blue-400">Tip:</span> Las palabras entre **asteriscos** se verán en <strong>negrita</strong> en tu anuncio.
          </p>
        )}
        <div className="flex justify-between mt-1">
          {errorField === 'descripcion' ? <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errorMensaje}</p> : <span></span>}
          <div className={`text-right text-xs font-medium transition-colors ${descripcion.length > 1350 ? 'text-amber-500' : 'text-slate-400'}`}>
            {descripcion.length} / 1500
          </div>
        </div>
      </div>

      <div className="my-8 border-t border-slate-200 dark:border-slate-800" />

      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">2. ¿Dónde está ubicado?</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div ref={provinciaRef} className={`transition-all duration-300 rounded-lg ${highlightProvincia ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
            <SearchableSelect
              label="Provincia"
              placeholder="Buscá tu provincia..."
              options={provinciasDisponibles}
              value={provincia}
              onChange={(val) => {
                setIsFormDirty(true);
                setProvincia(val);
                setCiudad("");
                if (errorField === 'provincia') {
                  setErrorField(null);
                  setErrorMensaje(null);
                }
              }}
              maxLength={55}
            />
          </div>
          {provincia && !isProvinciaValida && (
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-1 font-medium animate-in fade-in">
              Seleccioná una provincia válida de la lista.
            </p>
          )}
          {errorField === 'provincia' && <p className="text-red-500 text-sm mt-1 font-medium animate-in slide-in-from-top-1">{errorMensaje}</p>}
        </div>

        <div ref={ciudadRef} onClickCapture={() => {
            if (!isProvinciaValida) {
              setHighlightProvincia(true);
              provinciaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}>
          <SearchableSelect
            label="Ciudad"
            placeholder={cargandoCiudades ? "Cargando..." : "Escribí o seleccioná tu ciudad"}
            options={ciudadesDisponibles}
            loading={cargandoCiudades}
            value={ciudad}
            onChange={(val) => {
              setIsFormDirty(true);
              setCiudad(val);
              if (errorField === 'ciudad') {
                setErrorField(null);
                setErrorMensaje(null);
              }
            }}
            disabled={!isProvinciaValida}
            maxLength={35}
          />
          {errorField === 'ciudad' && <p className="text-red-500 text-sm mt-1 font-medium animate-in slide-in-from-top-1">{errorMensaje}</p>}
        </div>
      </div>

      <div className="mb-4">
        <FormLabel>Dirección y altura</FormLabel>
        <input 
          ref={direccionRef} 
          maxLength={60}
          type="text"
          placeholder={ciudad ? "Ej: Av. San Martín 1234" : "Ingresá una ciudad primero"}
          value={direccion}
          onChange={(e) => {
            setIsFormDirty(true);
            setDireccion(e.target.value);
            if (errorField === 'direccion') {
              setErrorField(null);
              setErrorMensaje(null);
            }
          }}
          className={`${getInputClasses(errorField === 'direccion')} disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed`}
          disabled={!ciudad}
        />
        <div className="flex justify-between mt-1">
          {errorField === 'direccion' ? <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errorMensaje}</p> : <span></span>}
          <div className={`text-right text-xs font-medium transition-colors ${direccion.length > 50 ? 'text-amber-500' : 'text-slate-400'}`}>
            {direccion.length} / 60
          </div>
        </div>
      </div>

      <div className="mb-4">
        <FormLabel>Ubicación en el mapa</FormLabel>
        <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 z-0 relative">
             <MapContainer center={[-34.6037, -58.3816]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker 
                    direccion={direccion} 
                    ciudad={ciudad} 
                    provincia={provincia} 
                    latitud={latitud} 
                    longitud={longitud} 
                    setLatitud={setLatitud} 
                    setLongitud={setLongitud} 
                />
             </MapContainer>
        </div>
        <p className="text-xs text-slate-500 mt-1">Podés mover el marcador para ajustar la ubicación exacta.</p>
      </div>

      <div className="mb-4">
        <FormLabel>Referencia de llegada (Opcional)</FormLabel>
        <textarea 
          rows={3} 
          maxLength={250} 
          placeholder="Ej: A dos cuadras de la plaza principal, portón negro." 
          value={referencia}
          onChange={(e) => setReferencia(e.target.value.replace(/\n{3,}/g, "\n\n"))} 
          className={`${getInputClasses(false)} resize-none`} 
        />
        <div className="text-right text-xs font-medium text-slate-400 mt-1">
          {referencia.length} / 250
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => {
            if (validarPaso1()) {
              onContinue();
            }
          }} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Continuar a Precio →
        </button>
      </div>
    </div>
  );
}