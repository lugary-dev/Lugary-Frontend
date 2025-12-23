import { useEffect } from 'react';

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // 1. Calcular el ancho de la barra de scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // 2. Compensar el espacio agregando padding al body
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add('overflow-hidden');
    } else {
      // 3. Restaurar estilos
      document.body.style.paddingRight = '';
      document.body.classList.remove('overflow-hidden');
    }

    // Limpieza al desmontar
    return () => {
      document.body.style.paddingRight = '';
      document.body.classList.remove('overflow-hidden');
    };
  }, [isLocked]);
}