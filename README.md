# Cipher Breach: Hangman Protocol

Application React/Vite de pendu transformee en experience "terminal de cracking".

Le jeu garde les mecaniques du hangman, avec une UI immersive cyber:
1. fond fullscreen anime type terminal (FaultyTerminal)
2. ambiance hacking (texte, labels, cards, status)
3. badge operateur 3D interactif (Lanyard)
4. mode mind game (grille de cartes au lieu du clavier)

## Fonctionnalites

1. 4 modes de jeu:
1. Brute force
2. Chain breach (streak)
3. Time exploit (timer)
4. Cipher memory (mind game)

2. API resiliente:
1. appel API distant pour le mot
2. timeout reseau
3. fallback local FR/EN si l'API ne repond pas

3. Contact immersif:
1. carte operateur dans un lanyard 3D draggable
2. photo profil importee depuis [src/assets/photoProfileDetourage.png](src/assets/photoProfileDetourage.png)

## Stack

1. React 19
2. Vite 7
3. Three.js + React Three Fiber + Drei + Rapier
4. OGL (background shader terminal)
5. ESLint

## Installation

```bash
npm install
```

## Lancer le projet

```bash
npm run dev
```

L'app sera accessible sur l'URL affichee par Vite (souvent http://localhost:5173).

## Scripts utiles

```bash
npm run dev      # mode developpement
npm run build    # build production
npm run preview  # preview du build
npm run lint     # verification ESLint
```

## Deploiement GitHub Pages (Actions)

Le projet contient un workflow pret a l'emploi:
1. [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)

### Etapes a faire sur GitHub

1. Push le projet sur la branche `main`.
2. Ouvrir Settings > Pages dans ton repository.
3. Dans Source, choisir `GitHub Actions`.
4. Verifier que le workflow `Deploy To GitHub Pages` est lance apres un push.

### URL finale

1. Repo standard (`owner/repo`):
1. `https://owner.github.io/repo/`
2. Repo user page (`owner.github.io`):
1. `https://owner.github.io/`

La base Vite est geree automatiquement dans [vite.config.js](vite.config.js) selon l'environnement GitHub Actions.

## Personnalisation rapide

1. Photo du badge contact:
1. remplacer [src/assets/photoProfileDetourage.png](src/assets/photoProfileDetourage.png)

2. Profil operateur (nom, role, lien):
1. modifier [src/components/Lanyard.jsx](src/components/Lanyard.jsx)
2. modifier [src/pages/ContactPage.jsx](src/pages/ContactPage.jsx)

3. Identite visuelle cyber:
1. modifier [src/styles/app.css](src/styles/app.css)

4. Background terminal:
1. regler les props dans [src/App.jsx](src/App.jsx)
2. shader dans [src/components/FaultyTerminal.jsx](src/components/FaultyTerminal.jsx)

## Structure principale

1. [src/pages/HomePage.jsx](src/pages/HomePage.jsx): ecran de jeu principal
2. [src/hooks/useHangmanGame.js](src/hooks/useHangmanGame.js): logique metier du jeu
3. [src/services/hangmanApi.js](src/services/hangmanApi.js): API + fallback local
4. [src/components/HangmanFigure.jsx](src/components/HangmanFigure.jsx): rendu du pendu
5. [src/components/MindGameGrid.jsx](src/components/MindGameGrid.jsx): grille du mode mind game
6. [src/components/FaultyTerminal.jsx](src/components/FaultyTerminal.jsx): fond terminal anime
7. [src/components/Lanyard.jsx](src/components/Lanyard.jsx): badge 3D contact

## Notes

1. La config Vite accepte les .glb via `assetsInclude` dans [vite.config.js](vite.config.js).
2. Le projet est en JavaScript (pas TypeScript).
