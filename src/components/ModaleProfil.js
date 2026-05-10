'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModaleProfil({
  isOpen,
  onClose,
  erreurModale,
  nouveauPseudo,
  setNouveauPseudo,
  nouvelAvatar,
  setNouvelAvatar,
  peutChangerPseudo,
  sauvegarderModifications,
  avatarsDispos,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 bg-neutral-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-neutral-800 border-2 border-red-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative'>
            <h2 className='text-xl font-bold mb-6 text-center text-white uppercase tracking-widest'>
              Forger son identité
            </h2>
            {erreurModale && (
              <div className='bg-red-900/50 text-red-200 text-xs p-3 rounded mb-4 text-center border border-red-500'>
                {erreurModale}
              </div>
            )}
            <div className='mb-6'>
              <label className='text-xs text-gray-300 uppercase font-bold mb-2 block'>
                Choisir un Avatar
              </label>
              <div className='flex justify-between bg-neutral-900 p-2 rounded-xl border border-neutral-600'>
                {avatarsDispos.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setNouvelAvatar(emo)}
                    className={`text-3xl p-2 rounded-lg transition-all cursor-pointer ${
                      nouvelAvatar === emo
                        ? 'bg-red-900/80 border border-red-400 scale-110'
                        : 'hover:bg-neutral-700 opacity-60 hover:opacity-100'
                    }`}>
                    {emo}
                  </button>
                ))}
              </div>
            </div>
            <div className='mb-8'>
              <div className='flex justify-between mb-2'>
                <label className='text-xs text-gray-300 uppercase font-bold block'>
                  Pseudonyme
                </label>
                <span
                  className={`text-xs ${
                    nouveauPseudo.length > 12 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                  {nouveauPseudo.length}/12
                </span>
              </div>
              <input
                type='text'
                value={nouveauPseudo}
                onChange={(e) => setNouveauPseudo(e.target.value)}
                disabled={!peutChangerPseudo}
                className='w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              {!peutChangerPseudo && (
                <p className='text-[10px] text-red-400 mt-2 italic'>
                  ⚠️ Les sceaux sont figés. Attends 24h.
                </p>
              )}
            </div>
            <div className='flex gap-4'>
              <button
                onClick={onClose}
                className='flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-xl font-bold uppercase text-sm transition-colors cursor-pointer border border-neutral-500'>
                Annuler
              </button>
              <button
                onClick={sauvegarderModifications}
                className='flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold uppercase text-sm transition-colors shadow-lg cursor-pointer'>
                Sauvegarder
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
