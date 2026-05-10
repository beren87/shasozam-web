'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function BuyPage() {
  const router = useRouter();
  const [joueur, setJoueur] = useState(null);
  const [profil, setProfil] = useState({ sceaux: 0 });
  const [chargement, setChargement] = useState(true);
  const [notification, setNotification] = useState(null);
  const [traitementEnCours, setTraitementEnCours] = useState(false);

  const PACKS = [
    {
      id: 'pack_starter',
      nom: "Pacte de l'Initié",
      base: 10,
      bonus: 0,
      prix: 0.99,
      pop: false,
    },
    {
      id: 'pack_basic',
      nom: "Sacoche de l'Hérétique",
      base: 50,
      bonus: 5,
      prix: 4.99,
      pop: false,
    },
    {
      id: 'pack_popular',
      nom: 'Coffre du Démon',
      base: 100,
      bonus: 20,
      prix: 9.99,
      pop: true,
    },
    {
      id: 'pack_advanced',
      nom: 'Trésor des Abysses',
      base: 250,
      bonus: 70,
      prix: 24.99,
      pop: false,
    },
    {
      id: 'pack_sovereign',
      nom: 'Tribut du Souverain',
      base: 500,
      bonus: 200,
      prix: 49.99,
      pop: false,
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

  const simulerPaiement = async (pack) => {
    setTraitementEnCours(true);
    setTimeout(async () => {
      try {
        const totalSceauxGagnes = pack.base + pack.bonus;
        const nouveauSolde = (profil.sceaux || 0) + totalSceauxGagnes;
        const docRef = doc(db, 'joueurs', joueur.uid);
        await updateDoc(docRef, { sceaux: nouveauSolde });
        setProfil({ ...profil, sceaux: nouveauSolde });
        setTraitementEnCours(false);
        afficherNotification(
          `Paiement de ${pack.prix}€ accepté ! +${totalSceauxGagnes} Sceaux 💠`
        );
      } catch (error) {
        setTraitementEnCours(false);
        afficherNotification('Erreur lors de la transaction bancaire.');
      }
    }, 1500);
  };

  const afficherNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (chargement)
    return (
      <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-yellow-500 font-black italic uppercase tracking-tighter'>
        Connexion à la banque de l&apos;Enfer...
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 p-4 md:p-12 flex flex-col items-center relative overflow-hidden'>
      {/* HEADER AVEC RACCOURCI VERS LE SHOP */}
      <div className='w-full max-w-6xl flex justify-between items-center mb-12 z-10 bg-neutral-800 p-4 rounded-2xl border border-neutral-600 shadow-xl'>
        <button
          onClick={() => router.push('/home')}
          className='group text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 uppercase text-xs font-black tracking-widest'>
          <span className='group-hover:-translate-x-1 transition-transform'>
            ⬅
          </span>{' '}
          Retour au Hub
        </button>

        {/* NOUVEAU : Solde interactif pour retourner au /shop */}
        <div
          onClick={() => router.push('/shop')}
          className='flex items-center gap-4 bg-neutral-900 border border-neutral-700 px-6 py-2 rounded-full shadow-md cursor-pointer hover:border-yellow-500 transition-all group/balance relative'
          title='Retourner au Bazar'>
          <div className='flex flex-col items-end'>
            <span className='text-[10px] text-gray-400 uppercase font-bold tracking-tighter'>
              Votre Fortune
            </span>
            <span className='text-xl font-black text-red-400'>
              {profil.sceaux || 0}
            </span>
          </div>
          <span className='text-2xl transition-transform group-hover/balance:scale-110'>
            💠
          </span>

          {/* Infobulle flottante */}
          <div className='absolute top-12 right-0 w-48 bg-neutral-700 text-[10px] text-white p-2 rounded-lg opacity-0 group-hover/balance:opacity-100 transition-opacity pointer-events-none text-center border border-neutral-500 z-20 shadow-xl'>
            Cliquez pour retourner au Bazar Infernal et dépenser vos sceaux.
          </div>
        </div>
      </div>

      <div className='text-center mb-16 z-10'>
        <h1 className='text-4xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none'>
          Chambre des <span className='text-yellow-500'>Tributs</span>
        </h1>
        <p className='text-gray-300 italic text-sm md:text-base max-w-2xl mx-auto'>
          L&apos;Arène vous a épuisé ? Acquérez instantanément des Sceaux
          d&apos;honneur pour débloquer les secrets du Bazar Infernal.
        </p>
      </div>

      <div className='flex flex-wrap justify-center gap-6 w-full max-w-6xl z-10'>
        {PACKS.map((pack) => (
          <motion.div
            key={pack.id}
            whileHover={{ y: -8 }}
            className={`w-full sm:w-[280px] flex flex-col items-center text-center p-6 rounded-3xl relative transition-all shadow-xl
              ${
                pack.pop
                  ? 'bg-neutral-800 border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)] scale-105'
                  : 'bg-neutral-800 border border-neutral-600 hover:border-yellow-600/50'
              }`}>
            {pack.pop && (
              <div className='absolute -top-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-neutral-900 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md'>
                Choix des Souverains
              </div>
            )}
            <h3
              className={`text-sm font-black mb-6 uppercase tracking-widest ${
                pack.pop ? 'text-yellow-400' : 'text-gray-300'
              }`}>
              {pack.nom}
            </h3>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-5xl font-black text-white'>
                {pack.base + pack.bonus}
              </span>
              <span className='text-3xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]'>
                💠
              </span>
            </div>
            <div className='h-6 mb-8'>
              {pack.bonus > 0 && (
                <span className='bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest'>
                  + {pack.bonus} Offerts !
                </span>
              )}
            </div>
            <button
              onClick={() => simulerPaiement(pack)}
              disabled={traitementEnCours}
              className={`w-full py-4 rounded-xl font-black text-lg uppercase transition-all cursor-pointer flex justify-center items-center gap-2
                ${
                  pack.pop
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-neutral-900 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                    : 'bg-neutral-900 hover:bg-neutral-700 text-white border border-neutral-600 hover:border-yellow-500'
                }
                ${traitementEnCours ? 'opacity-50 cursor-wait' : ''}
              `}>
              {pack.prix.toFixed(2).replace('.', ',')} €
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className='fixed bottom-10 bg-green-600 text-white px-8 py-4 rounded-full font-black uppercase text-sm shadow-[0_0_30px_rgba(34,197,94,0.4)] z-50 border-2 border-white/20 flex items-center gap-3'>
            <span>💰</span> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-white/[0.02] pointer-events-none select-none uppercase tracking-tighter z-0 w-full text-center'>
        TRIBUTS
      </div>
    </main>
  );
}
