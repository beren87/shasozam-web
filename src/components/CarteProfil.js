'use client';
import { motion } from 'framer-motion';

export default function CarteProfil({ profil, joueur, ouvrirModale }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl flex flex-col items-center shadow-xl relative'>
      <div
        onClick={ouvrirModale}
        className='w-28 h-28 bg-red-900/30 rounded-full border-2 border-red-500 mb-4 flex items-center justify-center text-6xl shadow-[0_0_20px_rgba(220,38,38,0.3)] cursor-pointer relative group overflow-hidden transition-transform hover:scale-105'>
        <span>{profil.avatar || '😈'}</span>
        <div className='absolute inset-0 bg-neutral-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
          <span className='text-xs font-bold uppercase tracking-widest text-white'>
            Modifier
          </span>
        </div>
      </div>
      <h2 className='text-2xl font-black mb-1 text-white'>{profil.pseudo}</h2>
      <p className='text-[11px] text-gray-300 mb-6 uppercase tracking-widest'>
        {joueur?.email}
      </p>
      <div className='w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 flex flex-col gap-2'>
        <div className='flex justify-between items-center border-b border-neutral-700 pb-2'>
          <span className='text-xs text-gray-300 uppercase font-bold'>
            Rang
          </span>
          <span className='text-sm font-black text-red-400'>Hérétique</span>
        </div>
        <div className='flex justify-between items-center border-b border-neutral-700 pb-2 pt-1'>
          <span className='text-xs text-gray-300 uppercase font-bold'>
            Classement
          </span>
          <span className='text-sm font-bold text-white'>
            {profil.classement ? `${profil.classement}ème` : 'Non classé'}
          </span>
        </div>
        <div className='flex justify-between items-center pt-1'>
          <span className='text-xs text-gray-300 uppercase font-bold'>
            Points de puissance
          </span>
          <span className='text-sm font-black text-yellow-400'>
            {profil.points || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
