import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Library, User, Search, Crown } from 'lucide-react'; // ✅ Icône Crown ajoutée
import Navbar from './components/Navbar';
import SearchOverlay from './components/SearchOverlay';
import SplashScreen from './components/SplashScreen';
import SearchPage from './pages/Search';
import Subscriptions from './pages/Subscriptions'; // ✅ Import de la page Abonnements

// Lazy loading des composants lourds
const FilmDetail = lazy(() => import('./components/FilmDetail'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const Profile = lazy(() => import('./pages/Profile'));
const Wallet = lazy(() => import('./pages/Wallet'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Fonction utilitaire pour générer srcSet à partir d'une URL
const generateSrcSet = (url, widths = [400, 800, 1200, 1920]) => {
  if (!url) return '';
  const [baseUrl, queryString] = url.split('?');
  const existingParams = new URLSearchParams(queryString || '');
  ['w', 'h', 'fit', 'crop', 'auto'].forEach(key => existingParams.delete(key));
  return widths
    .map(w => {
      const params = new URLSearchParams(existingParams);
      params.set('w', w);
      return `${baseUrl}?${params.toString()} ${w}w`;
    })
    .join(', ');
};

const generateSizes = (defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px') =>
  defaultSizes;

function UserApp() {
  const location = useLocation();
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState(null);
  const [userCoins, setUserCoins] = useState(20);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [seriesEpisodes, setSeriesEpisodes] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getCategory = () => {
    if (location.pathname === '/films') return 'film';
    if (location.pathname === '/series') return 'serie';
    if (location.pathname === '/documentaires') return 'documentaire';
    if (location.pathname === '/ma-liste') return 'ma-liste';
    return null;
  };

  const category = getCategory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token invalide');
          return res.json();
        })
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setUserCoins(data.user.blackCoins);
          } else {
            throw new Error('Données utilisateur manquantes');
          }
        })
        .catch(err => {
          console.error('Session invalide, déconnexion forcée', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setShowAuth(true);
        });
    }

    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setFilms(data))
      .catch(err => console.error(err));

    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
    setUserCoins(userData.blackCoins || 20);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowAuth(true);
  };

  const saveCoinsToBackend = async (newCoins) => {
    if (!user) return;
    await fetch('/api/auth/update-coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, coins: newCoins })
    });
  };

  const handleUnlock = (film, method) => {
    if (!user) { setShowAuth(true); return; }
    if (method === 'ad') {
      const newTotal = userCoins + 10;
      setUserCoins(newTotal);
      saveCoinsToBackend(newTotal);
      alert("📺 Publicité visionnée ! Vous avez gagné 10 Coins.");
      return false;
    } else if (method === 'coins') {
      if (userCoins >= film.coinsRequired) {
        const newTotal = userCoins - film.coinsRequired;
        setUserCoins(newTotal);
        saveCoinsToBackend(newTotal);
        alert(`🎉 Film débloqué ! Il vous reste ${newTotal} Coins.`);
        return true;
      } else {
        alert("❌ Solde insuffisant ! Regardez une pub pour gagner des coins.");
        return false;
      }
    }
    return false;
  };

  const handleBackToCatalogue = () => {
    setSelectedFilm(null);
    setIsPlaying(false);
    setShowProfile(false);
    setShowWallet(false);
    setSeriesEpisodes([]);
    window.location.href = '/';
  };

  const handleSelectFilm = (film) => {
    setSelectedFilm(film);
    setIsPlaying(false);
    setInitialIndex(0);
    setShowProfile(false);
    setShowWallet(false);
    if (film.category === 'serie') {
      const episodes = films
        .filter(f => f.title === film.title && f.category === 'serie')
        .sort((a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber);
      setSeriesEpisodes(episodes);
    } else {
      setSeriesEpisodes([]);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowWallet(false);
    setSelectedFilm(null);
    setIsPlaying(false);
  };

  const handleShowWallet = () => {
    setShowWallet(true);
    setShowProfile(false);
    setSelectedFilm(null);
    setIsPlaying(false);
  };

  const handleLogoClick = () => {
    setShowProfile(false);
    setShowWallet(false);
    setSelectedFilm(null);
    setIsPlaying(false);
    if (location.pathname !== '/') window.location.href = '/';
  };

  const handleExitPlayer = () => {
    setSelectedFilm(null);
    setIsPlaying(false);
    setShowProfile(false);
    setShowWallet(false);
    setSeriesEpisodes([]);
    window.location.href = '/';
  };

  const handleCoinsUpdate = (newCoins) => {
    setUserCoins(newCoins);
    if (user) {
      const updatedUser = { ...user, blackCoins: newCoins };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const filteredFilms = category ? films.filter(film => {
    if (category === 'ma-liste') return true;
    return film.category === category;
  }) : films;

  const universes = [
    { name: 'Abidjan Chic', icon: '🔥' },
    { name: 'Thriller de Quartier', icon: '🔪' },
    { name: 'Contes Modernes', icon: '✨' }
  ];

  if (isLoading) return <SplashScreen onFinish={() => setIsLoading(false)} />;

  return (
    <div className="min-h-screen bg-carbon text-offwhite font-body pb-20 lg:pb-0">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(197,160,89,0.05),transparent_40%)]"></div>

      {showAuth || !user ? (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-gold">Chargement...</div>}>
          <Auth onAuth={handleAuth} onBack={() => setShowAuth(false)} />
        </Suspense>
      ) : (
        <>
          <Navbar 
            user={user} 
            userCoins={userCoins} 
            onLogout={handleLogout}
            onProfileClick={handleShowProfile}
            onLogoClick={handleLogoClick}
            onSearchClick={() => setIsSearchOpen(true)}
          />
          <Suspense fallback={<div className="flex justify-center items-center h-screen text-gold">Chargement...</div>}>
            {showWallet ? (
              <Wallet user={user} onCoinsUpdate={handleCoinsUpdate} />
            ) : showProfile ? (
              <Profile 
                user={user} 
                onLogout={handleLogout} 
                onBack={handleLogoClick}
                onOpenWallet={handleShowWallet}
              />
            ) : isPlaying && selectedFilm ? (
              <VideoPlayer
                key={selectedFilm.id}
                video={selectedFilm}
                allVideos={seriesEpisodes.length > 0 ? seriesEpisodes : [selectedFilm]}
                userCoins={userCoins}
                onUnlock={handleUnlock}
                onExit={handleExitPlayer}
                initialIndex={initialIndex}
              />
            ) : selectedFilm ? (
              <FilmDetail
                film={selectedFilm}
                user={user}
                onBack={handleBackToCatalogue}
                onPlay={handlePlay}
                onAddToList={() => alert("Ajouté à votre liste !")}
                onSelectEpisode={(episode) => {
                  const idx = seriesEpisodes.findIndex(e => e.id === episode.id);
                  setInitialIndex(idx > -1 ? idx : 0);
                  setSelectedFilm(episode);
                  setIsPlaying(true);
                }}
              />
            ) : (
              <>
                {!category && (
                  <section className="relative h-[90vh] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-carbon/80 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&auto=format&fit=crop" 
                      srcSet={generateSrcSet('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&auto=format&fit=crop')}
                      sizes={generateSizes()}
                      alt="Black Box Cinéma" 
                      className="w-full h-full object-cover opacity-60"
                      loading="lazy"
                    />
                    <div className="absolute bottom-20 left-0 right-0 z-20 px-6 md:px-12">
                      <div className="max-w-3xl">
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-gold text-sm font-bold uppercase tracking-[0.2em] mb-4">Production Originale</motion.p>
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-4xl md:text-6xl font-black leading-tight text-white drop-shadow-2xl">LES RACINES DE L'OR</motion.h1>
                        <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-gray-300 max-w-xl leading-relaxed">Plongez dans le quotidien d'une famille africaine déchirée entre tradition et modernité.</motion.p>
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex flex-wrap gap-4">
                          <button onClick={() => handleSelectFilm(films[0])} className="bg-crimson text-white font-bold py-3 px-8 rounded hover:bg-red-700 hover:shadow-glow-red transition duration-300 flex items-center gap-2">
                            <span className="text-xl">▶</span> Regarder maintenant
                          </button>
                          <button className="bg-deepblack/50 backdrop-blur-md text-white border border-white/20 py-3 px-8 rounded hover:border-gold hover:text-gold hover:bg-deepblack transition duration-300 flex items-center gap-2">
                            <span className="text-xl">＋</span> Ma liste
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </section>
                )}

                <section className={`max-w-7xl mx-auto px-6 pb-20 ${category ? 'pt-24' : '-mt-10'} relative z-30`}>
                  {category ? (
                    <>
                      <h3 className="font-display text-xl font-bold text-white mb-6 border-l-4 border-crimson pl-4">
                        {category === 'film' ? '🎬 Films' : 
                         category === 'serie' ? '📺 Séries' : 
                         category === 'documentaire' ? '🎥 Documentaires' : 
                         category === 'ma-liste' ? '❤️ Ma liste' : ''}
                      </h3>
                      {filteredFilms.length === 0 ? (
                        <p className="text-gray-500">Aucun contenu dans cette catégorie pour le moment.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {filteredFilms.map(film => (
                            <motion.div 
                              key={film.id} 
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleSelectFilm(film)} 
                              className="group relative bg-deepblack rounded-lg overflow-hidden transition duration-300 shadow-lg cursor-pointer"
                            >
                              <img 
                                src={film.poster} 
                                srcSet={generateSrcSet(film.poster, [300, 600, 900])} 
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                                alt={film.title} 
                                className="w-full h-auto object-cover group-hover:opacity-80 transition" 
                                loading="lazy" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition duration-300">
                                <p className="text-sm font-semibold text-white">{film.title}</p>
                                <p className="text-xs text-gold mt-1">{film.coinsRequired > 0 ? `${film.coinsRequired} Coins` : 'Gratuit'}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-xl font-bold text-white mb-6 border-l-4 border-crimson pl-4">🔥 Tendances actuelles</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
                        {films.slice(0, 6).map(film => (
                          <motion.div 
                            key={film.id} 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSelectFilm(film)} 
                            className="group relative bg-deepblack rounded-lg overflow-hidden transition duration-300 shadow-lg cursor-pointer"
                          >
                            <img 
                              src={film.poster} 
                              srcSet={generateSrcSet(film.poster, [300, 600, 900])} 
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                              alt={film.title} 
                              className="w-full h-auto object-cover group-hover:opacity-80 transition" 
                              loading="lazy" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition duration-300">
                              <p className="text-sm font-semibold text-white">{film.title}</p>
                              <p className="text-xs text-gold mt-1">{film.coinsRequired > 0 ? `${film.coinsRequired} Coins` : 'Gratuit'}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {universes.map((universe, idx) => (
                        <div key={idx} className="mb-10">
                          <h3 className="font-display text-xl font-bold text-white mb-6 border-l-4 border-crimson pl-4">
                            {universe.icon} {universe.name}
                          </h3>
                          {films.filter(film => film.title === universe.name).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {films.filter(film => film.title === universe.name).map(film => (
                                <motion.div 
                                  key={film.id} 
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => handleSelectFilm(film)} 
                                  className="group relative bg-deepblack rounded-lg overflow-hidden transition duration-300 shadow-lg cursor-pointer"
                                >
                                  <img 
                                    src={film.poster} 
                                    srcSet={generateSrcSet(film.poster, [300, 600, 900])} 
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                                    alt={film.title} 
                                    className="w-full h-auto object-cover group-hover:opacity-80 transition" 
                                    loading="lazy" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition duration-300">
                                    <p className="text-sm font-semibold text-white">Épisode {film.episodeNumber}</p>
                                    <p className="text-xs text-gold mt-1">{film.coinsRequired > 0 ? `${film.coinsRequired} Coins` : 'Gratuit'}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Aucun contenu dans cet univers pour le moment.</p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </section>
              </>
            )}
          </Suspense>
        </>
      )}

      {/* Barre d'onglets mobile (Bottom Navigation) */}
      {user && !isPlaying && !showAuth && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-carbon/90 backdrop-blur-xl border-t border-white/10 flex justify-around py-2 pb-safe">
          <Link to="/" className="flex flex-col items-center text-gray-400 hover:text-gold p-2">
            <Home className="w-6 h-6" />
            <span className="text-xs">Accueil</span>
          </Link>
          <Link to="/films" className="flex flex-col items-center text-gray-400 hover:text-gold p-2">
            <Library className="w-6 h-6" />
            <span className="text-xs">Films</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center text-gray-400 hover:text-gold p-2">
            <Search className="w-6 h-6" />
            <span className="text-xs">Recherche</span>
          </Link>
          <Link to="/series" className="flex flex-col items-center text-gray-400 hover:text-gold p-2">
            <Library className="w-6 h-6" />
            <span className="text-xs">Séries</span>
          </Link>
          <button 
            onClick={handleShowProfile}
            className="flex flex-col items-center text-gray-400 hover:text-gold p-2"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      )}

      {/* Overlay de recherche */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        films={films}
        onSelectFilm={handleSelectFilm}
      />
    </div>
  );
}

function AdminApp() {
  const [token, setToken] = useState(null);
  if (!token) return <AdminLogin onLogin={setToken} />;
  return <AdminPanel token={token} />;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen bg-carbon flex items-center justify-center text-gold">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<UserApp />} />
          <Route path="/films" element={<UserApp />} />
          <Route path="/series" element={<UserApp />} />
          <Route path="/documentaires" element={<UserApp />} />
          <Route path="/ma-liste" element={<UserApp />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/abonnements" element={<Subscriptions />} /> {/* ✅ Route ajoutée */}
          <Route path="/secure-panel-2026" element={<AdminApp />} /> {/* ✅ Route admin obscurcie */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;