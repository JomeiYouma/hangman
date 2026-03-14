// ============================================================
// Fichier : MindGameGrid.jsx
// Rôle   : Grille de cartes cachées pour le mode "mind game".
//          Le joueur ne tape pas au clavier : il clique une carte,
//          la carte révèle sa lettre, puis la logique de jeu décide
//          si c'est une bonne ou une mauvaise tentative.
//
// Contrat des props :
//   cards (Array)      → liste de cartes [{ id, letter, state }]
//   disabled (boolean) → bloque tous les clics quand true
//   onReveal (func)    → callback appelée avec l'id de la carte
//
// États visuels attendus côté carte :
//   hidden   → face cachée, cliquable
//   guessed  → lettre validée (bonne réponse)
//   wrong    → lettre ratée, marquée comme consommée
// ============================================================

export const MindGameGrid = ({ cards, disabled, onReveal }) => {
  return (
    <div className="mindgame-grid" role="grid" aria-label="Mind game letter cards">
      {cards.map((card) => {
        const isHidden = card.state === 'hidden'
        const buttonClass = isHidden
          ? 'mind-card'
          : card.state === 'guessed'
            ? 'mind-card guessed'
            : 'mind-card wrong'

        return (
          <button
            key={card.id}
            type="button"
            className={buttonClass}
            disabled={disabled || !isHidden}
            onClick={() => onReveal(card.id)}
            aria-label={isHidden ? 'Hidden card' : `Revealed ${card.letter.toUpperCase()}`}
          >
            <span>{isHidden ? '?' : card.letter.toUpperCase()}</span>
          </button>
        )
      })}
    </div>
  )
}
