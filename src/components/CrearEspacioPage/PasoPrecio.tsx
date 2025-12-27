import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  LuCloudUpload, LuDollarSign, 
  LuWifi, LuSnowflake, LuMusic, LuTv, LuUtensils, 
  LuTrash2, LuBan, LuVolume2, LuUsers, LuCigaretteOff 
} from "react-icons/lu";
import { TbGrill, TbPool, TbAirConditioning, TbParking } from "react-icons/tb";

// 1. Definición de la Interfaz Completa
interface PasoDetallesProps {
  capacidadMaxima: number | '';
  setCapacidadMaxima: (value: number | '') => void;
  precio: number | '';
  setPrecio: (value: number | '') => void;
  unidad: string;
  setUnidad: (value: string) => void;
  servicios: string[];
  setServicios: (value: string[]) => void;
  reglas: string[];
  setReglas: (value: string[]) => void;
  // Moved from Preferencias
  precioFinDeSemana: number | '';
  setPrecioFinDeSemana: (value: number | '') => void;
  cargoLimpieza: number | '';
  setCargoLimpieza: (value: number | '') => void;
  montoDeposito: number | '';
  setMontoDeposito: (value: number | '') => void;
  cobroDeposito: 'EFECTIVO' | 'PLATAFORMA';
  setCobroDeposito: (value: 'EFECTIVO' | 'PLATAFORMA') => void;
  uploadedFiles: File[];
  setUploadedFiles: (value: File[]) => void;
  errorMensaje: string | null;
  errorField: string | null;
  setErrorField: (value: string | null) => void;
  setErrorMensaje: (value: string | null) => void;
  setIsFormDirty: (value: boolean) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  loading: boolean;
  actionInProgress: 'draft' | 'publish' | null;
  esEdicion: boolean; // <--- AQUÍ ESTABA EL ERROR (FALTABA ESTA PROP)
}

const SERVICIOS_LIST = [
  { id: "wifi", label: "Wifi", icon: <LuWifi /> },
  { id: "parrilla", label: "Parrilla", icon: <TbGrill /> },
  { id: "pileta", label: "Pileta", icon: <TbPool /> },
  { id: "aire acondicionado", label: "Aire Acondicionado", icon: <TbAirConditioning /> },
  { id: "calefaccion", label: "Calefacción", icon: <LuSnowflake /> },
  { id: "estacionamiento", label: "Estacionamiento", icon: <TbParking /> },
  { id: "vajilla", label: "Vajilla", icon: <LuUtensils /> },
  { id: "equipo de musica", label: "Equipo de Música", icon: <LuMusic /> },
  { id: "tv", label: "Smart TV", icon: <LuTv /> },
];

const REGLAS_LIST = [
  { id: "no fumar adentro", label: "No fumar adentro", icon: <LuCigaretteOff /> },
  { id: "no se permiten mascotas", label: "No mascotas", icon: <LuBan /> },
  { id: "musica moderada", label: "Música moderada", icon: <LuVolume2 /> },
  { id: "capacidad maxima", label: "Respeta capacidad", icon: <LuUsers /> },
  { id: "basura", label: "Llevarse la basura", icon: <LuTrash2 /> },
];

