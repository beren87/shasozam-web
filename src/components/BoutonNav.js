'use client';
import { useRouter } from 'next/navigation';

export default function BoutonNav({ icone, texte, texteHover, lien }) {
  const router = useRouter();

  return (
    <div
      className='relative group cursor-pointer'
      onClick={() => router.push(lien)}>
      <button className='flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 w-10 h-10 lg:w-auto lg:px-3 rounded-lg transition-colors cursor-pointer text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-200'>
        <span className='text-base'>{icone}</span>
        <span className='hidden lg:inline'>{texte}</span>
      </button>

      {/* La petite bulle d'aide qui s'affiche au survol (Tooltip) */}
      <div className='absolute top-12 left-1/2 -translate-x-1/2 w-max bg-neutral-700 text-xs text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center border border-neutral-500 z-20 shadow-xl'>
        {texteHover}
      </div>
    </div>
  );
}
