import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const StarRating = ({ user, film }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la note", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center gap-1.5">
        {stars.map((star) => {
          const filled = star <= (hoverRating || userRating);
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onTouchStart={(e) => {
                e.stopPropagation();
                setHoverRating(star);
                handleRate(star);
              }}
              disabled={submitting}
              aria-label={`Noter ${star} étoiles`}
              className={`relative transition-transform duration-200 ${filled ? 'text-gold' : 'text-gray-500'} hover:scale-110 active:scale-90 disabled:opacity-50`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Star
                className={`w-8 h-8 md:w-6 md:h-6 ${filled ? 'fill-current' : 'fill-none'}`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      {loading ? (
        <div className="animate-pulse h-8 w-32 bg-gray-700 rounded" />
      ) : (
        renderStars()
      )}
      {userRating > 0 && (
        <span className="text-sm text-gray-400">Votre note : {userRating}/5</span>
      )}
    </div>
  );
};

export default StarRating;