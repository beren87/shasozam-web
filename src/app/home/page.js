'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import BoutonNav from '../../components/BoutonNav';
import ModaleInfo from '../../components/ModaleInfo';
import ModaleProfil from '../../components/ModaleProfil';
import CarteProfil from '../../components/CarteProfil';
import EtatService from '../../components/EtatService';

const MOTS_INTERDITS = [
  'merde',
  'putain',
  'con',
  'salope',
  'bite',
  'cul',
  'idiot',
  'connard',
];
const AVATARS_DISPOS = ['🩸', '🔥', '😈', '🌀', '👺'];
const DELAI_24H_MS = 24 * 60 * 60 * 1000;

// La liste des Admins
const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

export default function HomePage() {
  const router = useRouter();
  const [joueur, setJoueur] = useState(null);

  const [profil, setProfil] = useState({
    pseudo: '',
    avatar: '😈',
    dernierChangementPseudo: 0,
    sceaux: 0,
    victoires: 0,
    defaites: 0,
    points: 0,
    gloires: 0,
  });
  const [chargement, setChargement] = useState(true);

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [modaleInfoOuverte, setModaleInfoOuverte] = useState(false);

  const [nouveauPseudo, setNouveauPseudo] = useState('');
  const [nouvelAvatar, setNouvelAvatar] = useState('');
  const [erreurModale, setErreurModale] = useState('');
  const [heureOuverture, setHeureOuverture] = useState(0);

  const GLOIRES_PREVIEW = [
    {
      id: 1,
      nom: 'Première goutte de sang',
      desc: "Remporter un premier duel dans l'Arène.",
      recompense: '10 💠',
      accompli: true,
    },
    {
      id: 2,
      nom: 'Souverain Impitoyable',
      desc: "Remporter 10 duels d'affilée.",
      recompense: 'Avatar Exclusif',
      accompli: false,
    },
    {
      id: 3,
      nom: 'Pacte Consumé',
      desc: 'Dépenser 100 Sceaux au Bazar Infernal.',
      recompense: 'Titre : Le Dépensier',
      accompli: false,
    },
  ];

  const chargerOuCreerProfil = async (user) => {
    const docRef = doc(db, 'joueurs', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setProfil(docSnap.data());
    } else {
      const nouveauProfil = {
        pseudo: user.displayName || 'Nouveau Souverain',
        email: user.email,
        avatar: '😈',
        dernierChangementPseudo: 0,
        sceaux: 0,
        victoires: 0,
        defaites: 0,
        points: 0,
        gloires: 0,
      };
      await setDoc(docRef, nouveauProfil);
      setProfil(nouveauProfil);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setJoueur(user);
        await chargerOuCreerProfil(user);
        setChargement(false);
      } else {
        router.push('/');
      }
    });
  }, [router]);

  const ouvrirModale = () => {
    setHeureOuverture(Date.now());
    setNouveauPseudo(profil.pseudo);
    setNouvelAvatar(profil.avatar || '😈');
    setErreurModale('');
    setModaleOuverte(true);
  };

  const peutChangerPseudo = profil.dernierChangementPseudo
    ? heureOuverture - profil.dernierChangementPseudo >= DELAI_24H_MS
    : true;

  const sauvegarderModifications = async () => {
    setErreurModale('');
    const pseudoNettoye = nouveauPseudo.trim();
    if (pseudoNettoye.length < 3)
      return setErreurModale('Ton pseudo doit faire au moins 3 caractères.');
    if (pseudoNettoye.length > 12)
      return setErreurModale('Ton pseudo est trop long (12 caractères max).');
    const contientInsulte = MOTS_INTERDITS.some((mot) =>
      pseudoNettoye.toLowerCase().includes(mot)
    );
    if (contientInsulte)
      return setErreurModale('Ce nom est banni des royaumes infernaux.');

    const modifications = { avatar: nouvelAvatar };
    let aChangePseudo = false;

    if (pseudoNettoye !== profil.pseudo) {
      if (!peutChangerPseudo)
        return setErreurModale(
          'Tu dois attendre 24h entre chaque changement de pseudo.'
        );
      modifications.pseudo = pseudoNettoye;
      modifications.dernierChangementPseudo = Date.now();
      aChangePseudo = true;
    }

    try {
      const docRef = doc(db, 'joueurs', joueur.uid);
      await updateDoc(docRef, modifications);
      setProfil((prev) => ({
        ...prev,
        avatar: nouvelAvatar,
        ...(aChangePseudo && {
          pseudo: pseudoNettoye,
          dernierChangementPseudo: modifications.dernierChangementPseudo,
        }),
      }));
      setModaleOuverte(false);
    } catch (error) {
      setErreurModale('Erreur lors de la sauvegarde.');
    }
  };

  const seDeconnecter = async () => {
    await signOut(auth);
    router.push('/');
  };

  const totalDuels = (profil.victoires || 0) + (profil.defaites || 0);
  let ratio = 0;
  let couleurRatio = 'text-white';

  if (totalDuels > 0) {
    ratio = Math.round(((profil.victoires || 0) / totalDuels) * 100);
    if (ratio > 50) couleurRatio = 'text-green-400';
    else if (ratio < 50) couleurRatio = 'text-red-400';
  }

  if (chargement)
    return (
      <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-red-500 font-bold'>
        Chargement de l&apos;arène...
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 flex justify-center p-4 md:p-8 overflow-hidden relative'>
      <aside className='hidden xl:flex flex-col w-[160px] 2xl:w-[200px] mr-6 my-auto h-[600px] border-2 border-dashed border-neutral-700/50 bg-neutral-800/30 rounded-2xl items-center justify-center text-neutral-600 z-10'>
        <span className='text-3xl mb-3'>📢</span>
        <span className='text-[10px] font-black uppercase tracking-widest text-center px-4 leading-relaxed'>
          Espace
          <br />
          Annonceur
          <br />
          <br />
          <span className='text-neutral-500 font-normal'>160x600</span>
        </span>
      </aside>

      <div className='flex-1 flex flex-col items-center w-full max-w-6xl z-10'>
        {/* BARRE SUPÉRIEURE */}
        <div className='w-full flex justify-between items-center mb-8 bg-neutral-800 p-4 rounded-2xl border border-neutral-600 shadow-lg flex-wrap xl:flex-nowrap gap-4'>
          <div className='flex items-center gap-4 md:gap-6'>
            <h1 className='text-2xl md:text-3xl font-black text-red-500 tracking-tighter uppercase italic'>
              Shasozam
            </h1>
            <div className='flex gap-2'>
              <BoutonNav
                icone='📜'
                texte='Règles'
                texteHover="Le règlement d'une partie"
                lien='/rules'
              />
              <BoutonNav
                icone='🃏'
                texte='Cartes de Duel'
                texteHover='Cartes de Duel'
                lien='/duel-cards'
              />
              <BoutonNav
                icone='🎯'
                texte='Objectifs'
                texteHover='Objectifs des Souverains Infernaux'
                lien='/objectives'
              />
              <BoutonNav
                icone='🩸'
                texte='Pactes'
                texteHover="Pacte des Seigneurs de l'Enfer"
                lien='/pacts'
              />
            </div>
          </div>

          <div className='flex items-center gap-3 md:gap-4'>
            {/* 👇 LE BOUTON ADMIN CORRIGÉ : Petit, discret et propre ! */}
            {joueur && ADMIN_UIDS.includes(joueur.uid) && (
              <div
                className='relative group cursor-pointer'
                onClick={() => router.push('/admin')}>
                <button className='flex items-center justify-center w-10 h-10 bg-purple-900/30 hover:bg-purple-600 text-purple-100 rounded-full shadow-md transition-colors border border-purple-500 cursor-pointer'>
                  <span className='text-xl'>⚙️</span>
                </button>
                <div className='absolute top-12 left-1/2 -translate-x-1/2 w-max bg-neutral-700 text-xs text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center border border-neutral-500 z-20 shadow-xl'>
                  Back-office (Admin)
                </div>
              </div>
            )}

            <div
              className='relative group cursor-pointer'
              onClick={() => router.push('/shop')}>
              <div className='flex items-center gap-2 bg-neutral-900 border border-neutral-600 px-4 py-1.5 rounded-full shadow-md group-hover:border-red-500 transition-colors'>
                <span className='text-sm font-black text-red-400'>
                  {profil.sceaux || 0}
                </span>
                <span className='text-lg'>💠</span>
              </div>
            </div>

            <div
              className='relative group cursor-pointer'
              onClick={() => router.push('/buy')}>
              <button className='flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 px-3 py-1.5 rounded-full shadow-md transition-all transform hover:scale-105 border border-yellow-300 font-black text-xs uppercase tracking-widest cursor-pointer'>
                <span className='text-lg leading-none'>+</span>
                <span className='hidden sm:inline'>Acheter</span>
              </button>
            </div>

            <button
              onClick={seDeconnecter}
              className='text-xs text-gray-400 hover:text-white uppercase font-bold tracking-widest cursor-pointer ml-2'>
              Quitter
            </button>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          <CarteProfil
            profil={profil}
            joueur={joueur}
            ouvrirModale={ouvrirModale}
          />

          <EtatService
            profil={profil}
            totalDuels={totalDuels}
            ratio={ratio}
            couleurRatio={couleurRatio}
            setModaleInfoOuverte={setModaleInfoOuverte}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='flex flex-col gap-6'>
            <div className='flex-1 bg-neutral-800 border border-neutral-600 p-6 rounded-2xl flex flex-col items-center justify-center shadow-xl group hover:bg-neutral-700 transition-colors'>
              <h3 className='text-lg font-black uppercase mb-2 text-white'>
                Le Purgatoire
              </h3>
              <p className='text-xs text-gray-300 mb-6 text-center font-medium italic'>
                Affrontez l&apos;IA pour tester vos stratégies sans risque.
              </p>
              <button
                onClick={() =>
                  alert("Lancement du simulateur d'entraînement...")
                }
                className='w-full bg-neutral-900 hover:bg-neutral-600 text-white font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest border border-neutral-500 cursor-pointer shadow-md'>
                S&apos;entraîner (IA)
              </button>
            </div>
            <div className='flex-1 bg-red-950/40 border-2 border-red-500/70 p-6 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(153,27,27,0.3)] group hover:border-red-400 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all'>
              <h3 className='text-lg font-black uppercase mb-2 text-red-300'>
                L&apos;Arène Infernale
              </h3>
              <p className='text-xs text-red-200 mb-6 text-center font-medium italic'>
                Affrontez d&apos;autres âmes damnées pour la gloire.
              </p>
              <button
                onClick={() => alert("Recherche d'un adversaire...")}
                className='w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest cursor-pointer'>
                Chercher un duel
              </button>
            </div>
          </motion.div>
        </div>

        {/* CLASSEMENT & GLOIRES */}
        <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 mb-12'>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl shadow-xl flex flex-col justify-between'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-3xl'>🏆</span>
                <h3 className='text-xl font-black uppercase text-white tracking-widest'>
                  Classement Général
                </h3>
              </div>
              <p className='text-sm text-gray-300 mb-6'>
                Consultez le panthéon des Souverains. Filtrez par pseudo, rang
                ou points pour trouver vos rivaux et affirmer votre domination
                sur l&apos;Arène.
              </p>
            </div>
            <button
              onClick={() => router.push('/rank')}
              className='w-full bg-neutral-900 border border-neutral-600 hover:border-yellow-500 hover:bg-neutral-700 text-white py-4 rounded-xl font-black uppercase text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 group'>
              <span>Voir le classement complet</span>
              <span className='group-hover:translate-x-1 transition-transform'>
                →
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl shadow-xl flex flex-col h-full'>
            <div className='flex items-center gap-3 mb-6'>
              <span className='text-3xl'>✨</span>
              <h3 className='text-xl font-black uppercase text-white tracking-widest'>
                Registre des Gloires
              </h3>
            </div>
            <div className='flex-1 flex flex-col gap-3 mb-6'>
              {GLOIRES_PREVIEW.map((gloire) => (
                <div
                  key={gloire.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    gloire.accompli
                      ? 'bg-neutral-900/50 border-green-900/50'
                      : 'bg-neutral-900/30 border-neutral-700/50 opacity-60 hover:opacity-100 transition-opacity'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        gloire.accompli
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-800 border border-neutral-600 text-transparent'
                      }`}>
                      {gloire.accompli && '✓'}
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          gloire.accompli ? 'text-white' : 'text-gray-400'
                        }`}>
                        {gloire.nom}
                      </h4>
                      <p className='text-[10px] text-gray-500'>{gloire.desc}</p>
                    </div>
                  </div>
                  <div className='text-xs font-bold text-yellow-500 bg-neutral-950 px-2 py-1 rounded border border-neutral-800'>
                    {gloire.recompense}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/objectives')}
              className='w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer'>
              Afficher toutes les gloires <span>⬇</span>
            </button>
          </motion.div>
        </div>
      </div>

      <aside className='hidden xl:flex flex-col w-[160px] 2xl:w-[200px] ml-6 my-auto h-[600px] border-2 border-dashed border-neutral-700/50 bg-neutral-800/30 rounded-2xl items-center justify-center text-neutral-600 z-10'>
        <span className='text-3xl mb-3'>📢</span>
        <span className='text-[10px] font-black uppercase tracking-widest text-center px-4 leading-relaxed'>
          Espace
          <br />
          Annonceur
          <br />
          <br />
          <span className='text-neutral-500 font-normal'>160x600</span>
        </span>
      </aside>

      <div className='mt-20 opacity-5 text-[120px] font-black absolute -bottom-12 pointer-events-none select-none tracking-tighter text-white z-0'>
        SHASOZAM
      </div>

      <ModaleInfo
        isOpen={modaleInfoOuverte}
        onClose={() => setModaleInfoOuverte(false)}
      />
      <ModaleProfil
        isOpen={modaleOuverte}
        onClose={() => setModaleOuverte(false)}
        erreurModale={erreurModale}
        nouveauPseudo={nouveauPseudo}
        setNouveauPseudo={setNouveauPseudo}
        nouvelAvatar={nouvelAvatar}
        setNouvelAvatar={setNouvelAvatar}
        peutChangerPseudo={peutChangerPseudo}
        sauvegarderModifications={sauvegarderModifications}
        avatarsDispos={AVATARS_DISPOS}
      />
    </main>
  );
}
