'use client';

export default function ListeCartes({
  toutesLesCartes,
  preparerEdition,
  supprimerCarte,
}) {
  return (
    <section>
      <h2 className='text-xl font-bold mb-6 uppercase text-gray-400'>
        Grimoire Existant ({toutesLesCartes.length})
      </h2>
      <div className='space-y-4'>
        {toutesLesCartes.map((carte) => (
          <div
            key={carte.id}
            className='bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center group'>
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center font-black text-yellow-500'>
                {carte.ame}
              </div>
              <div>
                <h4 className='font-bold uppercase tracking-tighter'>
                  {carte.nom}
                </h4>
                <p className='text-[9px] text-gray-500 uppercase font-bold tracking-widest'>
                  [{carte.type}]{' '}
                  {!carte.publiee && (
                    <span className='text-yellow-600 ml-2'>(BROUILLON)</span>
                  )}
                </p>
              </div>
            </div>
            <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <button
                onClick={() => preparerEdition(carte)}
                className='bg-blue-900/30 text-blue-400 p-2 rounded-lg border border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold uppercase cursor-pointer'>
                Éditer
              </button>
              <button
                onClick={() => supprimerCarte(carte.id)}
                className='bg-red-900/30 text-red-500 p-2 rounded-lg border border-red-900/50 hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase cursor-pointer'>
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {toutesLesCartes.length === 0 && (
          <p className='text-gray-600 italic text-center py-20 border-2 border-dashed border-neutral-800 rounded-3xl'>
            Le grimoire est vide pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
