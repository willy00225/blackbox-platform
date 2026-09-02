import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const StarRating = ({ user, film }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Charger la note existante de l'utilisateur pour ce film
  useEffect(() => {
    if (!user || !film) return;
    const fetchRating = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ratings?userId=${user.id}&filmId=${film.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserRating(data.stars || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la note", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [user, film]);

  // Envoyer la note au backend
  const handleRate = async (stars) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, filmId: film.id, stars })
      });
      setUserRating(stars);
      // Optionnel : afficher un message de succès
      // toast.success("Note enregistrée !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la note", error);
      // Optionnel : afficher un message d'erreur
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu des étoiles
  const renderStars = () => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const filled = star <= (hoverRating || userRating);
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={submitting}
              aria-label={`Noter ${star} étoiles`}
              className={`transition duration-200 ${filled ? 'text-gold' : 'text-gray-500'} hover:scale-110 disabled:opacity-50`}
            >
              <Star
                className={`w-6 h-6 ${filled ? 'fill-current' : 'fill-none'}`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {/* Affichage des étoiles */}
      {loading ? (
        <div className="animate-pulse h-6 w-24 bg-gray-700 rounded" />
      ) : (
        renderStars()
      )}
      {/* Note affichée à droite */}
      {userRating > 0 && (
        <span className="text-sm text-gray-400">Votre note : {userRating}/5</span>
      )}
    </div>
  );
};

export default StarRating;