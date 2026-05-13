'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
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
const DELAI_24H_MS = 24 * 60 * 60 * 1000;
const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

const getXpRequirePourNiveau = (niveau) => {
  if (niveau <= 1) return 100;
  return Math.floor(100 * Math.pow(1.5, niveau - 1));
};

export default function HomePage() {
  const router = useRouter();
  const menuRef = useRef(null);

  const [joueur, setJoueur] = useState(null);
  const [profil, setProfil] = useState({
    pseudo: '',
    tagId: '',
    avatar: '',
    dernierChangementPseudo: 0,
    sceaux: 0,
    victoires: 0,
    defaites: 0,
    points: 0,
    gloires: 0,
    dateCreation: null,
    niveau: 1,
    xp: 0,
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
  const [avatarsDispos, setAvatarsDispos] = useState([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOuvert(false);
      }
    }
    if (isMenuOuvert) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOuvert]);

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

  const chargerAvatarsDefaut = async () => {
    try {
      const q = query(
        collection(db, 'avatars'),
        where('estDefaut', '==', true)
      );
      const snap = await getDocs(q);
      const liste = snap.docs.map((d) => d.data().imageUrl);
      setAvatarsDispos(liste);
      return liste;
    } catch (error) {
      console.error('Erreur chargement avatars:', error);
      return [];
    }
  };

  const genererTagId = () => {
    return '#' + Math.floor(1000000 + Math.random() * 9000000);
  };

  const initialiserProfilSiBesoin = async (user, listeAvatars) => {
    const docRef = doc(db, 'joueurs', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let updates = {};
      if (!data.tagId) updates.tagId = genererTagId();
      if (data.niveau === undefined) updates.niveau = 1;
      if (data.xp === undefined) updates.xp = 0;
      if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates);
      }
    } else {
      const avatarParDefaut = listeAvatars.length > 0 ? listeAvatars[0] : '😈';
      let pseudoInit = user.displayName || 'Âme Damnée';
      if (pseudoInit.length > 12) pseudoInit = pseudoInit.substring(0, 12);

      const nouveauProfil = {
        pseudo: pseudoInit,
        tagId: genererTagId(),
        email: user.email,
        avatar: avatarParDefaut,
        dernierChangementPseudo: 0,
        sceaux: 0,
        victoires: 0,
        defaites: 0,
        points: 0,
        gloires: 0,
        niveau: 1,
        xp: 0,
        dateCreation: new Date().toISOString(),
      };
      await setDoc(docRef, nouveauProfil);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setJoueur(user);
        const listeAvatars = await chargerAvatarsDefaut();

        await initialiserProfilSiBesoin(user, listeAvatars);

        const docRef = doc(db, 'joueurs', user.uid);
        unsubscribeSnapshot = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfil(docSnap.data());
              setChargement(false);
            }
          },
          (error) => {
            console.log('Écouteur débranché.');
          }
        );
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        router.push('/');
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [router]);

  useEffect(() => {
    if (!joueur || profil.niveau === undefined || profil.xp === undefined)
      return;

    const verifierLevelUp = async () => {
      const xpReq = getXpRequirePourNiveau(profil.niveau);

      if (profil.xp >= xpReq) {
        const nouveauNiveau = profil.niveau + 1;
        const xpRestante = profil.xp - xpReq;

        const docRef = doc(db, 'joueurs', joueur.uid);
        await updateDoc(docRef, {
          niveau: nouveauNiveau,
          xp: xpRestante,
        });
      }
    };

    verifierLevelUp();
  }, [profil.xp, profil.niveau, joueur]);

  const ouvrirModale = () => {
    setHeureOuverture(Date.now());
    setNouveauPseudo(profil.pseudo);
    setNouvelAvatar(
      profil.avatar || (avatarsDispos.length > 0 ? avatarsDispos[0] : '😈')
    );
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

      try {
        const pseudoQuery = query(
          collection(db, 'joueurs'),
          where('pseudo', '==', pseudoNettoye)
        );
        const pseudoSnap = await getDocs(pseudoQuery);

        if (!pseudoSnap.empty) {
          return setErreurModale(
            'Ce nom existe déjà, tu dois en trouver un autre.'
          );
        }
      } catch (error) {
        console.error('Erreur unicité pseudo :', error);
        return setErreurModale('Erreur de vérification. Réessaie plus tard.');
      }

      modifications.pseudo = pseudoNettoye;
      modifications.dernierChangementPseudo = Date.now();
      aChangePseudo = true;
    }

    try {
      const docRef = doc(db, 'joueurs', joueur.uid);
      await updateDoc(docRef, modifications);
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

  const renderAvatar = (avatarValue, extraClasses = '') => {
    if (!avatarValue) return null;
    if (avatarValue.startsWith('http')) {
      return (
        <img
          src={avatarValue}
          alt='Avatar'
          className={`w-full h-full object-cover ${extraClasses}`}
        />
      );
    }
    return <span className={extraClasses}>{avatarValue}</span>;
  };

  if (chargement)
    return (
      <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest'>
        Récupération de votre âme...
      </div>
    );

  const niveauActuel = profil.niveau || 1;
  const xpActuelle = profil.xp || 0;
  const xpRequise = getXpRequirePourNiveau(niveauActuel);
  const pourcentageXP = Math.min(
    100,
    Math.round((xpActuelle / xpRequise) * 100)
  );

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 flex flex-col items-center p-4 md:p-8 overflow-hidden relative'>
      <div className='w-full max-w-5xl z-[100] relative mb-6 mt-2'>
        <div className='w-full relative flex justify-between items-start pb-4'>
          {/* BARRE D'XP : Remontée très légèrement (-bottom-2) */}
          <div className='absolute -bottom-2 left-0 right-[5.5rem] h-2.5 bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden flex items-center shadow-inner z-0'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pourcentageXP}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='absolute top-0 left-0 h-full bg-gradient-to-r from-pink-600 to-pink-400'
            />
            <div className='absolute w-full text-center text-[8px] font-black uppercase text-white drop-shadow-md z-10 leading-none mt-[1px]'>
              {xpActuelle} / {xpRequise} XP - {pourcentageXP}%
            </div>
          </div>

          {/* SECTION DES IMAGES PERSONNALISÉES */}
          <div className='flex items-center gap-6 pl-2 z-10'>
            {/* 1. Unknow */}
            <div className='flex flex-col items-center cursor-pointer group'>
              <img
                src='/icons/unknow.png'
                alt='Unknow'
                className='w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className='hidden w-14 h-14 rounded bg-neutral-800 border border-neutral-700 items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-xs text-neutral-500'>IMG</span>
              </div>
              <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-2 group-hover:text-white transition-colors'>
                Unknow
              </span>
            </div>

            {/* 2. Gloires */}
            <div
              onClick={() => router.push('/objectives')}
              className='flex flex-col items-center cursor-pointer group'>
              <img
                src='/icons/gloires.png'
                alt='Gloires'
                className='w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className='hidden w-14 h-14 rounded bg-neutral-800 border border-neutral-700 items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-xs text-neutral-500'>IMG</span>
              </div>
              <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-2 group-hover:text-white transition-colors'>
                Gloires
              </span>
            </div>

            {/* 3. Talents */}
            <div className='flex flex-col items-center cursor-pointer group'>
              <img
                src='/icons/talents.png'
                alt='Talents'
                className='w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className='hidden w-14 h-14 rounded bg-neutral-800 border border-neutral-700 items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-xs text-neutral-500'>IMG</span>
              </div>
              <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-2 group-hover:text-white transition-colors'>
                Talents
              </span>
            </div>

            {/* 4. Collection */}
            <div
              onClick={() => router.push('/card-back')}
              className='flex flex-col items-center cursor-pointer group'>
              <img
                src='/icons/collection.png'
                alt='Collection'
                className='w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className='hidden w-14 h-14 rounded bg-neutral-800 border border-neutral-700 items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-xs text-neutral-500'>IMG</span>
              </div>
              <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-2 group-hover:text-white transition-colors'>
                Collection
              </span>
            </div>
          </div>

          {/* GROUPE BOUTONS & AVATAR (DROITE) */}
          <div className='flex items-center gap-3 md:gap-4 z-10'>
            {joueur && ADMIN_UIDS.includes(joueur.uid) && (
              <button
                onClick={() => router.push('/admin')}
                className='w-10 h-10 bg-purple-900/30 hover:bg-purple-600 text-purple-100 rounded-full border border-purple-500 transition-all flex items-center justify-center cursor-pointer shadow-lg shrink-0'
                title='Back-office Admin'>
                ⚙️
              </button>
            )}

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

              <div className='flex items-center gap-2 bg-neutral-800 border border-neutral-700 pl-3 pr-1.5 py-1.5 rounded-xl shadow-md shrink-0'>
                <div
                  onClick={() => router.push('/shop')}
                  className='flex items-center gap-1 cursor-pointer group relative px-1'>
                  <span className='text-sm font-black text-red-400'>
                    {profil.sceaux || 0}
                  </span>
                  <span className='text-lg'>💠</span>

                  <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-yellow-500 text-[9px] font-bold px-2 py-1 rounded border border-yellow-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg uppercase tracking-wider'>
                    Boutique
                  </div>
                </div>

                <motion.button
                  onClick={() => router.push('/buy')}
                  animate={{
                    boxShadow: [
                      '0px 0px 0px rgba(234,179,8,0)',
                      '0px 0px 15px rgba(234,179,8,0.7)',
                      '0px 0px 0px rgba(234,179,8,0)',
                    ],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className='ml-1 bg-yellow-500 text-neutral-900 px-3 py-1.5 rounded-lg flex items-center justify-center font-black cursor-pointer text-[10px] uppercase tracking-widest'>
                  Acheter
                </motion.button>
              </div>
            </div>

            <div className='w-px h-8 bg-neutral-700 mx-1 hidden sm:block'></div>

            <div className='relative shrink-0' ref={menuRef}>
              <div
                className='flex flex-col items-center cursor-pointer group'
                onClick={() => setIsMenuOuvert(!isMenuOuvert)}>
                <div className='relative'>
                  <div className='bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center border-2 border-neutral-600 group-hover:border-red-500 transition-colors shadow-lg overflow-hidden'>
                    {renderAvatar(profil.avatar, 'text-4xl')}
                  </div>
                  <div className='absolute -top-1 -left-2 bg-neutral-900 border-2 border-blue-500 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-md'>
                    {niveauActuel}
                  </div>
                </div>

                <span className='text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-1 group-hover:text-white transition-colors'>
                  {profil.pseudo}
                </span>
                <span className='text-[8px] italic text-gray-500 leading-none mt-0.5'>
                  {profil.tagId}
                </span>
              </div>

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
                      <p className='text-[10px] italic text-gray-500 mt-1'>
                        {profil.tagId}
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
      </div>

      <div className='w-full max-w-2xl flex flex-col sm:flex-row justify-center gap-6 md:gap-12 mb-8 z-10 mt-2 px-4'>
        <div className='flex-1 flex flex-col items-center gap-2'>
          <button
            onClick={() => alert('Simulateur...')}
            className='w-full bg-neutral-900 hover:bg-neutral-700 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest border border-neutral-500 cursor-pointer shadow-lg'>
            S&apos;entraîner (IA)
          </button>
          <p className='text-[10px] text-gray-400 italic text-center'>
            Affrontez l&apos;IA pour tester vos stratégies sans risque.
          </p>
        </div>

        <div className='flex-1 flex flex-col items-center gap-2'>
          <button
            onClick={() => alert('Duel...')}
            className='w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.5)] transition-all uppercase tracking-widest cursor-pointer hover:shadow-[0_4px_20px_rgba(220,38,38,0.8)]'>
            Chercher un duel
          </button>
          <p className='text-[10px] text-red-400/80 italic text-center'>
            Affrontez d&apos;autres âmes damnées pour la gloire.
          </p>
        </div>
      </div>

      <nav className='w-full max-w-4xl flex justify-center gap-3 mb-8 z-50 flex-wrap'>
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
          icone='🎴'
          texte='Collection'
          texteHover='Dos de cartes et cosmétiques'
          lien='/card-back'
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
        <div className='w-full max-w-2xl mb-6'>
          <EtatService
            profil={profil}
            totalDuels={totalDuels}
            ratio={ratio}
            couleurRatio={couleurRatio}
            setModaleInfoOuverte={setModaleInfoOuverte}
          />
        </div>

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
        avatarsDispos={avatarsDispos}
      />

      <ModalConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={seDeconnecter}
        message="Vous êtes sur le point de vous déconnecter de Shasozam. Vos progrès sont sauvegardés dans les archives infernales. Voulez-vous vraiment quitter l'Arène ?"
      />

      <div className='fixed bottom-2 right-4 text-neutral-500 text-[10px] font-bold uppercase tracking-widest z-50 pointer-events-none'>
        v{APP_VERSION}
      </div>

      <div className='mt-20 opacity-5 text-[120px] font-black absolute -bottom-12 pointer-events-none select-none tracking-tighter text-white z-0'>
        SHASOZAM
      </div>
    </main>
  );
}
