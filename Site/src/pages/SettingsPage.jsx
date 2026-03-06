// ============================================================
// Fichier : SettingsPage.jsx
// Rôle   : Page des paramètres (difficulté, langue, indices).
//          Permet à l'utilisateur de modifier les réglages du jeu.
//
// Concepts React / JSX utilisés :
//   • Formulaires contrôlés (controlled components) :
//     En React, un champ de formulaire est « contrôlé » quand
//     sa valeur est gérée par l'état React (via value={state}).
//     Quand l'utilisateur change la valeur, on appelle onChange
//     pour mettre à jour l'état, ce qui re-rend le composant
//     avec la nouvelle valeur. Le flux est :
//       Utilisateur tape/choisit → onChange → setState → re-render → value
//
//   • htmlFor au lieu de for :
//     En JSX, l'attribut HTML « for » (dans <label for="...">) s'écrit
//     « htmlFor » car « for » est un mot réservé en JavaScript.
//     (Même logique que className au lieu de class.)
//
//   • event.target.value / event.target.checked :
//     L'objet « event » est créé automatiquement par le navigateur
//     quand un événement se produit.
//       event.target  = l'élément HTML qui a déclenché l'événement
//       .value        = la valeur du <select> ou <input type='text'>
//       .checked      = true/false pour un <input type='checkbox'>
//
// Props :
//   settings (object)   – { difficulty, hints, language }
//   onChange (function) – callback pour modifier un paramètre
//                         Appelé avec un objet partiel :
//                         onChange({ difficulty: 'hard' })
//
// Debug  : console.log('[SettingsPage] settings:', settings)
// ============================================================
export const SettingsPage = ({ settings, onChange }) => {
  return (
    <section className="card">
      <h2>Settings</h2>

      {/* --- Difficulté (select / liste déroulante) --- */}
      <div className="field-row">
        {/* htmlFor lie le <label> au <select> via son id → clic sur le label = focus sur le select */}
        <label htmlFor="difficulty">Difficulty</label>
        {/* value contrôlée par React : la valeur affichée dépend de l'état */}
        {/* Quand l'utilisateur change la sélection, onChange est appelé
            avec UN OBJET contenant juste la propriété modifiée.
            Le parent fusionne avec le reste des settings (spread operator). */}
        <select
          id="difficulty"
          value={settings.difficulty}
          onChange={(event) => onChange({ difficulty: event.target.value })}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* --- Langue --- */}
      <div className="field-row">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={settings.language}
          onChange={(event) => onChange({ language: event.target.value })}
        >
          <option value="en-GB">English (UK)</option>
          <option value="fr-FR">Français</option>
        </select>
      </div>

      {/* --- Indices (checkbox) --- */}
      <div className="field-row checkbox-row">
        <label htmlFor="hints">Hints</label>
        {/* Pour une checkbox, c'est « checked » et non « value » */}
        {/* event.target.checked retourne true ou false */}
        <input
          id="hints"
          type="checkbox"
          checked={settings.hints}
          onChange={(event) => onChange({ hints: event.target.checked })}
        />
      </div>
    </section>
  )
}
