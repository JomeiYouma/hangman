import { useState } from 'react'
import { useHangmanGame } from '../hooks/useHangmanGame.js'
import { HangmanFigure } from '../components/HangmanFigure.jsx'
import { Keyboard } from '../components/Keyboard.jsx'
import { WordDisplay } from '../components/WordDisplay.jsx'

export const HomePage = ({ settings, selectedMode }) => {
  const [letter, setLetter] = useState('')

  const {
    status,
    error,
    maskedWord,
    usedLetters,
    wrongLetters,
    remainingLives,
    remainingSeconds,
    streak,
    canUseHint,
    onGuess,
    onHint,
    startNewGame,
  } = useHangmanGame({ settings, selectedMode })

  const handleSubmit = (event) => {
    event.preventDefault()
    onGuess(letter)
    setLetter('')
  }

  const modeLabel =
    selectedMode === 'regular'
      ? 'Regular mode'
      : selectedMode === 'streak'
        ? 'Streak mode'
        : 'Speedrun mode'

  const statusMessage =
    status === 'loading'
      ? 'Loading a new word...'
      : status === 'won'
        ? 'You won!'
        : status === 'lost'
          ? 'You lost!'
          : status === 'error'
            ? 'API error'
            : 'Game in progress'

  return (
    <section className="card engine-layout">
      <div className="engine-topbar">
        <h2>Engine</h2>
        <div className="chip-group">
          <span className="chip">{modeLabel}</span>
          <span className="chip">Lives: {remainingLives}</span>
          {selectedMode === 'speedrun' && <span className="chip">Time: {remainingSeconds ?? 0}s</span>}
          {selectedMode === 'streak' && <span className="chip">Streak: {streak}</span>}
        </div>
      </div>

      <HangmanFigure wrongCount={wrongLetters.length} />
      <WordDisplay maskedWord={maskedWord} />

      <p className="status-line">{statusMessage}</p>
      {error && <p className="error-line">{error}</p>}

      <form className="guess-form" onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={1}
          value={letter}
          onChange={(event) => setLetter(event.target.value)}
          placeholder="Enter a letter"
          disabled={status !== 'playing'}
        />
        <button className="primary-btn" type="submit" disabled={status !== 'playing'}>
          Guess
        </button>
      </form>

      <Keyboard usedLetters={usedLetters} disabled={status !== 'playing'} onGuess={onGuess} />

      <div className="actions-row">
        <button className="secondary-btn" onClick={startNewGame}>
          New game
        </button>
        <button className="secondary-btn" disabled={!canUseHint} onClick={onHint}>
          Use hint
        </button>
      </div>
    </section>
  )
}
