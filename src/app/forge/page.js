'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

// KAN-19 : On importe la modale de sécurité
import ModalConfirmation from '../../components/ModalConfirmation';

const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

export default function AdminPage() {
  const router = useRouter();
  const [estAdmin, setEstAdmin] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [toutesLesCartes, setToutesLesCartes] = useState([]);

  // KAN-19 : Nos deux nouvelles mémoires pour la modale
  const [isDirty, setIsDirty] = useState(false); // Le formulaire a-t-il été modifié ?
  const [showModal, setShowModal] = useState(false); // Doit-on afficher la modale ?

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

  // KAN-19 : On crée des fonctions intermédiaires qui activent l'alarme "isDirty"
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

  // KAN-19 : Fonction qui décide si on part ou si on affiche l'alerte
  const handleBackAttempt = () => {
    if (isDirty) {
      setShowModal(true); // Alerte !
    } else {
      router.push('/admin'); // Tout va bien, on rentre au menu
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

      if (idEdition) {
        await updateDoc(doc(db, 'cartes', idEdition), dataASauvegarder);
        alert('Carte mise à jour !');
      } else {
        await addDoc(collection(db, 'cartes'), dataASauvegarder);
        alert('Nouvelle carte forgée !');
      }

      resetForm();
      setIsDirty(false); // KAN-19 : On remet l'alarme à zéro car c'est sauvegardé !
      await chargerCartes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const supprimerCarte = async (id) => {
    if (confirm('Voulez-vous vraiment anéantir cette carte ?')) {
      await deleteDoc(doc(db, 'cartes', id));
      await chargerCartes();
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
    <main className='min-h-screen bg-neutral-950 text-white p-4 md:p-12 relative'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <h1 className='text-4xl font-black uppercase italic tracking-tighter'>
            La <span className='text-red-600'>Forge</span>
          </h1>
          <button
            onClick={handleBackAttempt}
            className='bg-neutral-800 px-6 py-2 rounded-xl text-xs font-bold uppercase border border-neutral-700 hover:bg-neutral-700 transition-colors'>
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
              setIsDirty(false); // Pas d'alarme juste en ouvrant une carte
            }}
            supprimerCarte={supprimerCarte}
          />
        </div>
      </div>

      {/* KAN-19 : Notre nouvelle modale s'affiche par-dessus tout le reste */}
      <ModalConfirmation
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setIsDirty(false);
          setShowModal(false);
          router.push('/admin');
        }}
      />
    </main>
  );
}
