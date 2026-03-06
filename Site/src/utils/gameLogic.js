// ============================================================
// Fichier : gameLogic.js
// Rôle   : Fonctions utilitaires PURES (sans état React) pour
//          la logique du jeu du pendu.
//          "Pure" signifie qu'elles ne modifient rien à l'extérieur :
//          elles prennent des paramètres et retournent un résultat,
//          sans effet de bord (pas de setState, pas d'appel API…).
//
// Debug  : Ajouter console.log() dans chaque fonction pour
//          vérifier les entrées / sorties pendant le développement.
//          Ex. : console.log('[gameLogic] normalizeChar:', value, '→', result)
// ============================================================

// --- normalizeChar -------------------------------------------------
// Supprime les accents d'un caractère pour pouvoir comparer les
// lettres de manière uniforme (« é » → « e », « ç » → « c »…).
//
// Méthode utilisée (chaîne de 3 transformations) :
//   1. .normalize('NFD')
//        → Décompose le caractère Unicode.
//          NFD = "Normalization Form Decomposition".
//          Exemple : « é » (1 caractère) → « e » + « ´ » (2 caractères)
//
//   2. .replace(/[\u0300-\u036f]/g, '')
//        → Supprime tous les « combining diacritical marks »
//          (la plage Unicode U+0300 à U+036F contient les accents
//          séparés produits par l'étape 1).
//        → Le flag « g » (global) signifie "remplacer TOUTES les
//          occurrences, pas seulement la première".
//
//   3. .toLowerCase()
//        → Met en minuscule pour que 'A' et 'a' soient identiques.
//
// Exemples :
//   normalizeChar('É') → 'e'
//   normalizeChar('ç') → 'c'
//   normalizeChar('A') → 'a'
//   normalizeChar(' ') → ' '   ← un espace reste un espace
// -------------------------------------------------------------------
const normalizeChar = (value) => {
  return value
    .normalize('NFD')                  // Étape 1 : décomposer les accents
    .replace(/[\u0300-\u036f]/g, '')   // Étape 2 : retirer les diacritiques
    .toLowerCase()                     // Étape 3 : tout en minuscule
}

// --- isSingleLetter ------------------------------------------------
// Vérifie qu'une valeur est bien UNE SEULE lettre de l'alphabet.
// On normalise d'abord pour que les lettres accentuées (é, ü…)
// soient acceptées (elles deviennent e, u… après normalisation).
//
// Paramètre :
//   value (string) – la saisie de l'utilisateur
//
// Retour :
//   true si c'est une seule lettre, false sinon
//
// La regex /^[a-z]$/i signifie :
//   ^      → début de la chaîne
//   [a-z]  → exactement une lettre de a à z
//   $      → fin de la chaîne
//   /i     → flag « insensible à la casse » (majuscule/minuscule)
// -------------------------------------------------------------------
export const isSingleLetter = (value) => {
  if (!value || value.length !== 1) {
    return false
  }

  return /^[a-z]$/i.test(normalizeChar(value))
}

// --- normalizeLetter -----------------------------------------------
// Raccourci public vers normalizeChar.
// Exporté pour que d'autres modules (ex. useHangmanGame.js) puissent
// normaliser une lettre sans accéder à la fonction privée.
//
// En JS, une fonction non exportée (comme normalizeChar) est privée
// au module : elle n'est accessible que dans CE fichier.
// -------------------------------------------------------------------
export const normalizeLetter = (value) => normalizeChar(value)

