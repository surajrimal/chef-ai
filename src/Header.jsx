import chefClaudeLogo from "./assets/hero.png"

export default function Header({ user, onLogout }) {
    return (
        <header className="site-header">
            <img src={chefClaudeLogo} alt="Chef AI logo" className="site-header-image" />
            <div className="site-header-copy">
                <h1>Chef AI</h1>
                <p>Type what you have in your kitchen, and Chef AI will turn it into a recipe.</p>
            </div>
            {user && <div className="account-actions">
                <span className="account-email">{user.name || user.email}</span>
                <button type="button" onClick={onLogout}>Sign out</button>
            </div>}
        </header>
    )
}
