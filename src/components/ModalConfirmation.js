'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModalConfirmation({
  isOpen,
  onClose,
  onConfirm,
  message,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4'>
          {/* Le fond noir semi-transparent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-black/90 backdrop-blur-sm'
          />

          {/* La boîte d'avertissement au centre */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className='relative bg-neutral-900 border border-red-900/50 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]'>
            <div className='text-4xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-black uppercase text-white mb-4 italic'>
              Attention, Archimage !
            </h2>
            <p className='text-gray-400 mb-8 leading-relaxed'>
              {message ||
                'Vous vous apprêtez à quitter la forge. Tout travail non enregistré sera définitivement perdu dans les abysses.'}
            </p>

            <div className='flex flex-col gap-3'>
              <button
                onClick={onConfirm}
                className='w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-4 rounded-xl transition-all tracking-widest text-sm'>
                Quitter et perdre les changements
              </button>
              <button
                onClick={onClose}
                className='w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold uppercase py-4 rounded-xl transition-all text-sm'>
                Annuler (Rester dans la forge)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
