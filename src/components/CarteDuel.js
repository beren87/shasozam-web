'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  if (!conf) return <span>{word}</span>;

  return (
    <span
      className='relative inline-block font-black cursor-help z-[350]'
      onMouseEnter={() => isZoomed && (setShow(true), setHoveredKeyword(true))}
      onMouseLeave={() =>
        isZoomed && (setShow(false), setHoveredKeyword(false))
      }>
      {word}
      <AnimatePresence>
        {show && <Tooltip texte={conf.desc} customZ='z-[400]' />}
      </AnimatePresence>
    </span>
  );
};

const ParsedText = ({ text, isZoomed, setHoveredKeyword, isBrut = false }) => {
  if (!text) return null;

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
  allKeywords.sort((a, b) => b.length - a.length);

  const regexStr = `(${allKeywords.join('|')})`;
  const regex = new RegExp(regexStr, 'gi');

  let textToParse = text;
  let startAme = '';

  if (isBrut) {
    const matchStart = text.match(/^([+\-–—]\s*\d+\s*[âaAÂ]mes?[.,]?\s*)/i);
    if (matchStart) {
      startAme = matchStart[1];
      textToParse = text.substring(startAme.length);
    }
  }

  const parts = textToParse.split(regex);

  return (
    <>
      {startAme && <span className='font-bold text-[#C91111]'>{startAme}</span>}
      {parts.map((part, i) => {
        const match = part.toLowerCase();
        let typeTooltip = null;
        if (match === 'fatigue') typeTooltip = 'fatigue';
        else if (match === 'charmer') typeTooltip = 'charmer';
        else if (match === 'corruption') typeTooltip = 'corruption';

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

const InfoBubble = ({ side, top, text }) => {
  const isLeft = side === 'left';
  return (
    <div
      className={`absolute ${top} ${
        isLeft ? 'right-[105%]' : 'left-[105%]'
      } w-[220px] bg-[#F1F5F9] text-slate-900 text-[10px] font-bold leading-snug p-2 shadow-[0_0_15px_rgba(0,0,0,0.6)] font-sans pointer-events-none`}>
      {text}
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
  const [showInfos, setShowInfos] = useState(true);

  return (
    <motion.div
      layoutId={isZoomed ? `card-${carte.id}` : undefined}
      whileHover={!isZoomed ? { y: -10, scale: 1.05 } : {}}
      onClick={() => !isZoomed && onZoom(carte)}
      className={`font-carte relative aspect-[2.5/3.5] w-full flex flex-col rounded-3xl transition-all mx-auto ${
        isZoomed
          ? 'max-w-[380px] z-[110] shadow-[0_0_50px_rgba(220,38,38,0.5)]'
          : 'max-w-[260px] cursor-pointer shadow-2xl'
      }`}>
      {isZoomed && (
        <>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowInfos(!showInfos);
            }}
            className='hidden md:flex absolute -top-5 -right-5 w-10 h-10 rounded-full border-[3px] border-white/50 bg-black/80 text-white justify-center items-center font-serif text-xl italic cursor-pointer hover:bg-white/20 hover:border-white transition-all z-[9999] group shadow-[0_0_10px_rgba(0,0,0,0.5)]'>
            i
            <span className='absolute -bottom-8 right-0 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-sans not-italic'>
              {showInfos
                ? 'Désactiver les informations'
                : 'Activer les informations'}
            </span>
          </div>

          {showInfos && (
            <div className='hidden md:block absolute inset-0 z-[500]'>
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
                text={
                  <span className='flex flex-col gap-1'>
                    <span>
                      Effet de victoire immédiat ou persistant* lorsqu’un duel
                      est remporté, déclenché uniquement au moment de la
                      victoire.
                    </span>
                    <span className='text-[8px] italic font-normal text-slate-500 leading-tight'>
                      *Sont considérés comme effets démoniaques bruts
                      persistants : Fatigue, Charmer et Corruption.
                    </span>
                  </span>
                }
              />
              <InfoBubble
                side='right'
                top='top-[3%]'
                text='Âme : Puissance de la carte.'
              />
              {carte.type &&
                !carte.type.toLowerCase().includes('serviteur') &&
                !carte.type.toLowerCase().includes('tentat') &&
                !carte.type.toLowerCase().includes('aberration') && (
                  <InfoBubble
                    side='right'
                    top='top-[16%]'
                    text='Coût en jeton d’Âme et/ou Sceau.'
                  />
                )}
              <InfoBubble
                side='right'
                top='top-[55%]'
                text='Cycle de duel (1 à 5) : gagne +1 Âme si respecté.'
              />
            </div>
          )}
        </>
      )}

      <div className='absolute inset-0 rounded-3xl overflow-hidden pointer-events-auto'>
        {carte.imageUrl ? (
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

        <img
          src='/cadre-carte.png'
          alt='Cadre de carte'
          className='absolute inset-0 w-full h-full object-fill z-10 pointer-events-none'
        />

        <div className='absolute inset-0 z-20 pointer-events-auto'>
          <div className='absolute top-[1%] left-[4%] w-[70%] h-[8%] flex items-center'>
            <h3
              className={`${
                isZoomed
                  ? 'text-3xl texte-contour'
                  : 'text-lg texte-contour-fin'
              } italic font-black uppercase text-white drop-shadow-lg tracking-tight underline decoration-[3px] underline-offset-[4px] pr-2`}>
              {carte.nom}
            </h3>
          </div>

          <div className='absolute top-[9%] left-[4%] w-[70%] h-[5%] flex items-center justify-start'>
            <p
              className={`${
                isZoomed ? 'text-sm' : 'text-xs'
              } text-[#FFDF10] italic uppercase font-bold tracking-wide texte-contour-fin drop-shadow-md`}>
              {carte.type}
            </p>
          </div>

          <div className='absolute top-[1%] right-[1%] w-[25%] h-[15%] flex items-center justify-center z-30'>
            <span
              className={`${
                isZoomed
                  ? 'text-[70px] texte-contour'
                  : 'text-[40px] texte-contour-fin'
              } font-black font-sans text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]`}>
              {carte.ame}
            </span>
          </div>

          <div
            className={`absolute top-[58%] left-[25%] w-[50%] h-[8%] flex justify-center items-center z-30`}>
            {[1, 2, 3, 4, 5].map((cycle, index) => {
              const isStandard = carte.cycles?.includes(cycle);
              const isAnge = carte.cyclesAnge?.includes(cycle);
              const isDemon = carte.cyclesDemon?.includes(cycle);
              const isActif = isStandard || isAnge || isDemon;

              const isNextStandard = carte.cycles?.includes(cycle + 1);
              const isNextAnge = carte.cyclesAnge?.includes(cycle + 1);
              const isNextDemon = carte.cyclesDemon?.includes(cycle + 1);
              const isNextActif = isNextStandard || isNextAnge || isNextDemon;

              const isLineAnge = isAnge && isNextAnge;
              const isLineDemon = isDemon && isNextDemon;

              const isFirstLineAnge =
                isLineAnge && !carte.cyclesAnge?.includes(cycle - 1);
              const isFirstLineDemon =
                isLineDemon && !carte.cyclesDemon?.includes(cycle - 1);
              const isStandaloneAnge =
                isAnge && !isNextAnge && !carte.cyclesAnge?.includes(cycle - 1);
              const isStandaloneDemon =
                isDemon &&
                !isNextDemon &&
                !carte.cyclesDemon?.includes(cycle - 1);

              let wrapperClasses = 'p-[2px] rounded-full transition-all ';
              let shadowClasses = '';
              if (isAnge && isDemon) {
                wrapperClasses +=
                  'bg-gradient-to-r from-[#92FFFF] to-[#CF81FF]';
                shadowClasses =
                  'shadow-[-6px_0_12px_rgba(146,255,255,0.7),6px_0_12px_rgba(207,129,255,0.7)]';
              } else if (isAnge) {
                wrapperClasses += 'bg-[#92FFFF]';
                shadowClasses = 'shadow-[0_0_12px_rgba(146,255,255,0.7)]';
              } else if (isDemon) {
                wrapperClasses += 'bg-[#CF81FF]';
                shadowClasses = 'shadow-[0_0_12px_rgba(207,129,255,0.7)]';
              } else if (isActif) {
                wrapperClasses += 'bg-red-500';
                shadowClasses = 'shadow-[0_0_12px_rgba(220,38,38,0.7)]';
              } else {
                wrapperClasses +=
                  'bg-neutral-800 border border-neutral-700/50 p-0';
              }

              let lineClasses = `h-1.5 transition-all ${
                isZoomed ? 'w-9' : 'w-7'
              } relative `;
              if (isLineAnge && isLineDemon) {
                lineClasses +=
                  'bg-gradient-to-r from-[#92FFFF] to-[#CF81FF] shadow-[0_0_8px_rgba(207,129,255,0.7)]';
              } else if (isLineAnge) {
                lineClasses +=
                  'bg-[#92FFFF] shadow-[0_0_8px_rgba(146,255,255,0.7)]';
              } else if (isLineDemon) {
                lineClasses +=
                  'bg-[#CF81FF] shadow-[0_0_8px_rgba(207,129,255,0.7)]';
              } else if (isActif && isNextActif) {
                lineClasses +=
                  'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.7)]';
              } else {
                lineClasses += 'bg-neutral-800/80';
              }

              return (
                <div key={cycle} className='flex items-center'>
                  <div className='relative flex items-center justify-center'>
                    {isStandaloneAnge && (
                      <span
                        className={`absolute ${
                          isZoomed ? '-top-6 text-[10px]' : '-top-4 text-[7px]'
                        } text-[#92FFFF] font-black uppercase tracking-wider drop-shadow-[0_0_5px_rgba(146,255,255,0.8)] texte-contour-fin z-40`}>
                        Ange
                      </span>
                    )}
                    {isStandaloneDemon && (
                      <span
                        className={`absolute ${
                          isZoomed
                            ? '-bottom-6 text-[10px]'
                            : '-bottom-4 text-[7px]'
                        } text-[#CF81FF] font-black uppercase tracking-wider drop-shadow-[0_0_5px_rgba(207,129,255,0.8)] texte-contour-fin z-40`}>
                        Démon
                      </span>
                    )}

                    <div className={`${wrapperClasses} ${shadowClasses}`}>
                      <div
                        className={`shrink-0 ${
                          isZoomed
                            ? 'w-10 h-10 text-base'
                            : 'w-6 h-6 text-[9px]'
                        } rounded-full flex items-center justify-center font-bold font-sans ${
                          isActif
                            ? 'bg-[#A80000] text-white border border-black/50'
                            : 'bg-neutral-900 text-neutral-600'
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
                    </div>
                  </div>

                  {index < 4 && (
                    <div className={lineClasses}>
                      {isFirstLineAnge && (
                        <span
                          className={`absolute ${
                            isZoomed
                              ? '-top-5 text-[10px]'
                              : '-top-4 text-[7px]'
                          } left-1/2 -translate-x-1/2 text-[#92FFFF] font-black uppercase tracking-wider drop-shadow-[0_0_5px_rgba(146,255,255,0.8)] texte-contour-fin z-40`}>
                          Ange
                        </span>
                      )}
                      {isFirstLineDemon && (
                        <span
                          className={`absolute ${
                            isZoomed
                              ? isLineAnge
                                ? '-bottom-5'
                                : '-top-5'
                              : isLineAnge
                              ? '-bottom-4'
                              : '-top-4'
                          } ${
                            isZoomed ? 'text-[10px]' : 'text-[7px]'
                          } left-1/2 -translate-x-1/2 text-[#CF81FF] font-black uppercase tracking-wider drop-shadow-[0_0_5px_rgba(207,129,255,0.8)] texte-contour-fin z-40`}>
                          Démon
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='absolute top-[16%] right-[5%] w-[25%] flex flex-col items-end gap-1 z-30'>
            {carte.cout_ame > 0 && (
              <div
                className={`px-1 rounded-lg flex items-center ${
                  isZoomed ? 'gap-2' : 'gap-1'
                }`}>
                <span
                  className={`${
                    isZoomed
                      ? 'text-[35px] texte-contour'
                      : 'text-lg texte-contour-fin'
                  } font-black text-white font-sans`}>
                  +{carte.cout_ame}
                </span>
                <img
                  src='/symbole-ame.png'
                  alt='Coût Âme'
                  className={`${
                    isZoomed ? 'w-10 h-10' : 'w-5 h-5'
                  } object-contain`}
                />
              </div>
            )}
            {carte.couts_sceaux?.map((cout, index) => (
              <div
                key={index}
                className={`px-1 rounded-lg flex items-center ${
                  isZoomed ? 'gap-2' : 'gap-1'
                }`}>
                <span
                  className={`${
                    isZoomed
                      ? 'text-[35px] texte-contour'
                      : 'text-lg texte-contour-fin'
                  } font-black text-white font-sans`}>
                  +{cout.qte}
                </span>
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
                  } object-contain`}
                />
              </div>
            ))}
          </div>

          <div
            className={`absolute top-[68%] left-[5%] w-[90%] h-[29%] bg-slate-200/90 backdrop-blur-md border border-white/50 rounded-xl flex flex-col justify-center px-3 z-30 shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${
              isZoomed ? 'gap-2 py-2' : 'gap-1 py-1'
            }`}>
            <div className='flex items-center w-full h-1/2 cursor-help'>
              <img
                src='/symbole-effet-brut.png'
                alt='Effet Brut'
                className={`shrink-0 object-contain ${
                  isZoomed ? 'w-9 h-9 mr-3' : 'w-6 h-6 mr-1.5'
                }`}
              />
              <div
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
            <div className='w-[85%] h-[1px] bg-slate-400 mx-auto shrink-0 rounded-full' />
            <div className='flex items-center w-full h-1/2 cursor-help'>
              <img
                src='/symbole-victoire.png'
                alt='Victoire'
                className={`shrink-0 object-contain ${
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
      </div>
    </motion.div>
  );
}
