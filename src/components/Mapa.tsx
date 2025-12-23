import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix para iconos de Leaflet en React (a veces fallan por defecto)
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para recentrar el mapa cuando cambian las coordenadas
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

interface MapaProps {
  direccion: string; // Recibimos el texto, ej: "Maipú, Mendoza"
}

const Mapa = ({ direccion }: MapaProps) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCoordenadas = async () => {
      try {
        setLoading(true);
        // Usamos Nominatim (Servicio gratuito de OpenStreetMap)
        // IMPORTANTE: Para producción, agrega tu email en el header User-Agent como piden sus normas
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          // Fallback a Mendoza centro si no encuentra
          setCoords({ lat: -32.8895, lng: -68.8458 });
        }
      } catch (error) {
        console.error("Error geocodificando:", error);
        setCoords({ lat: -32.8895, lng: -68.8458 }); // Fallback
      } finally {
        setLoading(false);
      }
    };

    if (direccion) {
      obtenerCoordenadas();
    }
  }, [direccion]);

  if (loading || !coords) {
    return (
      <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-slate-400 text-sm">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative z-0">
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={14}
        scrollWheelZoom={false} // Para que no haga zoom al scrollear la página
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Círculo de "Ubicación Aproximada". 
           radius={400} son metros. Suficiente para dar idea sin revelar la casa exacta.
           Esto da mucha confianza y seguridad.
        */}
        <Circle 
          center={[coords.lat, coords.lng]}
          pathOptions={{ 
            fillColor: '#ec4899', // Color rose-500 (similar a tu diseño)
            fillOpacity: 0.2, 
            color: '#ec4899', 
            weight: 2 
          }}
          radius={400} 
        />
        
        <RecenterMap lat={coords.lat} lng={coords.lng} />
      </MapContainer>
      
      {/* Etiqueta flotante estilo Airbnb */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-lg text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
        Ubicación aproximada
      </div>
    </div>
  );
};

export default Mapa;