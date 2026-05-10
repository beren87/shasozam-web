'use client';
import { motion } from 'framer-motion';

export default function Tooltip({ texte, customZ = 'z-[300]' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className={`absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 ${customZ} bg-neutral-800 text-white text-[11px] py-2 px-4 rounded-xl border-2 border-red-500 shadow-[0_10px_30px_rgba(0,0,0,1)] pointer-events-none w-max max-w-[260px] text-center font-medium leading-snug`}>
      {texte}
      <div className='absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-800 border-r-2 border-b-2 border-red-500 rotate-45'></div>
    </motion.div>
  );
}
