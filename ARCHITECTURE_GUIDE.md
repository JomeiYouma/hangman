# 📋 Guide Complet - Architecture du Jeu du Pendu (Hangman)

> **Document à importer dans Notion pour référence lors de discussions sur le code.**

---

## 📑 Table des matières

1. [Vue d'ensemble globale](#vue-densemble)
2. [Structure des fichiers](#structure-des-fichiers)
3. [Concepts React expliqués](#concepts-react)
4. [Flux d'une partie de A à Z](#flux-complet)
5. [Gestion des états](#gestion-des-états)
6. [API et communication réseau](#api)
7. [Modes de jeu](#modes-de-jeu)
8. [Syntaxe et patterns utilisés](#syntaxe)

---

## <a name="vue-densemble"></a>🏗️ Vue d'ensemble globale

### Hiérarchie des composants

```
Application React
├─ index.html (point d'ancrage DOM)
│  └── <div id="root"></div>
│
├─ main.jsx (point d'entrée JavaScript)
│  └── createRoot(root).render(<App />)
│
└─ App.jsx (composant racine)
   ├─ useState: currentPage, settings, selectedMode
   ├─ <Header /> (navigation)
   └─ renderPage()
      ├─ HomePage.jsx (quand currentPage = 'home')
      │  ├─ useHangmanGame() [❌ pas encore TypeScript]
      │  ├─ <HangmanFigure />
      │  ├─ <Keyboard />
      │  ├─ <WordDisplay />
      │  └─ <MindGameGrid />
      │
      ├─ SettingsPage.jsx (quand currentPage = 'settings')
      ├─ GameModePage.jsx (quand currentPage = 'gamemode')
      └─ ContactPage.jsx (quand currentPage = 'contact')
```

### Organigramme fonctionnel

```
Utilisateur interagit
        ↓
Événement (click, input)
        ↓
Gestionnaire (onGuess, onMindGameReveal, onHint)
        ↓
dispatch({ type, payload })
        ↓
reducer(state, action) → nouvel état
        ↓
État met à jour dans useReducer
        ↓
React détecte changement → re-rendu automatique
        ↓
Nouvelles valeurs calculées (maskedWord, statusMessage…)
        ↓
Composants enfants reçoivent nouvelles props
        ↓
Écran mis à jour (DOM re-rendu)
```

---

## <a name="structure-des-fichiers"></a>📁 Structure des fichiers en détail

### 1. **main.jsx** — Point d'entrée

**Rôle** : Seul fichier exécuté par le navigateur au démarrage.

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Concepts clés** :
- `createRoot(element)` : crée une « racine React » sur l'élément DOM
- `.render(<JSX />)` : demande à React de transformer JSX en DOM réel et d'insérer dans la racine
- `<StrictMode>` : active les vérifications supplémentaires en dev (exécute les effets 2× pour vérifier le nettoyage)

**Qu'est-ce que JSX ?**
- C'est du JavaScript qui ressemble à du HTML/XML
- `<App />` se transforme en `React.createElement(App)`
- React le compile via Babel (via Vite)

---

### 2. **App.jsx** — Orchestrateur global

**Rôle** : Gère les 3 états globaux et décide quelle page afficher.

```javascript
import { useState } from 'react'
import { Header } from './components/header.jsx'
import { HomePage } from './pages/HomePage.jsx'
// ... autres imports

const App = () => {
  // --- États globaux ---
  const [currentPage, setCurrentPage] = useState('home')
  const [settings, setSettings] = useState({
    difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
    hints: true,            // Activer/désactiver les indices
    language: 'en-GB',      // 'en-GB' | 'fr-FR'
  })
  const [selectedMode, setSelectedMode] = useState('regular')
  // 'regular' | 'streak' | 'speedrun' | 'mindgame'

  // --- Mise à jour partielle des settings ---
  const updateSettings = (partialSettings) => {
    setSettings((prev) => ({ ...prev, ...partialSettings }))
  }

  // --- Rendu conditionnel ---
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage settings={settings} selectedMode={selectedMode} />
      case 'settings':
        return <SettingsPage settings={settings} onUpdateSettings={updateSettings} />
      // etc...
    }
  }

  return (
    <>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </>
  )
}

export default App
```

**Concepts clés** :
- `useState` : hook pour gérer l'état local simple (une valeur + un setter)
- **Spread operator** (`...`) : `{ ...prev, ...partialSettings }` fusionne deux objets
  - Copie toutes les props de `prev`, puis les remplace par celles de `partialSettings`
  - Exemple : `{ ...{ a: 1, b: 2 }, ...{ b: 3 } }` → `{ a: 1, b: 3 }`
- **Props** : données passées aux composants enfants comme des attributs
  - `<HomePage settings={settings} />` → HomePage reçoit `settings` dans sa déstructuration

---

### 3. **pages/HomePage.jsx** — Page du jeu

**Rôle** : Assemble tous les composants du moteur de jeu et délègue la logique au hook.

```javascript
import { useState } from 'react'
import { useHangmanGame } from '../hooks/useHangmanGame.js'
import { HangmanFigure } from '../components/HangmanFigure.jsx'
import { Keyboard } from '../components/Keyboard.jsx'
import { WordDisplay } from '../components/WordDisplay.jsx'

export const HomePage = ({ settings, selectedMode }) => {
  const [letter, setLetter] = useState('')

  // --- Appel du hook personnalisé ---
  // Déstructure l'objet retourné en variables distinctes
  const {
    status,              // 'idle' | 'loading' | 'playing' | 'won' | 'lost' | 'error'
    error,               // Message d'erreur éventuel
    maskedWord,          // Mot avec _ à la place des lettres non devinées
    usedLetters,         // Toutes les lettres proposées (bonnes et mauvaises)
    wrongLetters,        // Seulement les mauvaises lettres
    mindGameCards,       // Cartes pour le mode mind game
    remainingLives,      // Vies restantes
    maxLives,            // Nombre total de vies
    remainingSeconds,    // Timer du mode speedrun
    streak,              // Nombre de victoires consécutives (mode streak)
    canUseHint,          // Booléen : indice disponible ?
    onGuess,             // Fonction : proposer une lettre
    onMindGameReveal,    // Fonction : révéler une carte
    onHint,              // Fonction : utiliser l'indice
    startNewGame,        // Fonction : nouvelle partie
  } = useHangmanGame({ settings, selectedMode })

  // --- Gestionnaire de soumission du formulaire ---
  const handleSubmit = (event) => {
    event.preventDefault()      // Empêche le rechargement de la page
    onGuess(letter)             // Envoie la lettre au hook
    setLetter('')               // Réinitialise le champ
  }

  // --- Calculs de labels pour l'affichage ---
  const modeLabel =
    selectedMode === 'regular' ? 'Brute force'
    : selectedMode === 'streak' ? 'Chain breach'
    : selectedMode === 'speedrun' ? 'Time exploit'
    : 'Cipher memory'

  const statusMessage =
    status === 'loading' ? 'Initializing target hash...'
    : status === 'won' ? 'Password cracked.'
    : status === 'lost' ? 'Trace detected. Access denied.'
    : status === 'error' ? 'Network relay unavailable'
    : 'Breach in progress'

  // --- Rendu JSX ---
  return (
    <section className="card engine-layout">
      <div className="engine-topbar">
        <h2>Cracking Console</h2>
        <div className="chip-group">
          <span className="chip">{modeLabel}</span>
          <span className="chip">Stealth traces: {remainingLives}</span>
          {selectedMode === 'speedrun' && (
            <span className="chip">Watchdog: {remainingSeconds ?? 0}s</span>
          )}
          {selectedMode === 'streak' && (
            <span className="chip">Chain: {streak}</span>
          )}
        </div>
      </div>

      <HangmanFigure wrongCount={wrongLetters.length} maxLives={maxLives} />

      <WordDisplay word={maskedWord} />

      <Keyboard usedLetters={usedLetters} />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          placeholder="Enter a letter"
        />
        <button type="submit" disabled={status !== 'playing'}>
          Guess
        </button>
      </form>

      {canUseHint && (
        <button onClick={onHint} disabled={status !== 'playing'}>
          Use Hint
        </button>
      )}

      {status === 'won' && <div className="message">🎉 You won!</div>}
      {status === 'lost' && <div className="message">💀 You lost!</div>}
      {status === 'error' && <div className="error">Error: {error}</div>}

      <button onClick={startNewGame}>New Game</button>
    </section>
  )
}
```

**Concepts clés** :
- **Déstructuration** : `const { status, error, ... } = objet`
  - Extrait des propriétés d'un objet dans des variables locales
  - Équivalent de : `const status = result.status; const error = result.error; ...`
- **Opérateur ternaire** : `condition ? siVrai : siFaux`
  - Équivalent d'un if/else en une seule ligne
- **Rendu conditionnel** : `{condition && <élément />}`
  - N'affiche l'élément QUE si la condition est vraie
- **Attributs spéciaux** :
  - `className` (au lieu de `class` car `class` est réservé en JS)
  - `disabled={condition}` (booléen)
  - `onChange`, `onSubmit`, `onClick` (événements)

---

### 4. **hooks/useHangmanGame.js** — Logique complète du jeu

**Rôle** : Encapsule **TOUTE** la logique métier du jeu du pendu. C'est le « cerveau » de l'application.

#### 4.1 Constants de configuration

```javascript
const LIVES_BY_DIFFICULTY = {
  easy: 9,      // Potence progressive + 6 parties du bonhomme = 9 étapes
  medium: 6,    // Potence affichée + 6 parties du bonhomme
  hard: 4,      // Potence affichée + 4 parties du bonhomme (simplifiées)
}

const SPEEDRUN_SECONDS_BY_DIFFICULTY = {
  easy: 90,     // 90 secondes pour mode easy
  medium: 60,   // 60 secondes pour mode medium
  hard: 45,     // 45 secondes pour mode hard
}
```

**Pourquoi ?** Ces constantes centralisent la configuration. Si tu veux changer le nombre de vies, tu changes ici sans chercher partout.

#### 4.2 État initial

```javascript
const initialState = {
  secretWord: '',           // Le mot à deviner (API ou fallback)
  uniqueLetters: [],        // Lettres uniques à trouver, normalisées
  guessedLetters: [],       // Lettres correctes devinées par le joueur
  wrongLetters: [],         // Lettres incorrectes propo sées
  mindGameCards: [],        // Cartes du mode mind game
  remainingLives: 6,        // Vies restantes (décrémente à chaque erreur)
  remainingSeconds: null,   // Temps restant (mode speedrun) ou null
  hintUsed: false,          // Indice utilisé ou non
  streak: 0,                // Nombre de victoires consécutives
  status: 'idle',           // État actuel
  error: '',                // Message d'erreur éventuel
}
```

**Explications** :
- `status` : machine à états. Valeurs : `'idle'` → `'loading'` → `'playing'` → `'won'|'lost'`
- `uniqueLetters` : après `getUniqueLetters('café')` → `['c','a','f','e']` (sans doublons, normalisées)
- `remainingSeconds` : `null` sauf en mode speedrun (sinon = nombre de secondes restantes)

#### 4.3 Fonction utilitaire : applyGuessToState

```javascript
const applyGuessToState = (state, letter, mode) => {
  // Guard clause : si la lettre a déjà été proposée, ne rien faire
  if (state.guessedLetters.includes(letter) || state.wrongLetters.includes(letter)) {
    return state
  }

  const isCorrect = state.uniqueLetters.includes(letter)

  if (isCorrect) {
    const guessedLetters = [...state.guessedLetters, letter]
    const isWon = state.uniqueLetters.every((item) => guessedLetters.includes(item))

    return {
      ...state,
      guessedLetters,
      status: isWon ? 'won' : 'playing',
      streak: isWon && mode === 'streak' ? state.streak + 1 : state.streak,
    }
  }

  // Mauvaise réponse
  const wrongLetters = [...state.wrongLetters, letter]
  const remainingLives = state.remainingLives - 1
  const isLost = remainingLives <= 0

  return {
    ...state,
    wrongLetters,
    remainingLives,
    status: isLost ? 'lost' : 'playing',
    streak: isLost && mode === 'streak' ? 0 : state.streak,
  }
}
```

**Concepts** :
- **Guard clause** : return précoce qui évite les imbrications `if/else`
- **every()** : retourne `true` si TOUS les éléments satisfont la condition
  - `[1,2,3].every(x => x > 0)` → `true`
  - `[1,2,3].every(x => x > 2)` → `false`
- **Spread array** : `[...array, newItem]` crée un nouveau tableau avec tous les éléments + le nouveau à la fin

#### 4.4 Le reducer (machine à états)

```javascript
const reducer = (state, action) => {
  // action = { type: 'NOM_ACTION', payload: données }

  if (action.type === 'START_LOADING') {
    return {
      ...state,
      secretWord: '',
      guessedLetters: [],
      wrongLetters: [],
      remainingLives: action.payload.lives,
      remainingSeconds: action.payload.seconds,
      hintUsed: false,
      status: 'loading',
      error: '',
      streak: action.payload.mode === 'streak' ? state.streak : 0,
      // En mode streak, on PRÉSERVE le streak existant
    }
  }

  if (action.type === 'START_SUCCESS') {
    return {
      ...state,
      secretWord: action.payload.word,
      uniqueLetters: action.payload.uniqueLetters,
      status: 'playing',
      error: '',
    }
  }

  if (action.type === 'START_ERROR') {
    return {
      ...state,
      status: 'error',
      error: action.payload,
    }
  }

  if (action.type === 'GUESS') {
    if (state.status !== 'playing') return state
    const letter = action.payload.letter
    return applyGuessToState(state, letter, action.payload.mode)
  }

  if (action.type === 'MIND_REVEAL') {
    if (state.status !== 'playing') return state
    const card = state.mindGameCards.find((item) => item.id === action.payload.cardId)
    if (!card || card.state !== 'hidden') return state

    const nextState = applyGuessToState(state, card.letter, action.payload.mode)
    const nextCardState = state.uniqueLetters.includes(card.letter) ? 'guessed' : 'wrong'

    return {
      ...(nextState === state ? { ...state } : nextState),
      mindGameCards: state.mindGameCards.map((item) =>
        item.id === card.id ? { ...item, state: nextCardState } : item,
      ),
    }
  }

  if (action.type === 'USE_HINT') {
    return { ...state, hintUsed: true }
  }

  if (action.type === 'TICK') {
    if (state.status !== 'playing' || state.remainingSeconds === null) {
      return state
    }
    const nextSeconds = state.remainingSeconds - 1
    const hasExpired = nextSeconds <= 0
    return {
      ...state,
      remainingSeconds: Math.max(0, nextSeconds),
      status: hasExpired ? 'lost' : state.status,
      streak: hasExpired && action.payload.mode === 'streak' ? 0 : state.streak,
    }
  }

  return state // Action inconnue → pas de changement
}
```

**Concepts** :
- **Reducer Pattern** : fonction pure `(state, action) => newState`
  - Toujours retourner UN NOUVEL objet, jamais modifier l'ancien
  - Aucun effet de bord (pas de setState, pas d'API call dans le reducer)
- **Action** : objet `{ type: 'STRING_EXPLICITE', payload: données }`
- **find()** : retourne le PREMIER élément qui satisfait la condition
- **map()** : retourne un NOUVEAU tableau avec les mêmes éléments (ou modifiés)
  - Ici : met à jour une carte en particulier tout en gardant les autres

#### 4.5 Le hook lui-même

```javascript
export const useHangmanGame = ({ settings, selectedMode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // --- useMemo : mémoriser un calcul coûteux ---
  const maxLives = useMemo(() => {
    return LIVES_BY_DIFFICULTY[settings.difficulty] ?? 6
  }, [settings.difficulty])  // ← recalcule UNIQUEMENT si settings.difficulty change

  const speedrunSeconds = useMemo(() => {
    return SPEEDRUN_SECONDS_BY_DIFFICULTY[settings.difficulty] ?? 60
  }, [settings.difficulty])

  // --- useCallback : mémoriser une fonction ---
  const startNewGame = useCallback(async () => {
    dispatch({
      type: 'START_LOADING',
      payload: {
        lives: maxLives,
        seconds: selectedMode === 'speedrun' ? speedrunSeconds : null,
        mode: selectedMode,
        mindGameCards: selectedMode === 'mindgame' ? generateMindGameCards() : [],
      },
    })

    try {
      const word = await fetchRandomWord(settings.language)
      const uniqueLetters = getUniqueLetters(word)

      dispatch({
        type: 'START_SUCCESS',
        payload: { word, uniqueLetters },
      })
    } catch (error) {
      dispatch({
        type: 'START_ERROR',
        payload: error instanceof Error ? error.message : 'Unexpected API error.',
      })
    }
  }, [maxLives, selectedMode, settings.language, speedrunSeconds])


  // --- useEffect : au montage du composant ---
  useEffect(() => {
    startNewGame()
  }, [startNewGame])
  // Quand startNewGame change (car déps changent) → lance nouvelle partie


  // --- useEffect : timer du speedrun ---
  useEffect(() => {
    if (selectedMode !== 'speedrun' || state.status !== 'playing') {
      return undefined
    }

    const timerId = setInterval(() => {
      dispatch({ type: 'TICK', payload: { mode: selectedMode } })
    }, 1000)  // Chaque 1000 ms (1 seconde)

    return () => clearInterval(timerId)  // Nettoyage : arrête le timer
  }, [selectedMode, state.status])
  // Se ré-exécute si selectedMode ou state.status change


  // --- Fonctions exposées au composant ---
  const onGuess = useCallback(
    (value) => {
      if (!isSingleLetter(value)) return
      dispatch({
        type: 'GUESS',
        payload: {
          letter: normalizeLetter(value),  // 'É' → 'e'
          mode: selectedMode,
        },
      })
    },
    [selectedMode],
  )

  const onMindGameReveal = useCallback(
    (cardId) => {
      if (selectedMode !== 'mindgame') return
      dispatch({
        type: 'MIND_REVEAL',
        payload: { cardId, mode: selectedMode },
      })
    },
    [selectedMode],
  )

  const onHint = useCallback(() => {
    if (!settings.hints || state.hintUsed || state.status !== 'playing') return

    const hiddenLetter = state.uniqueLetters.find(
      (letter) => !state.guessedLetters.includes(letter)
    )

    if (!hiddenLetter) return

    dispatch({
      type: 'USE_HINT',
      payload: { letter: hiddenLetter },
    })

    dispatch({
      type: 'GUESS',
      payload: { letter: hiddenLetter, mode: selectedMode },
    })
  }, [settings.hints, state.hintUsed, state.status, state.uniqueLetters, state.guessedLetters, selectedMode])

  // --- Retour du hook ---
  return {
    status: state.status,
    error: state.error,
    maskedWord: getMaskedWord(state.secretWord, state.guessedLetters),
    usedLetters: [...state.guessedLetters, ...state.wrongLetters],
    wrongLetters: state.wrongLetters,
    mindGameCards: state.mindGameCards,
    remainingLives: state.remainingLives,
    maxLives,
    remainingSeconds: state.remainingSeconds,
    streak: state.streak,
    canUseHint: !state.hintUsed && settings.hints,
    onGuess,
    onMindGameReveal,
    onHint,
    startNewGame,
  }
}
```

**Concepts React clés** :

| Hook | Utilité | Exemple |
|------|---------|---------|
| `useState(initial)` | État simple | `const [count, setCount] = useState(0)` |
| `useReducer(fn, init)` | État complexe avec actions | `const [state, dispatch] = useReducer(reducer, initialState)` |
| `useEffect(fn, deps)` | Effets de bord après rendu | Appels API, timers, abonnements |
| `useCallback(fn, deps)` | Mémoriser une fonction | Évite re-création à chaque rendu |
| `useMemo(fn, deps)` | Mémoriser un calcul | Évite recalcul coûteux à chaque rendu |

**Pourquoi useCallback et useMemo ?**
- Sans eux, les fonctions/valeurs seraient recréées à chaque rendu
- Les composants enfants recevraient des « nouvelles » références → re-rendus inutiles
- Avec les dépendances correctes → optimisation des performances

---

### 5. **utils/gameLogic.js** — Fonctions pures

**Rôle** : Logique métier SANS React. Des fonctions pures qui prennent des paramètres et retournent un résultat.

```javascript
// --- normalizeChar (privée) ---
const normalizeChar = (value) => {
  return value
    .normalize('NFD')                  // Décompose les accents
    .replace(/[\u0300-\u036f]/g, '')   // Supprime les diacritiques
    .toLowerCase()                     // Minuscule
}
// Exemples : 'É' → 'e', 'Ç' → 'c', 'A' → 'a'


// --- isSingleLetter ---
export const isSingleLetter = (value) => {
  if (!value || value.length !== 1) return false
  return /^[a-z]$/i.test(normalizeChar(value))
}
// Exemples : 'a' → true, 'é' → true, "ab" → false, '' → false


// --- normalizeLetter ---
export const normalizeLetter = (value) => normalizeChar(value)
// Raccourci public pour normaliseChar


// --- generateMindGameCards ---
export const generateMindGameCards = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

  // Fisher-Yates shuffle : mélange uniforme
  for (let index = alphabet.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[alphabet[index], alphabet[randomIndex]] = [alphabet[randomIndex], alphabet[index]]
  }

  return alphabet.map((letter, index) => ({
    id: `${letter}-${index}`,
    letter,
    state: 'hidden',
  }))
}
// Retourne : [{ id: 'a-0', letter: 'a', state: 'hidden' }, ...]


// --- getUniqueLetters ---
export const getUniqueLetters = (word) => {
  const letters = word
    .split('')                                // 'café' → ['c','a','f','é']
    .map(normalizeChar)                       // → ['c','a','f','e']
    .filter((char) => /^[a-z]$/i.test(char))  // Filtre les caractères non-alpha

  return [...new Set(letters)]  // Élimine doublons et reconvertit en tableau
}
// Exemples:
//   getUniqueLetters('café')       → ['c','a','f','e']
//   getUniqueLetters('hello')      → ['h','e','l','o']
//   getUniqueLetters('arc-en-ciel') → ['a','r','c','e','n','i','l'] (tiret filtré)


// --- getMaskedWord ---
export const getMaskedWord = (word, guessedLetters) => {
  const guessedSet = new Set(guessedLetters)

  return word
    .split('')
    .map((char) => {
      const normalized = normalizeChar(char)

      // Caractère non-alphabétique : affiche tel quel
      if (!/^[a-z]$/i.test(normalized)) {
        return char
      }

      // Lettre devinée : affiche en majuscule
      if (guessedSet.has(normalized)) {
        return char.toUpperCase()
      }

      // Lettre non devinée : underscore
      return '_'
    })
    .join(' ')  // Sépare par des espaces pour la lisibilité
}
// Exemples:
//   getMaskedWord('café', ['c'])     → "C _ F _"
//   getMaskedWord('café', ['c','e']) → "C _ F E"
//   getMaskedWord('hello world', ['e']) → "_ E _ _ _ W O _ _ _"
//                                        (espace conservé mais pas à deviner)
```

**Concepts JavaScript** :

| Concept | Explication | Exemple |
|---------|-------------|---------|
| `.split('')` | Convertit string en array de caractères | `'abc'.split('')` → `['a','b','c']` |
| `.map(fn)` | Applique fonction à chaque élément | `['a','b'].map(x => x.toUpperCase())` → `['A','B']` |
| `.filter(condition)` | Garde seulement éléments qui satisfont | `[1,2,3].filter(x => x > 1)` → `[2,3]` |
| `.join(sep)` | Reconvertit array en string avec séparateur | `['a','b'].join('-')` → `'a-b'` |
| `new Set()` | Ensemble sans doublons ; recherche O(1) | `new Set([1,1,2])` → `Set { 1, 2 }` |
| `/regex/` | Expressions régulières pour recherche | `/^[a-z]$/i.test('A')` → `true` |
| `.normalize('NFD')` | Décompose caractères Unicode | `'é'.normalize('NFD')` → `'e´'` |

---

### 6. **services/hangmanApi.js** — Communication réseau

**Rôle** : Appelle l'API distante pour récupérer un mot aléatoire.

```javascript
const API_BASE_URL = 'https://hangman.alexischarp.fr'
const API_TIMEOUT_MS = 6000

const FALLBACK_WORDS_BY_LOCALE = {
  'fr-FR': ['maison', 'orage', 'silence', 'horizon', ...],
  'en-GB': ['shadow', 'whisper', 'midnight', 'lantern', ...],
}

const pickFallbackWord = (locale) => {
  const words = FALLBACK_WORDS_BY_LOCALE[locale] ?? FALLBACK_WORDS_BY_LOCALE['en-GB']
  const randomIndex = Math.floor(Math.random() * words.length)
  return words[randomIndex]
}

export const fetchRandomWord = async (locale) => {
  const body = new URLSearchParams()

  if (locale) {
    body.set('locale', locale)  // Ajoute "locale=fr-FR"
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: controller.signal,
    })

    if (!response.ok) {
      return pickFallbackWord(locale)  // Fallback si erreur HTTP
    }

    const data = await response.json()

    if (data.error || !data.word || typeof data.word !== 'string') {
      return pickFallbackWord(locale)  // Fallback si réponse invalide
    }

    return data.word
  } catch {
    return pickFallbackWord(locale)  // Fallback si réseau down
  } finally {
    clearTimeout(timeoutId)
  }
}
```

**Concepts async/await** :

```javascript
// Avant (callbacks/Promises)
fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))

// Après (async/await - plus lisible)
async function getData() {
  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
```

**URLSearchParams** : construit un corps de requête

```javascript
const body = new URLSearchParams()
body.set('locale', 'fr-FR')
body.set('difficulty', 'hard')
// Résultat : "locale=fr-FR&difficulty=hard"
```

**AbortController** : timeout de 6 secondes

```javascript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 6000)
// Si 6s passent sans réponse → abort automatique
```

**Fallback local** : 30 mots précachés en cas d'offline

---

## <a name="concepts-react"></a>⚛️ Concepts React expliqués

### 1. **Hooks React**

Un **hook** est une fonction JavaScript qui commence par `use` et qui utilise les APIs de React.

#### useState : État simple

```javascript
const [count, setCount] = useState(0)
// count = 0 (valeur actuelle)
// setCount = fonction pour changer la valeur

setCount(5)           // count devient 5
setCount(prev => prev + 1)  // count devient 6
// Quand setCount est appelé → React re-rend le composant
```

#### useReducer : État complexe

```javascript
const [state, dispatch] = useReducer(reducer, initialState)
// state = l'objet d'état actuel
// dispatch = fonction pour envoyer des actions

dispatch({ type: 'ACTION_NAME', payload: données })
// dispatch envoie une ACTION au reducer
// Le reducer retourne un nouvel état
```

**Quand utiliser ?**
- `useState` : état simple (nombre, string, booléen)
- `useReducer` : état complexe avec plusieurs propriétés interdépendantes

#### useEffect : Effets de bord

```javascript
useEffect(() => {
  // Code exécuté APRÈS le rendu du composant
  console.log('Composant rendu')
  
  return () => {
    // Nettoyage : exécuté AVANT la prochaine exécution ou démontage
    console.log('Nettoyage')
  }
}, [dépendance1, dépendance2])
// Dépendances : re-exécute l'effet si une dépendance change
```

**Quand utiliser ?**
- Appels API
- Timers (setInterval, setTimeout)
- Abonnements (WebSocket, etc.)
- Manipulation du DOM

**Pièges courants** :
```javascript
useEffect(() => {
  // S'exécute à CHAQUE rendu (MAUVAIS pour les appels API)
  fetchData()
})

useEffect(() => {
  // S'exécute UNE FOIS au montage (BON pour initialisation)
  fetchData()
}, [])

useEffect(() => {
  // S'exécute si dependency change
  fetchData(dependency)
}, [dependency])
```

#### useCallback : Mémoriser une fonction

```javascript
const handleClick = useCallback(() => {
  console.log('Cliqué')
}, [])
// Sans useCallback : nouvelle fonction créée à chaque rendu
// Avec useCallback : même fonction réutilisée (optimisation)
```

**Utilité** : Si tu passes cette fonction à un enfant en prop, l'enfant ne se re-rend pas inutilement.

#### useMemo : Mémoriser une valeur

```javascript
const expensiveValue = useMemo(() => {
  // Calcul coûteux
  return someExpensiveCalculation()
}, [dependency])
// Résultat recalculé UNIQUEMENT si dependency change
```

### 2. **Cycle de vie des composants**

```
Utilisateur ouvre l'app
        ↓
Composant MONTÉ (mounted) : useEffect avec deps [] s'exécute
        ↓
Utilisateur interagit : state change
        ↓
Composant RE-RENDU : fonction du composant réexécutée, JSX réévalué
        ↓
useEffect avec deps pertinentes s'exécute
        ↓
Si deps changent : cleanup s'exécute, puis nouvel effet
        ↓
Utilisateur navigue : composant DÉMONTÉ (unmounted)
        ↓
useEffect cleanup s'exécute une dernière fois
```

### 3. **Immutabilité en React**

**Règle d'or** : JAMAIS modifier l'état directement. Toujours retourner UN NOUVEL objet.

```javascript
// ❌ MAUVAIS : mutation directe
state.count = 5
state.settings.difficulty = 'hard'

// ✅ BON : créer un nouvel objet
setState({ ...state, count: 5 })
setState({
  ...state,
  settings: { ...state.settings, difficulty: 'hard' }
})
```

**Pourquoi ?** React détecte les changements EN COMPARANT les références (===), pas le contenu. Un nouvel objet = référence différente = React voit le changement.

### 4. **Re-rendu en React**

```
Composant rend


    ↓
JSX évalué, résultat en mémoire
        ↓
React compare avec ancien JSX (diffing)
        ↓
Seulement les parties changées sont mises à jour dans le DOM
        ↓
Appel du navigateur pour repaint/reflow
        ↓
Écran mis à jour
```

**Performance** : Plus un composant est petit, plus vite React peut vérifier les changements.

---

## <a name="flux-complet"></a>🔄 Flux d'une partie de A à Z

### 1. Utilisateur accède la page home

```
HomePage.jsx se monte
        ↓
useHangmanGame() appelé
        ↓
useReducer retourne state = initialState
        ↓
useEffect avec dépendance [] déclenche startNewGame()
```

### 2. startNewGame() s'exécute

```
dispatch({ type: 'START_LOADING', ... })
        ↓
Reducer: state.status = 'loading'
        ↓
HomePage re-rend avec status='loading'
        ↓
Message "Initializing target hash..." s'affiche
        ↓
Pendant ce temps : await fetchRandomWord(locale)
        ↓
API appelée (ou fallback local après 6s)
```

### 3. Mot reçu de l'API

```
word = 'elephant' (exemple)
        ↓
getUniqueLetters('elephant') = ['e','l','p','h','a','n','t']
        ↓
dispatch({ type: 'START_SUCCESS', payload: { word, uniqueLetters } })
        ↓
Reducer: state.secretWord = 'elephant', state.uniqueLetters = [...]
        ↓
Reducer: state.status = 'playing'
        ↓
HomePage re-rend avec status='playing'
        ↓
maskedWord = getMaskedWord('elephant', []) = "_ _ _ _ _ _ _ _"
        ↓
Clavier activé, champ de saisie prêt
```

### 4. Utilisateur tape 'E'

```
<input value="e" onChange={...} />
        ↓
setLetter('e')  ← state local de HomePage change
        ↓
HomePage re-rend, champ affiche "e"
```

### 5. Utilisateur clique « Guess »

```
handleSubmit(event)
        ↓
onGuess('e')  ← appelle la fonction du hook
        ↓
isSingleLetter('e') = true ✓
        ↓
dispatch({ type: 'GUESS', payload: { letter: 'e', mode: 'regular' } })
        ↓
setLetter('')  ← vide le champ
```

### 6. Reducer traite GUESS

```
action.type = 'GUESS', payload.letter = 'e'
        ↓
applyGuessToState(state, 'e', 'regular')
        ↓
isCorrect = state.uniqueLetters.includes('e') = true ✓
        ↓
guessedLetters = ['e']
        ↓
isWon = uniqueLetters.every(letter => guessedLetters.includes(letter))
       = ['e','l','p','h','a','n','t'].every(...) = false (pas toutes devinées)
        ↓
Retourner { ...state, guessedLetters: ['e'], status: 'playing' }
```

### 7. HomePage re-rend avec nouvel état

```
maskedWord = getMaskedWord('elephant', ['e'])
        ↓
'elephant'.split('')
  .map(char => normalized=normalizeChar(char),
       normalized in Set(['e']) ? char.toUpperCase() : '_')
  .join(' ')
        ↓
= "E _ _ _ _ _ _ _"
        ↓
wrongLetters.length = 0
        ↓
HangmanFigure re-rend avec wrongCount=0, maxLives=6
        ↓
Écran se met à jour avec le mot partiellement découvert
```

### 8. Utilisateur propose 'Z' (mauvaise réponse)

```
isSingleLetter('z') = true ✓
        ↓
dispatch({ type: 'GUESS', payload: { letter: 'z', mode: 'regular' } })
        ↓
applyGuessToState(state, 'z', 'regular')
        ↓
isCorrect = uniqueLetters.includes('z') = false ❌
        ↓
wrongLetters = ['z']
        ↓
remainingLives = 6 - 1 = 5
        ↓
isLost = 5 <= 0 = false
        ↓
Retourner { ...state, wrongLetters: ['z'], remainingLives: 5, status: 'playing' }
```

### 9. HomePage re-rend

```
maskedWord = getMaskedWord('elephant', ['e'])  (inchangé)
        ↓
wrongLetters = ['z']
        ↓
remainingLives = 5
        ↓
HangmanFigure re-rend avec wrongCount=1, maxLives=6
        ↓
Dessin du pendu progresse d'une étape (1/9 étapes en mode easy)
        ↓
usedLetters = ['e', 'z']  ← affiches à l'utilisateur
```

### 10. Utilisateur remporte ou perd

```
Si toutes les lettres sont devinées :
  ↓
isWon = true
  ↓
dispatch → state.status = 'won'
  ↓
HomePage affiche message "Password cracked." ✓
  ↓
Clavier désactivé, boutton "New Game" apparaît

Si remainingLives = 0 :
  ↓
isLost = true
  ↓
dispatch → state.status = 'lost'
  ↓
HomePage affiche message "Access denied." ❌
  ↓
Mot affiché complètement révélé
  ↓
Boutton "New Game" apparaît
```

### 11. Utilisateur clique « New Game »

```
onClick={() => startNewGame()}
        ↓
dispatch({ type: 'START_LOADING', ... })  ← retour à l'étape 2
```

---

## <a name="gestion-des-états"></a>🎛️ Gestion des états

### État global (App.jsx)

```javascript
const [currentPage, setCurrentPage] = useState('home')
const [settings, setSettings] = useState({ difficulty, hints, language })
const [selectedMode, setSelectedMode] = useState('regular')
```

**Qui peut le modifier ?** :
- Header (navigation) → change `currentPage`
- SettingsPage → change `settings`
- GameModePage → change `selectedMode`

**Impact** :
- Changer `currentPage` → affiche une page différente
- Changer `settings` → nouvelle partie avec nouvelle config
- Changer `selectedMode` → nouvelle partie avec nouveau mode

### État local (HomePage.jsx)

```javascript
const [letter, setLetter] = useState('')  // Saisie utilisateur temporaire
```

**Qui peut le modifier ?** : Seulement HomePage
**Impact** : Affichage du champ texte

### État du jeu (useHangmanGame)

```javascript
const [state, dispatch] = useReducer(reducer, initialState)
// state = objet complexe avec 11 propriétés
```

**Chaîne d'actions possibles** :

```
'idle' 
  ↓ (START_LOADING)
'loading' 
  ↓ (START_SUCCESS ou START_ERROR)
'playing' 
  ↓ (GUESS ou TICK)
'won' ou 'lost'
  ↓ (START_LOADING de nouveau)
'playing'
```

**Événements qui changent l'état** :
- `onGuess` : utilisateur propose lettre → GUESS
- `onHint` → USE_HINT + GUESS
- `onMindGameReveal` → MIND_REVEAL
- Timer speedrun → TICK tous les 1000ms
- `startNewGame` → START_LOADING

---

## <a name="api"></a>🌐 API et communication réseau

### Requête à l'API

```
POST https://hangman.alexischarp.fr/
Content-Type: application/x-www-form-urlencoded

Body: locale=fr-FR
```

### Réponse attendue

```json
{
  "word": "éléphant",
  "error": null
}
```

### Timeout

6 secondes maximales. Si pas de réponse → fallback local.

### Gestion des erreurs

```
Réseau offline
  ↓ catch
Fallback local
  ↓
pickFallbackWord(locale)
  ↓
Mots précachés : 'maison', 'orage', 'silence'… (30 total)
```

### Fallback par locale

**fr-FR** : 'maison', 'orage', 'silence', 'horizon', 'verrou', 'cendre', 'foret', 'bougie', 'mystere', 'frisson'

**en-GB** : 'shadow', 'whisper', 'midnight', 'lantern', 'hollow', 'graveyard', 'phantom', 'silence', 'mirror', 'moonlight'

---

## <a name="modes-de-jeu"></a>🎮 Modes de jeu

### Mode regular (standard)

```
- Nombre de tentatives : 6 (medium) / 9 (easy) / 4 (hard)
- Pas de timer
- Pas de streak
- Pas de cartes
- Objectif : trouver le mot avant de manquer de vies
```

### Mode streak (chaîne)

```
- Nombre de tentatives : 6
- Pas de timer
- Compteur streak : +1 par victoire, 0 à la défaite
- Objectif : remporter le plus d'épisodes consécutifs
- Le streak persiste même après « New Game »
```

Code dans le reducer :
```javascript
streak: isWon && mode === 'streak' ? state.streak + 1 : state.streak
streak: isLost && mode === 'streak' ? 0 : state.streak
```

### Mode speedrun (contre la montre)

```
- Nombre de tentatives : 6
- Timer : 60 secondes (medium) / 90 (easy) / 45 (hard)
- Décrémente de 1 chaque seconde
- Si timer = 0 : défaite automatique
- Pas de streak
- Objectif : trouver le mot avant expiration du temps
```

Code useEffect :
```javascript
useEffect(() => {
  if (selectedMode !== 'speedrun' || state.status !== 'playing') return
  const timerId = setInterval(() => {
    dispatch({ type: 'TICK', payload: {...} })
  }, 1000)
  return () => clearInterval(timerId)
}, [selectedMode, state.status])
```

### Mode mind game (cartes)

```
- 26 cartes (a-z) face cachée
- Cliquer une carte = reveal lettre
- Lettre bonne = reste visible
- Lettre mauvaise = reste visible
- Même logique qu'une tentative normale
- Objective : trouver le mot en révélant les cartes
```

Code :
```javascript
onMindGameReveal(cardId)
  ↓
dispatch({ type: 'MIND_REVEAL', payload: { cardId, mode } })
  ↓
Reducer : find carte, apply GUESS logic, update carte state
```

---

## <a name="syntaxe"></a>💻 Syntaxe et patterns utilisés

### JavaScript ES6+

#### Arrow functions

```javascript
// Avant (ES5)
function add(a, b) { return a + b }

// Après (ES6)
const add = (a, b) => a + b

// Syntaxe complète (avec accolades)
const add = (a, b) => {
  const result = a + b
  return result
}

// Sans parenthèses si un param
const double = x => x * 2
```

#### Destructuring

```javascript
// Objets
const { name, age } = { name: 'Alice', age: 30 }
// name = 'Alice', age = 30

const { name: personName } = obj  // Renommer
// personName au lieu de name

// Tableaux
const [first, second] = [1, 2, 3]
// first = 1, second = 2

// Dans les paramètres
function greet({ name, age }) {
  // ...
}
greet({ name: 'Alice', age: 30 })
```

#### Spread operator

```javascript
// Objets
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 }
// obj2 = { a: 1, b: 2, c: 3 }

const obj3 = { ...obj1, b: 99 }
// obj3 = { a: 1, b: 99 }  (remplace b)

// Tableaux
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]
// arr2 = [1, 2, 3, 4, 5]

const arr3 = [...arr1]
// Copie superficielle
```

#### Template literals

```javascript
const name = 'Alice'
const age = 30

// Avant
const msg = 'Bonjour ' + name + ', âge: ' + age

// Après
const msg = `Bonjour ${name}, âge: ${age}`
// Expressions : ${expr}
```

#### Optional chaining (?.)

```javascript
const obj = { user: { name: 'Alice' } }

obj.user.name              // 'Alice'
obj.admin?.name            // undefined (pas d'erreur si admin n'existe pas)
obj.admin?.profile?.email  // Safe chaîning

// Aussi pour fonctions
obj.callback?.()  // Appelle si existe
```

#### Nullish coalescing (??)

```javascript
const value = null
value ?? 'default'  // 'default'

const count = 0
count ?? 10  // 0 (car 0 n'est pas null/undefined)

const name = undefined
name ?? 'Anonymous'  // 'Anonymous'
```

### Patterns React

#### Guard clauses

```javascript
// Mauvais (imbrication)
if (condition1) {
  if (condition2) {
    if (condition3) {
      // Faire quelque chose
    }
  }
}

// Bon (guard clauses)
if (!condition1) return
if (!condition2) return
if (!condition3) return
// Faire quelque chose
```

#### Functional updates

```javascript
// Mauvais (peut être obsolète)
setCount(count + 1)

// Bon (utilise toujours la valeur actuelle)
setCount(prev => prev + 1)
```

#### Conditional rendering

```javascript
// Méthode 1 : if/else
{status === 'won' && <WinMessage />}

// Méthode 2 : ternaire
{status === 'won' ? <WinMessage /> : <PlayMessage />}

// Méthode 3 : switch (dans une fonction)
const renderContent = () => {
  switch (status) {
    case 'won': return <WinMessage />
    case 'lost': return <LoseMessage />
    default: return <PlayMessage />
  }
}
```

#### Dependency arrays

```javascript
useEffect(() => {
  // S'exécute à CHAQUE rendu
})

useEffect(() => {
  // S'exécute UNE FOIS au montage
}, [])

useEffect(() => {
  // S'exécute si count change
}, [count])

useEffect(() => {
  // S'exécute si count OU name change
}, [count, name])
```

**Règle** : inclure TOUTES les variables extérieures qu'on utilise dans l'effet.

---

### TypeScript (non utilisé actuellement)

**Pourquoi TypeScript serait utile ?**
- Erreurs attrapées à la compilation (pas au runtime)
- Autocomplétion meilleure
- Documentation du code via types

**Exemple : typage du reducer**

```typescript
// Sans TypeScript
const reducer = (state, action) => { ... }

// Avec TypeScript
type GameState = {
  secretWord: string
  guessedLetters: string[]
  wrongLetters: string[]
  remainingLives: number
  status: 'idle' | 'loading' | 'playing' | 'won' | 'lost' | 'error'
  error: string
}

type GameAction = 
  | { type: 'START_LOADING'; payload: { lives: number } }
  | { type: 'START_SUCCESS'; payload: { word: string } }
  | { type: 'GUESS'; payload: { letter: string } }
  | { type: 'TICK' }

const reducer = (state: GameState, action: GameAction): GameState => { ... }
```

**Avantages** :
- `dispatch` impose de respecter les types d'actions
- `state.invalidProperty` génère une erreur TypeScript
- Les fonctions retournent des types explicites

---

## 📚 Récapitulatif des fichiers clés

| Fichier | Rôle | État ? | API ? | Re-render ? |
|---------|------|--------|-------|-------------|
| `main.jsx` | Point d'entrée | Non | Non | Non |
| `App.jsx` | Navigation globale | Oui (3 états) | Non | Oui |
| `HomePage.jsx` | Page du jeu | Oui (letter) | Non (passe au hook) | Oui |
| `useHangmanGame.js` | Logique du jeu | Oui (reducer) | Oui (appel API) | Non (expose état au composant) |
| `gameLogic.js` | Fonctions pures | Non | Non | Non |
| `hangmanApi.js` | Communication réseau | Non | Oui | Non |
| Composants UI | Affichage | Non | Non | Oui (reçoivent props) |

---

## 🎯 Points clés à retenir

1. **React est déclaratif** : tu décris l'UI, React l'afficheensuite (pas comme jQuery où tu fais du DOM imperatif)

2. **Unidirectional data flow** : données parent → enfants via props. Les enfants ne modifient PAS les données directement, ils appellent des fonctions reçues du parent.

3. **État = source de vérité** : chaque donnée importante doit être dans l'état, jamais dans une variable temporaire.

4. **Re-rendu** : React re-exécute les composants quand l'état change. C'est très rapide grâce à la virtualisation du DOM.

5. **Hooks** : permettent d'utiliser l'état et les effet s de bord dans des composants fonctionnels (pas de classes).

6. **Immutabilité** : toujours créer UN NOU VEL objet/tableau au lieu de modifier l'existant.

7. **Séparation des responsabilités** :
   - Composants = affichage
   - Hooks = logique
   - Services = réseau
   - Utils = calculs

8. **Fallback strategy** : si l'API est down, utiliser des données locales précachées.

---

**Document prêt à importer dans Notion ! 🚀**
