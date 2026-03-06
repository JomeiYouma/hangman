export const HangmanFigure = ({ wrongCount }) => {
  const progress = Math.min(6, Math.max(0, wrongCount))

  return (
    <svg viewBox="0 0 160 200" className="hangman-figure" aria-label="Hangman figure">
      <line x1="20" y1="180" x2="120" y2="180" />
      <line x1="50" y1="180" x2="50" y2="20" />
      <line x1="50" y1="20" x2="110" y2="20" />
      <line x1="110" y1="20" x2="110" y2="40" />

      {progress >= 1 && <circle cx="110" cy="55" r="15" />}
      {progress >= 2 && <line x1="110" y1="70" x2="110" y2="120" />}
      {progress >= 3 && <line x1="110" y1="85" x2="85" y2="105" />}
      {progress >= 4 && <line x1="110" y1="85" x2="135" y2="105" />}
      {progress >= 5 && <line x1="110" y1="120" x2="90" y2="150" />}
      {progress >= 6 && <line x1="110" y1="120" x2="130" y2="150" />}
    </svg>
  )
}
