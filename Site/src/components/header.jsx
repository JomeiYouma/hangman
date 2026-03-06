const navItems = [
    { key: 'home', label: 'Homepage' },
    { key: 'settings', label: 'Settings' },
    { key: 'gamemode', label: 'Gamemode' },
    { key: 'contact', label: 'Contact' },
]

export const Header = ({ currentPage, onNavigate }) => {
    return (
        <header className="header">
            <h1>Hangman Game</h1>
            <nav>
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.key}>
                            <button
                                className={currentPage === item.key ? 'nav-btn active' : 'nav-btn'}
                                onClick={() => onNavigate(item.key)}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}