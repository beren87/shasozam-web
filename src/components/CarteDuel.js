'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

const KeywordTooltip = ({ word, type, isZoomed, setHoveredKeyword }) => {
  const [show, setShow] = useState(false);
  const configs = {
    fatigue: {
      desc: 'Fatigue : Empêche le joueur ciblé de rejouer le MÊME type de Sceau au duel suivant.',
    },
    charmer: {
      desc: 'Charmer : À la fin du cycle du lanceur, la carte charmée transfère toute son Âme à la carte charmante.',
    },
    corruption: {
      desc: 'Corruption : À la fin du cycle du lanceur, toutes les cartes adjacentes à la cible perdent 1 Âme.',
    },
  };
  const conf = configs[type];

  // Sécurité au cas où un type n'existe pas dans config
  if (!conf) return <span>{word}</span>;

  return (
    <span
      // 👇 Plus de couleurs ni de stroke, juste le gras (font-black) et le curseur d'aide 👇
      className={`relative inline-block font-black cursor-help z-[350]`}>
      {word}
    </span>
  );
};

const ParsedText = ({ text, isZoomed, setHoveredKeyword, isBrut = false }) => {
  if (!text) return null;

  // ==========================================
  // 👇 ÉTAPE 4 & 5 : TA LISTE DE MOTS-CLÉS 👇
  // Remplace ces mots par ta vraie liste. N'oublie pas les guillemets et les virgules !
  // ==========================================
  const motsRouges = [
    'échangez',
    'Déplacez',
    'révèle',
    'détruisez',
    'déplacez-le',
    'Récupérez',
    'remettez-le',
    'Copiez',
    'perd',
    'Perdez',
    'Piochez',
    'gagne',
    'Défausse',
    'Bloquez-en',
    'bloqué',
    'mélange',
    'Défaussez',
    'révèle',
    'vole',
    'Gagnez',
    'pioche',
    'Choisissez-en',
    'défausser',
    'gagnez',
    'perdent',
    'Ne fait rien',
    'récupérez',
    'récupère',
    'redirigée',
    'redirigées',
    'Retirez',
    'ignoré',
    'donné',
    'infligez-le',
    'perdre',
    'gagnent',
    'ajoutez-la',
    'tombe',
    'infliger',
    'piocher',
    'défaussez',
    'Répétez',
    'déplacé',
    'détruit',
    'piochez',
    'mélangez',
    'placez-la',
    'Choisissez',
    'appliquez-le',
    'copiez',
    'révélé',
    'visibles',
  ];

  const motsTooltips = ['Fatigue', 'Charmer', 'Corruption'];
  const allKeywords = [...motsRouges, ...motsTooltips];
  // 👇 LA SOLUTION EST ICI : On trie les mots du plus long au plus court ! 👇
  allKeywords.sort((a, b) => b.length - a.length);
  const regexStr = `(${allKeywords.join('|')})`;
  const regex = new RegExp(regexStr, 'gi');

  let textToParse = text;
  let startAme = '';

  // LOGIQUE DE L'ÂME AMÉLIORÉE (Prend en compte tous les types de tirets et les points)
  if (isBrut) {
    // Cette formule attrape "+1 Âme", "-2 Âmes.", "–3 Âmes", etc.
    const matchStart = text.match(/^([+\-–—]\s*\d+\s*[âaAÂ]mes?[.,]?\s*)/i);
    if (matchStart) {
      startAme = matchStart[1];
      textToParse = text.substring(startAme.length);
    }
  }

  const parts = textToParse.split(regex);

  return (
    <>
      {/* Le -X Âmes du début en gras et Rouge Sang (#C91111) */}
      {startAme && <span className='font-bold text-[#C91111]'>{startAme}</span>}

      {parts.map((part, i) => {
        const match = part.toLowerCase();

        let typeTooltip = null;
        if (match === 'fatigue') typeTooltip = 'fatigue';
        else if (match === 'charmer') typeTooltip = 'charmer';
        else if (match === 'corruption') typeTooltip = 'corruption';
        // else if (match.startsWith('redirig') || match === 'redirection')
        // typeTooltip = 'redirection';

        if (typeTooltip) {
          return (
            <span key={i} className='text-[#C91111] font-bold'>
              <KeywordTooltip
                word={part}
                type={typeTooltip}
                isZoomed={isZoomed}
                setHoveredKeyword={setHoveredKeyword}
              />
            </span>
          );
        }

        // Si le mot fait partie de TA liste (motsRouges)
        const isMotRouge = motsRouges.some((m) => m.toLowerCase() === match);
        if (isMotRouge) {
          return (
            <span key={i} className='font-bold text-[#C91111]'>
              {part}
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// 👇 ÉTAPE 1 : LE COMPOSANT BULLE FIXE 👇
const InfoBubble = ({ side, top, text }) => {
  const isLeft = side === 'left';

  return (
    <div
      className={`absolute ${top} ${isLeft ? 'right-[105%]' : 'left-[105%]'} 
                  w-[220px] bg-[#F1F5F9] text-slate-900 text-[10px] font-bold leading-snug p-2 shadow-[0_0_15px_rgba(0,0,0,0.6)] font-sans pointer-events-none`}>
      {text}

      {/* La petite flèche directionnelle géométriquement parfaite */}
      {isLeft ? (
        <div className='absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[6px] border-l-[#F1F5F9]' />
      ) : (
        <div className='absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#F1F5F9]' />
      )}
    </div>
  );
};

export default function CarteDuel({ carte, onZoom, isZoomed = false }) {
  const [hoveredKeyword, setHoveredKeyword] = useState(false);

  // 👇 ÉTAPE 2 : On ajoute ça ! (Activé par défaut quand on zoome)
  const [showInfos, setShowInfos] = useState(true);

  const definitions = {
    essence: "Essence d'Âme : Valeur de combat lors du duel.",
    cycles:
      'Cycles de Duel : Gagnez +1 Âme stockée si jouée dans sa suite logique.',
    cout: 'Coût : Dépense requise pour invoquer cette carte.',
    effetBrut: "Effet Brut : S'applique à la révélation.",
    effetVictoire: "Effet de Victoire : S'active en cas de succès.",
  };

  const getTypeDesc = (type) => {
    const t = type.toLowerCase();
    if (t.includes('serviteur'))
      return 'Spécialiste de la manipulation des Sceaux.';
    if (t.includes('tentat'))
      return "Affecte la main et le mental de l'adversaire.";
    if (t.includes('aberration'))
      return "S'attaque directement à l'Essence adverse.";
    if (t.includes('gardien'))
      return 'Protecteurs capable de rediriger les dégâts.';
    if (t.includes('invocateur')) return 'Maîtres de la défausse.';
    if (t.includes('démon')) return "Puissance affectant toute l'Arène.";
    return 'Entité infernale.';
  };

  return (
    <motion.div
      layoutId={isZoomed ? `card-${carte.id}` : undefined}
      whileHover={!isZoomed ? { y: -10, scale: 1.05 } : {}}
      onClick={() => !isZoomed && onZoom(carte)}
      // 👇 IMPORTANT : J'ai retiré "overflow-hidden" de cette ligne pour que les bulles puissent sortir !
      className={`font-carte relative aspect-[2.5/3.5] w-full flex flex-col rounded-3xl transition-all mx-auto
        ${
          isZoomed
            ? 'max-w-[380px] z-[110] shadow-[0_0_50px_rgba(220,38,38,0.5)]'
            : 'max-w-[260px] cursor-pointer shadow-2xl'
        }`}>
      {/* ========================================== */}
      {/* LE SYSTÈME D'INFORMATIONS (Bouton + Bulles) */}
      {/* ========================================== */}
      {isZoomed && (
        <>
          {/* 1. LE BOUTON "i" (Fixe en haut à droite de la fenêtre) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowInfos(!showInfos);
            }}
            className='fixed top-8 right-8 w-10 h-10 rounded-full border-[3px] border-white/50 bg-black/80 text-white flex justify-center items-center font-serif text-xl italic cursor-pointer hover:bg-white/20 hover:border-white transition-all z-[9999] group'>
            i
            <span className='absolute -bottom-8 right-0 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-sans not-italic'>
              {showInfos
                ? 'Désactiver les informations'
                : 'Activer les informations'}
            </span>
          </div>
          {/* 2. LES BULLES D'INFO */}
          {showInfos && (
            <div className='absolute inset-0 z-[500]'>
              {/* Côté Gauche */}
              <InfoBubble side='left' top='top-[1%]' text='Nom de la carte.' />
              <InfoBubble side='left' top='top-[9%]' text='Type de la carte.' />
              <InfoBubble
                side='left'
                top='top-[70%]'
                text='Effet démoniaque brut, indiquant l’effet appliqué à la carte ciblée + effet supplémentaire.'
              />
              <InfoBubble
                side='left'
                top='top-[85%]'
                text='Effet de victoire immédiat ou persistant* lorsqu’un duel est remporté, déclenché uniquement au moment de la victoire
*Sont considérés comme effets démoniaques bruts persistants : Fatigue, Charmer et Corruption.'
              />

              {/* Côté Droit */}
              <InfoBubble
                side='right'
                top='top-[3%]'
                text='Puissance d’âme de la carte (de 1 à 6).'
              />
              <InfoBubble
                side='right'
                top='top-[16%]'
                text='Coût en jeton d’Âme, et/ou coût en Sceau démoniaque.'
              />
              <InfoBubble
                side='right'
                top='top-[55%]'
                text='Cycle de duel (1 à 5) : le joueur gagne +1 Âme si la carte est jouée dans son cycle 
(en rouge).'
              />
            </div>
          )}
        </>
      )}
      {/* ========================================== */}
      {/* LA CARTE EN ELLE-MÊME */}
      {/* ========================================== */}
      {/* 👇 On remet l'overflow-hidden ici pour que ta carte reste propre ! 👇 */}
      <div className='absolute inset-0 rounded-3xl overflow-hidden pointer-events-auto'></div>

      {/* ========================================== */}
      {/* COUCHE 1 : LE MONSTRE (Tout au fond)       */}
      {/* ========================================== */}
      {carte.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={carte.imageUrl}
          alt={carte.nom}
          className='absolute inset-0 w-full h-full object-cover z-0'
        />
      ) : (
        <div className='absolute inset-0 w-full h-full bg-neutral-900 z-0 flex items-center justify-center text-sm font-bold text-gray-600'>
          CONCEPT ART
        </div>
      )}

      {/* ========================================== */}
      {/* COUCHE 2 : LE CADRE (Le template transparent)*/}
      {/* ========================================== */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/cadre-carte.png'
        alt='Cadre de carte'
        className='absolute inset-0 w-full h-full object-fill z-10 pointer-events-none'
      />

      {/* ========================================== */}
      {/* COUCHE 3 : LES DONNÉES DE FIREBASE (Par dessus) */}
      {/* ========================================== */}
      <div className='absolute inset-0 z-20 pointer-events-auto'>
        {/* LA ZONE DU NOM */}
        <div className='absolute top-[1%] left-[4%] w-[70%] h-[8%] flex items-center'>
          <h3
            // 👇 J'ai retiré "truncate" et ajouté "pr-2" (padding-right) tout à la fin 👇
            className={`${
              isZoomed ? 'text-3xl texte-contour' : 'text-lg texte-contour-fin'
            } italic font-black uppercase text-white drop-shadow-lg tracking-tight underline decoration-[3px] underline-offset-[4px] pr-2`}>
            {carte.nom}
          </h3>
        </div>

        {/* LA ZONE DU TYPE DE MONSTRE */}
        <div className='absolute top-[9%] left-[4%] w-[70%] h-[5%] flex items-center justify-start cursor-help'>
          <p
            className={`${
              isZoomed ? 'text-sm' : 'text-xs' // 👈 C'est plus gros qu'avant !
            } text-[#FFDF10] italic uppercase font-bold tracking-wide texte-contour-fin drop-shadow-md`}>
            {carte.type}
          </p>
        </div>

        {/* LA ZONE DE L'ÂME */}
        <div
          // On agrandit un peu la zone (w-[25%] h-[15%]) pour accueillir le chiffre géant, et on ajoute z-30 pour qu'il passe au-dessus du reste
          className='absolute top-[1%] right-[1%] w-[25%] h-[15%] flex items-center justify-center cursor-help z-30'>
          <span
            // 👇 TAILLE GÉANTE, CONTOUR NOIR, POLICE SANS-SERIF ET AURA LUMINEUSE JAUNE 👇
            className={`${
              isZoomed
                ? 'text-[70px] texte-contour'
                : 'text-[40px] texte-contour-fin'
            } font-black font-sans text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]`}>
            {carte.ame}
          </span>
        </div>

        {/* LA ZONE DES CYCLES (Avec liaison et grosse aura) */}
        {/* J'ai retiré le "gap" ici car les traits de liaison font maintenant office d'espacement ! */}
        <div
          className={`absolute top-[58%] left-[25%] w-[50%] h-[8%] flex justify-center items-center z-30`}>
          {[1, 2, 3, 4, 5].map((cycle, index) => {
            // On vérifie si le cycle actuel est engagé (rouge)
            const isActif = carte.cycles?.includes(cycle);
            // On vérifie si le cycle d'APRÈS est engagé aussi
            const isNextActif = carte.cycles?.includes(cycle + 1);

            return (
              <div key={cycle} className='flex items-center'>
                {/* 1. LE CERCLE DU CYCLE */}
                <div
                  className={`shrink-0 ${
                    isZoomed ? 'w-10 h-10 text-base' : 'w-6 h-6 text-[10px]'
                  } rounded-full flex items-center justify-center font-bold font-sans transition-all 
                  ${
                    isActif
                      ? 'bg-red-600 text-white shadow-[0_0_25px_8px_rgba(220,38,38,0.7)] border border-red-400'
                      : 'bg-neutral-800/80 text-neutral-500'
                  } texte-contour-fin`}>
                  {cycle === 1
                    ? 'I'
                    : cycle === 2
                    ? 'II'
                    : cycle === 3
                    ? 'III'
                    : cycle === 4
                    ? 'IV'
                    : 'V'}
                </div>

                {/* 2. LE TRAIT DE LIAISON (On ne l'affiche pas après le 5ème cycle) */}
                {index < 4 && (
                  <div
                    // La largeur du trait change avec le zoom pour remplacer tes anciens gap-9 / gap-7
                    className={`h-1.5 transition-all ${
                      isZoomed ? 'w-9' : 'w-7'
                    } 
                    ${
                      isActif && isNextActif
                        ? 'bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]' // Trait allumé
                        : 'bg-neutral-800/80' // Trait éteint
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* LA ZONE DES COÛTS (Empilement vertical à droite) */}
        <div className='absolute top-[16%] right-[5%] w-[25%] flex flex-col items-end gap-1 z-30'>
          {/* 1. Coût en Âme (si présent) */}
          {carte.cout_ame > 0 && (
            <div
              className={`px-1 rounded-lg flex items-center ${
                isZoomed ? 'gap-2' : 'gap-1'
              }`}>
              {/* 👇 On utilise texte-contour et texte-contour-fin ici ! 👇 */}
              <span
                className={`${
                  isZoomed
                    ? 'text-[35px] texte-contour'
                    : 'text-lg texte-contour-fin'
                } font-black text-white font-sans tracking-wider`}>
                +{carte.cout_ame}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src='/symbole-ame.png'
                alt='Coût Âme'
                className={`${
                  isZoomed ? 'w-10 h-10' : 'w-5 h-5'
                } object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]`}
              />
            </div>
          )}

          {/* 2. Liste des Coûts en Sceaux (un par ligne) */}
          {carte.couts_sceaux?.map((cout, index) => (
            <div
              key={index}
              className={`px-1 rounded-lg flex items-center ${
                isZoomed ? 'gap-2' : 'gap-1'
              }`}>
              {/* 👇 Et on utilise texte-contour et texte-contour-fin ici aussi ! 👇 */}
              <span
                className={`${
                  isZoomed
                    ? 'text-[35px] texte-contour'
                    : 'text-lg texte-contour-fin'
                } font-black text-white font-sans tracking-wider`}>
                +{cout.qte}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  cout.type === 'Hostile'
                    ? '/sceau-hostile.png'
                    : cout.type === 'Précurseur'
                    ? '/sceau-precurseur.png'
                    : '/sceau-ancestral.png'
                }
                alt={cout.type}
                className={`${
                  isZoomed ? 'w-10 h-10' : 'w-5 h-5'
                } object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]`}
              />
            </div>
          ))}
        </div>
        {/* ========================================== */}
        {/* LA ZONE DES EFFETS (Agrandie et Gris Clair) */}
        {/* ========================================== */}
        <div
          // 1. TAILLE : Plus large (w-90%), plus haut (h-29%) et remonté un peu (top-68%)
          // 2. FOND : bg-slate-200/90 (un gris clair légèrement transparent)
          className={`absolute top-[68%] left-[5%] w-[90%] h-[29%] bg-slate-200/90 backdrop-blur-md border border-white/50 rounded-xl flex flex-col justify-center px-3 z-30 shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${
            isZoomed ? 'gap-2 py-2' : 'gap-1 py-1'
          }`}>
          {/* 1. EFFET BRUT */}
          <div className='flex items-center w-full h-1/2 cursor-help'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/symbole-effet-brut.png'
              alt='Effet Brut'
              // Images légèrement agrandies
              className={`shrink-0 object-contain drop-shadow-md ${
                isZoomed ? 'w-9 h-9 mr-3' : 'w-6 h-6 mr-1.5'
              }`}
            />
            <div
              // 3. TEXTE : text-slate-900 (gris très foncé) au lieu de text-white, et font-medium pour la lisibilité
              className={`flex-1 text-center text-slate-900 font-medium ${
                isZoomed ? 'text-xs leading-snug' : 'text-[9px] leading-tight'
              }`}>
              <ParsedText
                text={carte.effetBrut}
                isZoomed={isZoomed}
                setHoveredKeyword={setHoveredKeyword}
                isBrut={true}
              />
            </div>
          </div>

          {/* LE SÉPARATEUR DE CLASSE (Devenu sombre) */}
          <div className='w-[85%] h-[1px] bg-slate-400 mx-auto shrink-0 rounded-full' />

          {/* 2. EFFET DE VICTOIRE */}
          <div className='flex items-center w-full h-1/2 cursor-help'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/symbole-victoire.png'
              alt='Victoire'
              className={`shrink-0 object-contain drop-shadow-md ${
                isZoomed ? 'w-9 h-9 mr-3' : 'w-6 h-6 mr-1.5'
              }`}
            />
            <div
              className={`flex-1 text-center text-slate-900 font-medium ${
                isZoomed ? 'text-xs leading-snug' : 'text-[9px] leading-tight'
              }`}>
              <ParsedText
                text={carte.effetVictoire}
                isZoomed={isZoomed}
                setHoveredKeyword={setHoveredKeyword}
                isBrut={false}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
