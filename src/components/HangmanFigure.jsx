// ============================================================
// Fichier : HangmanFigure.jsx
// Rôle   : Composant React qui dessine le pendu en SVG.
//          Le dessin s'adapte au nombre total de vies (maxLives) :
//
//          • 9 vies (easy)   → 3 parties de potence dessinées
//                               progressivement + 6 parties du bonhomme
//          • 6 vies (medium) → potence affichée d'emblée
//                               + 6 parties du bonhomme
//          • 4 vies (hard)   → potence affichée d'emblée
//                               + 4 parties groupées du bonhomme
//                               (bras ensemble, jambes ensemble)
//
// Concepts JSX utilisés :
//   • SVG en JSX : on écrit du SVG directement dans le JSX, comme
//     du HTML. React le transforme en vrais éléments SVG dans le DOM.
//   • Rendu conditionnel : {condition && <élément />}
//     → Si condition est true, l'élément est affiché.
//     → Si condition est false, rien n'est affiché.
//     C'est l'équivalent de : if (condition) { afficher élément }
//   • Fragment <> … </> : permet de grouper plusieurs éléments
//     sans ajouter de nœud DOM supplémentaire (pas de <div> en trop).
//
// Props (propriétés reçues du parent) :
//   wrongCount (number) – nombre de mauvaises réponses (0, 1, 2…)
//   maxLives   (number) – nombre total de vies (9, 6 ou 4)
//
// Debug  : console.log('[HangmanFigure] wrongCount:', wrongCount, 'maxLives:', maxLives)
// ============================================================

const FigureFrame = ({ children }) => {
  return (
    <svg viewBox="0 0 160 200" className="hangman-figure" aria-label="Hangman figure">
      <defs>
        <radialGradient id="figureFog" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1c8f66" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#030507" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="100" rx="76" ry="92" className="figure-fog" fill="url(#figureFog)" />
      {children}
    </svg>
  )
}

const Head = () => {
  return (
    <>
      <circle className="head-part" cx="110" cy="55" r="15" />
      <line className="scar-part" x1="102" y1="48" x2="106" y2="55" />
      <line className="scar-part" x1="118" y1="48" x2="114" y2="55" />
      <circle className="eye-glow" cx="104" cy="55" r="1.8" />
      <circle className="eye-glow" cx="116" cy="55" r="1.8" />
    </>
  )
}

// --- Éléments SVG de la potence (le gibet) --------------------------
// Chaque élément est une ligne (<line>) ou un groupe de lignes.
//
// Coordonnées SVG (viewBox="0 0 160 200") :
//   x1, y1 = point de départ
//   x2, y2 = point d'arrivée
//
// Structure visuelle :
//   ┌──────────┐  ← poutre horizontale (beam) + corde (rope)
//   │          │
//   │          O  ← tête
//   │         /|\ ← corps + bras
//   │         / \ ← jambes
//   └──────────┘  ← base (floor)
// -------------------------------------------------------------------

