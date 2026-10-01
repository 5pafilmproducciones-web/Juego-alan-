import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Globe,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onAddToast,
}) => {
  const [copied, setCopied] = useState(false);

  // The permanent public shared URL provided by AI Studio Cloud Run
  const sharedUrl = 'https://ais-pre-qeoterzg64hqgejxuqadjq-367728644307.us-east1.run.app';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      setCopied(true);
      onAddToast('¡Enlace Copiado!', 'El enlace público se ha copiado al portapapeles', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      onAddToast('Error', 'No se pudo copiar automáticamente. Cópialo manualmente.', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AventuraEduca - Plataforma Educativa',
          text: '¡Entra a jugar, aprender matemáticas, gramática y conversar con tu amigo Lumi!',
          url: sharedUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Compartir Aplicación</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                URL Pública Lista
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparte el enlace con tu hijo, familiares o alumnos
            </p>
          </div>
        </div>

        {/* URL Card with 1-Click Copy */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enlace Público de la Aplicación:</span>
          </label>
          <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-2xl">
            <input
              type="text"
              readOnly
              value={sharedUrl}
              className="bg-transparent flex-1 px-2 text-xs font-mono text-cyan-300 focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: Open Link / Share */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={sharedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Abrir en Nueva Pestaña</span>
          </a>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar por WhatsApp / Redes</span>
          </button>
        </div>

        {/* Guide: How to make it public in AI Studio */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>¿Cómo asegurar que esté pública en Google AI Studio?</span>
          </h4>
          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              En la esquina superior derecha de la pantalla de Google AI Studio, haz clic en el botón{' '}
              <strong className="text-white">"Share" (Compartir)</strong>.
            </li>
            <li>
              En la ventana de permisos, asegúrate de que el acceso esté configurado en{' '}
              <strong className="text-emerald-300">"Anyone with the link" (Cualquier persona con el enlace)</strong>.
            </li>
            <li>
              ¡Listo! Cualquier persona que abra la URL podrá usar la aplicación de inmediato sin requerir cuenta de desarrollador.
            </li>
          </ol>
        </div>

        {/* Tip: Mobile & Tablet Installation */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-900/50 text-cyan-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-cyan-200">
              Tip para la Tablet o Celular de tu hijo:
            </h5>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Abre el enlace en el navegador (Chrome o Safari) y toca{' '}
              <strong className="text-white">"Agregar a la pantalla principal"</strong>. Se creará
              un ícono en el dispositivo como si fuera una app instalada de la tienda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
