'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RulesPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [sectionOuverte, setSectionOuverte] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) setChargement(false);
      else router.push('/');
    });
  }, [router]);

  const toggleSection = (id) => {
    setSectionOuverte(sectionOuverte === id ? null : id);
  };

  const REGLES = [
    {
      id: 'objectif-contenu',
      titre: 'Objectif & Contenu du jeu',
      icone: '🎯',
      contenu: (
        <div className='space-y-6 text-sm text-gray-300 leading-relaxed'>
          <div>
            <h3 className='text-red-400 font-black uppercase mb-2'>
              Objectif du jeu
            </h3>
            <p>
              Le Royaume de l&apos;Enfer est à court d&apos;âmes et en réclame
              toujours davantage pour renforcer les Seigneurs Infernaux. Pour
              répondre à cet appel, les Souverains Infernaux unissent les
              créatures démoniaques les plus redoutables, chacune renfermant en
              elle des âmes convoitées.
            </p>
            <p className='mt-2 text-white font-bold'>
              Leur mission est simple : s&apos;affronter en duel, dominer et
              récolter le plus d&apos;âmes possible pour asseoir leur pouvoir
              sur les Royaumes Infernaux.
            </p>
          </div>
          <hr className='border-neutral-700' />
          <div>
            <h3 className='text-red-400 font-black uppercase mb-4'>
              Contenu du jeu
            </h3>
            <ul className='space-y-4'>
              <li>
                <strong className='text-white'>🔱 1. Cartes Objectifs :</strong>{' '}
                Elles offrent la possibilité de gagner des Âmes supplémentaires
                lorsque les objectifs sont remplis.
              </li>
              <li>
                <strong className='text-white'>🔥 2. Cartes Pacte :</strong>{' '}
                Déterminent la limite de Sceaux démoniaques (Face Lucifer :
                Généreux / Face Satan : Restreint). Le Jeton de Pacte est lancé
                pile ou face en début de manche.
              </li>
              <li>
                <strong className='text-white'>⚔️ 3. Cartes de Duel :</strong>{' '}
                Utilisées pour les affrontements. Elles comportent :
                <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-400'>
                  <li>Une valeur d&apos;Âme (1 à 6) et/ou un coût.</li>
                  <li>Un cycle de duel (1 à 5) pour les bonus en série.</li>
                  <li>Un effet démoniaque brut et un effet de victoire.</li>
                </ul>
              </li>
              <li>
                <strong className='text-white'>
                  🧿 4. Jetons Compteurs d&apos;Âme :
                </strong>{' '}
                Ajustent les valeurs d&apos;Âme.
              </li>
              <li>
                <strong className='text-white'>
                  🥏 5. Jetons de Sceaux démoniaques :
                </strong>{' '}
                Marqueur de ciblage caché.
                <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-400'>
                  <li>
                    <strong className='text-red-300'>Hostile :</strong> Cible la
                    carte adverse.
                  </li>
                  <li>
                    <strong className='text-yellow-300'>Précurseur :</strong>{' '}
                    Cible votre prochaine carte.
                  </li>
                  <li>
                    <strong className='text-purple-300'>Ancestral :</strong>{' '}
                    Cible votre carte précédente.
                  </li>
                </ul>
              </li>
              <li>
                <strong className='text-white'>
                  🟡 6. Jetons de Sacrifice :
                </strong>{' '}
                Limité à 1 par manche pour changer sa main.
              </li>
              <li>
                <strong className='text-white'>
                  ⭕ 7. Jetons de Blocage & Persistance :
                </strong>{' '}
                Indiquent des états spécifiques sur le terrain.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'deroulement-manche',
      titre: "Déroulement d'une manche",
      icone: '🌀',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <p className='font-bold text-white mb-4'>
            Une manche comporte 5 duels. Avant de commencer :
          </p>
          <ul className='space-y-4'>
            <li>
              <strong className='text-red-400'>
                1️⃣ Distribution des Souverains :
              </strong>{' '}
              Chaque joueur pioche une carte Souverain Infernal au hasard qui
              l&apos;accompagne toute la manche.
            </li>
            <li>
              <strong className='text-red-400'>
                2️⃣ Préparation des pioches :
              </strong>{' '}
              Pioche identique de 60 cartes. Mélangez, coupez l&apos;adversaire,
              et piochez 5 cartes en main.
            </li>
            <li>
              <strong className='text-red-400'>3️⃣ Pacte des Seigneurs :</strong>{' '}
              Un joueur lance le Jeton de Pacte. On choisit une carte à
              l&apos;aveugle avec la bonne face pour constituer sa réserve de
              Sceaux démoniaques (ex: 4 Hostiles, 3 Précurseurs, etc.).
            </li>
          </ul>
          <p className='mt-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700'>
            Chaque joueur reçoit également 1 jeton Sacrifice et 1 Jeton
            d&apos;Âme en début de manche. Le Jeton de Pacte détermine la
            priorité au tout premier duel.
          </p>
        </div>
      ),
    },
    {
      id: 'deroulement-duel',
      titre: "Déroulement d'un duel (Phases)",
      icone: '⚔️',
      contenu: (
        <div className='space-y-6 text-sm text-gray-300 leading-relaxed'>
          <div>
            <h4 className='text-white font-bold'>Phase 1 — Placement</h4>
            <p>
              Le joueur place une carte face cachée et choisit un Sceau
              démoniaque placé devant.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>Phase 2 — Révélation</h4>
            <p>Révélation simultanée des Sceaux puis des Cartes.</p>
          </div>
          <div>
            <h4 className='text-white font-bold'>
              Phase 3 — Application des effets
            </h4>
            <p>
              Le joueur ayant la{' '}
              <strong className='text-red-400'>priorité</strong> (celui qui a
              gagné le duel/la manche précédente) résout son Sceau en premier.
              Bonus de compensation : au tout 1er duel de la partie, le joueur
              sans priorité gagne +1 Âme.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>
              Phase 4 — Bataille d&apos;Âme
            </h4>
            <p>
              On compare l&apos;Âme totale. La plus haute remporte le duel et
              gagne 1 jeton d&apos;Âme. En cas d&apos;égalité : aucun gagnant,
              la priorité reste au même joueur.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>Phase 5 — Duel remporté</h4>
            <p>
              Le gagnant applique obligatoirement et immédiatement son effet de
              Victoire, ou le perd.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>Phase 6 — Fin du duel</h4>
            <p>
              On vérifie les objectifs, chaque joueur pioche 1 carte, et le duel
              suivant commence.
            </p>
          </div>
          <div className='p-4 bg-red-950/30 border border-red-900/50 rounded-xl'>
            <h4 className='text-red-400 font-bold mb-2'>
              Phases 7, 8 & 9 — Fin de Manche
            </h4>
            <p>
              Au 5ème duel, on additionne toutes les Âmes (cartes alignées,
              duels remportés, bonus sacrifice, cycles, objectifs). Le vainqueur
              gagne 1 Jeton de Victoire. En cas d&apos;égalité absolue, on lance
              le Jeton de Pacte. Toutes les cartes jouées vont à la défausse.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sceaux-demoniaques',
      titre: 'Règles : Sceaux Démoniaques',
      icone: '📜',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <p>
            Le Sceau n&apos;est qu&apos;un{' '}
            <strong className='text-white'>marqueur de ciblage</strong>.
            L&apos;effet vient toujours de la carte !
          </p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Un Sceau obligatoire doit être révélé à chaque duel.</li>
            <li>
              Si un Sceau est déplacé, son effet d&apos;origine ne se réactive
              pas. Il ne fait que changer la cible d&apos;un éventuel effet
              persistant.
            </li>
            <li>
              Détruire un Sceau n&apos;annule pas un effet brut déjà appliqué.
            </li>
            <li>
              Un Sceau Précurseur met un jeton &quot;en attente&quot; sur la
              prochaine carte. L&apos;effet se déclenchera à la révélation de
              celle-ci.
            </li>
            <li>
              <strong>Rupture de Sceaux :</strong> Si vous n&apos;avez plus de
              Sceaux, vous devez jouer votre carte sans Sceau (elle participera
              à la Bataille d&apos;Âme mais n&apos;aura pas d&apos;effet brut).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cycles-blocages',
      titre: 'Cycles et Cartes Bloquées',
      icone: '🔘',
      contenu: (
        <div className='space-y-6 text-sm text-gray-300 leading-relaxed'>
          <div>
            <h4 className='text-white font-bold'>Bonus de Cycle en Série</h4>
            <p>
              Si une carte est jouée dans sa suite continue (ex: I-II-III),
              gagnez 1 Âme stockée dans votre réserve personnelle à la fin du
              cycle.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>Cartes hors-cycle</h4>
            <p>
              Jouer hors-cycle est risqué mais autorisé ! La carte participe au
              duel, mais son effet démoniaque ou de victoire peut échouer si les
              conditions ne sont pas réunies. Aucun bonus de série ne sera
              accordé.
            </p>
          </div>
          <div>
            <h4 className='text-red-400 font-bold'>
              Impossibilité de jouer / Carte Bloquée
            </h4>
            <p>
              Si aucune carte de la main n&apos;est payable (Âme/Sceaux
              insuffisants) et le Sacrifice utilisé, le joueur prouve sa main,
              et ne joue rien (0 Âme). L&apos;adversaire gagne automatiquement
              le duel.
            </p>
            <p className='mt-2'>
              Une carte bloquée par l&apos;adversaire est mise de côté 1 tour.
              Un &quot;Effet Bloqué&quot; annule l&apos;effet brut de la carte,
              mais elle participe quand même à la Bataille d&apos;Âme.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'effets-cartes',
      titre: 'Effets des Cartes (Fatigue, Charmer...)',
      icone: '🃏',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <ul className='space-y-4'>
            <li>
              <strong className='text-purple-400'>💤 Fatigue :</strong> Empêche
              le joueur ciblé de rejouer le MÊME type de Sceau au duel suivant.
            </li>
            <li>
              <strong className='text-pink-400'>❤️‍🔥 Charmer :</strong> À la fin
              du cycle du lanceur, la carte charmée transfère toute son Âme à la
              carte charmante.
            </li>
            <li>
              <strong className='text-green-400'>🦠 Corruption :</strong> À la
              fin du cycle du lanceur, toutes les cartes adjacentes à la carte
              corrompue perdent 1 Âme.
            </li>
            <li>
              <strong className='text-yellow-400'>
                🛡️ Redirection (Gardiens) :
              </strong>{' '}
              Les Gardiens peuvent absorber les pertes d&apos;Âmes causées par
              l&apos;adversaire (pas les auto-malus). La redirection la plus
              récente est prioritaire.
            </li>
          </ul>
          <p className='italic text-gray-400 border-l-2 border-neutral-600 pl-4'>
            Limite : Un joueur ne peut appliquer qu&apos;un seul effet
            démoniaque brut persistant PAR TYPE pendant une manche (ex: 1 seul
            Charmer actif à la fois).
          </p>
        </div>
      ),
    },
    {
      id: 'gestion-ame',
      titre: "L'Âme : Gestion et Coûts",
      icone: '👛',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <p>
            L&apos;Âme est la valeur de combat, mais aussi une monnaie
            d&apos;invocation.
          </p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>
              <strong className='text-white'>Limite Minimale :</strong> Une
              carte ne descend jamais sous 0 Âme. On ne peut pas voler de
              l&apos;Âme à une carte qui est à 0.
            </li>
            <li>
              <strong className='text-white'>Gardiens (4 Âmes) :</strong> Coût
              d&apos;invocation = 2 jetons d&apos;Âme.
            </li>
            <li>
              <strong className='text-white'>Invocateurs (5 Âmes) :</strong>{' '}
              Coût d&apos;invocation = 1 Sceau spécifique défaussé.
            </li>
            <li>
              <strong className='text-white'>Démons (6 Âmes) :</strong> Coût
              d&apos;invocation = 1 ou 2 Sceaux + 2 jetons d&apos;Âme.
            </li>
          </ul>
          <p className='text-red-400 font-bold mt-2'>
            Attention : Si vous ne pouvez pas payer lors de la révélation, la
            carte devient invalide (0 Âme).
          </p>
        </div>
      ),
    },
    {
      id: 'sacrifice-defausse',
      titre: 'Le Sacrifice & La Défausse',
      icone: '🪦',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <div>
            <h4 className='text-white font-bold'>
              Le Jeton Sacrifice (1 par manche)
            </h4>
            <p>
              Permet de défausser 1 carte de sa main pour en piocher 3 (on en
              garde 1). Ne peut pas être utilisé en réaction à un effet.
              S&apos;il n&apos;est pas utilisé de la manche, il rapporte{' '}
              <strong className='text-green-400'>+1 Âme</strong> au décompte
              final.
            </p>
          </div>
          <div>
            <h4 className='text-white font-bold'>La Défausse</h4>
            <p>
              Les cartes jouées lors des duels restent sur la table. Elles ne
              vont dans la défausse qu&apos;à la fin de la manche, ou si elles
              sont détruites. Si une défausse est &quot;détruite&quot; par un
              effet, elle est remélangée sous la pioche.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'souverains',
      titre: 'Les Souverains Infernaux',
      icone: '👑',
      contenu: (
        <div className='space-y-4 text-sm text-gray-300 leading-relaxed'>
          <p>
            Chaque joueur est lié à un Souverain différent à chaque manche, qui
            propose 4 objectifs spécifiques (ex: Ne pas défausser, remporter un
            duel sans modifier l&apos;Âme).
          </p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Accomplir un objectif donne un gain immédiat d&apos;Âme.</li>
            <li>Chaque objectif ne peut être validé qu&apos;une seule fois.</li>
            <li>Ne pas réussir n&apos;entraîne aucun malus.</li>
            <li>
              <strong className='text-yellow-400'>Maîtrise :</strong> Accomplir
              les 4 objectifs octroie un bonus supplémentaire de +3 Âmes à la
              fin de la manche.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <main className='min-h-screen bg-neutral-900 text-gray-100 p-4 md:p-12 flex flex-col items-center relative overflow-hidden'>
      {/* HEADER */}
      <div className='w-full max-w-4xl flex justify-between items-center mb-12 z-10 bg-neutral-800 p-4 rounded-2xl border border-neutral-600 shadow-xl'>
        <button
          onClick={() => router.push('/home')}
          className='group text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 uppercase text-xs font-black tracking-widest'>
          <span className='group-hover:-translate-x-1 transition-transform'>
            ⬅
          </span>{' '}
          Retour au Hub
        </button>
        <div className='text-red-500 font-black uppercase tracking-widest text-sm flex items-center gap-2'>
          <span>📜</span> Édition Standard
        </div>
      </div>

      {/* TITRE PRINCIPAL */}
      <div className='text-center mb-12 z-10'>
        <h1 className='text-4xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none'>
          Le <span className='text-red-600'>Règlement</span>
        </h1>
        <p className='text-gray-300 italic text-sm md:text-base max-w-xl mx-auto'>
          L&apos;ignorance est le premier pas vers la damnation. Étudiez les
          lois de l&apos;Arène avant de verser le premier sang.
        </p>
      </div>

      {/* L'ACCORDÉON DES RÈGLES */}
      <div className='w-full max-w-4xl z-10 flex flex-col gap-4 mb-20'>
        {REGLES.map((regle) => (
          <div
            key={regle.id}
            className='bg-neutral-800 border border-neutral-600 rounded-2xl overflow-hidden shadow-lg'>
            {/* L'Entête cliquable */}
            <div
              onClick={() => toggleSection(regle.id)}
              className='p-6 flex items-center justify-between cursor-pointer hover:bg-neutral-700 transition-colors'>
              <div className='flex items-center gap-4'>
                <span className='text-3xl'>{regle.icone}</span>
                <h2 className='text-lg md:text-xl font-black uppercase tracking-widest text-white'>
                  {regle.titre}
                </h2>
              </div>
              <div
                className={`text-red-500 text-xl font-bold transition-transform duration-300 ${
                  sectionOuverte === regle.id ? 'rotate-180' : ''
                }`}>
                ▼
              </div>
            </div>

            {/* Le Contenu déroulant */}
            <AnimatePresence>
              {sectionOuverte === regle.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='overflow-hidden'>
                  <div className='p-6 bg-neutral-900 border-t border-neutral-700 shadow-inner'>
                    {regle.contenu}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* DECORATION FOND */}
      <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-white/[0.02] pointer-events-none select-none uppercase tracking-tighter z-0 w-full text-center'>
        CODEX
      </div>
    </main>
  );
}
