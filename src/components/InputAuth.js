'use client';

export default function InputAuth({
  type,
  placeholder,
  valeur,
  onChange,
  boutonAction,
  iconeBouton,
}) {
  return (
    <div className='relative flex items-center'>
      <input
        type={type}
        placeholder={placeholder}
        value={valeur}
        onChange={onChange}
        className='bg-black p-4 pr-12 rounded-xl border border-neutral-800 w-full text-white focus:outline-none focus:border-red-600'
      />
      {/* S'il y a un bouton d'action (comme la croix ou l'oeil), on l'affiche */}
      {boutonAction && iconeBouton && (
        <button
          type='button'
          onClick={boutonAction}
          className='absolute right-4 text-gray-500 hover:text-white transition-colors text-xl cursor-pointer'>
          {iconeBouton}
        </button>
      )}
    </div>
  );
}
