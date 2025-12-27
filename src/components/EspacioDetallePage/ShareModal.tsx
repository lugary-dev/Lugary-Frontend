import { useState } from "react";
import { LuX, LuCopy, LuCheck, LuLink } from "react-icons/lu";
import { FaWhatsapp, FaFacebook, FaTwitter, FaEnvelope } from "react-icons/fa";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  espacio: {
    nombre: string;
    imagenUrl: string;
    direccion?: string;
  };
}

export default function ShareModal({ isOpen, onClose, espacio }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const url = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Mirá este lugar en Lugary: ${espacio.nombre} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mirá este lugar: ${espacio.nombre}`)}&url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(`Mirá este lugar: ${espacio.nombre}`)}&body=${encodeURIComponent(`Chequeá este espacio que encontré: ${url}`)}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compartir este espacio</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-4 items-center">
            <img 
              src={espacio.imagenUrl} 
              alt={espacio.nombre} 
              className="w-16 h-16 rounded-lg object-cover bg-slate-200"
            />
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{espacio.nombre}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{espacio.direccion || "Buenos Aires, Argentina"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
             </a>
             <a href={shareLinks.email} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                <FaEnvelope className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
             </a>
             <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                <FaFacebook className="w-6 h-6 text-[#1877F2]" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
             </a>
             <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                <FaTwitter className="w-6 h-6 text-[#1DA1F2]" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">X (Twitter)</span>
             </a>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enlace del espacio</label>
            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <LuLink className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
              <input 
                type="text" 
                readOnly 
                value={url} 
                className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 w-full truncate"
              />
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition flex-shrink-0 border border-slate-200 dark:border-slate-600"
              >
                {copied ? <LuCheck className="w-4 h-4 text-emerald-500" /> : <LuCopy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
