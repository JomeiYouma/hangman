// ============================================================
// Fichier : useHangmanGame.js
// Rôle   : Hook React personnalisé (« custom hook ») qui encapsule
//          TOUTE la logique et l'état du jeu du pendu.
//
// Un hook personnalisé est une fonction dont le nom commence par
// « use » et qui utilise d'autres hooks React à l'intérieur.
// → Cela permet de SÉPARER la logique métier de l'affichage (UI).
// → Les composants appellent ce hook et reçoivent des valeurs prêtes
//   à l'emploi, sans connaître le fonctionnement interne.
//
// Concepts React utilisés ici :
//   • useReducer  – gestion d'état complexe via un « reducer »
//   • useCallback – mémoriser des fonctions pour éviter les
//                   re-rendus inutiles des composants enfants
//   • useMemo     – mémoriser des valeurs calculées coûteuses
//   • useEffect   – exécuter des effets de bord (appel API, timer)
//
// Debug  : Décommentez la ligne suivante dans le reducer pour
//          voir l'état à chaque action dans la console :
//          console.log('[useHangmanGame] action:', action.type, 'state:', state)
// ============================================================

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { fetchRandomWord } from '../services/hangmanApi.js'
import {
  getMaskedWord,
  getUniqueLetters,
  isSingleLetter,
  normalizeLetter,
} from '../utils/gameLogic.js'

// --- Constantes de configuration ------------------------------------
// On associe chaque difficulté à un nombre de vies.
// Ce nombre détermine AUSSI comment le pendu est dessiné :
//
//   • easy (9 vies) :
//       3 parties de la potence (base, poteau, poutre+corde)
//       + 6 parties du bonhomme (tête, corps, 2 bras, 2 jambes)
//       = 9 étapes dessinées progressivement
//
//   • medium (6 vies) :
//       La potence est déjà affichée dès le début
//       + 6 parties du bonhomme
//
//   • hard (4 vies) :
//       La potence est déjà affichée dès le début
//       + 4 parties du bonhomme (bras groupés, jambes groupées)
// -------------------------------------------------------------------
const LIVES_BY_DIFFICULTY = {
  easy: 9,      // Potence progressive + bonhomme complet
  medium: 6,    // Potence affichée + bonhomme complet
  hard: 4,      // Potence affichée + bonhomme simplifié
}

// Temps en secondes pour le mode speedrun, selon la difficulté
const SPEEDRUN_SECONDS_BY_DIFFICULTY = {
  easy: 90,
  medium: 60,
  hard: 45,
}

// --- État initial du reducer ----------------------------------------
// C'est l'objet qui représente l'état du jeu AU TOUT DÉBUT,
// avant que quoi que ce soit ne se passe.
//
// Chaque propriété a un rôle précis :
//   secretWord       → le mot à deviner (vide au départ)
//   uniqueLetters    → les lettres uniques normalisées à trouver
//                      (sans espaces, sans accents, sans doublons)
//   guessedLetters   → lettres correctes déjà proposées par le joueur
//   wrongLetters     → lettres incorrectes déjà proposées
//   remainingLives   → vies restantes (décrémente à chaque erreur)
//   remainingSeconds → secondes restantes (mode speedrun uniquement, sinon null)
//   hintUsed         → true si le joueur a utilisé son indice
//   streak           → série de victoires consécutives (mode streak)
//   status           → état de la partie :
//                      'idle'    → pas encore commencée
//                      'loading' → chargement du mot depuis l'API
//                      'playing' → partie en cours
//                      'won'     → victoire
//                      'lost'    → défaite
//                      'error'   → erreur (API inaccessible…)
//   error            → message d'erreur éventuel
// -------------------------------------------------------------------
const initialState = {
  secretWord: '',
  uniqueLetters: [],
  guessedLetters: [],
  wrongLetters: [],
  remainingLives: 6,
  remainingSeconds: null,
  hintUsed: false,
  streak: 0,
  status: 'idle',
  error: '',
}

