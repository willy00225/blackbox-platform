import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Library, User, Coins, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = ({ user, userCoins, onLogout, onProfileClick, onLogoClick, onSearchClick }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // Navigation principale (sans Profil, car celui-ci est géré via onProfileClick)
  const navItems = [
    { label: 'Accueil', icon: Home, path: '/' },
    { label: 'Films', icon: Library, path: '/films' },
    { label: 'Séries', icon: Library, path: '/series' },
    { label: 'Documentaires', icon: Library, path: '/documentaires' },
    { label: 'Ma liste', icon: Library, path: '/ma-liste' },
  ];

  const isActive = (path) => location.pathname === path;

  // Gestionnaire de clic sur le logo
  const handleLogoClick = (e) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  return (
    <>
      {/* Header Desktop */}
      <header className="fixed top-0 w-full z-50 bg-carbon/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Bouton Hamburger (Mobile uniquement) */}
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="lg:hidden text-white p-2 hover:text-gold transition"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo (cliquable pour retour accueil) */}
          <Link 
            to="/" 
            onClick={handleLogoClick} 
            className="flex items-center cursor-pointer"
            aria-label="Retour à l'accueil"
          >
            <img 
              src={logo} 
              alt="Black Box" 
              className="h-8 w-auto object-contain" 
              loading="eager"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>

          {/* Navbar Desktop */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-300">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`hover:text-gold transition ${isActive(item.path) ? 'text-gold' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions Droites (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Icône recherche */}
            <button 
              onClick={onSearchClick} 
              className="text-gray-300 hover:text-white transition"
              aria-label="Rechercher"
            >
              <Search className="w-6 h-6" />
            </button>
            
            {/* Solde de coins */}
            <div className="flex items-center gap-1 bg-deepblack border border-gold/30 px-3 py-1 rounded-full">
              <Coins className="w-4 h-4 text-gold" />
              <span className="text-gold font-bold text-sm">{userCoins}</span>
            </div>
            
            {/* Avatar cliquable pour profil */}
            <button 
              onClick={onProfileClick}
              title="Voir mon profil"
              aria-label="Voir mon profil"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-crimson to-gold flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:scale-110 transition"
            >
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>

          {/* Actions Droites (Mobile) */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Icône recherche */}
            <button 
              onClick={onSearchClick} 
              className="text-gray-300 hover:text-white transition"
              aria-label="Rechercher"
            >
              <Search className="w-6 h-6" />
            </button>
            
            {/* Solde de coins */}
            <div className="flex items-center gap-1 bg-deepblack border border-gold/30 px-2 py-1 rounded-full">
              <Coins className="w-3 h-3 text-gold" />
              <span className="text-gold font-bold text-xs">{userCoins}</span>
            </div>
            
            {/* Avatar */}
            <button 
              onClick={onProfileClick}
              aria-label="Voir mon profil"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-crimson to-gold flex items-center justify-center text-sm font-bold text-black cursor-pointer"
            >
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>
      </header>

      {/* DRAWER MOBILE */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay sombre */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          ></div>
          
          {/* Panneau Latéral */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-deepblack border-r border-gray-800 p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <img 
                src={logo} 
                alt="Black Box" 
                className="h-8 w-auto" 
                loading="eager"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="text-gray-400 hover:text-white transition"
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Solde */}
            <div className="mb-6 bg-carbon p-3 rounded-lg border border-gray-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold" />
              <span className="text-gold font-bold">{userCoins} Coins</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive(item.path) ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Bouton Profil (spécial) */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onProfileClick();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                  location.pathname === '/profile' ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profil</span>
              </button>

              {/* Recherche dans le drawer */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onSearchClick();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition text-left text-gray-300 hover:bg-gray-800"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Rechercher</span>
              </button>
            </div>

            {/* Déconnexion */}
            <button 
              onClick={() => { 
                setIsDrawerOpen(false); 
                onLogout(); 
              }} 
              className="mt-auto flex items-center gap-3 p-3 text-crimson hover:bg-crimson/10 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;