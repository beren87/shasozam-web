'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
// 👇 Ajout de getDoc ici pour lire le profil Admin
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import ModalConfirmation from '../../components/ModalConfirmation';

const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

export default function SettingsAvatarPage() {
  const router = useRouter();
  const [estAdmin, setEstAdmin] = useState(false);
  const [chargement, setChargement] = useState(true);

  // 👇 Nouvel état pour stocker le pseudo exact de l'Admin
  const [adminPseudo, setAdminPseudo] = useState('Admin');

  const [avatars, setAvatars] = useState([]);
  const [notification, setNotification] = useState(null);
  const [avatarASupprimer, setAvatarASupprimer] = useState(null);

  const [idEdition, setIdEdition] = useState(null);
  const [nom, setNom] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const afficherNotification = (message, type = 'succes') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formaterDate = (isoString) => {
    if (!isoString) return 'Inconnue';
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const chargerAvatars = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'avatars'));
      let liste = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      liste.sort((a, b) => {
        if (a.estDefaut === b.estDefaut)
          return (a.nom || '').localeCompare(b.nom || '');
        return a.estDefaut ? -1 : 1;
      });
      setAvatars(liste);
    } catch (error) {
      console.error('Erreur chargement avatars:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setEstAdmin(true);

        // 👇 On va chercher le vrai pseudo de l'Admin dans la BDD
        try {
          const userDoc = await getDoc(doc(db, 'joueurs', user.uid));
          if (userDoc.exists() && userDoc.data().pseudo) {
            setAdminPseudo(userDoc.data().pseudo);
          }
        } catch (e) {
          console.error('Erreur récupération pseudo:', e);
        }

        await chargerAvatars();
        setChargement(false);
      } else {
        router.push('/home');
      }
    });
    return () => unsubscribe();
  }, [router, chargerAvatars]);

  const gererImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setIdEdition(null);
    setNom('');
    setImageFile(null);
    setImagePreview(null);
  };

  const preparerEdition = (avatar) => {
    setIdEdition(avatar.id);
    setNom(avatar.nom);
    setImagePreview(avatar.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sauvegarderAvatar = async (e) => {
    e.preventDefault();
    if (!nom.trim())
      return afficherNotification("Le nom de l'avatar est requis.", 'erreur');
    if (!idEdition && !imageFile)
      return afficherNotification(
        'Une image est requise pour un nouvel avatar.',
        'erreur'
      );

    setChargement(true);
    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        const nomFichierUnique = `avatars/${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, nomFichierUnique);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const maintenant = new Date().toISOString();
      const auteurActuel = adminPseudo; // 👈 On utilise le vrai pseudo ici

      if (idEdition) {
        await updateDoc(doc(db, 'avatars', idEdition), {
          nom: nom.trim(),
          ...(imageFile && { imageUrl }),
          dateModification: maintenant,
          auteurModif: auteurActuel,
        });
        afficherNotification('Avatar mis à jour avec succès !');
      } else {
        await addDoc(collection(db, 'avatars'), {
          nom: nom.trim(),
          imageUrl,
          estDefaut: false,
          dateCreation: maintenant,
          dateModification: maintenant,
          auteurCreation: auteurActuel,
          auteurModif: auteurActuel,
        });
        afficherNotification('Nouvel avatar uploadé avec succès !');
      }

      resetForm();
      await chargerAvatars();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      afficherNotification('Erreur lors de la sauvegarde.', 'erreur');
    }
    setChargement(false);
  };

  const basculerDefaut = async (avatar) => {
    if (!avatar.estDefaut) {
      const nbDefautsActuels = avatars.filter((a) => a.estDefaut).length;
      if (nbDefautsActuels >= 3) {
        return afficherNotification(
          'Limite atteinte : Vous ne pouvez avoir que 3 avatars par défaut.',
          'erreur'
        );
      }
    }

    try {
      const maintenant = new Date().toISOString();
      const auteurActuel = adminPseudo; // 👈 Et ici aussi

      await updateDoc(doc(db, 'avatars', avatar.id), {
        estDefaut: !avatar.estDefaut,
        dateModification: maintenant,
        auteurModif: auteurActuel,
      });
      await chargerAvatars();
      afficherNotification(
        avatar.estDefaut
          ? 'Avatar retiré des défauts.'
          : 'Avatar défini comme défaut !'
      );
    } catch (error) {
      afficherNotification('Erreur lors de la modification.', 'erreur');
    }
  };

  const confirmerSuppression = async () => {
    if (avatarASupprimer) {
      await deleteDoc(doc(db, 'avatars', avatarASupprimer));
      await chargerAvatars();
      setAvatarASupprimer(null);
      afficherNotification('Avatar détruit avec succès !');
    }
  };

  if (chargement && avatars.length === 0)
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center font-bold'>
        Chargement...
      </div>
    );

  const nbDefauts = avatars.filter((a) => a.estDefaut).length;

  return (
    <main className='min-h-screen bg-neutral-950 text-white p-4 md:p-12'>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[2000] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border shadow-2xl backdrop-blur-md flex items-center gap-3
              ${
                notification.type === 'erreur'
                  ? 'bg-red-900/90 border-red-500 text-red-100 shadow-red-900/50'
                  : 'bg-green-900/90 border-green-500 text-green-100 shadow-green-900/50'
              }`}>
            <span>{notification.type === 'erreur' ? '❌' : '✅'}</span>{' '}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='text-4xl font-black uppercase italic tracking-tighter'>
              Gestion des <span className='text-purple-500'>Avatars</span>
            </h1>
            <p className='text-gray-500 text-xs uppercase tracking-widest mt-2'>
              Personnalisation & Économie
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className='bg-neutral-800 px-6 py-2 rounded-xl text-xs font-bold uppercase border border-neutral-700 hover:bg-neutral-700 transition-colors cursor-pointer'>
            Retour au Back-office
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='bg-neutral-900 border border-neutral-800 p-6 rounded-3xl sticky top-8'>
              <h2 className='text-lg font-black uppercase text-purple-400 mb-6'>
                {idEdition ? "Modifier l'avatar" : 'Uploader un avatar'}
              </h2>

              <form
                onSubmit={sauvegarderAvatar}
                className='flex flex-col gap-5'>
                <div>
                  <label className='block text-[10px] uppercase font-bold text-gray-500 mb-2'>
                    Nom de l&apos;avatar *
                  </label>
                  <input
                    required
                    type='text'
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder='Ex: Démon mineur'
                    className='w-full bg-black border border-neutral-800 p-3 rounded-xl focus:border-purple-500 outline-none text-sm'
                  />
                </div>

                <div>
                  <label className='block text-[10px] uppercase font-bold text-gray-500 mb-2'>
                    Fichier Image (PNG/JPG)
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={gererImage}
                    className='w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer'
                  />
                </div>

                {imagePreview && (
                  <div className='w-full h-40 bg-black border border-neutral-800 rounded-xl overflow-hidden flex items-center justify-center p-2'>
                    <img
                      src={imagePreview}
                      alt='Aperçu'
                      className='max-h-full max-w-full object-contain'
                    />
                  </div>
                )}

                <div className='flex gap-3 pt-4 border-t border-neutral-800'>
                  {idEdition && (
                    <button
                      type='button'
                      onClick={resetForm}
                      className='flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl text-xs font-bold uppercase transition-colors'>
                      Annuler
                    </button>
                  )}
                  <button
                    type='submit'
                    disabled={chargement}
                    className={`flex-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${
                      chargement
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      idEdition
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}>
                    {chargement
                      ? '...'
                      : idEdition
                      ? 'Mettre à jour'
                      : 'Uploader'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className='lg:col-span-2 flex flex-col gap-4'>
            <div className='bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center'>
              <h2 className='font-black uppercase tracking-widest text-gray-400'>
                Galerie
              </h2>
              <div
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                  nbDefauts === 3
                    ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50'
                    : 'bg-neutral-800 text-gray-400 border-neutral-700'
                }`}>
                {nbDefauts}/3 Par défaut
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`bg-neutral-900 border p-4 rounded-2xl flex flex-col gap-4 transition-colors ${
                    avatar.estDefaut
                      ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}>
                  <div className='flex justify-between items-start gap-4'>
                    <div className='w-20 h-20 bg-black rounded-xl overflow-hidden border border-neutral-800 shrink-0 flex items-center justify-center p-1'>
                      {avatar.imageUrl ? (
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.nom}
                          className='max-h-full max-w-full object-contain'
                        />
                      ) : (
                        <span className='text-[8px] text-gray-600'>
                          IMG PÉTÉE
                        </span>
                      )}
                    </div>

                    <div className='flex-1 flex flex-col items-end gap-2'>
                      <button
                        onClick={() => basculerDefaut(avatar)}
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          avatar.estDefaut
                            ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30'
                            : 'bg-neutral-800 text-gray-500 border-neutral-700 hover:text-white'
                        }`}>
                        {avatar.estDefaut
                          ? '⭐ Actif par défaut'
                          : 'Rendre par défaut'}
                      </button>
                      <div className='flex gap-2 mt-auto'>
                        <button
                          onClick={() => preparerEdition(avatar)}
                          className='text-xs font-bold uppercase text-blue-500 hover:text-blue-400'>
                          Éditer
                        </button>
                        <button
                          onClick={() => setAvatarASupprimer(avatar.id)}
                          className='text-xs font-bold uppercase text-red-500 hover:text-red-400'>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-black text-lg text-white mb-2 leading-none'>
                      {avatar.nom}
                    </h3>
                    <div className='pt-2 border-t border-neutral-800 text-[9px] uppercase tracking-wider text-gray-500 grid grid-cols-2 gap-1'>
                      <p>
                        Par:{' '}
                        <span className='text-gray-300'>
                          {avatar.auteurCreation}
                        </span>
                      </p>
                      <p>
                        Modifié par:{' '}
                        <span className='text-gray-300'>
                          {avatar.auteurModif}
                        </span>
                      </p>
                      <p>Créé: {formaterDate(avatar.dateCreation)}</p>
                      <p>Modifié: {formaterDate(avatar.dateModification)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {avatars.length === 0 && (
                <div className='col-span-full py-12 text-center text-gray-600 font-medium border-2 border-dashed border-neutral-800 rounded-2xl'>
                  Aucun avatar dans les archives.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalConfirmation
        isOpen={!!avatarASupprimer}
        onClose={() => setAvatarASupprimer(null)}
        onConfirm={confirmerSuppression}
        message='Voulez-vous vraiment anéantir cet avatar ? Cette action est irréversible.'
      />
    </main>
  );
}
