import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Film, Tv, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // États principaux
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    genre: searchParams.get('genre') || '',
    sort: searchParams.get('sort') || 'createdAt'
  });
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage] = useState(12);

  // Debounce du terme de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setCurrentPage(1); // Reset pagination à chaque nouvelle recherche
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Charger les genres disponibles (pour les filtres)
  useEffect(() => {
    fetch(`${API_URL}/api/genres`)
      .then(res => res.json())
      .then(data => setGenres(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erreur genres', err));
  }, []);

  // Charger les résultats depuis l'API (avec pagination)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedTerm) params.append('search', debouncedTerm);
    if (filters.category) params.append('category', filters.category);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.sort) params.append('sort', filters.sort);
    params.append('page', currentPage);
    params.append('limit', resultsPerPage);

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/videos?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur réseau');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setResults(data);
          setTotalPages(Math.ceil(data.length / resultsPerPage));
        } else {
          setResults(data.results || []);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(err => {
        console.error('Erreur recherche', err);
        setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
        setResults([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [debouncedTerm, filters, currentPage, resultsPerPage]);

  // Mettre à jour l'URL quand les filtres changent (pour partager des liens)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedTerm) params.append('search', debouncedTerm);
    if (filters.category) params.append('category', filters.category);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.sort) params.append('sort', filters.sort);
    setSearchParams(params, { replace: true });
  }, [debouncedTerm, filters, setSearchParams]);

  // Mise en évidence du terme recherché
  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-gold">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // Icône de catégorie
  const getCategoryIcon = (category) => {
    if (category === 'serie') return <Tv className="w-3 h-3" />;
    if (category === 'documentaire') return <BookOpen className="w-3 h-3" />;
    return <Film className="w-3 h-3" />;
  };

  const getCategoryLabel = (category) => {
    if (category === 'serie') return 'Série';
    if (category === 'documentaire') return 'Documentaire';
    return 'Film';
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
        <input
          type="text"
          placeholder="Rechercher un film, une série, un acteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-deepblack border border-gray-700 rounded-2xl text-white focus:border-gold outline-none transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Effacer"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bouton Filtres + Compteur */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-deepblack border border-gray-700 rounded-xl text-white hover:border-gold transition"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filtres
        </button>
        <span className="text-gray-400 text-sm">
          {loading ? 'Chargement...' : `${results.length} résultat(s)`}
        </span>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-deepblack rounded-xl border border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <select
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setCurrentPage(1); }}
            className="p-2 bg-carbon border border-gray-700 rounded-lg text-white focus:border-gold outline-none"
          >
            <option value="">Toutes catégories</option>
            <option value="film">Films</option>
            <option value="serie">Séries</option>
            <option value="documentaire">Documentaires</option>
          </select>
          <select
            value={filters.genre}
            onChange={(e) => { setFilters({ ...filters, genre: e.target.value }); setCurrentPage(1); }}
            className="p-2 bg-carbon border border-gray-700 rounded-lg text-white focus:border-gold outline-none"
          >
            <option value="">Tous genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="p-2 bg-carbon border border-gray-700 rounded-lg text-white focus:border-gold outline-none"
          >
            <option value="createdAt">Plus récents</option>
            <option value="rating">Mieux notés</option>
            <option value="views">Plus vus</option>
            <option value="title">Titre A-Z</option>
          </select>
        </motion.div>
      )}

      {/* Résultats en grille */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-deepblack rounded-lg overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-800" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center mt-10">
          <AlertCircle className="w-12 h-12 text-crimson mx-auto mb-4" />
          <p className="text-gray-400">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-white mb-2">Aucun résultat trouvé</p>
          <p className="text-gray-400">Essayez d'autres mots-clés ou filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((film, idx) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/watch/${film.id}`)}
              className="group relative bg-deepblack rounded-lg overflow-hidden shadow-lg cursor-pointer"
            >
              <img src={film.poster} alt={film.title} className="w-full h-auto object-cover group-hover:opacity-80 transition" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition">
                <p className="text-sm font-semibold text-white truncate">
                  {highlightText(film.title, debouncedTerm)}
                </p>
                <div className="flex items-center gap-1 text-gold text-xs mt-1">
                  {getCategoryIcon(film.category)}
                  <span>{getCategoryLabel(film.category)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{film.coinsRequired > 0 ? `${film.coinsRequired} Coins` : 'Gratuit'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && !error && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-deepblack border border-gray-700 rounded-lg text-white hover:border-gold disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-gray-400">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-deepblack border border-gray-700 rounded-lg text-white hover:border-gold disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;