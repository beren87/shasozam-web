'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { APP_VERSION } from '../../../version';

import BoutonNav from '../../components/BoutonNav';
import ModaleInfo from '../../components/ModaleInfo';
import ModaleProfil from '../../components/ModaleProfil';
import ModalConfirmation from '../../components/ModalConfirmation';
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
    dateCreation: null,
  });

  const [chargement, setChargement] = useState(true);
  const [isMenuOuvert, setIsMenuOuvert] = useState(false);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [modaleInfoOuverte, setModaleInfoOuverte] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [nouveauPseudo, setNouveauPseudo] = useState('');
  const [nouvelAvatar, setNouvelAvatar] = useState('');
  const [erreurModale, setErreurModale] = useState('');
  const [heureOuverture, setHeureOuverture] = useState(0);

  const [secondesSession, setSecondesSession] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondesSession((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formaterTempsSession = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  const formaterDate = (date) => {
    if (!date) return 'Inconnue';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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
        dateCreation: new Date().toISOString(),
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
    setIsMenuOuvert(false);
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
      <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest'>
        Récupération de votre âme...
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 flex flex-col items-center p-4 md:p-8 overflow-hidden relative'>
      {/* HUB BAR ÉPURÉE (KAN-29) */}
      <div className='w-full max-w-5xl z-[100] relative mb-6 mt-2'>
        <div className='w-full flex flex-wrap justify-end items-center gap-3 md:gap-4'>
          {/* Bouton Admin */}
          {joueur && ADMIN_UIDS.includes(joueur.uid) && (
            <button
              onClick={() => router.push('/admin')}
              className='w-10 h-10 bg-purple-900/30 hover:bg-purple-600 text-purple-100 rounded-full border border-purple-500 transition-all flex items-center justify-center cursor-pointer shadow-lg shrink-0'
              title='Back-office Admin'>
              ⚙️
            </button>
          )}

          {/* GROUPE COMPTE : Points / Gloires / Monnaie */}
          <div className='flex items-center gap-2'>
            <div className='bg-neutral-800 px-4 py-1.5 rounded-xl border border-neutral-700 flex flex-col items-center justify-center shadow-md'>
              <p className='text-[9px] uppercase font-bold text-gray-500'>
                Points
              </p>
              <p className='text-base font-black text-white leading-none'>
                {profil.points || 0}
              </p>
            </div>

            <div className='bg-neutral-800 px-4 py-1.5 rounded-xl border border-neutral-700 flex flex-col items-center justify-center shadow-md'>
              <p className='text-[9px] uppercase font-bold text-gray-500'>
                Gloires
              </p>
              <p className='text-base font-black text-yellow-500 leading-none'>
                {profil.gloires || 0}
              </p>
            </div>

            <div className='flex items-center gap-2 bg-neutral-800 border border-neutral-700 pl-4 pr-1.5 py-1.5 rounded-xl shadow-md shrink-0'>
              <span className='text-sm font-black text-red-400'>
                {profil.sceaux || 0}
              </span>
              <span className='text-lg'>💠</span>
              <button
                onClick={() => router.push('/buy')}
                className='ml-1 bg-yellow-500 hover:bg-yellow-400 text-neutral-900 px-3 py-1.5 rounded-lg flex items-center justify-center font-black transition-transform hover:scale-105 cursor-pointer shadow-md text-[10px] uppercase tracking-widest'>
                + Boutique
              </button>
            </div>
          </div>

          {/* Séparateur visuel */}
          <div className='w-px h-8 bg-neutral-700 mx-1 hidden sm:block'></div>

          {/* Profil Avatar & Menu */}
          <div className='relative shrink-0'>
            <div
              className='flex flex-col items-center cursor-pointer group'
              onClick={() => setIsMenuOuvert(!isMenuOuvert)}>
              <div className='text-4xl bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center border-2 border-neutral-600 group-hover:border-red-500 transition-colors shadow-lg'>
                {profil.avatar}
              </div>
              <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-1 group-hover:text-white transition-colors'>
                {profil.pseudo}
              </span>
            </div>

            {/* MENU DÉROULANT */}
            <AnimatePresence>
              {isMenuOuvert && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className='absolute right-0 mt-4 w-64 bg-neutral-800 border border-neutral-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] p-5 z-[110] flex flex-col gap-4'>
                  <div className='pb-2 border-b border-neutral-700'>
                    <p className='text-[9px] uppercase font-bold text-gray-500 mb-1'>
                      Compte
                    </p>
                    <p className='text-xs font-medium text-red-400 truncate'>
                      {profil.email}
                    </p>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <button
                      onClick={ouvrirModale}
                      className='w-full text-left bg-neutral-900 hover:bg-neutral-700 p-3 rounded-xl border border-neutral-700 transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-3 cursor-pointer'>
                      <span>✏️</span> Modifier Profil
                    </button>
                  </div>

                  <div className='flex flex-col gap-1 py-2'>
                    <div className='flex justify-between items-center text-[10px]'>
                      <span className='text-gray-500 font-bold uppercase'>
                        Inscrit le
                      </span>
                      <span className='text-gray-300'>
                        {formaterDate(profil.dateCreation)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px]'>
                      <span className='text-gray-500 font-bold uppercase'>
                        Session
                      </span>
                      <span className='text-green-500 font-mono'>
                        {formaterTempsSession(secondesSession)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className='w-full bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl border border-red-900/50 transition-all text-xs font-black uppercase tracking-widest cursor-pointer'>
                    Quitter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* BARRE DE NAVIGATION */}
      <nav className='w-full max-w-4xl flex justify-center gap-3 mb-8 z-50'>
        <BoutonNav
          icone='📜'
          texte='Règles'
          texteHover="Le règlement d'une partie"
          lien='/rules'
        />
        <BoutonNav
          icone='🃏'
          texte='Cartes'
          texteHover='Le Grimoire'
          lien='/duel-cards'
        />
        <BoutonNav
          icone='🎯'
          texte='Objectifs'
          texteHover='Objectifs'
          lien='/objectives'
        />
        <BoutonNav
          icone='🩸'
          texte='Pactes'
          texteHover='Pacte des Seigneurs'
          lien='/pacts'
        />
      </nav>

      <div className='flex-1 flex flex-col items-center w-full max-w-5xl z-10'>
        {/* DASHBOARD GRID */}
        <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <EtatService
            profil={profil}
            totalDuels={totalDuels}
            ratio={ratio}
            couleurRatio={couleurRatio}
            setModaleInfoOuverte={setModaleInfoOuverte}
          />

          <div className='flex flex-col gap-6'>
            <div className='flex-1 bg-neutral-800 border border-neutral-600 p-6 rounded-2xl flex flex-col items-center justify-center shadow-xl group hover:bg-neutral-700 transition-colors'>
              <h3 className='text-lg font-black uppercase mb-2 text-white'>
                Le Purgatoire
              </h3>
              <p className='text-xs text-gray-300 mb-6 text-center font-medium italic'>
                Affrontez l&apos;IA pour tester vos stratégies sans risque.
              </p>
              <button
                onClick={() => alert('Simulateur...')}
                className='w-full bg-neutral-900 hover:bg-neutral-600 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest border border-neutral-500 cursor-pointer shadow-md'>
                S&apos;entraîner (IA)
              </button>
            </div>
            <div className='flex-1 bg-red-950/40 border-2 border-red-500/70 p-6 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(153,27,27,0.3)] group hover:border-red-400 transition-all'>
              <h3 className='text-lg font-black uppercase mb-2 text-red-300'>
                L&apos;Arène Infernale
              </h3>
              <p className='text-xs text-red-200 mb-6 text-center font-medium italic'>
                Affrontez d&apos;autres âmes damnées pour la gloire.
              </p>
              <button
                onClick={() => alert('Duel...')}
                className='w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.5)] transition-all uppercase tracking-widest cursor-pointer'>
                Chercher un duel
              </button>
            </div>
          </div>
        </div>

        {/* CLASSEMENT & GLOIRES */}
        <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 mb-12'>
          <div className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl shadow-xl flex flex-col justify-between'>
            <div className='flex items-center gap-3 mb-4'>
              <span className='text-3xl'>🏆</span>
              <h3 className='text-xl font-black uppercase text-white tracking-widest'>
                Classement
              </h3>
            </div>
            <p className='text-sm text-gray-300 mb-6'>
              Consultez le panthéon des Souverains et affirmez votre domination
              sur l&apos;Arène.
            </p>
            <button
              onClick={() => router.push('/rank')}
              className='w-full bg-neutral-900 border border-neutral-600 hover:border-yellow-500 text-white py-4 rounded-xl font-black uppercase text-xs transition-colors cursor-pointer'>
              Voir le classement complet →
            </button>
          </div>

          <div className='bg-neutral-800 border border-neutral-600 p-6 rounded-2xl shadow-xl flex flex-col'>
            <div className='flex items-center gap-3 mb-6'>
              <span className='text-3xl'>✨</span>
              <h3 className='text-xl font-black uppercase text-white tracking-widest'>
                Gloires
              </h3>
            </div>
            <div className='flex-1 flex flex-col gap-3 mb-6'>
              {GLOIRES_PREVIEW.map((gloire) => (
                <div
                  key={gloire.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    gloire.accompli
                      ? 'bg-neutral-900/50 border-green-900/50'
                      : 'bg-neutral-900/30 border-neutral-700/50 opacity-60'
                  }`}>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        gloire.accompli
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-800 text-transparent border border-neutral-600'
                      }`}>
                      {gloire.accompli && '✓'}
                    </div>
                    <div className='text-sm font-bold'>{gloire.nom}</div>
                  </div>
                  <div className='text-[10px] font-bold text-yellow-500'>
                    {gloire.recompense}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
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

      <ModalConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={seDeconnecter}
        message="Vous êtes sur le point de vous déconnecter de Shasozam. Vos progrès sont sauvegardés dans les archives infernales. Voulez-vous vraiment quitter l'Arène ?"
      />

      {/* VERSION (KAN-28) */}
      <div className='fixed bottom-2 right-4 text-neutral-500 text-[10px] font-bold uppercase tracking-widest z-50 pointer-events-none'>
        v{APP_VERSION}
      </div>

      <div className='mt-20 opacity-5 text-[120px] font-black absolute -bottom-12 pointer-events-none select-none tracking-tighter text-white z-0'>
        SHASOZAM
      </div>
    </main>
  );
}
