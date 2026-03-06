import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { fetchRandomWord } from '../services/hangmanApi.js'
import {
  getMaskedWord,
  getUniqueLetters,
  isSingleLetter,
  normalizeLetter,
} from '../utils/gameLogic.js'

const LIVES_BY_DIFFICULTY = {
  easy: 8,
  medium: 6,
  hard: 4,
}

const SPEEDRUN_SECONDS_BY_DIFFICULTY = {
  easy: 90,
  medium: 60,
  hard: 45,
}

const initialState = {
  secretWord: '',
  uniqueLetters: [],
  guessedLetters: [],
  wrongLetters: [],
  remainingLives: 6,
  remainingSeconds: null,
  hintUsed: false,
  streak: 0,
  status: 'idle',
  error: '',
}

const reducer = (state, action) => {
  if (action.type === 'START_LOADING') {
    return {
      ...state,
      secretWord: '',
      uniqueLetters: [],
      guessedLetters: [],
      wrongLetters: [],
      remainingLives: action.payload.lives,
      remainingSeconds: action.payload.seconds,
      hintUsed: false,
      status: 'loading',
      error: '',
      streak: action.payload.mode === 'streak' ? state.streak : 0,
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
    if (state.status !== 'playing') {
      return state
    }

    const letter = action.payload.letter

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
        streak:
          isWon && action.payload.mode === 'streak'
            ? state.streak + 1
            : action.payload.mode === 'streak'
              ? state.streak
              : 0,
      }
    }

    const wrongLetters = [...state.wrongLetters, letter]
    const remainingLives = state.remainingLives - 1
    const isLost = remainingLives <= 0

    return {
      ...state,
      wrongLetters,
      remainingLives,
      status: isLost ? 'lost' : 'playing',
      streak: isLost && action.payload.mode === 'streak' ? 0 : state.streak,
    }
  }

  if (action.type === 'USE_HINT') {
    return {
      ...state,
      hintUsed: true,
    }
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

  return state
}

export const useHangmanGame = ({ settings, selectedMode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const maxLives = useMemo(() => {
    return LIVES_BY_DIFFICULTY[settings.difficulty] ?? 6
  }, [settings.difficulty])

  const speedrunSeconds = useMemo(() => {
    return SPEEDRUN_SECONDS_BY_DIFFICULTY[settings.difficulty] ?? 60
  }, [settings.difficulty])

  const startNewGame = useCallback(async () => {
    dispatch({
      type: 'START_LOADING',
      payload: {
        lives: maxLives,
        seconds: selectedMode === 'speedrun' ? speedrunSeconds : null,
        mode: selectedMode,
      },
    })

    try {
      const word = await fetchRandomWord(settings.language)
      const uniqueLetters = getUniqueLetters(word)

      dispatch({
        type: 'START_SUCCESS',
        payload: {
          word,
          uniqueLetters,
        },
      })
    } catch (error) {
      dispatch({
        type: 'START_ERROR',
        payload: error instanceof Error ? error.message : 'Unexpected API error.',
      })
    }
  }, [maxLives, selectedMode, settings.language, speedrunSeconds])

  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  useEffect(() => {
    if (selectedMode !== 'speedrun' || state.status !== 'playing') {
      return undefined
    }

    const timerId = setInterval(() => {
      dispatch({ type: 'TICK', payload: { mode: selectedMode } })
    }, 1000)

    return () => clearInterval(timerId)
  }, [selectedMode, state.status])

  const onGuess = useCallback(
    (value) => {
      if (!isSingleLetter(value)) {
        return
      }

      dispatch({
        type: 'GUESS',
        payload: {
          letter: normalizeLetter(value),
          mode: selectedMode,
        },
      })
    },
    [selectedMode],
  )

  const onHint = useCallback(() => {
    if (!settings.hints || state.hintUsed || state.status !== 'playing') {
      return
    }

    const hiddenLetter = state.uniqueLetters.find((letter) => !state.guessedLetters.includes(letter))

    if (!hiddenLetter) {
      return
    }

    dispatch({ type: 'USE_HINT' })
    dispatch({
      type: 'GUESS',
      payload: {
        letter: hiddenLetter,
        mode: selectedMode,
      },
    })
  }, [selectedMode, settings.hints, state.guessedLetters, state.hintUsed, state.status, state.uniqueLetters])

  const maskedWord = useMemo(() => {
    return getMaskedWord(state.secretWord, state.guessedLetters)
  }, [state.secretWord, state.guessedLetters])

  const usedLetters = useMemo(() => {
    return [...state.guessedLetters, ...state.wrongLetters]
  }, [state.guessedLetters, state.wrongLetters])

  return {
    status: state.status,
    error: state.error,
    maskedWord,
    wrongLetters: state.wrongLetters,
    usedLetters,
    remainingLives: state.remainingLives,
    remainingSeconds: state.remainingSeconds,
    streak: state.streak,
    hintUsed: state.hintUsed,
    canUseHint: settings.hints && !state.hintUsed && state.status === 'playing',
    onGuess,
    onHint,
    startNewGame,
  }
}
