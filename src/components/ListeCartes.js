'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListeCartes({
  toutesLesCartes,
  preparerEdition,
  supprimerCarte,
}) {
  const [openTypes, setOpenTypes] = useState({});

  const toggleType = (type) => {
    setOpenTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // KAN-26 : 1. Définir l'ordre exact demandé
  const ordreVoulu = [
    'Serviteurs',
    'Tentateurs / Tentatrices',
    'Aberrations',
    'Gardiens',
    'Invocateurs / Invocatrices',
    'Démons',
  ];

  // KAN-26 : 2. Fonction pour regrouper les cartes sous la bonne étiquette commune
  const getGroupe = (type) => {
    if (!type) return 'Inconnus';
    const t = type.toLowerCase();
    if (t.includes('serviteur')) return 'Serviteurs';
    if (t.includes('tentat')) return 'Tentateurs / Tentatrices';
    if (t.includes('aberration')) return 'Aberrations';
    if (t.includes('gardien')) return 'Gardiens';
    if (t.includes('invocat')) return 'Invocateurs / Invocatrices';
    if (t.includes('démon') || t.includes('demon')) return 'Démons';
    return type; // Au cas où un autre type existerait
  };

  // On range les cartes dans leurs nouveaux groupes
  const cartesParType = toutesLesCartes.reduce((acc, carte) => {
    const groupe = getGroupe(carte.type);
    if (!acc[groupe]) acc[groupe] = [];
    acc[groupe].push(carte);
    return acc;
  }, {});

  // KAN-26 : 3. Trier les groupes pour respecter l'ordre exact de "ordreVoulu"
  const groupesTries = Object.keys(cartesParType).sort((a, b) => {
    const indexA = ordreVoulu.indexOf(a);
    const indexB = ordreVoulu.indexOf(b);
    const posA = indexA === -1 ? 999 : indexA; // S'il y a des Inconnus, ils vont tout à la fin
    const posB = indexB === -1 ? 999 : indexB;
    return posA - posB;
  });

  const formaterDate = (isoString) => {
    if (!isoString) return 'Inconnue';
    const date = new Date(isoString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col h-full max-h-[800px] overflow-hidden'>
      <h2 className='text-2xl font-black uppercase italic mb-6'>Le Grimoire</h2>

      {/* Le conteneur principal a lui aussi un scroll global */}
      <div className='overflow-y-auto pr-2 flex flex-col custom-scrollbar'>
        {groupesTries.map((type) => (
          <div
            key={type}
            className='mb-4 border border-neutral-700 rounded-lg overflow-hidden shrink-0'>
            <button
              onClick={() => toggleType(type)}
              // KAN-26 : On s'assure de la présence de cursor-pointer
              className='w-full bg-neutral-800 hover:bg-neutral-700 p-4 flex justify-between items-center transition-colors cursor-pointer'>
              <span className='font-bold uppercase tracking-widest text-red-500'>
                {type} ({cartesParType[type].length})
              </span>
              <span className='text-gray-400'>
                {openTypes[type] ? '▼' : '▶'}
              </span>
            </button>

            <AnimatePresence>
              {openTypes[type] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className='bg-neutral-900/50 overflow-hidden'>
                  {/* KAN-26 : Ajout du scroll vertical (max-h-96 limite la hauteur de l'accordéon) */}
                  <div className='p-4 flex flex-col gap-4 max-h-96 overflow-y-auto custom-scrollbar'>
                    {cartesParType[type].map((carte) => (
                      <div
                        key={carte.id}
                        className='bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col gap-2 hover:border-neutral-600 transition-colors'>
                        <div className='flex justify-between items-start'>
                          <h3 className='font-bold text-lg text-white'>
                            {carte.nom}
                          </h3>
                          <div className='flex gap-3'>
                            <button
                              onClick={() => preparerEdition(carte)}
                              // KAN-26 : On force le pointeur main ici aussi
                              className='text-blue-500 hover:text-blue-400 text-sm font-bold uppercase cursor-pointer'>
                              Éditer
                            </button>
                            <button
                              onClick={() => supprimerCarte(carte.id)}
                              // KAN-26 : On force le pointeur main ici aussi
                              className='text-red-500 hover:text-red-400 text-sm font-bold uppercase cursor-pointer'>
                              Supprimer
                            </button>
                          </div>
                        </div>

                        <div className='mt-2 pt-2 border-t border-neutral-800 text-[10px] text-gray-500 flex flex-col gap-1 tracking-wider uppercase'>
                          <p>
                            👤 Auteur :{' '}
                            <span className='text-gray-300 font-bold'>
                              {carte.auteur || 'Ancien Admin'}
                            </span>
                          </p>
                          <p>
                            📅 Création :{' '}
                            <span className='text-gray-400'>
                              {formaterDate(carte.dateCreation)}
                            </span>
                          </p>
                          <p>
                            ⏱️ Modif :{' '}
                            <span className='text-gray-400'>
                              {formaterDate(carte.dateModification)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {groupesTries.length === 0 && (
          <p className='text-gray-500 italic text-center'>
            Le grimoire est vide.
          </p>
        )}
      </div>
    </div>
  );
}
