import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import './Navbar.css';
import searchIcon from '../assets/search.ico';
import gledati from '../assets/gledati.png';

export default function Navbar({ searchQuery, setSearchQuery, handleSearch }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef();
  const mobileMenuRef = useRef();
  const searchRef = useRef();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

  const isHomePage = location.pathname === '/home';
  const isSeriesPage=location.pathname==='/series';

  const currentPage = location.pathname.replace('/', '') || 'Trending';
  const formattedPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setDesktopSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="navbar-desktop">
        <div className="logo-container" onClick={() => navigate('/home')}>
        </div>

        <div className="nav-links-center">
          <NavLink to="/home" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => (isActive ? 'active' : '')}>Recommendations</NavLink>
          <NavLink to="/series" className={({ isActive }) => (isActive ? 'active' : '')}>Series</NavLink>
        </div>

        <div className="auth-links">
        {(isHomePage || isSeriesPage) && (
  <>
    {!desktopSearchOpen && (
      <button
        className="search-icon-button"
        onClick={() => setDesktopSearchOpen(true)}
      >
        <img src={searchIcon} alt="Search" className="icon" />
      </button>
    )}
    {desktopSearchOpen && (
      <div className="desktop-search-wrapper" ref={searchRef}>
        <span className="search-icon-inside">
          <img src={searchIcon} alt="Search" className="icon" />
        </span>
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
    )}
  </>
)}


          {user ? (
            <div className="profile-avatar-container" ref={dropdownRef}>
              <img
                src={user.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt="Profile"
                className="profile-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                  <NavLink to="/watchlist" className="dropdown-item">Watchlist</NavLink>
                  <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/signin">Sign In</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="navbar-mobile">
        <div className="mobile-left" onClick={() => navigate('/home')}>
          <img src={gledati} alt="Logo" />
        </div>

        <div className="mobile-title">{formattedPage}</div>

        <div className="mobile-icons">
          {(isHomePage||isSeriesPage) && (
            <button className="mobile-search-icon" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
              <img src={searchIcon} alt="Search" className="icon" />
            </button>
          )}
          <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            &#9776;
          </div>
        </div>
      </div>

      {(isHomePage||isSeriesPage) && mobileSearchOpen && (
        <div className="mobile-search-bar" ref={searchRef}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      )}

      {mobileMenuOpen && (
        <div className="mobile-dropdown" ref={mobileMenuRef}>
          <NavLink to="/home" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/recommendations" onClick={() => setMobileMenuOpen(false)}>Recommendations</NavLink>
          <NavLink to="/series" onClick={() => setMobileMenuOpen(false)}>Series</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
              <NavLink to="/watchlist" onClick={() => setMobileMenuOpen(false)}>Watchlist</NavLink>
              <button className="logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</NavLink>
              <NavLink to="/register" onClick={() => setMobileMenuOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
