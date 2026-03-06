import { useState } from 'react'
import { Header } from './components/header.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { GameModePage } from './pages/GameModePage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import './styles/app.css'

const App = () => {
	const [currentPage, setCurrentPage] = useState('home')
	const [settings, setSettings] = useState({
		difficulty: 'medium',
		hints: true,
		language: 'en-GB',
	})
	const [selectedMode, setSelectedMode] = useState('regular')

	const updateSettings = (partialSettings) => {
		setSettings((prev) => ({ ...prev, ...partialSettings }))
	}

	const renderPage = () => {
		if (currentPage === 'home') {
			return <HomePage settings={settings} selectedMode={selectedMode} />
		}

		if (currentPage === 'settings') {
			return <SettingsPage settings={settings} onChange={updateSettings} />
		}

		if (currentPage === 'gamemode') {
			return <GameModePage selectedMode={selectedMode} onChange={setSelectedMode} />
		}

		if (currentPage === 'contact') {
			return <ContactPage />
		}

		return <HomePage settings={settings} selectedMode={selectedMode} />
	}

	return (
		<main className="app-shell">
			<Header currentPage={currentPage} onNavigate={setCurrentPage} />
			<section className="page-content">{renderPage()}</section>
		</main>
	)
}

export default App