const PasoPrecio = ({
  capacidadMaxima,
  setCapacidadMaxima,
  precio,
  setPrecio,
  unidad,
  setUnidad,
  servicios,
  setServicios,
  reglas,
  setReglas,
  precioFinDeSemana, setPrecioFinDeSemana,
  cargoLimpieza, setCargoLimpieza,
  montoDeposito, setMontoDeposito,
  cobroDeposito, setCobroDeposito,
  uploadedFiles,
  setUploadedFiles,
  errorField,
  setErrorField,
  setIsFormDirty,
  onBack,
  onSaveDraft,
  onContinue,
  loading,
  actionInProgress
}: PasoDetallesProps) => {

  // --- Lógica de Imágenes ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    setIsFormDirty(true);
    if (errorField === "imagenes") setErrorField(null);
  }, [uploadedFiles, setUploadedFiles, setIsFormDirty, errorField, setErrorField]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 15,
  });

  const removeImage = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setIsFormDirty(true);
  };

  // --- Lógica de Selección Multiple ---
  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setIsFormDirty(true);
  };

  // --- Validaciones simples antes de continuar ---
  const handleContinue = () => {
    if (!capacidadMaxima) { setErrorField("capacidad"); return; }
    if (!precio) { setErrorField("precio"); return; }
    if (uploadedFiles.length === 0) { setErrorField("imagenes"); return; }
    
    setErrorField(null);
    onContinue();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Capacidad y Precio Base */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detalles Básicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacidad Máxima (Personas)</label>
            <input
              type="number"
              value={capacidadMaxima}
              onChange={(e) => {
                setCapacidadMaxima(Number(e.target.value));
                setIsFormDirty(true);
                if (errorField === "capacidad") setErrorField(null);
              }} 
              className={`w-full p-3 bg-white dark:bg-slate-800 border ${errorField === 'capacidad' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              placeholder="Ej: 50"
            />
            {errorField === 'capacidad' && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Base</label>
            <div className="flex">
              <div className="relative flex-1">
                <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => {
                    setPrecio(Number(e.target.value));
                    setIsFormDirty(true);
                    if (errorField === "precio") setErrorField(null);
                  }}
                  className={`w-full pl-10 p-3 bg-white dark:bg-slate-800 border ${errorField === 'precio' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-l-xl focus:ring-2 focus:ring-blue-500 outline-none`}
                  placeholder="0.00"
                />
              </div>
              <select 
                value={unidad} 
                onChange={(e) => {
                  setUnidad(e.target.value);
                  setIsFormDirty(true);
                }}
                className="bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl px-4 text-sm text-slate-700 dark:text-slate-300 font-medium outline-none"
              >
                <option value="DIA">/ día</option>
                <option value="HORA">/ hora</option>
              </select>
            </div>
            {errorField === 'precio' && <p className="text-red-500 text-xs mt-1">Ingresá un precio válido</p>}
          </div>
        </div>
      </section>

      {/* 2. Precios y Cargos Extra (NUEVO) */}
      <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          Precios y Cargos Extra
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded uppercase">Opcional</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Fin de Semana</label>
            <div className="relative">
               <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                 type="number"
                 value={precioFinDeSemana}
                 onChange={(e) => { setPrecioFinDeSemana(Number(e.target.value)); setIsFormDirty(true); }}
                 className="w-full pl-10 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                 placeholder="Opcional"
               />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Si es diferente al precio base (Sáb/Dom/Feriados).</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo Fijo de Limpieza</label>
            <div className="relative">
               <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                 type="number"
                 value={cargoLimpieza}
                 onChange={(e) => { setCargoLimpieza(Number(e.target.value)); setIsFormDirty(true); }}
                 className="w-full pl-10 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                 placeholder="Opcional"
               />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Se cobra una sola vez por reserva.</p>
          </div>
          
          <div className="md:col-span-2 mt-2">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Depósito de Seguridad (Fianza)</label>
             <div className="flex gap-4">
               <div className="relative flex-1">
                  <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={montoDeposito}
                    onChange={(e) => { setMontoDeposito(Number(e.target.value)); setIsFormDirty(true); }}
                    className="w-full pl-10 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="0"
                  />
               </div>
               <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                  <button 
                    type="button"
                    onClick={() => setCobroDeposito('EFECTIVO')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${cobroDeposito === 'EFECTIVO' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Manual
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCobroDeposito('PLATAFORMA')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${cobroDeposito === 'PLATAFORMA' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Plataforma
                  </button>
               </div>
             </div>
             <p className="text-[10px] text-slate-400 mt-1">
                {cobroDeposito === 'EFECTIVO' ? "Lo cobrás en efectivo al ingresar y lo devolvés al salir." : "Lugary retiene el monto en la tarjeta del cliente."}
             </p>
          </div>
        </div>
      </section>

      {/* 3. Servicios y Comodidades */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Servicios y Comodidades</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SERVICIOS_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(servicios, setServicios, item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                servicios.includes(item.id)
                  ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <span className="text-xs font-medium text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Reglas del Lugar */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Reglas del Lugar</h3>
        <div className="flex flex-wrap gap-2">
          {REGLAS_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(reglas, setReglas, item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                reglas.includes(item.id)
                  ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-900"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </section>
      
      {/* 5. Galería de Fotos */}
      <section>
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Galería de Fotos</h3>
          <span className="text-xs text-slate-500">{uploadedFiles.length} / 15</span>
        </div>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
              : errorField === 'imagenes' 
                ? "border-red-300 bg-red-50"
                : "border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
              <LuCloudUpload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Hacé clic o arrastrá tus fotos aquí
              </p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP até 10MB</p>
            </div>
          </div>
        </div>
        
        {errorField === 'imagenes' && (
          <p className="text-red-500 text-xs mt-2 font-medium">Debés subir al menos una foto para continuar.</p>
        )}

        {/* Grid de previsualización */}
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {uploadedFiles.map((file, index) => {
              // Lógica para mostrar preview tanto de archivos nuevos como existentes
              let previewUrl = "";
              if ((file as any).isExisting) {
                previewUrl = (file as any).existingUrl;
              } else {
                try { previewUrl = URL.createObjectURL(file); } catch(e) {}
              }

              return (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {index === 0 && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded">Portada</span>}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Botones de Acción */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Atrás
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onSaveDraft} 
            disabled={loading && actionInProgress === 'draft'}
            className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {actionInProgress === 'draft' ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            Continuar a Preferencias →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasoPrecio;