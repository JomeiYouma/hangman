// ============================================================
// Fichier : App.jsx
// Rôle   : Composant RACINE de l'application React.
//          C'est le « chef d'orchestre » qui :
//            1. Gère l'état global (page courante, settings, mode)
//            2. Décide quelle PAGE afficher selon currentPage
//            3. Passe les bonnes props à chaque page
//
// Hiérarchie des composants (arbre React) :
//   App
//   ├─ Header         (navigation)
//   └─ renderPage()
//      ├─ HomePage      (jeu du pendu)
//      ├─ SettingsPage  (paramètres)
//      ├─ GameModePage  (choix du mode)
//      └─ ContactPage   (contact)
//
// Concepts React utilisés :
//   • useState : hook pour gérer un état local simple.
//     Syntaxe : const [valeur, setValeur] = useState(valeurInitiale)
//     → valeur    : la donnée actuelle
//     → setValeur : fonction pour la modifier
//     Quand on appelle setValeur(x), React RE-REND le composant
//     avec la nouvelle valeur.
//
//   • Rendu conditionnel avec des if :
//     On peut retourner différents JSX selon une condition.
//     Ici, renderPage() retourne un composant différent
//     selon la valeur de currentPage.
//
//   • Passage de props :
//     <HomePage settings={settings} selectedMode={selectedMode} />
//     → Passe les variables comme « attributs » au composant enfant.
//     Le composant enfant les reçoit dans ses props.
//
//   • Fonction de mise à jour partielle (updateSettings) :
//     Utilise le spread operator pour fusionner l'ancien état
//     avec les nouvelles valeurs :
//       { ...prev, ...partialSettings }
//     Ex. : { ...{a:1, b:2}, ...{b:3} } → {a:1, b:3}
//
// Debug  : console.log('[App] currentPage:', currentPage, 'settings:', settings)
// ============================================================

// --- Imports --------------------------------------------------------
// import { useState } from 'react'
//   → On importe le hook useState depuis la bibliothèque react.
//   Les accolades { } indiquent un « named import » (export nommé),
//   par opposition à un « default import » (sans accolades).
import { useState } from 'react'
import { Header } from './components/header.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { GameModePage } from './pages/GameModePage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import FaultyTerminal from './components/FaultyTerminal.jsx'
import './styles/app.css'  // Import de fichier CSS → appliqué globalement

// --- Composant App --------------------------------------------------
// « const App = () => { … } » est une fonction fléchée (arrow function).
// C'est un raccourci ES6 pour : function App() { … }
//
// « export default App » (en bas du fichier) signifie que c'est
// l'export PRINCIPAL du module. On l'importe sans accolades :
//   import App from './App.jsx'
// (contrairement aux exports nommés : import { Header } from …)
// -------------------------------------------------------------------
const App = () => {
	// --- État local : page courante ------------------------------------
	// useState('home') crée un état avec la valeur initiale 'home'.
	// currentPage peut valoir : 'home', 'settings', 'gamemode', 'contact'
	const [currentPage, setCurrentPage] = useState('home')

	// --- État local : paramètres du jeu --------------------------------
	// L'objet settings regroupe tous les réglages du jeu.
	// Quand on modifie UN paramètre, on doit recréer TOUT l'objet
	// (React détecte les changements par référence, pas par contenu).
	const [settings, setSettings] = useState({
		difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
		hints: true,            // true = indices activés
		language: 'en-GB',      // 'en-GB' | 'fr-FR'
	})

	// --- État local : mode de jeu sélectionné --------------------------
	const [selectedMode, setSelectedMode] = useState('regular')

	// --- Fonction de mise à jour partielle des settings ----------------
	// Au lieu de remplacer TOUT l'objet settings, on fusionne
	// l'ancien état avec les nouvelles valeurs grâce au spread (...).
	//
	// setSettings(prev => ({ ...prev, ...partialSettings }))
	//   prev             = l'ancien état complet
	//   ...prev          = copie toutes les propriétés de prev
	//   ...partialSettings = remplace/ajoute les propriétés spécifiées
	//
	// Exemple d'appel : updateSettings({ difficulty: 'hard' })
	//   → { difficulty: 'medium', hints: true, language: 'en-GB' }
	//     devient { difficulty: 'hard', hints: true, language: 'en-GB' }
	const updateSettings = (partialSettings) => {
		setSettings((prev) => ({ ...prev, ...partialSettings }))
	}

	// --- Rendu conditionnel : quelle page afficher ? -------------------
	// Cette fonction retourne le composant correspondant à currentPage.
	// Chaque composant reçoit en props les données dont il a besoin.
	//
	// C'est un pattern courant pour le routing « maison »
	// (sans bibliothèque comme react-router).
	const renderPage = () => {
		if (currentPage === 'home') {
			return <HomePage settings={settings} selectedMode={selectedMode} />
		}

		if (currentPage === 'settings') {
			return <SettingsPage settings={settings} onChange={updateSettings} />
		}

		if (currentPage === 'gamemode') {
			return <GameModePage selectedMode={selectedMode} onChange={setSelectedMode} />
		}

		if (currentPage === 'contact') {
			return <ContactPage />
		}

		// Fallback : si aucune page ne correspond, on affiche l'accueil
		return <HomePage settings={settings} selectedMode={selectedMode} />
	}

	// --- Rendu principal -----------------------------------------------
	// <main> est une balise HTML sémantique pour le contenu principal.
	// {renderPage()} appelle la fonction et insère le JSX retourné.
	//
	// Le Header reçoit :
	//   currentPage → pour savoir quel bouton mettre en « active »
	//   onNavigate  → callback pour changer de page (= setCurrentPage)
	return (
		<main className="app-shell">
			<div className="terminal-bg-layer" aria-hidden="true">
				<FaultyTerminal
					scale={1.5}
					gridMul={[2, 1]}
					digitSize={1.2}
					timeScale={0.5}
					pause={false}
					scanlineIntensity={0.5}
					glitchAmount={1}
					flickerAmount={1}
					noiseAmp={1}
					chromaticAberration={0}
					dither={0}
					curvature={0.1}
					tint="#A7EF9E"
					mouseReact
					mouseStrength={0.5}
					pageLoadAnimation
					brightness={0.6}
				/>
			</div>

			<div className="app-content-layer">
			<Header currentPage={currentPage} onNavigate={setCurrentPage} />
			<section className="page-content">{renderPage()}</section>
			</div>
		</main>
	)
}

// Export par défaut : c'est LE composant principal de ce fichier.
// Importé dans main.jsx avec : import App from './App.jsx'
export default App
