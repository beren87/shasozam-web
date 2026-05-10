'use client';

export default function FormulaireCarte({
  form,
  idEdition,
  gererChangement,
  gererCycles,
  gererImage, // NOUVEAU
  sauvegarderCarte,
  resetForm,
  ajouterCoutSceau, // 👈 AJOUTE ÇA
  modifierCoutSceau, // 👈 AJOUTE ÇA
  supprimerCoutSceau, // 👈 AJOUTE ÇA
}) {
  return (
    <section className='bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl h-fit sticky top-8'>
      <h2 className='text-xl font-bold mb-6 uppercase text-red-500'>
        {idEdition ? "Modifier l'entité" : 'Forger une nouvelle carte'}
      </h2>

      <form onSubmit={sauvegarderCarte} className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1'>
              Nom de la créature
            </label>
            <input
              name='nom'
              value={form.nom}
              onChange={gererChangement}
              required
              className='w-full bg-black border border-neutral-700 p-3 rounded-xl focus:border-red-600 outline-none'
              placeholder='Ex: Cerbère'
            />
          </div>
          <div>
            <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1'>
              Type d&apos;entité
            </label>
            <select
              name='type'
              value={form.type}
              onChange={gererChangement}
              className='w-full bg-black border border-neutral-700 p-3 rounded-xl outline-none'>
              <option value='Serviteur'>Serviteur</option>
              <option value='Tentateur'>Tentateur</option>
              <option value='Tentatrice'>Tentatrice</option>
              <option value='Aberration'>Aberration</option>
              <option value='Gardien'>Gardien</option>
              <option value='Invocateur'>Invocateur</option>
              <option value='Invocatrice'>Invocatrice</option>
              <option value='Démon'>Démon</option>
            </select>
          </div>
        </div>

        {/* NOUVEAU BLOC : UPLOAD D'IMAGE */}
        <div className='bg-black border border-neutral-700 p-4 rounded-xl'>
          <label className='block text-[10px] uppercase font-bold text-gray-500 mb-2'>
            Concept Art (Format PNG)
          </label>
          <input
            type='file'
            accept='image/png'
            onChange={gererImage}
            className='w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer'
          />
          {/* Si on a une image, on affiche l'aperçu */}
          {form.imageUrl && (
            <div className='mt-4 w-full h-32 relative bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden flex items-center justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt='Aperçu'
                className='max-h-full max-w-full object-contain'
              />
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Âme (Puissance)
            </label>
            <input
              type='number'
              name='ame'
              value={form.ame}
              onChange={gererChangement}
              className='w-full bg-black border border-neutral-700 p-3 rounded-xl'
              min='1'
              max='6'
            />
          </div>
          <div>
            <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1'>
              Coût en Âme
            </label>
            <input
              type='number'
              name='cout_ame'
              value={form.cout_ame}
              onChange={gererChangement}
              className='w-full bg-black border border-neutral-700 p-3 rounded-xl'
              min='0'
            />
          </div>
        </div>

        {/* 👇 LA NOUVELLE ZONE DYNAMIQUE POUR LES SCEAUX 👇 */}
        <div className='bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3'>
          <div className='flex justify-between items-center'>
            <label className='text-[10px] uppercase font-bold text-gray-500'>
              Coûts en Sceaux
            </label>
            <button
              type='button'
              onClick={ajouterCoutSceau}
              className='bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3 py-1 rounded-lg transition-colors'>
              + AJOUTER UN SCEAU
            </button>
          </div>

          {form.couts_sceaux?.map((cout, index) => (
            <div
              key={index}
              className='flex gap-2 items-center bg-black p-2 rounded-lg border border-neutral-700'>
              <select
                value={cout.type}
                onChange={(e) =>
                  modifierCoutSceau(index, 'type', e.target.value)
                }
                className='flex-1 bg-transparent text-sm outline-none'>
                <option value='Hostile'>Hostile</option>
                <option value='Précurseur'>Précurseur</option>
                <option value='Ancestral'>Ancestral</option>
              </select>
              <input
                type='number'
                value={cout.qte}
                onChange={(e) =>
                  modifierCoutSceau(index, 'qte', e.target.value)
                }
                className='w-16 bg-transparent text-center text-sm outline-none border-l border-neutral-700'
                min='1'
              />
              <button
                type='button'
                onClick={() => supprimerCoutSceau(index)}
                className='text-red-500 hover:text-red-400 font-bold px-2'>
                X
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className='block text-[10px] uppercase font-bold text-gray-500 mb-2'>
            Cycles de Duel (clique pour activer)
          </label>
          <div className='flex gap-2'>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type='button'
                onClick={() => gererCycles(num)}
                className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${
                  form.cycles.includes(num)
                    ? 'bg-red-600 border-red-400 text-white scale-110'
                    : 'bg-black border-neutral-800 text-neutral-600'
                }`}>
                {num === 1
                  ? 'I'
                  : num === 2
                  ? 'II'
                  : num === 3
                  ? 'III'
                  : num === 4
                  ? 'IV'
                  : 'V'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1'>
            Effet Démoniaque Brut
          </label>
          <textarea
            name='effetBrut'
            value={form.effetBrut}
            onChange={gererChangement}
            rows='3'
            className='w-full bg-black border border-neutral-700 p-3 rounded-xl text-sm'
            placeholder="Décrivez l'effet immédiat..."
          />
        </div>

        <div>
          <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1'>
            Effet de Victoire
          </label>
          <textarea
            name='effetVictoire'
            value={form.effetVictoire}
            onChange={gererChangement}
            rows='3'
            className='w-full bg-black border border-neutral-700 p-3 rounded-xl text-sm'
            placeholder="Décrivez l'effet en cas de victoire..."
          />
        </div>

        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            name='publiee'
            checked={form.publiee}
            onChange={gererChangement}
            id='publiee'
            className='w-5 h-5 accent-red-600'
          />
          <label
            htmlFor='publiee'
            className='text-sm font-bold uppercase cursor-pointer'>
            Publier la carte immédiatement
          </label>
        </div>

        <div className='flex gap-4 pt-4'>
          <button
            type='button'
            onClick={resetForm}
            className='flex-1 bg-neutral-800 hover:bg-neutral-700 py-4 rounded-2xl font-bold uppercase text-xs transition-all'>
            Annuler
          </button>
          <button
            type='submit'
            className='flex-2 bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-900/20 transition-all'>
            {idEdition ? 'Mettre à jour' : 'Forger la carte'}
          </button>
        </div>
      </form>
    </section>
  );
}
