import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import imageCompression from 'browser-image-compression';
import axios from "axios";
import UnsavedChangesModal from "../components/UnsavedChangesModal";
import { useScrollLock } from "../hooks/useScrollLock";

// Importar los nuevos componentes
import PasoBasico from "../components/espacios/steps/PasoBasico";
import PasoDetalles from "../components/espacios/steps/PasoPrecio";
import PasoPreferencias from "../components/espacios/steps/PasoPreferencias";
import VistaPrevia from "../components/espacios/steps/VistaPrevia";

// Barra de Progreso
const ProgressBar = ({ step, highestStep, onStepClick }: { step: 1 | 2 | 3, highestStep: 1 | 2 | 3, onStepClick: (step: 1 | 2 | 3) => void }) => (
  <div className="flex items-center mb-8">
    {[1, 2, 3].map((num, index) => {
      const isReachable = num <= highestStep;
      return (
        <div key={num} className="flex items-center flex-1 last:flex-none">
          <button
            type="button"
            onClick={() => isReachable && onStepClick(num as 1 | 2 | 3)}
            disabled={!isReachable}
            className={`flex items-center rounded-full ${isReachable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 -m-2' : 'cursor-default p-2 -m-2'} transition-colors`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm z-10
              ${step >= num ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
              transition-colors duration-300`}
            >
              {num}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= num ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
              {num === 1 ? 'Básico' : num === 2 ? 'Detalles y Fotos' : 'Políticas y Reglas'}
            </span>
          </button>
          {index < 2 && (
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step > num ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          )}
        </div>
      );
    })}
  </div>
);

interface CrearEspacioPayload {
  nombre: string;
  descripcion: string;
  direccion: string;
  tipo: string;
  capacidadMaxima: number;
  precio: number;
  unidadPrecio: string;
  servicios: string[];
  reglas: string[];
  propietarioId: number;
  focalPoint?: { x: number; y: number };
  imageOrder?: string[];
  estado: 'PUBLICADO' | 'BORRADOR';
  // Nuevos campos de preferencias
  tipoReserva: string;
  requireTelefonoVerificado: boolean;
  requireIdentidadVerificada: boolean;
  mostrarDireccionExacta: string;
  avisoMinimo: number;
  anticipacionMaxima: number;
  permiteEstadiaNocturna: boolean;
  politicaCancelacion: string;
  tiempoPreparacion: number;
  horaCheckIn: string;
  horaCheckOut: string;
  montoDeposito: number;
  precioFinDeSemana: number;
  cargoLimpieza: number;
  estadiaMinima: number;
  diasBloqueados: string[];
  cobroDeposito: string;
  latitud?: number;
  longitud?: number;
}

export default function CrearEspacioPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [highestStep, setHighestStep] = useState<1 | 2 | 3>(1);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [tipos, setTipos] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState("");
  
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [referencia, setReferencia] = useState("");
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);

  const [capacidadMaxima, setCapacidadMaxima] = useState<number | ''>('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [unidad, setUnidad] = useState("DIA");
  const [servicios, setServicios] = useState<string[]>([]);
  const [reglas, setReglas] = useState<string[]>([]);

  // Estados de Preferencias (Paso 3)
  const [tipoReserva, setTipoReserva] = useState<'INSTANTANEA' | 'MANUAL'>('MANUAL');
  const [requireTelefonoVerificado, setRequireTelefonoVerificado] = useState(false);
  const [requireIdentidadVerificada, setRequireIdentidadVerificada] = useState(false);
  const [mostrarDireccionExacta, setMostrarDireccionExacta] = useState<'DESPUES_DE_CONFIRMAR' | 'APROXIMADA'>('APROXIMADA');
  const [avisoMinimo, setAvisoMinimo] = useState(24);
  const [anticipacionMaxima, setAnticipacionMaxima] = useState(3);
  const [permiteEstadiaNocturna, setPermiteEstadiaNocturna] = useState(false);
  const [politicaCancelacion, setPoliticaCancelacion] = useState<'FLEXIBLE' | 'MODERADA' | 'ESTRICTA'>('FLEXIBLE');
  const [tiempoPreparacion, setTiempoPreparacion] = useState(0);
  const [horaCheckIn, setHoraCheckIn] = useState('14:00');
  const [horaCheckOut, setHoraCheckOut] = useState('10:00');
  const [montoDeposito, setMontoDeposito] = useState<number | ''>('');
  const [precioFinDeSemana, setPrecioFinDeSemana] = useState<number | ''>('');
  const [cargoLimpieza, setCargoLimpieza] = useState<number | ''>('');
  const [estadiaMinima, setEstadiaMinima] = useState(1);
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);
  const [cobroDeposito, setCobroDeposito] = useState<'EFECTIVO' | 'PLATAFORMA'>('EFECTIVO');

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<'draft' | 'publish' | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [showBoldHint, setShowBoldHint] = useState(false);

  const propietarioId = Number(localStorage.getItem("userId")) || 1;

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [provinciasDisponibles, setProvinciasDisponibles] = useState<string[]>([]);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);

  useScrollLock(loading || aiLoading || showSuccessModal);

  // Efecto de carga inicial de provincias
  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        const res = await api.get<string[]>("/geo/provincias");
        
        const provinciasNormalizadas = res.data.map(p => 
          p === "Tierra del Fuego, Antártida e Islas del Atlántico Sur" ? "Tierra del Fuego" : p
        );

        const prioritarias = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza"];
        
        const provinciasOrdenadas = [...provinciasNormalizadas].sort((a, b) => {
          const indexA = prioritarias.indexOf(a);
          const indexB = prioritarias.indexOf(b);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });

        setProvinciasDisponibles(provinciasOrdenadas);
      } catch (error) {
        console.warn("API geo/provincias no disponible, usando lista estática.");
        setProvinciasDisponibles(["Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"]);
      }
    };
    cargarProvincias();
  }, []);

  // Efecto para cargar ciudades cuando cambia la provincia
  useEffect(() => {
    if (!provincia) {
      setCiudadesDisponibles([]);
      return;
    }

    if (!provinciasDisponibles.includes(provincia)) {
      setCiudadesDisponibles([]);
      return;
    }

    const cargarCiudades = async () => {
      setCargandoCiudades(true);
      setErrorMensaje(null);
      try {
        const provinciaApi = provincia === "Tierra del Fuego" 
          ? "Tierra del Fuego, Antártida e Islas del Atlántico Sur" 
          : provincia;

        const resp = await api.get<string[]>(`/geo/provincias/${encodeURIComponent(provinciaApi)}/ciudades`);
        setCiudadesDisponibles(resp.data);
      } catch (error) {
        console.error("Error cargando ciudades para la provincia", error);
        setCiudadesDisponibles([]);
        setErrorMensaje("No se pudieron cargar las ciudades para esta provincia. Reintentá o contactá a soporte.");
      } finally {
        setCargandoCiudades(false);
      }
    };

    void cargarCiudades();
  }, [provincia, provinciasDisponibles]);

  // Efecto para CARGAR DATOS EN MODO EDICIÓN
  useEffect(() => {
    if (esEdicion && id) {
      const cargarDatosEdicion = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/espacios/${id}`);
          
          setNombre(data.nombre);
          setDescripcion(data.descripcion);
          setCapacidadMaxima(data.capacidadMaxima);
          setPrecio(data.precio);
          setUnidad(data.unidadPrecio || "HORA");
          
          const tiposFromData = data.tipo || [];
          const tiposArray = Array.isArray(tiposFromData) ? tiposFromData : (typeof tiposFromData === 'string' ? tiposFromData.split(',').map((t: string) => t.trim()) : []);
          setTipos(tiposArray);
          
          const serviciosFromData = data.servicios || [];
          const serviciosArray = Array.isArray(serviciosFromData) ? serviciosFromData : (typeof serviciosFromData === 'string' ? serviciosFromData.split(',').map((s: string) => s.trim()) : []);
          setServicios(serviciosArray);

          const reglasFromData = data.reglas || [];
          const reglasArray = Array.isArray(reglasFromData) ? reglasFromData : (typeof reglasFromData === 'string' ? reglasFromData.split(',').map((r: string) => r.trim()) : []);
          setReglas(reglasArray);

          // Cargar preferencias
          setTipoReserva(data.tipoReserva || 'MANUAL');
          setRequireTelefonoVerificado(data.requireTelefonoVerificado || false);
          setRequireIdentidadVerificada(data.requireIdentidadVerificada || false);
          setMostrarDireccionExacta(data.mostrarDireccionExacta || 'APROXIMADA');
          setAvisoMinimo(data.avisoMinimo || 24);
          setAnticipacionMaxima(data.anticipacionMaxima || 3);
          setPermiteEstadiaNocturna(data.permiteEstadiaNocturna || false);
          setPoliticaCancelacion(data.politicaCancelacion || 'FLEXIBLE');
          setTiempoPreparacion(data.tiempoPreparacion || 0);
          setHoraCheckIn(data.horaCheckIn || '14:00');
          setHoraCheckOut(data.horaCheckOut || '10:00');
          setMontoDeposito(data.montoDeposito || '');
          setPrecioFinDeSemana(data.precioFinDeSemana || '');
          setCargoLimpieza(data.cargoLimpieza || '');
          setEstadiaMinima(data.estadiaMinima || 1);
          setDiasBloqueados(data.diasBloqueados || []);
          setCobroDeposito(data.cobroDeposito || 'EFECTIVO');
          setLatitud(data.latitud || null);
          setLongitud(data.longitud || null);

          if (data.direccion) {
             const parts = data.direccion.split(',').map((s: string) => s.trim());
             if (parts.length >= 3) {
               setProvincia(parts[parts.length - 1]);
               setCiudad(parts[parts.length - 2]);
               setDireccion(parts.slice(0, parts.length - 2).join(', '));
             } else {
               setDireccion(data.direccion);
             }
          }
          
          if (data.imagenes && data.imagenes.length > 0) {
            const imageFilesPromises = data.imagenes.map(async (url: string, index: number) => {
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], `imagen_existente_${index}.jpg`, { type: blob.type });
                (file as any).isExisting = true;
                (file as any).existingUrl = url;
                if (index === 0 && data.focalPoint) {
                  (file as any).focalPoint = data.focalPoint;
                }
                return file;
              } catch (error) {
                console.error(`Error al cargar la imagen existente ${url}:`, error);
                return null;
              }
            });

            const imageFiles = (await Promise.all(imageFilesPromises)).filter(f => f !== null) as File[];
            setUploadedFiles(imageFiles);
          }
        } catch (error) {
          console.error("Error cargando datos para edición", error);
          setErrorMensaje("No se pudo cargar la información del espacio.");
        } finally {
          setLoading(false);
        }
      };
      cargarDatosEdicion();
    }
  }, [id, esEdicion]);

  // FUNCIÓN MAESTRA DE GUARDADO
  const handleSave = async (isDraft: boolean): Promise<boolean> => {
    if (!propietarioId || !localStorage.getItem("token")) {
      setErrorMensaje("Error de sesión. Por favor, volvé a iniciar sesión.");
      return false;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMensaje("Tu sesión ha expirado. Por favor, volvé a iniciar sesión.");
      return false;
    }

    if (isDraft) {
      if (nombre.trim().length === 0) {
        setErrorMensaje("Para guardar un borrador, al menos ingresá un título.");
        setStep(1);
        setTimeout(() => {
          setErrorField("nombre");
        }, 100);
        return false;
      }
    }

    setActionInProgress(isDraft ? 'draft' : 'publish');
    setLoading(true); 
    setErrorMensaje(null); 
    setExitoMensaje(null);

    try {
      const direccionCompleta = `${direccion.trim()}, ${ciudad.trim()}, ${provincia.trim()}`;

      const imageOrder = uploadedFiles.map(file =>
        (file as any).isExisting ? (file as any).existingUrl : file.name
      );

      const espacioData: CrearEspacioPayload = {
        nombre,
        descripcion: descripcion.trim(),
        direccion: direccionCompleta,
        tipo: tipos.join(', '),
        capacidadMaxima: capacidadMaxima === '' ? 0 : Number(capacidadMaxima),
        precio: precio === '' ? 0 : Number(precio),
        unidadPrecio: unidad,
        servicios,
        reglas,
        propietarioId: propietarioId,
        focalPoint: (uploadedFiles[0] as any)?.focalPoint || { x: 50, y: 50 },
        imageOrder: imageOrder,
        estado: isDraft ? 'BORRADOR' : 'PUBLICADO',
        // Nuevos campos
        tipoReserva,
        requireTelefonoVerificado,
        requireIdentidadVerificada,
        mostrarDireccionExacta,
        avisoMinimo,
        anticipacionMaxima,
        permiteEstadiaNocturna,
        politicaCancelacion,
        tiempoPreparacion,
        horaCheckIn,
        horaCheckOut,
        montoDeposito: montoDeposito === '' ? 0 : Number(montoDeposito),
        precioFinDeSemana: precioFinDeSemana === '' ? 0 : Number(precioFinDeSemana),
        cargoLimpieza: cargoLimpieza === '' ? 0 : Number(cargoLimpieza),
        estadiaMinima,
        diasBloqueados,
        cobroDeposito,
        latitud: latitud || 0,
        longitud: longitud || 0
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(espacioData)], {
        type: 'application/json; charset=utf-8'
      });
      formData.append('espacio', jsonBlob);

      if (uploadedFiles.length > 0) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp"
        };

        const newFiles = uploadedFiles.filter(f => !(f as any).isExisting);

        const compressedFilesPromise = newFiles.map(async (file) => {
          try {
            const compressedBlob = await imageCompression(file, options);
            return new File([compressedBlob], file.name, { type: compressedBlob.type });
          } catch (err) {
            console.error("Error comprimiendo imagen", err);
            return file;
          }
        });

        const compressedFiles = await Promise.all(compressedFilesPromise);

        const portadaOriginal = uploadedFiles[0];
        if (!(portadaOriginal as any).isExisting) {
          const compressedPortada = compressedFiles.find(f => f.name === portadaOriginal.name);
          if (compressedPortada) {
            formData.append('imagen', compressedPortada);
          }
        }

        compressedFiles.forEach(file => {
          formData.append('imagenes', file);
        });
      }

      const headers = {
        "Content-Type": undefined,
        Authorization: `Bearer ${token}`
      };

      if (esEdicion) {
        await api.put(`/espacios/${id}`, formData, { headers });
      } else {
        await api.post("/espacios", formData, { headers });
      }

      setIsFormDirty(false);
      if (!isDraft) {
        setShowSuccessModal(true);
      } else {
        setExitoMensaje("Borrador guardado con éxito.");
        setTimeout(() => setExitoMensaje(null), 3000);
      }
      return true;

    } catch (error: any) {
      console.error("Error al guardar:", error);
      if (axios.isAxiosError(error)) {
        const mensajeBackend = (error.response?.data as { message?: string })?.message;
        const defaultMessage = "No se pudo guardar. Verificá los datos e intentá de nuevo.";
        setErrorMensaje(mensajeBackend || defaultMessage);
      } else {
        setErrorMensaje("Se ha producido un error inesperado.");
      }
      return false;
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  const handleSaveAndExit = async () => {
    const success = await handleSave(true);
    if (success) {
      navigate('/mis-espacios');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">

      <UnsavedChangesModal isDirty={isFormDirty} onSaveDraft={() => handleSave(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{esEdicion ? "Editá tu espacio" : "Publicá tu espacio"}</h1>
            <p className="text-slate-600 dark:text-slate-400">{esEdicion ? "Modificá los detalles de tu anuncio." : "¡Completá los pasos y empezá a recibir reservas!"}</p>
          </div>
          <button onClick={handleSaveAndExit} disabled={loading} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50">
            Guardar y Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: ASISTENTE */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm transition-colors duration-300">
            <ProgressBar step={step} highestStep={highestStep} onStepClick={(clickedStep) => setStep(clickedStep)} />

            {/* Mensajes de Error/Éxito */}
            {errorMensaje && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errorMensaje}
              </div>
            )}
            {exitoMensaje && !showSuccessModal && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-r-lg flex items-center animate-in fade-in slide-in-from-top-2">
                 <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {exitoMensaje}
              </div>
            )}
            
            {/* CONTENIDO DE LOS PASOS */}
            {step === 1 && (
              <PasoBasico
                nombre={nombre}
                setNombre={setNombre}
                tipos={tipos}
                setTipos={setTipos}
                descripcion={descripcion}
                setDescripcion={setDescripcion}
                provincia={provincia}
                setProvincia={setProvincia}
                ciudad={ciudad}
                setCiudad={setCiudad}
                direccion={direccion}
                setDireccion={setDireccion}
                referencia={referencia}
                setReferencia={setReferencia}
                latitud={latitud}
                setLatitud={setLatitud}
                longitud={longitud}
                setLongitud={setLongitud}
                provinciasDisponibles={provinciasDisponibles}
                ciudadesDisponibles={ciudadesDisponibles}
                cargandoCiudades={cargandoCiudades}
                errorMensaje={errorMensaje}
                errorField={errorField}
                setErrorField={setErrorField}
                setErrorMensaje={setErrorMensaje}
                setIsFormDirty={setIsFormDirty}
                onContinue={() => {
                  setStep(2);
                  setHighestStep(prev => Math.max(prev, 2) as 1 | 2 | 3);
                }}
                aiLoading={aiLoading}
                setAiLoading={setAiLoading}
                showBoldHint={showBoldHint}
                setShowBoldHint={setShowBoldHint}
              />
            )}

            {step === 2 && (
              <PasoDetalles
                capacidadMaxima={capacidadMaxima}
                setCapacidadMaxima={setCapacidadMaxima}
                precio={precio}
                setPrecio={setPrecio}
                unidad={unidad}
                setUnidad={setUnidad}
                servicios={servicios}
                setServicios={setServicios}
                reglas={reglas}
                setReglas={setReglas}
                precioFinDeSemana={precioFinDeSemana} setPrecioFinDeSemana={setPrecioFinDeSemana}
                cargoLimpieza={cargoLimpieza} setCargoLimpieza={setCargoLimpieza}
                montoDeposito={montoDeposito} setMontoDeposito={setMontoDeposito}
                cobroDeposito={cobroDeposito} setCobroDeposito={setCobroDeposito}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                errorMensaje={errorMensaje}
                errorField={errorField}
                setErrorField={setErrorField}
                setErrorMensaje={setErrorMensaje}
                setIsFormDirty={setIsFormDirty}
                onBack={() => setStep(1)}
                onContinue={() => {
                  setStep(3);
                  setHighestStep(prev => Math.max(prev, 3) as 1 | 2 | 3);
                }}
                onSaveDraft={() => handleSave(true)} // Guardar borrador desde paso 2
                loading={loading}
                actionInProgress={actionInProgress}
                esEdicion={esEdicion}
              />
            )}

            {step === 3 && (
              <PasoPreferencias
                tipoReserva={tipoReserva} setTipoReserva={setTipoReserva}
                requireTelefonoVerificado={requireTelefonoVerificado} setRequireTelefonoVerificado={setRequireTelefonoVerificado}
                requireIdentidadVerificada={requireIdentidadVerificada} setRequireIdentidadVerificada={setRequireIdentidadVerificada}
                mostrarDireccionExacta={mostrarDireccionExacta} setMostrarDireccionExacta={setMostrarDireccionExacta}
                avisoMinimo={avisoMinimo} setAvisoMinimo={setAvisoMinimo}
                anticipacionMaxima={anticipacionMaxima} setAnticipacionMaxima={setAnticipacionMaxima}
                permiteEstadiaNocturna={permiteEstadiaNocturna} setPermiteEstadiaNocturna={setPermiteEstadiaNocturna}
                politicaCancelacion={politicaCancelacion} setPoliticaCancelacion={setPoliticaCancelacion}
                tiempoPreparacion={tiempoPreparacion} setTiempoPreparacion={setTiempoPreparacion}
                horaCheckIn={horaCheckIn} setHoraCheckIn={setHoraCheckIn}
                horaCheckOut={horaCheckOut} setHoraCheckOut={setHoraCheckOut}
                estadiaMinima={estadiaMinima} setEstadiaMinima={setEstadiaMinima}
                diasBloqueados={diasBloqueados} setDiasBloqueados={setDiasBloqueados}
                setIsFormDirty={setIsFormDirty}
                onBack={() => setStep(2)}
                onSaveDraft={() => handleSave(true)}
                onPublish={() => handleSave(false)}
                loading={loading}
                actionInProgress={actionInProgress}
                esEdicion={esEdicion}
              />
            )}
        </section>

          {/* COLUMNA DERECHA: VISTA PREVIA */}
          <VistaPrevia
            nombre={nombre}
            tipos={tipos}
            descripcion={descripcion}
            ciudad={ciudad}
            provincia={provincia}
            capacidadMaxima={capacidadMaxima}
            precio={precio}
            unidad={unidad}
            uploadedFiles={uploadedFiles}
          />
        </div>
      </main>

      {/* OVERLAY DE CARGA IA */}
      {aiLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-900/30 animate-in zoom-in-95">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-lg">✨</div>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 animate-pulse">
              Mejorando tu descripción...
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY DE CARGA AL PUBLICAR */}
      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-300 animate-in fade-in">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/90 font-semibold mt-4 text-lg">
            {esEdicion ? "Guardando cambios..." : "Publicando tu espacio..."}
          </p>
          <p className="text-white/60 text-sm mt-1">
            Esto puede tardar unos segundos.
          </p>
        </div>
      )}

      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 dark:border-slate-800 transform transition-all scale-100 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-600 dark:text-emerald-400">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {esEdicion ? "¡Cambios guardados!" : "¡Espacio publicado!"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {esEdicion 
                ? "La información de tu espacio ha sido actualizada correctamente." 
                : "Tu espacio ya está visible para que los usuarios puedan reservarlo."}
            </p>
            <button
              onClick={() => navigate("/mis-espacios")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ir a Mis Espacios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}