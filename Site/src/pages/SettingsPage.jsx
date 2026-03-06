export const SettingsPage = ({ settings, onChange }) => {
  return (
    <section className="card">
      <h2>Settings</h2>

      <div className="field-row">
        <label htmlFor="difficulty">Difficulty</label>
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

      <div className="field-row checkbox-row">
        <label htmlFor="hints">Hints</label>
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
