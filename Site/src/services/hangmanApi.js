// ============================================================
// Fichier : hangmanApi.js
// Rôle   : Service d'appel à l'API externe pour récupérer
//          un mot aléatoire (en anglais ou français).
//
// Ce fichier ne contient PAS de React. C'est du JavaScript
// pur qui gère la communication réseau (HTTP).
//
// Concepts JS utilisés :
//   • async / await :
//     Le mot-clé « async » devant une fonction indique qu'elle
//     contient du code ASYNCHRONE (qui prend du temps, comme
//     un appel réseau). Elle retourne toujours une Promise.
//     « await » ATTEND que la Promise se résolve avant de continuer.
//     Sans await, on aurait un objet Promise au lieu du résultat.
//
//   • fetch() :
//     Fonction native du navigateur pour faire des requêtes HTTP.
//     Retourne une Promise qui se résout en un objet Response.
//       fetch(url, { method, headers, body })
//
//   • URLSearchParams :
//     Classe JS qui construit un corps de requête au format
//     « application/x-www-form-urlencoded » (comme un formulaire HTML).
//     Ex. : body.set('locale', 'fr') → "locale=fr"
//
//   • throw new Error(…) :
//     Lance une exception (erreur) qui sera rattrapée par un
//     try/catch dans le code appelant.
//
// Debug  : console.log('[hangmanApi] fetch word, locale:', locale)
// ============================================================

// URL de base de l'API. Définie comme constante car elle ne change pas.
const API_BASE_URL = 'https://hangman.alexischarp.fr'

// --- fetchRandomWord ------------------------------------------------
// Appelle l'API pour obtenir un mot aléatoire.
//
// Paramètre :
//   locale (string) – le code de langue ('en-GB', 'fr-FR'…)
//
// Retour :
//   Promise<string> – le mot retourné par l'API (ex. "éléphant")
//
// Erreurs possibles (lancées avec throw) :
//   – Le serveur est inaccessible
//   – L'API retourne une erreur dans sa réponse
//   – La réponse ne contient pas de mot valide
// -------------------------------------------------------------------
export const fetchRandomWord = async (locale) => {
  // URLSearchParams construit le corps de la requête POST
  // au format clé=valeur (comme un formulaire HTML)
  const body = new URLSearchParams()

  if (locale) {
    body.set('locale', locale)  // Ajoute "locale=fr-FR" au corps
  }

  // fetch() envoie la requête HTTP et retourne une Promise.
  // await attend que le serveur réponde.
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',                                       // Méthode HTTP (GET, POST, PUT, DELETE…)
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Indique le format des données envoyées
    },
    body,  // Le corps de la requête (URLSearchParams se convertit automatiquement en string)
  })

  // response.ok est true si le code HTTP est 200-299.
  // Sinon (404, 500…), on lance une erreur.
  if (!response.ok) {
    throw new Error('Unable to reach the API. Check the API URL or server availability.')
  }

  // response.json() parse la réponse JSON en objet JavaScript.
  // C'est aussi une opération asynchrone → on utilise await.
  const data = await response.json()

  // Vérifications de la réponse
  if (data.error) {
    throw new Error(data.error)
  }

  // typeof vérifie le type d'une variable en JavaScript.
  // Les types possibles : 'string', 'number', 'boolean', 'object',
  //                       'undefined', 'function', 'symbol', 'bigint'
  if (!data.word || typeof data.word !== 'string') {
    throw new Error('API response is invalid.')
  }

  return data.word  // Retourne le mot (ex. "éléphant")
}
