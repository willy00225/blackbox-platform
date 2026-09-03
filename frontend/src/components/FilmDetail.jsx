import React, { useState, useEffect } from 'react';
import { Star, Play, Plus, ArrowLeft, Loader2, Check, User, Users, Calendar, Clock, Clapperboard, Trophy, Monitor, Film, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StarRating from './StarRating'; // ✅ Import du composant StarRating optimisé

// URL du Backend en dur pour la production
const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const FilmDetail = ({ film, user, onBack, onPlay, onAddToList, onSelectEpisode }) => {
  const [userRating, setUserRating] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);
  const [toast, setToast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Charger la note et les épisodes
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
      fetch(`${API_URL}/api/ratings/${currentUser.id}/${film.id}`)
        .then(res => res.json())
        .then(data => {
          setUserRating(data.stars || 0);
          setLoadingRating(false);
        })
        .catch(err => {
          console.error("Erreur chargement note", err);
          setLoadingRating(false);
        });
    } else {
      setLoadingRating(false);
    }

    // Si c'est une série, charger les épisodes
    if (film.category === 'serie') {
      setLoadingEpisodes(true);
      fetch(`${API_URL}/api/videos`)
        .then(res => res.json())
        .then(videos => {
          const seriesEpisodes = videos.filter(v => 
            v.title === film.title && v.category === 'serie'
          );
          setEpisodes(seriesEpisodes.sort((a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber));
        })
        .catch(err => console.error("Erreur chargement épisodes", err))
        .finally(() => setLoadingEpisodes(false));
    }
  }, [film.id, film.title, film.category]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToList = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return showToast("❌ Connectez-vous");

    try {
      const res = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, filmId: film.id })
      });
      if (res.ok) {
        showToast("✅ Ajouté à votre liste !");
      }
    } catch (error) {
      showToast("❌ Erreur lors de l'ajout");
    }
  };

  return (
    <div className="min-h-screen bg-carbon text-offwhite pt-24 md:pt-20 relative pb-20 lg:pb-0">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 bg-deepblack border border-gold/40 text-gold px-6 py-3 rounded-xl shadow-2xl z-50"
        >
          {toast}
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gold transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au catalogue
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Affiche avec effet de zoom */}
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full md:w-1/3"
          >
            <img src={film.poster} alt={film.title} className="w-full rounded-2xl shadow-2xl border border-gray-800" />
            {film.url?.includes('.m3u8') && (
              <div className="mt-2 flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Monitor className="w-4 h-4 text-gold" />
                <span className="text-gold text-xs font-bold uppercase">Ultra HD</span>
                <span className="text-gray-400 text-xs">HLS</span>
              </div>
            )}
          </motion.div>

          {/* Infos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <h1 className="font-display text-3xl md:text-5xl font-black text-white mb-3">{film.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              {film.year && (
                <span className="flex items-center gap-2 bg-deepblack px-3 py-1.5 rounded-full border border-gray-800">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gray-300">{film.year}</span>
                </span>
              )}
              {film.duration && (
                <span className="flex items-center gap-2 bg-deepblack px-3 py-1.5 rounded-full border border-gray-800">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gray-300">{film.duration} min</span>
                </span>
              )}
              {film.genre && (
                <span className="flex items-center gap-2 bg-deepblack px-3 py-1.5 rounded-full border border-gray-800">
                  <Film className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gray-300">{film.genre}</span>
                </span>
              )}
              {film.rating && (
                <span className="flex items-center gap-2 bg-deepblack px-3 py-1.5 rounded-full border border-gray-800">
                  <Trophy className="w-4 h-4 text-gold" />
                  <span className="text-sm text-gold font-bold">{film.rating}/10</span>
                </span>
              )}
            </div>

            {/* Notation avec le composant StarRating optimisé tactile */}
            <div className="mt-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-deepblack p-4 rounded-xl border border-gray-800">
              <span className="text-gray-400 text-sm font-medium">Votre note :</span>
              <StarRating user={user} film={film} />
              {userRating > 0 && (
                <span className="text-gold text-sm font-bold ml-2">({userRating}/5)</span>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-gold text-sm font-bold uppercase tracking-wider mb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed">{film.description || "Synopsis non disponible."}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {film.director && (
                <div className="bg-deepblack p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      <Clapperboard className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Réalisateur</h3>
                  </div>
                  <p className="text-white font-medium">{film.director}</p>
                </div>
              )}
              {film.cast && (
                <div className="bg-deepblack p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Casting</h3>
                  </div>
                  <p className="text-white font-medium">{film.cast}</p>
                </div>
              )}
            </div>

            {/* Boutons d'action adaptés mobile */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onPlay}
                className="bg-crimson text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 hover:shadow-glow-red transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Regarder
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToList}
                className="bg-deepblack/50 text-white border border-white/20 py-4 px-8 rounded-xl hover:border-gold hover:text-gold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter à ma liste
              </motion.button>
            </div>

            {/* Liste des épisodes pour les séries */}
            {film.category === 'serie' && (
              <div className="mt-8 bg-deepblack p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-gold" />
                  Épisodes
                </h3>
                {loadingEpisodes ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded"></div>)}
                  </div>
                ) : episodes.length > 0 ? (
                  <div className="space-y-2">
                    {episodes.map(ep => (
                      <motion.button
                        key={ep.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectEpisode(ep)}
                        className="w-full flex items-center justify-between p-4 bg-carbon rounded-lg border border-gray-700 hover:border-gold/50 transition"
                      >
                        <span className="text-white font-medium">
                          {ep.seasonNumber > 1 ? `S${ep.seasonNumber} · ` : ''}Épisode {ep.episodeNumber}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gold" />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun épisode trouvé.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FilmDetail;