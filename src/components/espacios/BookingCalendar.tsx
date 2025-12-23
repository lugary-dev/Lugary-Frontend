import { useState, useMemo } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  isAfter, isBefore, isToday, startOfToday, addHours, 
  differenceInDays, differenceInHours, getDay, parse 
} from "date-fns";
import { es } from "date-fns/locale"; 
import { LuStar, LuChevronLeft, LuChevronRight, LuClock, LuUsers, LuInfo, LuX, LuShieldCheck, LuCreditCard } from "react-icons/lu";

export interface SpaceConfiguration {
  unidadPrecio: "HORA" | "DIA";
  avisoMinimoHoras: number;
  anticipacionMaximaMeses: number;
  estadiaMinima: number;
  horaCheckIn: string;
  horaCheckOut: string;
  diasBloqueados: string[];
  permiteReservasInvitado: boolean;
}

interface BookingCalendarProps {
  precio: number;
  calificacion?: number;
  resenas?: number;
  config: SpaceConfiguration;
  isUserLoggedIn?: boolean;
  isHostVerified?: boolean;
  fechasOcupadas?: Date[];
  cargoLimpieza?: number;
  precioPersonaExtra?: number;
  capacidadBase?: number;
  // Nuevos props para el modal de pago
  nombre: string;
  ciudad: string;
  provincia: string;
  coverImage?: string;
}

