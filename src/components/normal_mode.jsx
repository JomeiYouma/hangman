// ============================================================
// Fichier : normal_mode.jsx
// Rôle   : Composant placeholder pour le mode normal.
//          Ce composant est un exemple minimal de composant React.
//
// Anatomie d'un composant fonctionnel React :
//   1. export const NomDuComposant = () => { … }
//      → Fonction fléchée exportée (convention : PascalCase)
//   2. return ( <JSX /> )
//      → Le composant RETOURNE du JSX (le HTML-like de React)
//   3. Le JSX doit avoir UN SEUL élément racine
//      → Ici, c'est <div> qui englobe <h2> et <p>
//      → On peut aussi utiliser un Fragment <> … </> si on ne
//        veut pas de <div> supplémentaire dans le DOM.
//
// Debug  : console.log('[NormalMode] rendu')
// ============================================================
export const NormalMode = () => {
    return (
        <div>
            <h2>Normal Mode</h2>
            <p>Welcome to the normal mode!</p>
        </div>
    )
}