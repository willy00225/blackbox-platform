import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Film, Tv, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchOverlay = ({ isOpen, onClose, films, onSelectFilm }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounce : léger délai pour éviter les filtrages trop fréquents
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Filtrage en temps réel basé sur la requête debouncée
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const searchTerm = debouncedQuery.toLowerCase();
    const filtered = films.filter(film =>
      film.title.toLowerCase().includes(searchTerm) ||
      (film.category && film.category.toLowerCase().includes(searchTerm)) ||
      (film.genre && film.genre.toLowerCase().includes(searchTerm)) ||
      (film.director && film.director.toLowerCase().includes(searchTerm))
    );
    setResults(filtered);
  }, [debouncedQuery, films]);

  // Fermer avec Échap
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Mettre en évidence le terme recherché dans le titre
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
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

  // Icône selon la catégorie
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'serie': return <Tv className="w-3 h-3" />;
      case 'documentaire': return <BookOpen className="w-3 h-3" />;
      default: return <Film className="w-3 h-3" />;
    }
  };

  // Label de catégorie
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'serie': return 'Série';
      case 'documentaire': return 'Documentaire';
      default: return 'Film';
    }
  };

  // Compteur de résultats pour l'accessibilité
  const resultsCount = useMemo(() => results.length, [results]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col"
    >
      {/* Barre de recherche */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <Search className="w-6 h-6 text-gold" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film, une série, un documentaire..."
          className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-500"
          aria-label="Rechercher un film"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-gray-400 hover:text-white transition"
            aria-label="Effacer la recherche"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
          aria-label="Fermer la recherche"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto p-6">
        {query.trim() === '' ? (
          <div className="text-center mt-10">
            <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Tapez pour commencer la recherche</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center mt-10">
            <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Aucun résultat pour « {query} »</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(film => (
                <div
                  key={film.id}
                  onClick={() => {
                    onSelectFilm(film);
                    onClose();
                  }}
                  className="group cursor-pointer relative bg-deepblack rounded-lg overflow-hidden border border-gray-800 hover:border-gold/40 hover:shadow-gold/10 hover:shadow-xl transition"
                >
                  <img
                    src={film.poster}
                    alt={film.title}
                    className="w-full h-48 object-cover group-hover:opacity-80 transition"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm truncate">
                      {highlightText(film.title, query)}
                    </p>
                    <div className="flex items-center gap-1 text-gold text-xs mt-1">
                      {getCategoryIcon(film.category)}
                      <span>{getCategoryLabel(film.category)}</span>
                    </div>
                    {film.year && (
                      <p className="text-gray-500 text-xs mt-1">{film.year}</p>
                    )}
                    {film.genre && (
                      <p className="text-gray-600 text-xs mt-0.5 truncate">{film.genre}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SearchOverlay;