// ============================================================
// Fichier : HomePage.jsx
// Rôle   : Page principale du jeu — assemble tous les composants
//          du moteur de jeu (figure, mot, clavier, actions…).
//
// Architecture React :
//   Ce composant est un « composant conteneur » (container) :
//   il NE contient PAS de logique métier directement, il DÉLÈGUE
//   tout au hook useHangmanGame et se contente de :
//     1. Appeler le hook pour récupérer l'état et les actions
//     2. Passer les bonnes props aux composants enfants
//     3. Gérer l'affichage conditionnel (messages, boutons…)
//
// Concepts JSX utilisés :
//   • Déstructuration des props : ({ settings, selectedMode })
//   • Hook personnalisé : useHangmanGame({ settings, selectedMode })
//   • Composants enfants : <HangmanFigure />, <Keyboard />, <WordDisplay />
//   • Événements : onSubmit, onChange, onClick
//   • Rendu conditionnel : {condition && <élément />}
//   • Opérateur ternaire dans le JSX : {a ? b : c}
//   • Attribut « disabled » : désactive un bouton quand la condition est vraie
//
// Debug  : console.log('[HomePage] status:', status, 'maskedWord:', maskedWord)
// ============================================================

// --- Imports --------------------------------------------------------
// En React, chaque fichier importe ce dont il a besoin :
//   • useState           → hook pour gérer un état local simple
//   • useHangmanGame     → notre hook personnalisé (logique du jeu)
//   • HangmanFigure, etc → composants d'affichage (UI)
// -------------------------------------------------------------------
import { useState } from 'react'
import { useHangmanGame } from '../hooks/useHangmanGame.js'
import { HangmanFigure } from '../components/HangmanFigure.jsx'
import { Keyboard } from '../components/Keyboard.jsx'
import { WordDisplay } from '../components/WordDisplay.jsx'

