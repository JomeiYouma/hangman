const normalizeChar = (value) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export const isSingleLetter = (value) => {
  if (!value || value.length !== 1) {
    return false
  }

  return /^[a-z]$/i.test(normalizeChar(value))
}

export const normalizeLetter = (value) => normalizeChar(value)

export const getUniqueLetters = (word) => {
  const letters = word
    .split('')
    .map(normalizeChar)
    .filter((char) => /^[a-z]$/i.test(char))

  return [...new Set(letters)]
}

export const getMaskedWord = (word, guessedLetters) => {
  const guessedSet = new Set(guessedLetters)

  return word
    .split('')
    .map((char) => {
      const normalized = normalizeChar(char)

      if (!/^[a-z]$/i.test(normalized)) {
        return char
      }

      return guessedSet.has(normalized) ? char.toUpperCase() : '_'
    })
    .join(' ')
}
