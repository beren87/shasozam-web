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
  const renderAvatarOption = (avatarValue) => {
    if (!avatarValue) return null;
    if (avatarValue.startsWith('http')) {
      return (
        <img
          src={avatarValue}
          alt='Avatar'
          className='w-10 h-10 object-cover rounded-lg pointer-events-none'
        />
      );
    }
    return <span className='text-3xl'>{avatarValue}</span>;
  };

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
              <label className='text-xs text-gray-300 uppercase font-bold mb-3 block'>
                Choisir un Avatar
              </label>

              <div className='grid grid-cols-4 gap-3 bg-neutral-900 p-3 rounded-xl border border-neutral-600 min-h-[70px] max-h-48 overflow-y-auto custom-scrollbar'>
                {avatarsDispos.length > 0 ? (
                  avatarsDispos.map((avatarUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setNouvelAvatar(avatarUrl)}
                      className={`relative w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                        nouvelAvatar === avatarUrl
                          ? 'bg-red-900/40 border-2 border-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)] z-10'
                          : 'border border-neutral-700 hover:border-neutral-500 opacity-60 hover:opacity-100 bg-black'
                      }`}>
                      {renderAvatarOption(avatarUrl)}
                    </button>
                  ))
                ) : (
                  <p className='col-span-4 text-xs text-gray-500 italic flex items-center justify-center w-full text-center py-2'>
                    Aucun avatar disponible.
                  </p>
                )}
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
                maxLength={12} // 👈 KAN-36 : Limite matérielle de 12 caractères
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