// --- Composant HomePage ---------------------------------------------
// « export const » rend ce composant importable depuis App.jsx.
//
// Les props reçues du parent (App.jsx) :
//   settings     → { difficulty: 'easy'|'medium'|'hard',
//                    hints: true|false,
//                    language: 'en-GB'|'fr-FR' }
//   selectedMode → 'regular' | 'streak' | 'speedrun'
// -------------------------------------------------------------------
export const HomePage = ({ settings, selectedMode }) => {
  // useState retourne un tableau [valeur, setter] :
  //   letter    → la valeur actuelle (string vide au départ)
  //   setLetter → fonction pour modifier cette valeur
  // Utilisé pour le champ de saisie texte « Enter a letter ».
  const [letter, setLetter] = useState('')

  // --- Appel du hook personnalisé -----------------------------------
  // On « déstructure » l'objet retourné par useHangmanGame pour
  // extraire chaque propriété dans une variable locale.
  // C'est équivalent à :
  //   const result = useHangmanGame({ settings, selectedMode })
  //   const status = result.status
  //   const error = result.error
  //   ... etc.
  // Mais en plus concis et lisible.
  // -----------------------------------------------------------------
  const {
    status,
    error,
    maskedWord,
    usedLetters,
    wrongLetters,
    remainingLives,
    maxLives,          // ← Nombre total de vies (pour adapter le dessin du pendu)
    remainingSeconds,
    streak,
    canUseHint,
    onGuess,
    onHint,
    startNewGame,
  } = useHangmanGame({ settings, selectedMode })

  // --- Gestionnaire de soumission du formulaire ---------------------
  // En React, les formulaires utilisent « onSubmit » pour gérer
  // la soumission. event.preventDefault() empêche le rechargement
  // de la page (comportement par défaut du navigateur).
  // -----------------------------------------------------------------
  const handleSubmit = (event) => {
    event.preventDefault()  // Empêche le rechargement de la page
    onGuess(letter)         // Envoie la lettre au hook
    setLetter('')           // Vide le champ de saisie
  }

  // --- Calcul du label du mode pour l'affichage ---------------------
  // Opérateurs ternaires imbriqués (équivalent if/else if/else) :
  //   condition1 ? résultat1 : condition2 ? résultat2 : résultatParDéfaut
  // -----------------------------------------------------------------
  const modeLabel =
    selectedMode === 'regular'
      ? 'Regular mode'
      : selectedMode === 'streak'
        ? 'Streak mode'
        : 'Speedrun mode'

  // --- Calcul du message de statut ----------------------------------
  const statusMessage =
    status === 'loading'
      ? 'Loading a new word...'
      : status === 'won'
        ? 'You won!'
        : status === 'lost'
          ? 'You lost!'
          : status === 'error'
            ? 'API error'
            : 'Game in progress'

  // --- Rendu JSX ----------------------------------------------------
  // Le « return » d'un composant React retourne du JSX.
  // Le JSX ressemble à du HTML mais c'est du JavaScript :
  //   • className au lieu de class (car « class » est un mot réservé en JS)
  //   • Les expressions JS sont entre accolades : {variable}
  //   • Les composants commencent par une majuscule : <HangmanFigure />
  //   • Les props sont passées comme des attributs HTML :
  //     <Keyboard usedLetters={usedLetters} /> ← passe la variable usedLetters
  // -----------------------------------------------------------------
  return (
    <section className="card engine-layout">
      {/* --- Barre supérieure : titre + chips d'information --- */}
      <div className="engine-topbar">
        <h2>Engine</h2>
        {/* La className "chip-group" affiche les chips en ligne (flex) */}
        <div className="chip-group">
          <span className="chip">{modeLabel}</span>
          <span className="chip">Lives: {remainingLives}</span>
          {/* Rendu conditionnel : le timer n'apparaît QU'en mode speedrun */}
          {selectedMode === 'speedrun' && <span className="chip">Time: {remainingSeconds ?? 0}s</span>}
          {/* Le streak n'apparaît QU'en mode streak */}
          {selectedMode === 'streak' && <span className="chip">Streak: {streak}</span>}
        </div>
      </div>

      {/* --- Dessin du pendu ---
          On passe DEUX props au composant HangmanFigure :
            wrongCount → combien de mauvaises réponses (pour savoir quoi dessiner)
            maxLives   → le total de vies (pour savoir QUEL mode de dessin utiliser)
      */}
      <HangmanFigure wrongCount={wrongLetters.length} maxLives={maxLives} />

      {/* --- Affichage du mot masqué --- */}
      <WordDisplay maskedWord={maskedWord} />

      {/* --- Message de statut --- */}
      <p className="status-line">{statusMessage}</p>
      {/* L'erreur n'apparaît que si « error » est truthy (non vide) */}
      {error && <p className="error-line">{error}</p>}

      {/* --- Formulaire de saisie manuelle ---
          <form onSubmit={…}> : quand l'utilisateur appuie sur Entrée
          ou clique sur "Guess", handleSubmit est appelé.
      */}
      <form className="guess-form" onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={1}
          value={letter}
          onChange={(event) => setLetter(event.target.value)}
          placeholder="Enter a letter"
          disabled={status !== 'playing'}
        />
        <button className="primary-btn" type="submit" disabled={status !== 'playing'}>
          Guess
        </button>
      </form>

      {/* --- Clavier virtuel ---
          Les props transmises :
            usedLetters → lettres déjà utilisées (pour les griser)
            disabled    → true si la partie n'est pas en cours
            onGuess     → fonction appelée quand on clique sur une touche
      */}
      <Keyboard usedLetters={usedLetters} disabled={status !== 'playing'} onGuess={onGuess} />

      {/* --- Boutons d'action --- */}
      <div className="actions-row">
        <button className="secondary-btn" onClick={startNewGame}>
          New game
        </button>
        {/* Le bouton hint est désactivé si canUseHint est false
            (pas d'indice dispo, déjà utilisé, ou partie non en cours) */}
        <button className="secondary-btn" disabled={!canUseHint} onClick={onHint}>
          Use hint
        </button>
      </div>
    </section>
  )
}