// --- Composant fonctionnel ------------------------------------------
// En React, un composant fonctionnel est une FONCTION qui :
//   1. Reçoit des « props » (objets avec les données du parent)
//   2. Retourne du JSX (le HTML-like que React transforme en DOM)
//
// La déstructuration { wrongCount, maxLives } extrait directement
// les propriétés de l'objet props passé par le composant parent.
//
// Le mot-clé « export » rend ce composant importable depuis d'autres fichiers :
//   import { HangmanFigure } from './HangmanFigure.jsx'
// -------------------------------------------------------------------
export const HangmanFigure = ({ wrongCount, maxLives }) => {

  // ═══════════════════════════════════════════════════════════════
  // MODE 9 VIES (easy) : potence dessinée progressivement
  // ═══════════════════════════════════════════════════════════════
  // Étape 1 : base (sol)
  // Étape 2 : poteau vertical
  // Étape 3 : poutre horizontale + corde
  // Étapes 4-9 : les 6 parties du bonhomme
  // ─────────────────────────────────────────────────────────────
  if (maxLives >= 9) {
    return (
      <FigureFrame>
        {/* Étape 1 – Base (ligne horizontale en bas) */}
        {wrongCount >= 1 && <line className="gallows-part" x1="20" y1="180" x2="120" y2="180" />}

        {/* Étape 2 – Poteau vertical */}
        {wrongCount >= 2 && <line className="gallows-part" x1="50" y1="180" x2="50" y2="20" />}

        {/* Étape 3 – Poutre horizontale + corde (groupées dans un Fragment <>) */}
        {wrongCount >= 3 && (
          <>
            <line className="gallows-part" x1="50" y1="20" x2="110" y2="20" />
            <line className="rope-part" x1="110" y1="20" x2="110" y2="40" />
          </>
        )}

        {/* Étape 4 – Tête (cercle) */}
        {wrongCount >= 4 && <Head />}

        {/* Étape 5 – Corps (ligne verticale) */}
        {wrongCount >= 5 && <line className="body-part" x1="110" y1="70" x2="110" y2="120" />}

        {/* Étape 6 – Bras gauche */}
        {wrongCount >= 6 && <line className="body-part" x1="110" y1="85" x2="85" y2="105" />}

        {/* Étape 7 – Bras droit */}
        {wrongCount >= 7 && <line className="body-part" x1="110" y1="85" x2="135" y2="105" />}

        {/* Étape 8 – Jambe gauche */}
        {wrongCount >= 8 && <line className="body-part" x1="110" y1="120" x2="90" y2="150" />}

        {/* Étape 9 – Jambe droite */}
        {wrongCount >= 9 && <line className="body-part" x1="110" y1="120" x2="130" y2="150" />}
      </FigureFrame>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // MODE 4 VIES (hard) : potence toujours visible, bonhomme groupé
  // ═══════════════════════════════════════════════════════════════
  // La potence (4 lignes) est TOUJOURS affichée.
  // Le bonhomme a 4 étapes avec des parties groupées :
  //   Étape 1 : tête
  //   Étape 2 : corps
  //   Étape 3 : les DEUX bras ensemble
  //   Étape 4 : les DEUX jambes ensemble
  // ─────────────────────────────────────────────────────────────
  if (maxLives <= 4) {
    return (
      <FigureFrame>
        {/* Potence complète — toujours visible (pas de condition) */}
        <line className="gallows-part" x1="20" y1="180" x2="120" y2="180" />
        <line className="gallows-part" x1="50" y1="180" x2="50" y2="20" />
        <line className="gallows-part" x1="50" y1="20" x2="110" y2="20" />
        <line className="rope-part" x1="110" y1="20" x2="110" y2="40" />

        {/* Étape 1 – Tête */}
        {wrongCount >= 1 && <Head />}

        {/* Étape 2 – Corps */}
        {wrongCount >= 2 && <line className="body-part" x1="110" y1="70" x2="110" y2="120" />}

        {/* Étape 3 – Les deux bras (groupés dans un Fragment) */}
        {wrongCount >= 3 && (
          <>
            <line className="body-part" x1="110" y1="85" x2="85" y2="105" />
            <line className="body-part" x1="110" y1="85" x2="135" y2="105" />
          </>
        )}

        {/* Étape 4 – Les deux jambes (groupées dans un Fragment) */}
        {wrongCount >= 4 && (
          <>
            <line className="body-part" x1="110" y1="120" x2="90" y2="150" />
            <line className="body-part" x1="110" y1="120" x2="130" y2="150" />
          </>
        )}
      </FigureFrame>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // MODE 6 VIES (medium, par défaut) : potence visible, 6 parties
  // ═══════════════════════════════════════════════════════════════
  // La potence est affichée dès le début.
  // Le bonhomme a 6 parties individuelles :
  //   Étape 1 : tête
  //   Étape 2 : corps
  //   Étape 3 : bras gauche
  //   Étape 4 : bras droit
  //   Étape 5 : jambe gauche
  //   Étape 6 : jambe droite
  // ─────────────────────────────────────────────────────────────
  return (
    <FigureFrame>
      {/* Potence complète — toujours visible */}
      <line className="gallows-part" x1="20" y1="180" x2="120" y2="180" />
      <line className="gallows-part" x1="50" y1="180" x2="50" y2="20" />
      <line className="gallows-part" x1="50" y1="20" x2="110" y2="20" />
      <line className="rope-part" x1="110" y1="20" x2="110" y2="40" />

      {/* Étape 1 – Tête */}
      {wrongCount >= 1 && <Head />}

      {/* Étape 2 – Corps */}
      {wrongCount >= 2 && <line className="body-part" x1="110" y1="70" x2="110" y2="120" />}

      {/* Étape 3 – Bras gauche */}
      {wrongCount >= 3 && <line className="body-part" x1="110" y1="85" x2="85" y2="105" />}

      {/* Étape 4 – Bras droit */}
      {wrongCount >= 4 && <line className="body-part" x1="110" y1="85" x2="135" y2="105" />}

      {/* Étape 5 – Jambe gauche */}
      {wrongCount >= 5 && <line className="body-part" x1="110" y1="120" x2="90" y2="150" />}

      {/* Étape 6 – Jambe droite */}
      {wrongCount >= 6 && <line className="body-part" x1="110" y1="120" x2="130" y2="150" />}
    </FigureFrame>
  )
}