// --- Le Reducer -----------------------------------------------------
// Un « reducer » est une FONCTION PURE qui prend :
//   1. state  → l'état actuel (l'objet ci-dessus)
//   2. action → un objet { type, payload } décrivant ce qu'il faut faire
// Et qui RETOURNE un NOUVEL état (sans modifier l'ancien !).
//
// L'action est un simple objet envoyé au reducer pour lui dire
// quoi faire. Par convention, il a toujours cette forme :
//   { type: 'NOM_DE_L_ACTION', payload: ... }
//
// Le payload (littéralement la "charge utile"), ce sont les données
// supplémentaires nécessaires pour accomplir l'action.
//
// Analogie : Si l'action était "FAIRE_LES_COURSES",
//            le payload serait la "LISTE_DES_PRODUITS".
//
// Pourquoi useReducer plutôt que useState ?
//   → Quand l'état a BEAUCOUP de propriétés interdépendantes
//     (guessedLetters, wrongLetters, remainingLives, status…
//      qui changent TOUS ENSEMBLE quand on devine une lettre),
//     useReducer est plus lisible et plus maintenable.
//
// RÈGLE D'OR : on ne modifie JAMAIS state directement.
//   On retourne un NOUVEL objet avec le spread operator (...) :
//     {
//       ...state,          // 1. "Copie tout ce qu'il y avait dans l'ancien état"
//       status: 'playing'  // 2. "Mais remplace juste la propriété 'status'"
//     }
// -------------------------------------------------------------------
const reducer = (state, action) => {
  // 🐛 Debug : décommentez pour voir chaque action dans la console
  // console.log('[reducer]', action.type, action.payload, '→', state)

  // --- Action START_LOADING ----------------------------------------
  // Déclenchée quand on démarre une nouvelle partie.
  // On remet tout à zéro sauf le streak (en mode streak).
  if (action.type === 'START_LOADING') {
    return {
      ...state,              // Copie l'ancien état…
      secretWord: '',        // …mais remplace ces propriétés :
      uniqueLetters: [],
      guessedLetters: [],
      wrongLetters: [],
      remainingLives: action.payload.lives,      // Vies selon difficulté
      remainingSeconds: action.payload.seconds,  // null sauf speedrun
      hintUsed: false,
      status: 'loading',     // On passe en état "chargement"
      error: '',
      // En mode streak, on CONSERVE le streak existant.
      // Sinon, on le remet à 0.
      // Ceci est un opérateur ternaire : condition ? siVrai : siFaux
      streak: action.payload.mode === 'streak' ? state.streak : 0,
    }
  }

  // --- Action START_SUCCESS ----------------------------------------
  // L'API a retourné un mot avec succès.
  // On stocke le mot et ses lettres uniques, puis on joue.
  if (action.type === 'START_SUCCESS') {
    return {
      ...state,
      secretWord: action.payload.word,
      uniqueLetters: action.payload.uniqueLetters,
      status: 'playing',
      error: '',
    }
  }

  // --- Action START_ERROR ------------------------------------------
  // L'appel API a échoué → on enregistre l'erreur.
  if (action.type === 'START_ERROR') {
    return {
      ...state,
      status: 'error',
      error: action.payload,  // Le message d'erreur (string)
    }
  }

  // --- Action GUESS ------------------------------------------------
  // Le joueur propose une lettre.
  // Deux possibilités : la lettre est dans le mot, ou non.
  if (action.type === 'GUESS') {
    // Guard clause : on ne peut deviner que si la partie est en cours.
    // Une "guard clause" est un return anticipé qui évite un gros
    // bloc if/else imbriqué. Ça rend le code plus lisible.
    if (state.status !== 'playing') {
      return state  // État inchangé
    }

    const letter = action.payload.letter

    // Si la lettre a DÉJÀ été proposée (correcte ou incorrecte),
    // on ignore sans pénalité → on retourne l'état inchangé.
    // .includes(x) vérifie si le tableau contient l'élément x.
    if (state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter)) {
      return state
    }

    // On vérifie si la lettre (normalisée, sans accent) fait partie
    // des lettres uniques du mot secret.
    const isCorrect = state.uniqueLetters.includes(letter)

    if (isCorrect) {
      // --- Bonne réponse ---
      // On ajoute la lettre au tableau des lettres devinées.
      // Important : on ne fait PAS state.guessedLetters.push(letter)
      // car ça MODIFIERAIT l'ancien état. On crée un NOUVEAU tableau
      // avec le spread operator [...ancien, nouveau].
      const guessedLetters = [...state.guessedLetters, letter]

      // Condition de VICTOIRE : TOUTES les lettres uniques ont été devinées.
      // .every() retourne true si le callback retourne true pour CHAQUE élément.
      //
      // ⚠️ Les espaces et caractères spéciaux ne sont PAS dans uniqueLetters
      //    (filtrés par getUniqueLetters), donc ils n'ont PAS besoin
      //    d'être devinés pour gagner.
      const isWon = state.uniqueLetters.every((item) => guessedLetters.includes(item))

      return {
        ...state,
        guessedLetters,
        status: isWon ? 'won' : 'playing',
        // Gestion du streak (ternaires imbriqués) :
        //   victoire en mode streak → streak + 1
        //   pas encore gagné en streak → on garde le streak actuel
        //   pas en mode streak → 0
        streak:
          isWon && action.payload.mode === 'streak'
            ? state.streak + 1
            : action.payload.mode === 'streak'
              ? state.streak
              : 0,
      }
    }

    // --- Mauvaise réponse ---
    const wrongLetters = [...state.wrongLetters, letter]
    const remainingLives = state.remainingLives - 1
    const isLost = remainingLives <= 0  // Plus de vies = défaite

    return {
      ...state,
      wrongLetters,
      remainingLives,
      status: isLost ? 'lost' : 'playing',
      streak: isLost && action.payload.mode === 'streak' ? 0 : state.streak,
    }
  }

  // --- Action USE_HINT ---------------------------------------------
  // Marque que le joueur a utilisé son indice (un seul par partie).
  if (action.type === 'USE_HINT') {
    return {
      ...state,
      hintUsed: true,
    }
  }

  // --- Action TICK -------------------------------------------------
  // Le timer du mode speedrun décrémente chaque seconde.
  // Quand il atteint 0, la partie est perdue automatiquement.
  if (action.type === 'TICK') {
    if (state.status !== 'playing' || state.remainingSeconds === null) {
      return state
    }

    const nextSeconds = state.remainingSeconds - 1
    const hasExpired = nextSeconds <= 0

    return {
      ...state,
      remainingSeconds: Math.max(0, nextSeconds),
      status: hasExpired ? 'lost' : state.status,
      streak: hasExpired && action.payload.mode === 'streak' ? 0 : state.streak,
    }
  }

  // Action non reconnue → on retourne l'état inchangé (sécurité)
  return state
}

