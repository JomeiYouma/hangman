const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://hangman.alexischarp.fr'

export const fetchRandomWord = async (locale) => {
  const body = new URLSearchParams()

  if (locale) {
    body.set('locale', locale)
  }

  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Unable to reach the API. Check the API URL or server availability.')
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  if (!data.word || typeof data.word !== 'string') {
    throw new Error('API response is invalid.')
  }

  return data.word
}
