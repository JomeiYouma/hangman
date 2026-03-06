// ============================================================
// Fichier : WordDisplay.jsx
// Rôle   : Affiche le mot masqué (ex. "C _ F É") dans un <p>.
//
// C'est un composant très simple (« presentational component »)
// qui ne fait QUE de l'affichage, sans logique métier.
// En React, on découpe l'UI en petits composants réutilisables,
// même s'ils sont minuscules. Cela facilite :
//   • La réutilisation (on peut l'utiliser ailleurs)
//   • Les tests (on peut tester l'affichage isolément)
//   • La lisibilité (le parent n'a pas besoin de connaître le HTML)
//
// Concepts JSX :
//   • {maskedWord} entre accolades dans le JSX insère la VALEUR
//     de la variable maskedWord dans le rendu HTML.
//   • Les espaces dans la chaîne masquée séparent chaque caractère
//     visuellement. Les espaces du mot original apparaissent
//     comme des espaces plus larges (double espace).
//
// Props :
//   maskedWord (string) – le mot masqué, ex. "C _ F É"
//
// Debug  : console.log('[WordDisplay] maskedWord:', maskedWord)
// ============================================================
export const WordDisplay = ({ maskedWord }) => {
  // Le JSX ci-dessous produit : <p class="word-display">C _ F É</p>
  // React transforme « className » en « class » dans le vrai DOM.
  return <p className="word-display">{maskedWord}</p>
}
