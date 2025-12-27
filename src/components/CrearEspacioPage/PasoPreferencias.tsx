import React from 'react';
import { LuCircleCheck } from "react-icons/lu";

interface PasoPreferenciasProps {
  tipoReserva: 'INSTANTANEA' | 'MANUAL';
  setTipoReserva: (v: 'INSTANTANEA' | 'MANUAL') => void;
  acceptUnverifiedUsers: boolean;
  setAcceptUnverifiedUsers: (v: boolean) => void;
  mostrarDireccionExacta: 'DESPUES_DE_CONFIRMAR' | 'APROXIMADA';
  setMostrarDireccionExacta: (v: 'DESPUES_DE_CONFIRMAR' | 'APROXIMADA') => void;
  avisoMinimo: number;
  setAvisoMinimo: (v: number) => void;
  anticipacionMaxima: number;
  setAnticipacionMaxima: (v: number) => void;
  permiteEstadiaNocturna: boolean;
  setPermiteEstadiaNocturna: (v: boolean) => void;
  politicaCancelacion: 'FLEXIBLE' | 'MODERADA' | 'ESTRICTA';
  setPoliticaCancelacion: (v: 'FLEXIBLE' | 'MODERADA' | 'ESTRICTA') => void;
  tiempoPreparacion: number;
  setTiempoPreparacion: (v: number) => void;
  horaCheckIn: string;
  setHoraCheckIn: (v: string) => void;
  horaCheckOut: string;
  setHoraCheckOut: (v: string) => void;
  estadiaMinima: number;
  setEstadiaMinima: (v: number) => void;
  diasBloqueados: string[];
  setDiasBloqueados: (v: string[]) => void;
  
  // Control del formulario
  setIsFormDirty: (v: boolean) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  loading: boolean;
  actionInProgress: 'draft' | 'publish' | null;
  esEdicion: boolean;
}

