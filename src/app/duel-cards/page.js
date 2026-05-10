'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

// NOUVEAU : On importe notre super brique de Carte !
import CarteDuel from '../../components/CarteDuel';

export default function DuelCardsPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [carteZoom, setCarteZoom] = useState(null);
  const [categories, setCategories] = useState({});
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const chargerCartes = async () => {
      try {
        const q = query(collection(db, 'cartes'), where('publiee', '==', true));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => a.nom.localeCompare(b.nom));

        const grimoireOrganise = data.reduce((acc, carte) => {
          const type = carte.type || 'Inconnu';
          if (!acc[type]) acc[type] = [];
          acc[type].push(carte);
          return acc;
        }, {});

        setCategories(grimoireOrganise);
      } catch (err) {
        console.error('Erreur chargement:', err);
        setErreur(err.message);
      } finally {
        setChargement(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        chargerCartes();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (chargement)
    return (
      <div className='min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-black uppercase'>
        <p>Récupération du Grimoire...</p>
      </div>
    );

  if (erreur)
    return (
      <div className='min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-black uppercase'>
        <p>Erreur lors de la lecture des archives infernales.</p>
        <p className='text-white text-xs mt-4 normal-case max-w-lg text-center font-normal'>
          {erreur}
        </p>
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-950 text-gray-100 flex flex-col relative pb-32'>
      {/* BARRE DE NAVIGATION FLOTTANTE */}
      <div className='fixed top-4 left-0 right-0 z-[150] flex justify-center px-4 pointer-events-none'>
        <div className='w-full max-w-6xl flex justify-between items-center bg-neutral-800/90 backdrop-blur-md p-4 rounded-2xl border border-neutral-600 shadow-2xl pointer-events-auto'>
          <button
            onClick={() => router.push('/home')}
            className='text-gray-300 hover:text-white uppercase text-xs font-black tracking-widest flex items-center gap-2 transition-colors bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-700 hover:border-red-500 cursor-pointer'>
            <span>⬅</span> Retour au Hub
          </button>
          <div className='text-red-500 font-black uppercase tracking-widest text-sm flex items-center gap-2'>
            <span>🃏</span> Collection
          </div>
        </div>
      </div>

      <div className='h-32 w-full flex-shrink-0'></div>

      <div className='text-center mb-16 z-10 px-4'>
        <h1 className='text-4xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none'>
          Le <span className='text-red-600'>Grimoire</span> Infernal
        </h1>
        <p className='text-gray-400 text-sm'>
          Cliquez sur une entité pour l&apos;étudier.
        </p>
      </div>

      <div className='flex flex-col gap-20 z-10 w-full max-w-7xl mx-auto px-4'>
        {Object.entries(categories).map(([type, cards]) => (
          <section key={type} className='w-full'>
            <div className='flex items-center gap-4 mb-10 bg-neutral-900 p-6 rounded-2xl border-l-8 border-red-600 border border-neutral-700 shadow-xl'>
              <h2 className='text-3xl font-black uppercase text-white tracking-widest leading-none'>
                {type}s
              </h2>
            </div>

            {/* AFFICHAGE DE LA GRILLE DE CARTES */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 justify-items-center'>
              {cards.map((carte) => (
                <CarteDuel key={carte.id} carte={carte} onZoom={setCarteZoom} />
              ))}
            </div>
          </section>
        ))}

        {Object.keys(categories).length === 0 && (
          <div className='text-center py-40 text-gray-600 italic'>
            Le Grimoire est vide. Allez forger des cartes en mode Admin.
          </div>
        )}
      </div>

      {/* MODALE DE ZOOM SUR UNE CARTE */}
      <AnimatePresence>
        {carteZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/80 overflow-y-auto'
            onClick={() => setCarteZoom(null)}>
            <button
              className='absolute top-8 right-8 text-white text-4xl hover:text-red-500 transition-colors z-[210] fixed cursor-pointer'
              onClick={() => setCarteZoom(null)}>
              ✖
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className='relative z-[205] my-auto'>
              {/* ON UTILISE NOTRE BRIQUE EN MODE ZOOM */}
              <CarteDuel carte={carteZoom} isZoomed={true} onZoom={() => {}} />
              <p className='text-center text-gray-400 mt-8 text-xs uppercase tracking-[0.2em] animate-pulse'>
                Survolez les éléments pour plus d&apos;informations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
