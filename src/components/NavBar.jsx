import { Link } from 'react-router-dom'
import '../css/NavBar.css'

function NavBar() {
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">Memo.AI</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/create" className="nav-link">Create</Link>
            <Link to="/prev" className="nav-link">Your Cheatsheets</Link>
            
        </div>
    </nav>
}

export default NavBar;