const PasoPreferencias = ({
    tipoReserva, setTipoReserva,
    acceptUnverifiedUsers, setAcceptUnverifiedUsers,
    mostrarDireccionExacta, setMostrarDireccionExacta,
    avisoMinimo, setAvisoMinimo,
    anticipacionMaxima, setAnticipacionMaxima,
    permiteEstadiaNocturna, setPermiteEstadiaNocturna,
    politicaCancelacion, setPoliticaCancelacion,
    tiempoPreparacion, setTiempoPreparacion,
    horaCheckIn, setHoraCheckIn,
    horaCheckOut, setHoraCheckOut,
    estadiaMinima, setEstadiaMinima,
    diasBloqueados, setDiasBloqueados,
    setIsFormDirty,
    onBack,
    onSaveDraft,
    onPublish,
    loading,
    actionInProgress,
    esEdicion
  }: PasoPreferenciasProps) => {
  
    // Helper para manejar cambios y marcar el form como sucio
    const handleChange = <T,>(setter: (v: T) => void, value: T) => {
      setter(value);
      setIsFormDirty(true);
    };

    const toggleDiaBloqueado = (dia: string) => {
      const nuevosDias = diasBloqueados.includes(dia)
        ? diasBloqueados.filter(d => d !== dia)
        : [...diasBloqueados, dia];
      handleChange(setDiasBloqueados, nuevosDias);
    };

    const diasSemana = [
      { key: 'L', label: 'Lunes' },
      { key: 'M', label: 'Martes' },
      { key: 'X', label: 'Miércoles' },
      { key: 'J', label: 'Jueves' },
      { key: 'V', label: 'Viernes' },
      { key: 'S', label: 'Sábado' },
      { key: 'D', label: 'Domingo' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. Tipo de Reserva */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tipo de Reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange(setTipoReserva, 'INSTANTANEA')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  tipoReserva === 'INSTANTANEA'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Reserva Instantánea</span>
                  {tipoReserva === 'INSTANTANEA' && <LuCircleCheck className="text-blue-600" />}
                </div>
                <p className="text-sm text-slate-500">Los usuarios confirman al instante. Aumenta tu visibilidad y reservas.</p>
                <span className="inline-block mt-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">Recomendado</span>
              </button>

              <button
                type="button"
                onClick={() => handleChange(setTipoReserva, 'MANUAL')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  tipoReserva === 'MANUAL'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">Revisión Manual</span>
                  {tipoReserva === 'MANUAL' && <LuCircleCheck className="text-blue-600" />}
                </div>
                <p className="text-sm text-slate-500">Tenés 24hs para aprobar o rechazar cada solicitud. Más control, menos reservas.</p>
              </button>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 2. Requisitos para Reservar (Trust & Safety) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Requisitos para Reservar</h3>
            <div className="space-y-4">
              {/* Aceptar usuarios sin cuenta */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Aceptar reservas de usuarios sin cuenta</p>
                  <p className="text-xs text-slate-500 mt-0.5">Permitir que usuarios sin perfil verificado realicen reservas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={acceptUnverifiedUsers}
                    onChange={(e) => handleChange(setAcceptUnverifiedUsers, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 3. Política de Cancelación */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Política de Cancelación</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { val: 'FLEXIBLE', label: 'Flexible', desc: 'Reembolso 100% hasta 24hs antes.' },
                        { val: 'MODERADA', label: 'Moderada', desc: 'Reembolso 100% hasta 5 días antes.' },
                        { val: 'ESTRICTA', label: 'Estricta', desc: 'Reembolso 50% hasta 1 semana antes.' }
                    ].map((opt) => (
                        <div 
                            key={opt.val}
                            onClick={() => handleChange(setPoliticaCancelacion, opt.val as any)}
                            className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${politicaCancelacion === opt.val ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                        >
                            <div className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{opt.desc}</div>
                        </div>
                    ))}
                </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* 4. Horarios y Disponibilidad (Orden Senior UX) */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Horarios y Disponibilidad</h3>

            {/* 4.1 Pernocte (Master Switch) */}
            <div className="p-4 border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 rounded-xl flex items-center justify-between">
                <div>
                   <label className="font-bold text-slate-900 dark:text-white cursor-pointer" htmlFor="pernocte">
                     ¿Permitís estadías para acampar/dormir?
                   </label>
                   <p className="text-xs text-slate-500 mt-1">Habilita esta opción si tu espacio es apto para pasar la noche.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    id="pernocte"
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={permiteEstadiaNocturna}
                    onChange={(e) => handleChange(setPermiteEstadiaNocturna, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            {/* 4.2 Check In / Out */}
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check-in (Entrada)</label>
                  <div className="relative">
                     <input 
                       type="time" 
                       value={horaCheckIn}
                       onChange={(e) => handleChange(setHoraCheckIn, e.target.value)}
                       className="w-full pl-10 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check-out (Salida)</label>
                  <div className="relative">
                     <input 
                       type="time" 
                       value={horaCheckOut}
                       onChange={(e) => handleChange(setHoraCheckOut, e.target.value)}
                       className="w-full pl-10 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  {permiteEstadiaNocturna && (
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full mt-2 inline-block">
                        ← Día siguiente
                      </span>
                  )}
               </div>
            </div>

            {/* 4.3 Tiempo de Preparación */}
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiempo de preparación entre reservas</label>
               <select 
                 value={tiempoPreparacion}
                 onChange={(e) => handleChange(setTiempoPreparacion, Number(e.target.value))}
                 className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
               >
                  <option value={0}>Ninguno (Inmediato)</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={1440}>Bloquear 1 día entero</option>
               </select>
               <p className="text-xs text-slate-400 mt-1">Tiempo necesario para limpieza antes del siguiente cliente.</p>
            </div>

            {/* 4.4 Reglas de Tiempo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aviso mínimo para reservar</label>
                  <select 
                    value={avisoMinimo}
                    onChange={(e) => handleChange(setAvisoMinimo, Number(e.target.value))}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                     <option value={0}>Mismo día (Sin aviso)</option>
                     <option value={24}>1 día</option>
                     <option value={48}>2 días</option>
                     <option value={72}>3 días</option>
                     <option value={168}>7 días</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estadía mínima</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      min={1}
                      value={estadiaMinima}
                      onChange={(e) => handleChange(setEstadiaMinima, Number(e.target.value))}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl px-4 flex items-center text-sm text-slate-500">
                       {permiteEstadiaNocturna ? 'noches' : 'horas'}
                    </div>
                  </div>
               </div>
            </div>
            
            {/* 4.5 Anticipación Máxima */}
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anticipación máxima de reserva</label>
               <select 
                    value={anticipacionMaxima}
                    onChange={(e) => handleChange(setAnticipacionMaxima, Number(e.target.value))}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                     <option value={3}>3 meses</option>
                     <option value={6}>6 meses</option>
                     <option value={9}>9 meses</option>
                     <option value={12}>12 meses</option>
                     <option value={100}>Indefinido (Cualquier fecha futura)</option>
                  </select>
            </div>

            {/* 4.6 Días Bloqueados (Excepciones) */}
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Días no disponibles (Cerrado)</label>
               <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => (
                    <button
                      key={dia.key}
                      type="button"
                      onClick={() => toggleDiaBloqueado(dia.key)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                         diasBloqueados.includes(dia.key)
                           ? 'bg-slate-200 text-slate-400 line-through dark:bg-slate-700' // Estado "Cerrado"
                           : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50' // Estado "Abierto"
                      }`}
                      title={diasBloqueados.includes(dia.key) ? `Cerrado los ${dia.label}` : `Abierto los ${dia.label}`}
                    >
                      {dia.key}
                    </button>
                  ))}
               </div>
               <p className="text-xs text-slate-400 mt-2">Los días marcados en gris no aparecerán en el calendario.</p>
            </div>
          </section>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="text-slate-600 hover:text-slate-900 font-semibold px-4 py-2"
            >
              Atrás
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={loading && actionInProgress === 'draft'}
                className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading && actionInProgress === 'draft' ? "Guardando..." : "Guardar Borrador"}
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={loading && actionInProgress === 'publish'}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading && actionInProgress === 'publish' ? "Publicando..." : (esEdicion ? "Guardar Cambios" : "Publicar Espacio")}
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    export default PasoPreferencias;