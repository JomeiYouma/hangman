// ============================================================
// Fichier : header.jsx
// Rôle   : Barre de navigation principale de l'application.
//          Affiche le titre + les liens de navigation
//          (Homepage, Settings, Gamemode, Contact).
//
// Concepts JSX / React utilisés :
//   • Tableau de configuration (navItems) :
//     On définit les items de navigation dans un tableau d'objets
//     EN DEHORS du composant, puis on utilise .map() pour les
//     transformer en éléments JSX. C'est un pattern très courant
//     en React pour éviter la répétition de code (DRY).
//
//   • className dynamique (ternaire) :
//     className={condition ? 'classe-si-vrai' : 'classe-si-faux'}
//     Ici, le bouton de la page active reçoit la classe 'active'
//     pour avoir un style différent (fond noir).
//
//   • Callback de navigation :
//     onNavigate est une FONCTION passée par le parent (App.jsx).
//     Quand on clique sur un bouton, on appelle onNavigate('home')
//     ce qui remonte l'information au parent pour changer de page.
//     C'est le pattern « lifting state up » : l'enfant ne gère
//     pas l'état, il INFORME le parent via un callback.
//
// Props :
//   currentPage (string)   – la page active ('home', 'settings'…)
//   onNavigate  (function) – callback pour changer de page
//
// Debug  : console.log('[Header] currentPage:', currentPage)
// ============================================================

// Tableau de configuration de la navigation.
// Défini hors du composant car il ne change jamais.
// Chaque objet a :
//   key   → identifiant unique (utilisé aussi comme « key » React)
//   label → texte affiché à l'utilisateur
const navItems = [
    { key: 'home', label: 'Terminal' },
    { key: 'settings', label: 'Config' },
    { key: 'gamemode', label: 'Protocols' },
    { key: 'contact', label: 'Operator' },
]

export const Header = ({ currentPage, onNavigate }) => {
    return (
        <header className="header">
            <h1>Cipher Breach: Hangman Protocol</h1>
            {/* <nav> est une balise HTML sémantique pour la navigation */}
            <nav>
                <ul className="nav-list">
                    {/* .map() transforme chaque item du tableau en un <li> + <button> */}
                    {navItems.map((item) => (
                        <li key={item.key}>
                            {/* Le ternaire ajoute la classe 'active' au bouton de la page courante */}
                            <button
                                className={currentPage === item.key ? 'nav-btn active' : 'nav-btn'}
                                onClick={() => onNavigate(item.key)}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}