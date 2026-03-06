const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const Keyboard = ({ usedLetters, disabled, onGuess }) => {
  return (
    <div className="keyboard-grid">
      {ALPHABET.map((letter) => {
        const isUsed = usedLetters.includes(letter)

        return (
          <button
            key={letter}
            className="key-btn"
            disabled={disabled || isUsed}
            onClick={() => onGuess(letter)}
          >
            {letter.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
