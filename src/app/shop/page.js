'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ShopPage() {
  const router = useRouter();
  const [joueur, setJoueur] = useState(null);
  const [profil, setProfil] = useState({ sceaux: 0, avatar: '😈' });
  const [chargement, setChargement] = useState(true);
  const [notification, setNotification] = useState(null);

  const ARTICLES = [
    {
      id: 'gold_border',
      nom: 'Liseré Doré',
      prix: 50,
      icone: '✨',
      desc: "Vos cartes brillent d'un éclat divin lors des duels.",
      categorie: 'Cosmétique',
    },
    {
      id: 'avatar_skull',
      nom: 'Avatar : Crâne',
      prix: 100,
      icone: '👺',
      desc: 'Un avatar de démon supérieur pour impressionner.',
      categorie: 'Profil',
    },
    {
      id: 'card_back',
      nom: 'Dos : Abysse',
      prix: 150,
      icone: '🌀',
      desc: "Le vide absolu s'installe au dos de votre deck.",
      categorie: 'Cartes',
    },
    {
      id: 'avatar_fire',
      nom: 'Avatar : Brasier',
      prix: 80,
      icone: '🔥',
      desc: "Devenez l'étincelle qui dévorera le monde.",
      categorie: 'Profil',
    },
  ];

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setJoueur(user);
        const docRef = doc(db, 'joueurs', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfil(docSnap.data());
        setChargement(false);
      } else {
        router.push('/');
      }
    });
  }, [router]);

  const acheterArticle = async (article) => {
    if (profil.sceaux < article.prix) {
      afficherNotification(
        "Sceaux insuffisants ! Allez combattre dans l'arène ou obtenez des tributs."
      );
      return;
    }
    try {
      const nouveauSolde = profil.sceaux - article.prix;
      const docRef = doc(db, 'joueurs', joueur.uid);
      await updateDoc(docRef, { sceaux: nouveauSolde });
      setProfil({ ...profil, sceaux: nouveauSolde });
      afficherNotification(`Acquisition de : ${article.nom} !`);
    } catch (error) {
      afficherNotification("Une force obscure a bloqué l'achat...");
    }
  };

  const afficherNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (chargement)
    return (
      <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-red-500 font-black italic uppercase tracking-tighter'>
        Ouverture du Bazar...
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 p-4 md:p-12 flex flex-col items-center relative overflow-hidden'>
      {/* HEADER (Avec le nouveau bouton d'achat de monnaie) */}
      <div className='w-full max-w-6xl flex justify-between items-center mb-16 z-10 bg-neutral-800 p-4 rounded-2xl border border-neutral-600 shadow-xl'>
        <button
          onClick={() => router.push('/home')}
          className='group text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 uppercase text-xs font-black tracking-widest'>
          <span className='group-hover:-translate-x-1 transition-transform'>
            ⬅
          </span>{' '}
          Retour au Hub
        </button>

        <div className='flex items-center gap-3 md:gap-4'>
          {/* AFFICHAGE DU SOLDE ACTUEL */}
          <div className='flex items-center gap-4 bg-neutral-900 border border-neutral-700 px-6 py-2 rounded-full shadow-md'>
            <div className='flex flex-col items-end'>
              <span className='text-[10px] text-gray-400 uppercase font-bold tracking-tighter'>
                Votre Fortune
              </span>
              <span className='text-xl font-black text-red-400'>
                {profil.sceaux || 0}
              </span>
            </div>
            <span className='text-2xl'>💠</span>
          </div>

          {/* NOUVEAU : BOUTON ACHETER (Redirige vers /buy) */}
          <div
            className='relative group cursor-pointer'
            onClick={() => router.push('/buy')}>
            <button className='flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105 border border-yellow-300 font-black text-xs uppercase tracking-widest cursor-pointer h-full'>
              <span className='text-lg leading-none'>+</span>
              <span className='hidden sm:inline'>Acheter</span>
            </button>
            <div className='absolute top-12 right-0 w-56 bg-neutral-700 text-xs text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center border border-neutral-500 z-20 shadow-xl'>
              Obtenir plus de Sceaux avec de l&apos;argent réel.
            </div>
          </div>
        </div>
      </div>

      {/* TITRE PRINCIPAL */}
      <div className='text-center mb-16 z-10'>
        <h1 className='text-5xl md:text-7xl font-black text-white mb-2 uppercase italic tracking-tighter leading-none'>
          Bazar <span className='text-red-500'>Infernal</span>
        </h1>
        <p className='text-gray-300 italic text-sm md:text-base'>
          Échangez vos sceaux contre des faveurs éternelles.
        </p>
      </div>

      {/* GRILLE DES ARTICLES */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl z-10'>
        {ARTICLES.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -8 }}
            className='bg-neutral-800 border border-neutral-600 p-6 rounded-3xl flex flex-col items-center text-center group hover:border-red-500 transition-all shadow-xl relative'>
            <span className='absolute top-4 left-4 text-[9px] uppercase font-black text-gray-100 tracking-widest bg-neutral-900 px-3 py-1 rounded-md border border-neutral-700'>
              {item.categorie}
            </span>

            <div className='w-24 h-24 bg-neutral-900 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-inner border border-neutral-700 group-hover:scale-110 transition-transform'>
              {item.icone}
            </div>

            <h3 className='text-lg font-black mb-2 uppercase text-white'>
              {item.nom}
            </h3>
            <p className='text-[11px] text-gray-300 mb-8 leading-relaxed px-2 font-medium'>
              {item.desc}
            </p>

            <button
              onClick={() => acheterArticle(item)}
              className='w-full bg-neutral-900 hover:bg-red-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase transition-all cursor-pointer border border-neutral-600 hover:border-red-400 shadow-md'>
              {item.prix} 💠 Acheter
            </button>
          </motion.div>
        ))}
      </div>

      {/* NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className='fixed bottom-10 bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase text-sm shadow-[0_0_30px_rgba(220,38,38,0.5)] z-50 border-2 border-white/20'>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.03] pointer-events-none select-none uppercase tracking-tighter z-0'>
        BAZAR
      </div>
    </main>
  );
}
