'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const router = useRouter();

  const menuBlocks = [
    {
      title: 'La Forge',
      description: 'Créer, modifier et forger les entités du Grimoire.',
      icon: '🔥',
      path: '/forge',
      color: 'hover:border-red-600',
    },
    // 👇 NOUVEAU BLOC AVATARS (KAN-34) 👇
    {
      title: 'Avatars',
      description:
        'Gérer les avatars, uploader les images et définir ceux par défaut.',
      icon: '👺',
      path: '/settings-avatar',
      color: 'hover:border-purple-600',
    },
  ];

  return (
    <main className='min-h-screen bg-neutral-950 text-white p-8 flex flex-col items-center'>
      <div className='w-full max-w-4xl'>
        <button
          onClick={() => router.push('/home')}
          className='mb-12 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors'>
          ⬅ Retour au Hub
        </button>

        <h1 className='text-5xl font-black uppercase italic mb-2 tracking-tighter'>
          Back-<span className='text-red-600'>office</span>
        </h1>
        <p className='text-gray-400 mb-12 uppercase text-xs tracking-[0.3em]'>
          Archives de contrôle infernal
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {menuBlocks.map((block) => (
            <motion.div
              key={block.path}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(block.path)}
              className={`bg-neutral-900 border border-neutral-800 p-8 rounded-2xl cursor-pointer transition-all ${block.color} group`}>
              <div className='text-4xl mb-4'>{block.icon}</div>
              <h2 className='text-2xl font-black uppercase mb-2 group-hover:text-white transition-colors'>
                {block.title}
              </h2>
              <p className='text-gray-500 text-sm leading-relaxed'>
                {block.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
