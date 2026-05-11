'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListeCartes({
  toutesLesCartes,
  preparerEdition,
  supprimerCarte,
}) {
  // Ce "state" mémorise quels accordéons sont ouverts (ex: { "Serviteur": true, "Démon": false })
  const [openTypes, setOpenTypes] = useState({});

  const toggleType = (type) => {
    setOpenTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // On trie et on range les cartes dans des boîtes en fonction de leur type
  const cartesParType = toutesLesCartes.reduce((acc, carte) => {
    const type = carte.type || 'Sans Type';
    if (!acc[type]) acc[type] = [];
    acc[type].push(carte);
    return acc;
  }, {});

  // Outil pour transformer le code ISO de l'heure en date française lisible
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
    <div className='bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col h-full max-h-[800px] overflow-y-auto'>
      <h2 className='text-2xl font-black uppercase italic mb-6'>Le Grimoire</h2>

      {Object.entries(cartesParType).map(([type, cartes]) => (
        <div
          key={type}
          className='mb-4 border border-neutral-700 rounded-lg overflow-hidden'>
          {/* L'ENTÊTE DE L'ACCORDÉON */}
          <button
            onClick={() => toggleType(type)}
            className='w-full bg-neutral-800 hover:bg-neutral-700 p-4 flex justify-between items-center transition-colors'>
            <span className='font-bold uppercase tracking-widest text-red-500'>
              {type}s ({cartes.length})
            </span>
            <span className='text-gray-400'>{openTypes[type] ? '▼' : '▶'}</span>
          </button>

          {/* LE CONTENU DE L'ACCORDÉON (ANIMÉ) */}
          <AnimatePresence>
            {openTypes[type] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className='bg-neutral-900/50 p-4 flex flex-col gap-4 overflow-hidden'>
                {cartes.map((carte) => (
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
                          className='text-blue-500 hover:text-blue-400 text-sm font-bold uppercase'>
                          Éditer
                        </button>
                        <button
                          onClick={() => supprimerCarte(carte.id)}
                          className='text-red-500 hover:text-red-400 text-sm font-bold uppercase'>
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* KAN-18 : LES MÉTADONNÉES DE LA CARTE */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {Object.keys(cartesParType).length === 0 && (
        <p className='text-gray-500 italic text-center'>
          Le grimoire est vide.
        </p>
      )}
    </div>
  );
}
