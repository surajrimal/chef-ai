import chefClaudeLogo from "./assets/hero.png"

export default function Header() {
    return (
        <header className="site-header">
            <img src={chefClaudeLogo} alt="Chef AI logo" className="site-header-image" />
            <h1>Chef AI</h1>
        </header>
    )
}
