import { useState, useEffect, useRef } from "react";

interface Props {
  options: string[];
  loading?: boolean;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  maxLength?: number;
}

export default function SearchableSelect({ options, loading = false, value, onChange, disabled, label, placeholder, maxLength }: Props) {
  const [sugerencias, setSugerencias] = useState<string[]>([]); // Filtro tiempo real
  const [mostrarLista, setMostrarLista] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // [NUEVO] Función para normalizar texto (ignora acentos y mayúsculas)
  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // 2. Filtrado en memoria RAM (Instantáneo)
  const manejarInput = (texto: string) => {
    onChange(texto); // Actualizamos el estado padre
    
    const textoNormalizado = normalizeText(texto);
    const filtro = options.filter(c =>
      normalizeText(c).includes(textoNormalizado)
    ).slice(0, 100); // Aumentamos el límite para mostrar más opciones
    setSugerencias(filtro);
    setMostrarLista(true);
  };

  const seleccionarSugerencia = (ciudad: string) => {
    onChange(ciudad);
    setMostrarLista(false);
  };

  // Cerrar lista si clickean afuera
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarLista(false);
        
        // [SEGURIDAD] Validar que el valor escrito coincida con una opción válida
        if (value) {
          const match = options.find(opt => normalizeText(opt) === normalizeText(value));
          if (match) {
            if (match !== value) onChange(match); // Corregir mayúsculas/minúsculas
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value, options, onChange]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || (disabled ? "Seleccioná una opción" : (loading ? "Cargando..." : "Escribí o seleccioná"))}
          value={value}
          onChange={(e) => manejarInput(e.target.value)}
          disabled={disabled || loading}
          onFocus={() => manejarInput(value)}
          maxLength={maxLength}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
        />
        {/* Lupa Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
        </div>
        {/* Botón de limpiar */}
        {value && !disabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => manejarInput("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none transition-colors"
              title="Limpiar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Lista Desplegable (Autocomplete) */}
      {mostrarLista && sugerencias.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          {sugerencias.map((opcion) => (
            <li
              key={opcion}
              onClick={() => seleccionarSugerencia(opcion)}
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 transition-colors"
            >
              {opcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}