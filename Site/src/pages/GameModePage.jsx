// ============================================================
// Fichier : GameModePage.jsx
// Rôle   : Page de sélection du mode de jeu.
//          Affiche 4 cartes cliquables (Regular, Streak, Speedrun, Mind game).
//
// Concepts React / JSX utilisés :
//   • Tableau de configuration défini HORS du composant :
//     Le tableau MODES contient les données de chaque mode.
//     Défini hors du composant car il est STATIQUE (ne change jamais).
//     → Pas besoin de le recréer à chaque rendu.
//
//   • .map() pour créer une liste de composants :
//     On transforme chaque objet du tableau en une <button>.
//     Chaque élément a un « key » unique (mode.key) pour que
//     React puisse identifier les changements efficacement.
//
//   • className dynamique avec ternaire :
//     className={condition ? 'classe-a classe-b' : 'classe-a'}
//     La carte active reçoit la classe 'active' en plus.
//
// Props :
//   selectedMode (string)   – le mode actuellement sélectionné
//   onChange     (function) – callback pour changer de mode
//
// Debug  : console.log('[GameModePage] selectedMode:', selectedMode)
// ============================================================

// Tableau STATIQUE des modes de jeu.
// Chaque objet décrit un mode avec :
//   key         → identifiant unique (utilisé comme key React et comme valeur)
//   title       → titre affiché
//   description → texte explicatif
const MODES = [
  {
    key: 'regular',
    title: 'Regular mode',
    description: 'Classic hangman with lives.',
  },
  {
    key: 'streak',
    title: 'Streak mode',
    description: 'Win consecutive games to build your streak.',
  },
  {
    key: 'speedrun',
    title: 'Speedrun mode',
    description: 'Guess the word before the timer ends.',
  },
  {
    key: 'mindgame',
    title: 'Mind game mode',
    description: 'Reveal hidden letter cards to guess. No keyboard input allowed.',
  },
]

export const GameModePage = ({ selectedMode, onChange }) => {
  return (
    <section className="card">
      <h2>Gamemode</h2>
      {/* mode-grid utilise CSS Grid pour afficher les cartes côte à côte */}
      <div className="mode-grid">
        {/* .map() itère sur MODES et crée une <button> par mode */}
        {MODES.map((mode) => (
          <button
            key={mode.key}
            className={selectedMode === mode.key ? 'mode-card active' : 'mode-card'}
            onClick={() => onChange(mode.key)}
          >
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
