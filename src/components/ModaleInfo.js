'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ModaleInfo({ isOpen, onClose }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className='fixed inset-0 bg-neutral-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md'
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className='bg-neutral-800 border-2 border-neutral-500 rounded-2xl p-6 w-full max-w-md shadow-2xl relative'
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-xl font-bold cursor-pointer'>
              ✖
            </button>
            <h2 className='text-lg font-black text-white mb-6 uppercase tracking-widest border-b border-neutral-600 pb-3'>
              Le cycle des âmes
            </h2>
            <div className='space-y-6 text-sm text-gray-200 mb-8'>
              <div>
                <h4 className='text-red-400 font-bold uppercase text-xs mb-2'>
                  💠 Sceaux d&apos;honneur
                </h4>
                <p className='text-xs text-gray-300'>
                  Gagnez <strong className='text-green-400'>3 Sceaux</strong>{' '}
                  par victoire et{' '}
                  <strong className='text-red-400'>1 Sceau</strong> par défaite.
                </p>
              </div>
              <div>
                <h4 className='text-yellow-400 font-bold uppercase text-xs mb-2'>
                  🏆 Les Gloires
                </h4>
                <p className='text-xs text-gray-300'>
                  Des hauts-faits à accomplir en jeu.
                </p>
              </div>
              <div>
                <h4 className='text-white font-bold uppercase text-xs mb-2'>
                  📈 Le Classement
                </h4>
                <p className='text-xs text-gray-300'>
                  Accumulez des Points pour gravir les échelons.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push('/shop');
              }}
              className='w-full bg-neutral-900 hover:bg-neutral-700 text-white py-3 rounded-xl font-bold uppercase text-xs transition-all border border-neutral-500 cursor-pointer shadow-md'>
              Visiter le Bazar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
