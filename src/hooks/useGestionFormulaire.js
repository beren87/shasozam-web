import { useState } from 'react';

export default function useGestionFormulaire() {
  const [idEdition, setIdEdition] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    nom: '',
    type: 'Serviteur',
    ame: 1,
    cout_ame: 0,
    couts_sceaux: [],
    cycles: [],
    cyclesAnge: [], // 👈 NOUVEAU : Mémoire pour les cycles Ange
    cyclesDemon: [], // 👈 NOUVEAU : Mémoire pour les cycles Démon
    effetBrut: '',
    effetVictoire: '',
    publiee: true,
    imageUrl: '',
  });

  const gererChangement = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'ame' || name === 'cout_ame'
          ? parseInt(value)
          : value,
    }));
  };

  const gererCycles = (num) => {
    setForm((prev) => {
      const nouveauxCycles = prev.cycles.includes(num)
        ? prev.cycles.filter((c) => c !== num)
        : [...prev.cycles, num].sort();
      return { ...prev, cycles: nouveauxCycles };
    });
  };

  // 👇 NOUVELLES FONCTIONS : Gestion des cycles Ange et Démon 👇
  const gererCyclesAnge = (num) => {
    setForm((prev) => {
      const nouveaux = prev.cyclesAnge.includes(num)
        ? prev.cyclesAnge.filter((c) => c !== num)
        : [...prev.cyclesAnge, num].sort();
      return { ...prev, cyclesAnge: nouveaux };
    });
  };

  const gererCyclesDemon = (num) => {
    setForm((prev) => {
      const nouveaux = prev.cyclesDemon.includes(num)
        ? prev.cyclesDemon.filter((c) => c !== num)
        : [...prev.cyclesDemon, num].sort();
      return { ...prev, cyclesDemon: nouveaux };
    });
  };

  const ajouterCoutSceau = () => {
    setForm((prev) => ({
      ...prev,
      couts_sceaux: [...(prev.couts_sceaux || []), { type: 'Hostile', qte: 1 }],
    }));
  };

  const modifierCoutSceau = (index, champ, valeur) => {
    setForm((prev) => {
      const nouveauxCouts = [...prev.couts_sceaux];
      nouveauxCouts[index][champ] = champ === 'qte' ? parseInt(valeur) : valeur;
      return { ...prev, couts_sceaux: nouveauxCouts };
    });
  };

  const supprimerCoutSceau = (index) => {
    setForm((prev) => ({
      ...prev,
      couts_sceaux: prev.couts_sceaux.filter((_, i) => i !== index),
    }));
  };

  const gererImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/png') {
        alert('PNG uniquement.');
        return;
      }
      setImageFile(file);
      setForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    }
  };

  const resetForm = () => {
    setForm({
      nom: '',
      type: 'Serviteur',
      ame: 1,
      cout_ame: 0,
      couts_sceaux: [],
      cycles: [],
      cyclesAnge: [], // 👈 NOUVEAU
      cyclesDemon: [], // 👈 NOUVEAU
      effetBrut: '',
      effetVictoire: '',
      publiee: true,
      imageUrl: '',
    });
    setIdEdition(null);
    setImageFile(null);
  };

  const preparerEdition = (carte) => {
    setForm({
      ...carte,
      couts_sceaux: carte.couts_sceaux || [],
      cyclesAnge: carte.cyclesAnge || [], // 👈 NOUVEAU
      cyclesDemon: carte.cyclesDemon || [], // 👈 NOUVEAU
    });
    setIdEdition(carte.id);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    form,
    idEdition,
    imageFile,
    gererChangement,
    gererCycles,
    gererCyclesAnge, // 👈 Exporté
    gererCyclesDemon, // 👈 Exporté
    gererImage,
    resetForm,
    preparerEdition,
    ajouterCoutSceau,
    modifierCoutSceau,
    supprimerCoutSceau,
  };
}
