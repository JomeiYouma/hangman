// ============================================================
// Fichier : Keyboard.jsx
// Rôle   : Clavier virtuel A-Z pour le jeu du pendu.
//          Chaque touche est un <button> qui appelle onGuess(lettre)
//          quand on clique dessus.
//
// Concepts JSX / React utilisés :
//   • .map() pour le rendu de liste :
//     En JSX, on ne peut pas écrire de boucle for directement.
//     On utilise .map() sur un tableau pour transformer chaque
//     élément en un composant JSX.
//     Ex. : [1,2,3].map(n => <span>{n}</span>) → <span>1</span><span>2</span><span>3</span>
//
//   • L'attribut « key » (obligatoire dans .map()) :
//     React a besoin d'un identifiant UNIQUE pour chaque élément
//     de liste, afin de savoir lesquels ont changé, été ajoutés
//     ou supprimés lors d'un re-rendu. Ici, la lettre elle-même
//     est un bon key car elle est unique dans l'alphabet.
//
//   • Arrow function dans onClick :
//     onClick={() => onGuess(letter)}
//     On passe une FONCTION FLÉCHÉE (arrow function) qui sera
//     appelée au clic. Si on écrivait onClick={onGuess(letter)},
//     la fonction serait appelée IMMÉDIATEMENT au rendu !
//     La flèche () => … crée une fonction qui ATTEND le clic.
//
//   • L'attribut « disabled » :
//     Quand disabled={true}, le bouton est grisé et ne réagit
//     plus aux clics. L'expression (disabled || isUsed) est
//     true si la partie n'est plus en cours OU si la lettre
//     a déjà été utilisée.
//
// Props reçues du parent (HomePage.jsx) :
//   usedLetters (string[]) – lettres déjà proposées ['a','e','z'…]
//   disabled    (boolean)  – true si la partie n'est pas en cours
//   onGuess     (function) – fonction appelée avec la lettre cliquée
//
// Debug  : console.log('[Keyboard] usedLetters:', usedLetters)
// ============================================================

// 'abcdefghijklmnopqrstuvwxyz'.split('') transforme la chaîne
// en un tableau de 26 caractères : ['a', 'b', 'c', …, 'z']
// Ce tableau est défini EN DEHORS du composant (constante module)
// car il ne change jamais → pas besoin de le recréer à chaque rendu.
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const Keyboard = ({ usedLetters, disabled, onGuess }) => {
  return (
    <div className="keyboard-grid">
      {/* .map() itère sur les 26 lettres et retourne un <button> pour chacune */}
      {ALPHABET.map((letter) => {
        // .includes() vérifie si le tableau contient cet élément
        const isUsed = usedLetters.includes(letter)

        return (
          <button
            key={letter}                          // ← identifiant unique (obligatoire dans .map)
            className="key-btn"
            disabled={disabled || isUsed}          // ← grisé si partie finie OU lettre déjà jouée
            onClick={() => onGuess(letter)}        // ← appelle onGuess au clic (pas immédiatement !)
          >
            {letter.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
