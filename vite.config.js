import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const env = globalThis.process?.env ?? {}

const getGithubPagesBase = () => {
  const isGitHubActions = env.GITHUB_ACTIONS === 'true'

  if (!isGitHubActions) {
    return '/'
  }

  const repository = env.GITHUB_REPOSITORY ?? ''
  const repoName = repository.split('/')[1]

  if (!repoName) {
    return '/'
  }

  // Si le repo est de type "username.github.io", la racine Pages est '/'.
  if (repoName.endsWith('.github.io')) {
    return '/'
  }

  return `/${repoName}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getGithubPagesBase(),
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
})
