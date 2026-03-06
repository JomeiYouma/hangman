// ============================================================
// Fichier : main.jsx
// Rôle   : POINT D'ENTRÉE de l'application React.
//          C'est le PREMIER fichier JavaScript exécuté par le
//          navigateur (via Vite, le bundler/serveur de dév).
//
// Que se passe-t-il ici ?
//   1. On importe createRoot depuis 'react-dom/client'
//   2. On sélectionne l'élément HTML <div id="root"> (dans index.html)
//   3. On crée une « racine React » (root) sur cet élément
//   4. On rend (render) le composant <App /> dedans
//
// Concepts React :
//   • createRoot(element) :
//     Crée un point d'entrée React dans le DOM réel.
//     React va contrôler TOUT ce qui est à l'intérieur de cet élément.
//
//   • .render(<JSX />) :
//     Demande à React de transformer le JSX en vrais éléments DOM
//     et de les insérer dans l'élément racine.
//
//   • <StrictMode> :
//     Composant spécial de React qui active des vérifications
//     supplémentaires en développement (pas d'effet en production) :
//       – Détecte les effets de bord involontaires
//       – Avertit des API dépréciées
//       – Exécute les effets DEUX FOIS pour vérifier le nettoyage
//     → C'est normal si vous voyez des appels API doublés en dev !
//
// Debug  : console.log('[main.jsx] Application React démarrée')
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// document.getElementById('root') récupère le <div id="root">
// défini dans index.html. C'est le « point d'ancrage » de React.
createRoot(document.getElementById('root')).render(
  // StrictMode enveloppe l'app pour activer les vérifications de dev
  <StrictMode>
    <App />
  </StrictMode>,
)
