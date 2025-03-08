import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={closeMobileMenu}>Resume Builder</Link>
        </div>
        
        <button 
          className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/create" 
            className={location.pathname === '/create' ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Create Resume
          </Link>
          <Link 
            to="/ai-optimize" 
            className={location.pathname === '/ai-optimize' ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            AI Optimize
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