// --- Le Hook useHangmanGame ----------------------------------------
// Paramètres (« déstructurés » depuis l'objet passé) :
//   settings     → { difficulty, hints, language }
//   selectedMode → 'regular' | 'streak' | 'speedrun'
//
// La déstructuration { settings, selectedMode } est un raccourci
// pour extraire des propriétés d'un objet :
//   Au lieu de :  const settings = props.settings
//   On écrit   :  const { settings } = props
//   Ou directement dans les paramètres : ({ settings, selectedMode })
// -------------------------------------------------------------------
export const useHangmanGame = ({ settings, selectedMode }) => {
  // useReducer retourne un tableau de 2 éléments :
  //   state    → l'état actuel (l'objet géré par le reducer)
  //   dispatch → fonction pour envoyer des « actions » au reducer
  //              Usage : dispatch({ type: 'NOM', payload: données })
  const [state, dispatch] = useReducer(reducer, initialState)

  // --- useMemo -----------------------------------------------------
  // useMemo MÉMORISE le résultat d'un calcul.
  // Il ne recalcule QUE quand ses dépendances changent.
  //
  // Syntaxe : useMemo(() => valeurCalculée, [dépendance1, dep2…])
  //   → Le 2e argument est le « tableau de dépendances »
  //   → React compare les valeurs : si rien n'a changé, il réutilise
  //     le résultat précédent au lieu de refaire le calcul.
  //
  // L'opérateur ?? (nullish coalescing) retourne la valeur à droite
  // UNIQUEMENT si celle de gauche est null ou undefined.
  //   Ex. : undefined ?? 6  → 6
  //         4 ?? 6          → 4
  //   ≠ de || qui retourne la droite aussi pour 0, '', false.
  // -----------------------------------------------------------------
  const maxLives = useMemo(() => {
    return LIVES_BY_DIFFICULTY[settings.difficulty] ?? 6
  }, [settings.difficulty])

  const speedrunSeconds = useMemo(() => {
    return SPEEDRUN_SECONDS_BY_DIFFICULTY[settings.difficulty] ?? 60
  }, [settings.difficulty])

  // --- useCallback -------------------------------------------------
  // useCallback MÉMORISE une FONCTION pour qu'elle ne soit pas
  // recréée à chaque rendu du composant.
  //
  // Pourquoi c'est utile ?
  //   Sans useCallback, à chaque rendu, une NOUVELLE fonction est
  //   créée en mémoire (même si son code est identique).
  //   Les composants enfants qui reçoivent cette fonction en prop
  //   se re-rendent inutilement car React voit une nouvelle référence.
  //
  // Syntaxe : useCallback(fn, [dépendances])
  //
  // Le mot-clé « async » devant la fonction indique qu'elle contient
  // du code asynchrone (ici : un appel API avec await).
  // -----------------------------------------------------------------
  const startNewGame = useCallback(async () => {
    // On envoie l'action START_LOADING pour réinitialiser l'état
    dispatch({
      type: 'START_LOADING',
      payload: {
        lives: maxLives,
        seconds: selectedMode === 'speedrun' ? speedrunSeconds : null,
        mode: selectedMode,
      },
    })

    // try/catch : mécanisme de gestion des erreurs.
    //   try   → on essaie d'exécuter ce bloc
    //   catch → si une erreur est « lancée » (throw), on la rattrape ici
    try {
      // await : on ATTEND que la Promesse (Promise) se résolve
      // avant de continuer l'exécution. Sans await, « word »
      // contiendrait un objet Promise au lieu du mot réel.
      const word = await fetchRandomWord(settings.language)
      const uniqueLetters = getUniqueLetters(word)

      dispatch({
        type: 'START_SUCCESS',
        payload: {
          word,             // Raccourci ES6 : { word } = { word: word }
          uniqueLetters,    // Idem : { uniqueLetters: uniqueLetters }
        },
      })
    } catch (error) {
      // instanceof vérifie si un objet est une instance d'une classe.
      // Si c'est bien une Error JS, on prend son .message.
      // Sinon, on met un message par défaut.
      dispatch({
        type: 'START_ERROR',
        payload: error instanceof Error ? error.message : 'Unexpected API error.',
      })
    }
  }, [maxLives, selectedMode, settings.language, speedrunSeconds])

  // --- useEffect (démarrage automatique) ----------------------------
  // useEffect exécute du code APRÈS le rendu du composant.
  // C'est l'endroit idéal pour les « effets de bord » :
  //   → appels API, abonnements, timers, manipulation du DOM…
  //
  // Syntaxe : useEffect(callback, [dépendances])
  //   → Le callback s'exécute au premier rendu (montage) ET à chaque
  //     changement des dépendances.
  //
  // Ici : on lance automatiquement une nouvelle partie dès que
  // startNewGame change (c'est-à-dire quand la difficulté, le mode
  // ou la langue changent, car ce sont ses dépendances).
  // -----------------------------------------------------------------
  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  // --- useEffect (timer du speedrun) --------------------------------
  // Crée un intervalle (setInterval) qui envoie une action TICK
  // toutes les 1000 ms (= 1 seconde) en mode speedrun.
  //
  // IMPORTANT : la fonction de RETOUR (return () => clearInterval(…))
  // est la « fonction de nettoyage » (cleanup function).
  // React l'appelle automatiquement :
  //   1. AVANT de ré-exécuter l'effet (si les dépendances changent)
  //   2. Quand le composant est DÉMONTÉ (retiré du DOM)
  // → Cela évite les « fuites mémoire » (memory leaks) en arrêtant
  //   le timer quand il n'est plus nécessaire.
  // -----------------------------------------------------------------
  useEffect(() => {
    // Si on n'est pas en speedrun ou pas en train de jouer, pas de timer
    if (selectedMode !== 'speedrun' || state.status !== 'playing') {
      return undefined
    }

    const timerId = setInterval(() => {
      dispatch({ type: 'TICK', payload: { mode: selectedMode } })
    }, 1000)

    return () => clearInterval(timerId)  // ← Nettoyage du timer
  }, [selectedMode, state.status])

  // --- Fonction deviner une lettre ----------------------------------
  const onGuess = useCallback(
    (value) => {
      // On vérifie que la saisie est bien une seule lettre valide
      if (!isSingleLetter(value)) {
        return
      }

      // On normalise la lettre (retire accents, met en minuscule)
      // AVANT de l'envoyer au reducer.
      // Ainsi « e » validera aussi « é », « è », « ê »…
      dispatch({
        type: 'GUESS',
        payload: {
          letter: normalizeLetter(value),
          mode: selectedMode,
        },
      })
    },
    [selectedMode],
  )

  // --- Fonction utiliser un indice ----------------------------------
  const onHint = useCallback(() => {
    // Guard clauses : vérifications avant d'agir
    if (!settings.hints || state.hintUsed || state.status !== 'playing') {
      return
    }

    // .find() retourne le PREMIER élément du tableau qui satisfait
    // la condition du callback. Ici : la première lettre pas encore devinée.
    const hiddenLetter = state.uniqueLetters.find((letter) => !state.guessedLetters.includes(letter))

    if (!hiddenLetter) {
      return  // Toutes les lettres sont déjà devinées (ne devrait pas arriver)
    }

    // On dispatch deux actions successives :
    // 1. Marquer l'indice comme utilisé
    // 2. Deviner la lettre automatiquement
    dispatch({ type: 'USE_HINT' })
    dispatch({
      type: 'GUESS',
      payload: {
        letter: hiddenLetter,
        mode: selectedMode,
      },
    })
  }, [selectedMode, settings.hints, state.guessedLetters, state.hintUsed, state.status, state.uniqueLetters])

  // --- Valeurs mémorisées (useMemo) ---------------------------------
  const maskedWord = useMemo(() => {
    return getMaskedWord(state.secretWord, state.guessedLetters)
  }, [state.secretWord, state.guessedLetters])

  // On fusionne les lettres correctes et incorrectes pour savoir
  // quels boutons du clavier virtuel désactiver.
  // Le spread operator (...) « étale » les éléments de deux tableaux
  // dans un nouveau tableau :
  //   [...['a','b'], ...['c','d']] → ['a', 'b', 'c', 'd']
  const usedLetters = useMemo(() => {
    return [...state.guessedLetters, ...state.wrongLetters]
  }, [state.guessedLetters, state.wrongLetters])

  // --- Retour du hook -----------------------------------------------
  // Le hook retourne un OBJET contenant tout ce dont les composants
  // ont besoin : valeurs d'état + fonctions d'action.
  //
  // C'est le « contrat » (l'API publique) du hook : les composants
  // n'ont pas besoin de connaître le reducer, les actions ou le
  // state interne. Ils utilisent juste les propriétés de cet objet.
  // -----------------------------------------------------------------
  return {
    status: state.status,
    error: state.error,
    maskedWord,
    wrongLetters: state.wrongLetters,
    usedLetters,
    remainingLives: state.remainingLives,
    maxLives,             // ← Nombre total de vies (pour adapter le dessin du pendu)
    remainingSeconds: state.remainingSeconds,
    streak: state.streak,
    hintUsed: state.hintUsed,
    canUseHint: settings.hints && !state.hintUsed && state.status === 'playing',
    onGuess,
    onHint,
    startNewGame,
  }
}
