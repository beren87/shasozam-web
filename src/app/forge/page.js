'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';

import { auth, db, storage } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  getDoc, // 👈 KAN-41 : Ajout de getDoc pour lire le pseudo
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

  // 👇 KAN-41 : On stocke le pseudo de l'admin
  const [adminPseudo, setAdminPseudo] = useState('Admin');

  const [isDirty, setIsDirty] = useState(false);
  const [showModalQuitter, setShowModalQuitter] = useState(false);
  const [carteASupprimer, setCarteASupprimer] = useState(null);
  const [notification, setNotification] = useState(null);

  const {
    form,
    idEdition,
    imageFile,
    gererChangement,
    gererCycles,
    gererCyclesAnge,
    gererCyclesDemon,
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
  const gererCyclesAngeAvecDirty = (e) => {
    setIsDirty(true);
    gererCyclesAnge(e);
  };
  const gererCyclesDemonAvecDirty = (e) => {
    setIsDirty(true);
    gererCyclesDemon(e);
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

        // 👇 KAN-41 : Récupération du pseudo exact du profil Admin
        try {
          const userDoc = await getDoc(doc(db, 'joueurs', user.uid));
          if (userDoc.exists() && userDoc.data().pseudo) {
            setAdminPseudo(userDoc.data().pseudo);
          }
        } catch (e) {
          console.error('Erreur récupération pseudo:', e);
        }

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
      const auteurActuel = adminPseudo; // 👈 KAN-41 : On utilise le pseudo

      if (idEdition) {
        // Mode Édition
        dataASauvegarder.dateModification = maintenant;
        dataASauvegarder.auteurModification = auteurActuel;
        await updateDoc(doc(db, 'cartes', idEdition), dataASauvegarder);
        afficherNotification('La carte a été mise à jour avec succès !');
      } else {
        // Mode Création (on ne met pas de modif par défaut)
        dataASauvegarder.dateCreation = maintenant;
        dataASauvegarder.auteurCreation = auteurActuel;
        await addDoc(collection(db, 'cartes'), dataASauvegarder);
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

  const publierCarteRapide = async (carteId) => {
    try {
      const maintenant = new Date().toISOString();
      const auteurActuel = adminPseudo; // 👈 KAN-41 : On utilise le pseudo

      const carteRef = doc(db, 'cartes', carteId);
      await updateDoc(carteRef, {
        publiee: true,
        dateModification: maintenant,
        auteurModification: auteurActuel,
      });

      setIsDirty(false);
      await chargerCartes();
      afficherNotification(
        'La carte est désormais accessible dans le Grimoire !'
      );
    } catch (error) {
      console.error('Erreur publication rapide:', error);
      alert('Erreur lors de la publication.');
    }
  };

  const preparerSuppression = (id) => {
    setCarteASupprimer(id);
  };

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
            gererCyclesAnge={gererCyclesAngeAvecDirty}
            gererCyclesDemon={gererCyclesDemonAvecDirty}
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
            publierCarteRapide={publierCarteRapide}
            supprimerCarte={preparerSuppression}
          />
        </div>
      </div>

      <ModalConfirmation
        isOpen={showModalQuitter}
        onClose={() => setShowModalQuitter(false)}
        onConfirm={() => {
          setIsDirty(false);
          setShowModalQuitter(false);
          router.push('/admin');
        }}
      />

      <ModalConfirmation
        isOpen={!!carteASupprimer}
        onClose={() => setCarteASupprimer(null)}
        onConfirm={confirmerSuppression}
        message='Voulez-vous vraiment anéantir cette carte ? Cette action est définitive et la carte sera effacée des registres infernaux.'
      />
    </main>
  );
}
