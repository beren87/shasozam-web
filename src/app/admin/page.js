'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// NOUVEAU : On importe 'storage' de ton fichier firebase
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

// NOUVEAU : On importe les outils pour envoyer des fichiers sur Firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import FormulaireCarte from '../../components/FormulaireCarte';
import ListeCartes from '../../components/ListeCartes';
import useGestionFormulaire from '../../hooks/useGestionFormulaire';

const ADMIN_UIDS = ['IfCNStfQ1WN4KZvLIsYRjEX5l9g2'];

export default function AdminPage() {
  const router = useRouter();
  const [estAdmin, setEstAdmin] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [toutesLesCartes, setToutesLesCartes] = useState([]);

  // On récupère nos outils de formulaire, dont les nouveaux "imageFile" et "gererImage"
  // On récupère nos outils de formulaire, dont les nouveaux pour les sceaux !
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
    supprimerCoutSceau, // 👈 AJOUTE CES 3 LIGNES ICI
  } = useGestionFormulaire();

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

  const sauvegarderCarte = async (e) => {
    e.preventDefault();
    try {
      // On copie le formulaire pour pouvoir le modifier avant de l'envoyer à la base de données
      let dataASauvegarder = { ...form };

      // NOUVEAU : Si l'admin a sélectionné une nouvelle image depuis son ordi...
      if (imageFile) {
        // On crée un nom de fichier unique (date + nom)
        const nomFichierUnique = `${Date.now()}_${imageFile.name}`;
        // On cible le dossier "cartes" dans le Storage de Firebase
        const imageRef = ref(storage, `cartes/${nomFichierUnique}`);

        // On envoie physiquement le fichier sur Firebase
        await uploadBytes(imageRef, imageFile);

        // On demande à Firebase le lien public de cette image
        const urlImage = await getDownloadURL(imageRef);

        // On remplace le faux lien temporaire par le vrai lien officiel
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
      await chargerCartes();
    } catch (error) {
      console.error('Erreur:', error);
      alert(
        'Erreur lors de la sauvegarde. Vérifie ta connexion ou les droits Firebase Storage.'
      );
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
    <main className='min-h-screen bg-neutral-950 text-white p-4 md:p-12'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <h1 className='text-4xl font-black uppercase italic tracking-tighter'>
            La <span className='text-red-600'>Forge</span> Admin
          </h1>
          <button
            onClick={() => router.push('/home')}
            className='bg-neutral-800 px-6 py-2 rounded-xl text-xs font-bold uppercase border border-neutral-700'>
            Retour au Hub
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <FormulaireCarte
            form={form}
            idEdition={idEdition}
            gererChangement={gererChangement}
            gererCycles={gererCycles}
            gererImage={gererImage} // On passe la fonction au formulaire
            sauvegarderCarte={sauvegarderCarte}
            resetForm={resetForm}
            // 👇 AJOUTE CES 3 LIGNES 👇
            ajouterCoutSceau={ajouterCoutSceau}
            modifierCoutSceau={modifierCoutSceau}
            supprimerCoutSceau={supprimerCoutSceau}
          />

          <ListeCartes
            toutesLesCartes={toutesLesCartes}
            preparerEdition={preparerEdition}
            supprimerCarte={supprimerCarte}
          />
        </div>
      </div>
    </main>
  );
}
