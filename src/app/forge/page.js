'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// KAN-12 : On importe motion et AnimatePresence pour animer notre notification
import { motion, AnimatePresence } from 'framer-motion';

import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import FormulaireCarte from '../../components/FormulaireCarte';
import ListeCartes from '../../components/ListeCartes';
import useGestionFormulaire from '../../hooks/useGestionFormulaire';
import ModalConfirmation from '../../components/ModalConfirmation';

const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

export default function AdminPage() {
  const router = useRouter();
  const [estAdmin, setEstAdmin] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [toutesLesCartes, setToutesLesCartes] = useState([]);

  // États pour les modales et notifications
  const [isDirty, setIsDirty] = useState(false);
  const [showModalQuitter, setShowModalQuitter] = useState(false);
  const [carteASupprimer, setCarteASupprimer] = useState(null); // KAN-12 : Mémorise la carte à supprimer
  const [notification, setNotification] = useState(null); // KAN-12 : Le message de succès en vert

  const {
    form,
    idEdition,
    imageFile,
    gererChangement,
    gererCycles,
    gererImage,
    resetForm,
    preparerEdition,
    ajouterCoutSceau,
    modifierCoutSceau,
    supprimerCoutSceau,
  } = useGestionFormulaire();

  const gererChangementAvecDirty = (e) => {
    setIsDirty(true);
    gererChangement(e);
  };
  const gererCyclesAvecDirty = (e) => {
    setIsDirty(true);
    gererCycles(e);
  };
  const gererImageAvecDirty = (e) => {
    setIsDirty(true);
    gererImage(e);
  };
  const ajouterCoutSceauAvecDirty = () => {
    setIsDirty(true);
    ajouterCoutSceau();
  };
  const modifierCoutSceauAvecDirty = (index, champ, valeur) => {
    setIsDirty(true);
    modifierCoutSceau(index, champ, valeur);
  };
  const supprimerCoutSceauAvecDirty = (index) => {
    setIsDirty(true);
    supprimerCoutSceau(index);
  };

  // KAN-12 : Fonction pour afficher la phrase en vert pendant 3 secondes
  const afficherNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const chargerCartes = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cartes'));
      let cartes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      cartes.sort((a, b) => {
        const typeA = a.type || '';
        const typeB = b.type || '';
        const nomA = a.nom || '';
        const nomB = b.nom || '';
        return typeA.localeCompare(typeB) || nomA.localeCompare(nomB);
      });

      setToutesLesCartes(cartes);
    } catch (e) {
      console.error('Erreur Firebase:', e);
      setErreur(e.message);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setEstAdmin(true);
        await chargerCartes();
        setChargement(false);
      } else {
        router.push('/home');
      }
    });
    return () => unsubscribe();
  }, [router, chargerCartes]);

  const handleBackAttempt = () => {
    if (isDirty) {
      setShowModalQuitter(true);
    } else {
      router.push('/admin');
    }
  };

  const sauvegarderCarte = async (e) => {
    e.preventDefault();
    try {
      let dataASauvegarder = { ...form };

      if (imageFile) {
        const nomFichierUnique = `${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, `cartes/${nomFichierUnique}`);
        await uploadBytes(imageRef, imageFile);
        const urlImage = await getDownloadURL(imageRef);
        dataASauvegarder.imageUrl = urlImage;
      }

      const maintenant = new Date().toISOString();
      const auteurActuel =
        auth.currentUser?.displayName || auth.currentUser?.email || 'Admin';

      dataASauvegarder.dateModification = maintenant;
      dataASauvegarder.auteur = auteurActuel;

      if (idEdition) {
        await updateDoc(doc(db, 'cartes', idEdition), dataASauvegarder);
        // KAN-12 : Remplacement du "alert" par notre notification
        afficherNotification('La carte a été mise à jour avec succès !');
      } else {
        dataASauvegarder.dateCreation = maintenant;
        await addDoc(collection(db, 'cartes'), dataASauvegarder);
        // KAN-12 : Remplacement du "alert" par notre notification
        afficherNotification('Nouvelle carte forgée avec succès !');
      }

      resetForm();
      setIsDirty(false);
      await chargerCartes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  // KAN-12 : La suppression déclenche d'abord notre propre modale
  const preparerSuppression = (id) => {
    setCarteASupprimer(id);
  };

  // KAN-12 : La fonction qui supprime réellement après confirmation
  const confirmerSuppression = async () => {
    if (carteASupprimer) {
      await deleteDoc(doc(db, 'cartes', carteASupprimer));
      await chargerCartes();
      setCarteASupprimer(null);
      afficherNotification('La carte a été anéantie avec succès !');
    }
  };

  if (chargement)
    return (
      <div className='min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-black uppercase'>
        <p>Vérification de l&apos;autorité...</p>
        {erreur && (
          <p className='text-white text-xs mt-4 normal-case font-normal max-w-lg text-center'>
            Erreur: {erreur}
          </p>
        )}
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-950 text-white p-4 md:p-12 relative overflow-hidden'>
      {/* KAN-12 : LA NOTIFICATION EN VERT EN HAUT DE L'ÉCRAN */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed top-8 left-1/2 -translate-x-1/2 z-[2000] bg-green-600/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-green-400 shadow-[0_0_30px_rgba(22,163,74,0.3)] backdrop-blur-md flex items-center gap-3'>
            <span>✅</span> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <h1 className='text-4xl font-black uppercase italic tracking-tighter'>
            La <span className='text-red-600'>Forge</span>
          </h1>
          <button
            onClick={handleBackAttempt}
            className='bg-neutral-800 px-6 py-2 rounded-xl text-xs font-bold uppercase border border-neutral-700 hover:bg-neutral-700 transition-colors cursor-pointer'>
            Retour au Back-office
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <FormulaireCarte
            form={form}
            idEdition={idEdition}
            gererChangement={gererChangementAvecDirty}
            gererCycles={gererCyclesAvecDirty}
            gererImage={gererImageAvecDirty}
            sauvegarderCarte={sauvegarderCarte}
            resetForm={() => {
              resetForm();
              setIsDirty(false);
            }}
            ajouterCoutSceau={ajouterCoutSceauAvecDirty}
            modifierCoutSceau={modifierCoutSceauAvecDirty}
            supprimerCoutSceau={supprimerCoutSceauAvecDirty}
          />

          <ListeCartes
            toutesLesCartes={toutesLesCartes}
            preparerEdition={(carte) => {
              preparerEdition(carte);
              setIsDirty(false);
            }}
            // KAN-12 : On envoie la carte vers notre modale au lieu de supprimer direct
            supprimerCarte={preparerSuppression}
          />
        </div>
      </div>

      {/* Modale pour le bouton retour (existante) */}
      <ModalConfirmation
        isOpen={showModalQuitter}
        onClose={() => setShowModalQuitter(false)}
        onConfirm={() => {
          setIsDirty(false);
          setShowModalQuitter(false);
          router.push('/admin');
        }}
      />

      {/* KAN-12 : Nouvelle modale pour confirmer la suppression */}
      <ModalConfirmation
        isOpen={!!carteASupprimer}
        onClose={() => setCarteASupprimer(null)}
        onConfirm={confirmerSuppression}
        message='Voulez-vous vraiment anéantir cette carte ? Cette action est définitive et la carte sera effacée des registres infernaux.'
      />
    </main>
  );
}
