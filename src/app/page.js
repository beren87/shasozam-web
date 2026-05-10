'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

// NOUVEAU : On importe notre brique pour les champs de saisie
import InputAuth from '../components/InputAuth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modeInscription, setModeInscription] = useState(false);
  const [erreur, setErreur] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        // SI CONNECTÉ : On envoie directement sur la page Home !
        router.push('/home');
      } else {
        setChargement(false);
      }
    });
  }, [router]);

  const gererLogin = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      if (modeInscription) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErreur('Ce parchemin est déjà lié à un autre Souverain.');
          break;
        case 'auth/invalid-credential':
          setErreur('Les sceaux ne correspondent pas.');
          break;
        case 'auth/weak-password':
          setErreur(
            'Votre mot de passe est trop faible. (6 caractères minimum)'
          );
          break;
        case 'auth/invalid-email':
          setErreur("Cette adresse n'existe dans aucun registre.");
          break;
        default:
          setErreur('Une force obscure a bloqué la connexion. Réessayez.');
      }
    }
  };

  const gererGoogle = async () => {
    setErreur('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setErreur('La connexion avec Google a échoué.');
      }
    }
  };

  if (chargement)
    return (
      <div className='min-h-screen bg-black flex items-center justify-center text-red-600 font-bold'>
        Vérification des sceaux...
      </div>
    );

  return (
    <main className='min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4'>
      <h1 className='text-6xl font-black text-red-600 mb-12 tracking-tighter italic uppercase'>
        Shasozam
      </h1>

      <form
        onSubmit={gererLogin}
        className='bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl w-full max-w-md flex flex-col gap-4'>
        {erreur && (
          <div className='bg-red-950/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm text-center font-medium'>
            {erreur}
          </div>
        )}

        {/* Brique Input pour l'Email */}
        <InputAuth
          type='email'
          placeholder='Email'
          valeur={email}
          onChange={(e) => setEmail(e.target.value)}
          boutonAction={email.length > 0 ? () => setEmail('') : null}
          iconeBouton='✖️'
        />

        {/* Brique Input pour le Mot de passe */}
        <InputAuth
          type={voirMdp ? 'text' : 'password'}
          placeholder='Mot de passe'
          valeur={password}
          onChange={(e) => setPassword(e.target.value)}
          boutonAction={() => setVoirMdp(!voirMdp)}
          iconeBouton={voirMdp ? '🙈' : '👁️'}
        />

        <button className='bg-red-600 py-4 rounded-xl font-bold uppercase tracking-widest mt-2 hover:bg-red-500 transition-colors cursor-pointer'>
          {modeInscription ? 'Créer son alliance' : "Entrer dans l'enfer"}
        </button>

        <button
          type='button'
          onClick={() => {
            setModeInscription(!modeInscription);
            setErreur('');
          }}
          className='text-xs text-gray-500 underline uppercase hover:text-white transition-colors cursor-pointer'>
          {modeInscription
            ? 'Déjà un compte ? Se connecter'
            : 'Nouveau ? Créer un compte'}
        </button>
      </form>

      <button
        onClick={gererGoogle}
        className='mt-8 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer'>
        Continuer avec Google
      </button>
    </main>
  );
}
