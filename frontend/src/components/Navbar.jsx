import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Search, Library, User, Coins, LogOut, Bell, Check } from 'lucide-react';

const Navbar = ({ user, userCoins, onLogout, onProfileClick, onLogoClick, onSearchClick }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau film disponible", message: "Les Racines de l'Or vient de sortir !", time: "Il y a 2 min", read: false },
    { id: 2, title: "Votre abonnement", message: "Votre abonnement Premium est actif.", time: "Il y a 1 h", read: false },
    { id: 3, title: "Bienvenue", message: "Merci de rejoindre Black Box.", time: "Hier", read: false },
  ]);
  const location = useLocation();

  const navItems = [
    { label: 'Accueil', icon: Home, path: '/' },
    { label: 'Films', icon: Library, path: '/films' },
    { label: 'Séries', icon: Library, path: '/series' },
    { label: 'Documentaires', icon: Library, path: '/documentaires' },
    { label: 'Ma liste', icon: Library, path: '/ma-liste' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogoClick = (e) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Fermer le panneau quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotificationOpen && !e.target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <>
      {/* Header Desktop */}
      <header className="fixed top-0 w-full z-50 bg-carbon/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Bouton Hamburger (Mobile uniquement) */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDrawerOpen(true)} 
            className="lg:hidden text-white p-2 hover:text-gold transition"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>

          {/* Logo */}
          <Link 
            to="/" 
            onClick={handleLogoClick} 
            className="flex items-center cursor-pointer group"
            aria-label="Retour à l'accueil"
          >
            <img 
              src="/assets/logo.png" 
              alt="Black Box" 
              className="h-8 w-auto object-contain transition group-hover:drop-shadow-[0_0_15px_rgba(197,160,89,0.6)]" 
              loading="eager"
            />
          </Link>

          {/* Navbar Desktop */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-300">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`relative px-2 py-1 transition-colors ${isActive(item.path) ? 'text-gold' : 'hover:text-gold'}`}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.span 
                    layoutId="nav-underline" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions Droites (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onSearchClick} 
              className="text-gray-300 hover:text-white transition"
              aria-label="Rechercher"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Cloche Notifications */}
            <div className="relative notification-container">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-300 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-deepblack border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="text-white font-bold">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-gold hover:underline"
                      >
                        Tout marquer lu
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center p-6">Aucune notification</p>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition ${!notif.read ? 'bg-gold/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1 ${!notif.read ? 'bg-crimson' : 'bg-gray-600'}`}></div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{notif.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                                <p className="text-gray-600 text-[10px] mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solde de coins */}
            <div className="flex items-center gap-1 bg-deepblack border border-gold/30 px-3 py-1 rounded-full">
              <Coins className="w-4 h-4 text-gold" />
              <span className="text-gold font-bold text-sm">{userCoins}</span>
            </div>

            {/* Avatar */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onProfileClick}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-crimson to-gold flex items-center justify-center text-sm font-bold text-black cursor-pointer hover:scale-110 transition"
            >
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </motion.button>
          </div>

          {/* Actions Droites (Mobile) */}
          <div className="lg:hidden flex items-center gap-3">
            <button 
              onClick={onSearchClick} 
              className="text-gray-300 hover:text-white transition"
              aria-label="Rechercher"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Cloche Notifications (mobile) */}
            <div className="relative notification-container">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-300 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-deepblack border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* Même contenu que desktop, mais largeur adaptée */}
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="text-white font-bold">Notifications</h3>
                      <button onClick={markAllAsRead} className="text-xs text-gold hover:underline">Tout marquer lu</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${!notif.read ? 'bg-gold/5' : ''}`}>
                          <p className="text-white text-sm font-medium">{notif.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                          <p className="text-gray-600 text-[10px] mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1 bg-deepblack border border-gold/30 px-2 py-1 rounded-full">
              <Coins className="w-3 h-3 text-gold" />
              <span className="text-gold font-bold text-xs">{userCoins}</span>
            </div>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onProfileClick}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-crimson to-gold flex items-center justify-center text-sm font-bold text-black cursor-pointer"
            >
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </motion.button>
          </div>
        </div>
      </header>

      {/* DRAWER MOBILE (Menu Hamburger) - FLUIDE ET NATIF */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-deepblack border-r border-gray-800 p-6 flex flex-col overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <img src="/assets/logo.png" alt="Black Box" className="h-8 w-auto" loading="eager" />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white transition" aria-label="Fermer le menu">
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="mb-6 bg-carbon p-3 rounded-lg border border-gray-800 flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold" />
                <span className="text-gold font-bold">{userCoins} Coins</span>
              </div>

              <div className="flex-1 space-y-2">
                {navItems.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setIsDrawerOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive(item.path) ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setIsDrawerOpen(false); onProfileClick(); }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${location.pathname === '/profile' ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profil</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setIsDrawerOpen(false); onSearchClick(); }} className="w-full flex items-center gap-3 p-3 rounded-lg transition text-left text-gray-300 hover:bg-gray-800 hover:text-white">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Rechercher</span>
                </motion.button>
              </div>

              <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setIsDrawerOpen(false); onLogout(); }} className="mt-auto flex items-center gap-3 p-3 text-crimson hover:bg-crimson/10 rounded-lg transition">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;