export const BookingCalendar = ({ 
  precio, 
  calificacion = 0, 
  resenas = 0,
  config = {
    unidadPrecio: "DIA",
    avisoMinimoHoras: 24,
    anticipacionMaximaMeses: 3,
    estadiaMinima: 1,
    horaCheckIn: "09:00",
    horaCheckOut: "18:00",
    diasBloqueados: [],
    permiteReservasInvitado: false
  },
  isUserLoggedIn = false,
  isHostVerified = true,
  fechasOcupadas = [],
  cargoLimpieza = 0,
  precioPersonaExtra = 0,
  capacidadBase = 1,
  nombre = "Nombre del Espacio",
  ciudad = "Ciudad",
  provincia = "Provincia",
  coverImage
}: BookingCalendarProps) => {
  const today = startOfToday(); // Fecha de hoy a las 00:00:00
  const maxDate = addMonths(today, config.anticipacionMaximaMeses); // Límite configurado

  // Estado del calendario visual
  const [currentMonth, setCurrentMonth] = useState(today);
  
  // Estado de la selección
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Estado para HORA
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  // Estado de Reserva
  const [guestCount, setGuestCount] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ email: "", phone: "" });
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");

  // --- LÓGICA DE NAVEGACIÓN ---
  const canGoBack = !isSameMonth(currentMonth, today);
  const canGoNext = !isSameMonth(currentMonth, maxDate);

  const nextMonth = () => {
    if (canGoNext) setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    if (canGoBack) setCurrentMonth(subMonths(currentMonth, 1));
  };

  // --- VALIDACIONES ---
  const isDateDisabled = (day: Date) => {
    // 1. Pasado
    if (isBefore(day, today)) return true;
    
    // 2. Anticipación (Aviso Mínimo)
    // Verificamos si el momento de check-in de ese día cumple con el aviso mínimo
    const checkInDate = parse(config.horaCheckIn, "HH:mm", day);
    const minNoticeDate = addHours(new Date(), config.avisoMinimoHoras);
    if (isBefore(checkInDate, minNoticeDate)) return true;

    // 3. Horizonte
    if (isAfter(day, maxDate)) return true;

    // 4. Días Bloqueados
    const dayIndex = getDay(day);
    const mapDays: Record<string, number> = { "D": 0, "L": 1, "M": 2, "X": 3, "Mi": 3, "J": 4, "V": 5, "S": 6 };
    const isBlockedDay = config.diasBloqueados.some(d => {
       const mapped = mapDays[d.toUpperCase()] || mapDays[d.substring(0,1).toUpperCase()] || -1;
       return mapped === dayIndex;
    });
    if (isBlockedDay) return true;

    // 5. Ocupación
    if (fechasOcupadas.some(occupied => isSameDay(day, occupied))) return true;

    return false;
  };

  const onDateClick = (day: Date) => {
    if (isDateDisabled(day)) return;

    if (config.unidadPrecio === "HORA") {
      // Selección única para horas
      setStartDate(day);
      setEndDate(null);
      setStartTime("");
      setEndTime("");
    } else {
      // Selección de rango para días
      if (!startDate || (startDate && endDate)) {
        setStartDate(day);
        setEndDate(null);
      } else if (isAfter(day, startDate)) {
        // Validar estadía mínima en noches
        if (differenceInDays(day, startDate) < config.estadiaMinima) {
            return; // Podríamos mostrar un toast aquí
        }
        setEndDate(day);
      } else {
        setStartDate(day);
        setEndDate(null);
      }
    }
  };

  // Generar opciones de hora
  const timeOptions = useMemo(() => {
    if (!startDate || config.unidadPrecio !== "HORA") return { start: [], end: [] };
    
    const startHour = parseInt(config.horaCheckIn.split(":")[0]);
    const endHour = parseInt(config.horaCheckOut.split(":")[0]);
    
    const starts = [];
    for (let i = startHour; i < endHour; i++) {
        starts.push(`${i.toString().padStart(2, '0')}:00`);
    }

    let ends: string[] = [];
    if (startTime) {
        const startH = parseInt(startTime.split(":")[0]);
        // Mínimo: start + estadiaMinima
        const minEnd = startH + config.estadiaMinima;
        for (let i = minEnd; i <= endHour; i++) {
            ends.push(`${i.toString().padStart(2, '0')}:00`);
        }
    }

    return { start: starts, end: ends };
  }, [startDate, startTime, config]);

  // Generar los días
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDateGrid;

    while (day <= endDateGrid) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        
        // Validaciones de Estado
        const isDisabled = isDateDisabled(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelectedStart = startDate ? isSameDay(day, startDate) : false;
        const isSelectedEnd = endDate ? isSameDay(day, endDate) : false;
        const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
        const isDayToday = isToday(day);

        // Estilos Base
        let buttonClasses = "w-9 h-9 flex items-center justify-center text-sm rounded-full transition-all relative z-10 ";
        
        // Lógica de Estilos
        if (!isCurrentMonth) {
          // Días de otros meses (gris muy claro, ocultos o deshabilitados)
          buttonClasses += "text-slate-200 cursor-default ";
        } else if (isDisabled) {
          // Días deshabilitados
          buttonClasses += "text-slate-300 line-through decoration-slate-300 cursor-not-allowed ";
        } else if (isSelectedStart || isSelectedEnd) {
          // Extremos de selección
          buttonClasses += "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ";
        } else if (isInRange) {
          // Rango medio
          buttonClasses += "bg-blue-50 text-blue-600 font-medium ";
        } else if (isDayToday && !startDate) {
          // Hoy (si no está seleccionado)
          buttonClasses += "text-blue-600 font-bold border border-blue-600 ";
        } else {
          // Día disponible normal
          buttonClasses += "text-slate-700 hover:bg-slate-100 cursor-pointer ";
        }

        days.push(
          <div 
            key={day.toString()} 
            className={`flex justify-center py-1 relative ${isInRange ? 'bg-blue-50' : ''} ${isSelectedStart ? 'rounded-l-full bg-blue-50' : ''} ${isSelectedEnd ? 'rounded-r-full bg-blue-50' : ''}`}
          >
            {/* Conectores visuales del rango */}
            {(isSelectedStart && endDate) && <div className="absolute right-0 top-1 bottom-1 w-1/2 bg-blue-50 z-0"></div>}
            {(isSelectedEnd && startDate) && <div className="absolute left-0 top-1 bottom-1 w-1/2 bg-blue-50 z-0"></div>}

            <button
              onClick={() => onDateClick(cloneDay)}
              disabled={isDisabled || !isCurrentMonth} // Deshabilitar lógica
              className={buttonClasses}
            >
              {formattedDate}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
      
      {/* Header Precio... (Igual que antes) */}
      <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${precio.toLocaleString("es-AR")}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-1">
             / {config.unidadPrecio === "HORA" ? "Hora" : "Día"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
          <LuStar className="w-4 h-4 text-slate-900 dark:text-white fill-current" />
          <span>{calificacion.toFixed(1)}</span>
          <span className="text-slate-400 font-normal underline decoration-slate-300 decoration-1 underline-offset-2">
            ({resenas} reseñas)
          </span>
        </div>
      </div>

      {/* --- CALENDARIO CONTROLES --- */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-900 dark:text-white capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <div className="flex gap-2">
          {/* Botón ATRÁS: Deshabilitado visual y lógicamente si no se puede volver */}
          <button 
            onClick={prevMonth} 
            disabled={!canGoBack}
            className={`p-1 rounded-full transition-colors ${
                !canGoBack 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LuChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Botón ADELANTE: Deshabilitado si llegamos al límite */}
          <button 
            onClick={nextMonth} 
            disabled={!canGoNext}
            className={`p-1 rounded-full transition-colors ${
                !canGoNext 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LuChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Días de la semana... (Igual que antes) */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
          <span key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </span>
        ))}
      </div>

      {/* Grid de días */}
      <div className="mb-6">
        {renderDays()}
      </div>

      {/* Leyenda, Inputs y Botón (Igual que antes) */}
      <div className="flex justify-center gap-4 mb-6 text-[10px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Ocupado</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-blue-600"></span> Hoy</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Selección</div>
      </div>

      {/* --- SELECTORES DE TIEMPO (SOLO HORA) --- */}
      {config.unidadPrecio === "HORA" && startDate && (
        <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
            <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Desde</label>
                <div className="relative">
                    <select 
                        value={startTime} 
                        onChange={(e) => { setStartTime(e.target.value); setEndTime(""); }}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none cursor-pointer"
                    >
                        <option value="">--:--</option>
                        {timeOptions.start.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <LuClock className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Hasta</label>
                <div className="relative">
                    <select 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!startTime}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="">--:--</option>
                        {timeOptions.end.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <LuClock className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
      )}

      {/* --- INPUTS DE FECHA (SOLO DIA) --- */}
      {config.unidadPrecio === "DIA" && (
        <div className="grid grid-cols-2 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
            <div className="p-3 border-r border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setStartDate(null)}>
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5">Llegada</p>
            <p className="text-sm text-slate-500 truncate">
                {startDate ? format(startDate, "dd/MM/yyyy") : "Seleccionar"}
            </p>
            </div>
            <div className="p-3 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-0.5">Salida</p>
            <p className="text-sm text-slate-500 truncate">
                {endDate ? format(endDate, "dd/MM/yyyy") : "Seleccionar"}
            </p>
            </div>
        </div>
      )}

      {/* --- SELECTOR DE INVITADOS --- */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Invitados</label>
        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5">
            <LuUsers className="w-4 h-4 text-slate-400 mr-2" />
            <input 
                type="number" 
                min={1} 
                value={guestCount} 
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white"
            />
        </div>
        {guestCount > capacidadBase && (
            <p className="text-[10px] text-orange-500 mt-1">
                +${precioPersonaExtra} por persona extra
            </p>
        )}
      </div>

      <button 
        disabled={config.unidadPrecio === "DIA" ? (!startDate || !endDate) : (!startDate || !startTime || !endTime)}
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center gap-2"
      >
        Reservar ahora
      </button>

      <p className="text-xs text-slate-400 text-center mt-3 font-medium">
        No se te cobrará nada todavía
      </p>

      {/* --- MODAL DE RESERVA --- */}
      {showModal && (
        (() => {
          const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
          const hours = startTime && endTime ? differenceInHours(parse(endTime, 'HH:mm', new Date()), parse(startTime, 'HH:mm', new Date())) : 0;
          const basePrice = config.unidadPrecio === 'DIA' ? nights * precio : (config.unidadPrecio === 'HORA' ? hours * precio : 0);
          const extraPeople = Math.max(0, guestCount - capacidadBase);
          const extraCharge = extraPeople * precioPersonaExtra;
          const finalTotal = basePrice + cargoLimpieza + extraCharge;

          let finalButtonText = `Pagar Total ($${finalTotal.toLocaleString('es-AR')})`;
          if (paymentType === "deposit" && isUserLoggedIn) {
              finalButtonText = `Pagar Seña ($${(finalTotal * 0.3).toLocaleString('es-AR')})`;
          }
          if (!isUserLoggedIn && !config.permiteReservasInvitado) {
              finalButtonText = "Iniciá sesión para pagar";
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirmar Reserva</h3>
                        <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><LuX /></button>
                    </div>
                    
                    {/* 1. Resumen de la Reserva */}
                    <div className="flex gap-4 p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        {coverImage && (
                            <img src={coverImage} alt={`Foto de ${nombre}`} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tu reserva en</p>
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">{nombre}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 capitalize truncate">{ciudad.toLowerCase()}, {provincia.toLowerCase()}</p>
                            <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-medium">
                                <p>
                                    {config.unidadPrecio === 'DIA' && startDate && endDate
                                        ? `${nights} ${nights > 1 ? 'noches' : 'noche'}: ${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`
                                        : config.unidadPrecio === 'HORA' && startDate && startTime && endTime
                                        ? `${hours} ${hours > 1 ? 'horas' : 'hora'} el ${format(startDate, 'dd MMM yyyy', { locale: es })}`
                                        : 'Fechas no seleccionadas'
                                    }
                                </p>
                                <p>{guestCount} {guestCount > 1 ? 'invitados' : 'invitado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {!isHostVerified && (
                            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex gap-2 items-start">
                                <LuInfo className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Este anfitrión aún no ha verificado su identidad. Te recomendamos contactarlo antes de pagar.</p>
                            </div>
                        )}

                        {/* 2. Transparencia en los Costos */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {config.unidadPrecio === 'DIA' && nights > 0
                                        ? `$${precio.toLocaleString('es-AR')} x ${nights} ${nights > 1 ? 'noches' : 'noche'}`
                                        : config.unidadPrecio === 'HORA' && hours > 0
                                        ? `$${precio.toLocaleString('es-AR')} x ${hours} ${hours > 1 ? 'horas' : 'hora'}`
                                        : 'Precio base'
                                    }
                                </span>
                                <span className="font-medium">${basePrice.toLocaleString('es-AR')}</span>
                            </div>
                            {cargoLimpieza > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Limpieza</span>
                                    <span className="font-medium">${cargoLimpieza.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            {extraCharge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Personas extra</span>
                                    <span className="font-medium">${extraCharge.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between font-bold text-slate-900 dark:text-white text-lg">
                                <span>Total</span>
                                <span>${finalTotal.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        {/* 4. Flujo de Usuario */}
                        {!isUserLoggedIn && config.permiteReservasInvitado && (
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Datos de contacto</p>
                                <input type="email" placeholder="Tu correo electrónico para enviar el ticket" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} />
                                <input type="tel" placeholder="Tu teléfono" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                            </div>
                        )}

                        {isUserLoggedIn ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setPaymentType("full")} className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentType === "full" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300"}`}>Pago Total</button>
                                <button onClick={() => setPaymentType("deposit")} className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentType === "deposit" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300"}`}>Seña (30%)</button>
                            </div>
                        ) : (
                            <div className="text-xs text-center text-slate-500">
                                {!config.permiteReservasInvitado ? "Debes iniciar sesión para reservar." : "Como invitado debes abonar el 100%."}
                            </div>
                        )}

                        {/* 5. Trust Signals */}
                        <div className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 pt-2">
                            <LuShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">Pago 100% seguro y encriptado.</span>
                        </div>

                        <button disabled={(!isUserLoggedIn && !config.permiteReservasInvitado) || (!isUserLoggedIn && (!guestInfo.email || !guestInfo.phone))} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <LuCreditCard className="w-4 h-4" />
                            {finalButtonText}
                        </button>
                    </div>

                    {/* 3. Mensaje Post-Pago */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Al confirmar, recibirás un comprobante por email con la ubicación exacta y los datos de contacto del anfitrión para coordinar tu llegada.
                        </p>
                    </div>
                </div>
            </div>
          )
        })()
      )}

    </div>
  );
};