// --- getUniqueLetters ----------------------------------------------
// Extrait les lettres UNIQUES et NORMALISÉES d'un mot.
//
// ⚠️  IMPORTANT pour la gestion des espaces :
//     Les espaces, tirets, apostrophes et autres caractères
//     NON-alphabétiques sont FILTRÉS ici par .filter().
//     Ils n'apparaissent JAMAIS dans la liste des lettres à deviner.
//     → C'est ce qui fait que les ESPACES n'ont PAS besoin
//       d'être devinés pour gagner la partie.
//
// ⚠️  IMPORTANT pour la gestion des accents :
//     Les lettres sont normalisées (« é » → « e »), donc deviner
//     « e » suffit pour valider « é », « è », « ê »…
//
// Chaîne de traitement :
//   1. word.split('')              → transforme la string en tableau de caractères
//   2. .map(normalizeChar)         → normalise chaque caractère (retire accents)
//   3. .filter(…)                  → ne garde QUE les lettres [a-z]
//   4. new Set(…)                  → élimine les doublons (Set = ensemble mathématique)
//   5. [...set]                    → reconvertit le Set en tableau classique
//
// Exemples :
//   getUniqueLetters("arc-en-ciel") → ['a','r','c','e','n','i','l']
//     (le tiret est filtré, le doublon 'c' est retiré par le Set)
//   getUniqueLetters("hello world") → ['h','e','l','o','w','r','d']
//     (l'espace est filtré, le doublon 'l' est retiré)
// -------------------------------------------------------------------
export const getUniqueLetters = (word) => {
  const letters = word
    .split('')                                       // 1. "café" → ['c','a','f','é']
    .map(normalizeChar)                              // 2. → ['c','a','f','e']
    .filter((char) => /^[a-z]$/i.test(char))         // 3. retire espaces, tirets…

  return [...new Set(letters)]                       // 4+5. retire les doublons
}

// --- getMaskedWord -------------------------------------------------
// Construit la représentation « masquée » du mot pour l'affichage.
//
// Règles d'affichage :
//   • Espace ou caractère non-alphabétique (tiret, apostrophe…)
//       → affiché TEL QUEL (pas besoin de le deviner)
//       → Les espaces apparaissent naturellement entre les mots
//
//   • Lettre déjà devinée
//       → affichée en MAJUSCULE avec ses ACCENTS D'ORIGINE
//         Ex. : le joueur devine 'e' → le 'é' du mot s'affiche 'É'
//
//   • Lettre pas encore devinée
//       → remplacée par le caractère '_' (underscore)
//
// 📌 Note sur les accents (fonctionnement clé) :
//    On COMPARE la version normalisée (sans accent) du caractère
//    avec les lettres devinées (elles aussi normalisées).
//    Mais on AFFICHE le caractère ORIGINAL (avec accent).
//    → Appuyer sur 'E' au clavier révèle aussi 'É', 'È', 'Ê'…
//
// Le .join(' ') à la fin sépare chaque caractère par un espace
// pour la lisibilité (ex. "C _ F É").
//
// Paramètres :
//   word           (string)   – le mot secret complet (ex. "café")
//   guessedLetters (string[]) – lettres correctement devinées (ex. ['c','e'])
//
// Retour :
//   string – le mot masqué prêt à afficher (ex. "C _ F É")
// -------------------------------------------------------------------
export const getMaskedWord = (word, guessedLetters) => {
  // new Set() convertit le tableau en « ensemble » (Set).
  // Avantage : la recherche .has() est en O(1) (instantanée)
  // au lieu de O(n) avec .includes() sur un tableau.
  const guessedSet = new Set(guessedLetters)

  return word
    .split('')
    .map((char) => {
      const normalized = normalizeChar(char)

      // Si ce n'est PAS une lettre (espace, tiret, apostrophe…),
      // on l'affiche tel quel. Pas besoin de le deviner.
      if (!/^[a-z]$/i.test(normalized)) {
        return char
      }

      // Si la lettre normalisée a été devinée, on affiche le
      // caractère ORIGINAL en majuscule (conserve les accents).
      // L'opérateur ternaire  condition ? siVrai : siFaux
      // est un raccourci de if/else sur une seule ligne.
      return guessedSet.has(normalized) ? char.toUpperCase() : '_'
    })
    .join(' ')  // Sépare chaque caractère par un espace pour la lisibilité
}
