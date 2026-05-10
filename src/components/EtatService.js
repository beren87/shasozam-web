'use client';
import { motion } from 'framer-motion';

export default function EtatService({
  profil,
  totalDuels,
  ratio,
  couleurRatio,
  setModaleInfoOuverte,
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl flex flex-col justify-between shadow-xl'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-gray-200 text-sm font-black uppercase tracking-widest'>
          État de Service
        </h3>
        <button
          onClick={() => setModaleInfoOuverte(true)}
          className='w-6 h-6 rounded-full border-2 border-neutral-500 text-gray-200 text-xs font-bold flex items-center justify-center hover:bg-neutral-600 hover:text-white transition-colors cursor-pointer shadow-sm'>
          ?
        </button>
      </div>
      <div className='bg-gradient-to-r from-yellow-900/40 to-neutral-900 border border-yellow-600/50 rounded-xl p-4 mb-6 flex items-center justify-between'>
        <div>
          <p className='text-xs text-yellow-400 uppercase font-bold tracking-widest mb-1'>
            Gloires accomplies
          </p>
          <p className='text-[11px] text-gray-300'>
            Hauts-faits d&apos;exception
          </p>
        </div>
        <span className='text-3xl font-black text-yellow-400'>
          {profil.gloires || 0}
        </span>
      </div>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-center flex flex-col justify-center'>
          <p className='text-[11px] text-gray-300 uppercase font-bold mb-1'>
            Parties jouées
          </p>
          <p className='text-2xl font-black text-white'>{totalDuels}</p>
        </div>
        <div className='bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-center flex flex-col justify-center'>
          <p className='text-[11px] text-gray-300 uppercase font-bold mb-1'>
            Taux de victoire
          </p>
          <p className={`text-2xl font-black ${couleurRatio}`}>
            {totalDuels > 0 ? `${ratio}%` : '-'}
          </p>
        </div>
      </div>
      <div className='flex justify-between px-2 text-sm font-bold bg-neutral-900 p-3 rounded-lg border border-neutral-700'>
        <div className='flex items-center gap-2 text-green-400'>
          <span className='w-3 h-3 rounded-full bg-green-500'></span>
          {profil.victoires || 0} Victoires
        </div>
        <div className='flex items-center gap-2 text-red-400'>
          {profil.defaites || 0} Défaites
          <span className='w-3 h-3 rounded-full bg-red-500'></span>
        </div>
      </div>
    </motion.div>
  );
}
