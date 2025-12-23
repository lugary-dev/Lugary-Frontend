import { useState } from "react";

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export const useShare = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const share = async (data: ShareData) => {
    // 1. Intentar usar la API Nativa del navegador (Móviles/Tablets)
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url || window.location.href,
        });
      } catch (error) {
        // El usuario canceló o hubo un error, lo ignoramos silenciosamente
        console.log("Share cancelado o fallido", error);
      }
    } else {
      // 2. Si no soporta nativo (Desktop), abrimos nuestro Modal
      setModalOpen(true);
    }
  };

  return { share, isModalOpen, setModalOpen };
};