const MODES = [
  {
    key: 'regular',
    title: 'Regular mode',
    description: 'Classic hangman with lives.',
  },
  {
    key: 'streak',
    title: 'Streak mode',
    description: 'Win consecutive games to build your streak.',
  },
  {
    key: 'speedrun',
    title: 'Speedrun mode',
    description: 'Guess the word before the timer ends.',
  },
]

export const GameModePage = ({ selectedMode, onChange }) => {
  return (
    <section className="card">
      <h2>Gamemode</h2>
      <div className="mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            className={selectedMode === mode.key ? 'mode-card active' : 'mode-card'}
            onClick={() => onChange(mode.key)}
          >
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
