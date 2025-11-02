import React, { useState, useEffect } from 'react'
import Search from './Search'

const Navbar = ({ activeFilter, onFilterChange, searchTerm, setSearchTerm, theme, onToggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevenir scroll do body quando menu está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleFilterClick = (filter) => {
    setIsOpen(false) // Fechar menu ao clicar em um item
    onFilterChange?.(filter) // Notifica o componente pai sobre a mudança de filtro
  }

  const menuItems = [
    { id: 'movies', label: 'Filmes', icon: '🎬' },
    { id: 'series', label: 'Séries', icon: '📺' },
    { id: 'anime', label: 'Animações', icon: '🎨' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <span className="logo-text">MovieApp</span>
        </div>

        {/* Barra de Pesquisa - Desktop */}
        <div className="navbar-search-desktop">
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* Menu Desktop */}
        <ul className="navbar-menu-desktop">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`navbar-link ${activeFilter === item.id ? 'active' : ''}`}
                onClick={() => handleFilterClick(item.id)}
                aria-label={`Filtrar por ${item.label}`}
              >
                <span className="navbar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              className="navbar-link theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              title={`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativo`}
            >
              <span className="navbar-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </li>
        </ul>

        {/* Botão Hambúrguer */}
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          type="button"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Barra de Pesquisa - Mobile (sempre visível no navbar) */}
      <div className="navbar-search-mobile">
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Menu Mobile Overlay */}
      <div className={`navbar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleMenu}></div>

      {/* Menu Mobile */}
      <div className={`navbar-menu-mobile ${isOpen ? 'active' : ''}`}>
        <div className="navbar-menu-header">
          <h3>Menu</h3>
          <button
            className="navbar-close"
            onClick={toggleMenu}
            aria-label="Fechar menu"
            type="button"
          >
            ✕
          </button>
        </div>
        <ul className="navbar-menu-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`navbar-menu-item ${activeFilter === item.id ? 'active' : ''}`}
                onClick={() => handleFilterClick(item.id)}
              >
                <span className="navbar-menu-icon">{item.icon}</span>
                <span className="navbar-menu-text">{item.label}</span>
                {activeFilter === item.id && <span className="navbar-menu-check">✓</span>}
              </button>
            </li>
          ))}
          <li className="navbar-menu-divider">
            <button
              className="navbar-menu-item theme-toggle-mobile"
              onClick={() => {
                onToggleTheme()
                setIsOpen(false)
              }}
              aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              <span className="navbar-menu-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="navbar-menu-text">
                Tema {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
