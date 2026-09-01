import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, Heart, MessageCircle, Share2, MoreHorizontal,
  Coins, ChevronDown, X, Send, ChevronUp, Volume2,
  Maximize, Minimize, SkipBack, SkipForward, XCircle, ShoppingBag
} from 'lucide-react';
import Hls from 'hls.js'; // ✅ AJOUTÉ

const VideoPlayer = ({ video, allVideos, userCoins, onUnlock, onExit, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEpisodesList, setShowEpisodesList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [videoError, setVideoError] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [availableAd, setAvailableAd] = useState(null);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mainRef = useRef(null);
  const hideControlsTimeout = useRef(null);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const safeUser = user && user.id && user.id !== 'otp-user' ? user : null;

  const safeVideos = Array.isArray(allVideos) && allVideos.length > 0 ? allVideos : [video];
  const currentVideo = safeVideos[currentIndex] || video;

  // ===== LECTURE ADAPTATIVE HLS / MP4 =====
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !currentVideo?.url) return;

    // Nettoyage précédent (destruction HLS si existant)
    let hls = null;

    // Si flux HLS (.m3u8)
    if (currentVideo.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(currentVideo.url);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoEl.play().catch(() => {});
        });
      } 
      // Fallback pour Safari / iOS (lecture native)
      else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = currentVideo.url;
        videoEl.addEventListener('loadedmetadata', () => {
          videoEl.play().catch(() => {});
        });
      }
    } 
    // Sinon MP4 classique
    else {
      videoEl.src = currentVideo.url;
      videoEl.play().catch(() => {});
    }

    // Nettoyage mémoire à chaque changement de vidéo
    return () => {
      if (hls) hls.destroy();
    };
  }, [currentVideo?.url]);

  // Détection mobile / desktop
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus automatique pour capter les touches clavier
  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  // Charger likes et commentaires
  useEffect(() => {
    setVideoError(false);
    setHasUnlocked(false);
    setLikesCount(0);
    setComments([]);

    if (currentVideo?.id) {
      const likesUrl = safeUser
        ? `/api/video/${currentVideo.id}/likes?userId=${safeUser.id}`
        : `/api/video/${currentVideo.id}/likes`;

      fetch(likesUrl)
        .then(res => res.json())
        .then(data => {
          setLikesCount(data.likesCount || 0);
          setLiked(!!data.liked);
        })
        .catch(err => {
          console.error(err);
          setLikesCount(0);
        });

      fetch(`/api/video/${currentVideo.id}/comments`)
        .then(res => res.json())
        .then(data => setComments(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error(err);
          setComments([]);
        });
    }

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [currentVideo?.id, safeUser?.id]);

  // Plein écran
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape').catch(() => {});
        }
        setIsFullscreen(true);
      } catch (error) {
        console.warn("Impossible de passer en plein écran", error);
      }
    } else {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Scroll
  const handleScroll = (e) => {
    const element = e.target;
    const height = element.clientHeight;
    const index = Math.round(element.scrollTop / height);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setIsPlaying(true);
      setShowComments(false);
    }
  };

  const goNext = useCallback(() => {
    if (currentIndex < safeVideos.length - 1) {
      const next = currentIndex + 1;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      containerRef.current?.scrollTo({ top: next * height, behavior: 'smooth' });
      setCurrentIndex(next);
      setIsPlaying(true);
    }
  }, [currentIndex, safeVideos.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      containerRef.current?.scrollTo({ top: prev * height, behavior: 'smooth' });
      setCurrentIndex(prev);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (videoRef.current) {
        if (prev) videoRef.current.pause();
        else videoRef.current.play();
      }
      return !prev;
    });
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100 || 0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const seekTime = (percent / 100) * duration;
    if (videoRef.current && isFinite(seekTime)) {
      videoRef.current.currentTime = seekTime;
      setProgress(percent);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onExit(); }
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowUp') goPrev();
      if (e.key === 'ArrowRight') skip(10);
      if (e.key === 'ArrowLeft') skip(-10);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, goNext, goPrev, onExit]);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    if (controlsVisible) {
      clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(hideControlsTimeout.current);
  }, [controlsVisible, currentIndex]);

  const handleMouseMove = useCallback(() => {
    if (!isMobile) showControlsTemporarily();
  }, [isMobile, showControlsTemporarily]);

  const handleTouchStart = useCallback(() => {
    if (isMobile) showControlsTemporarily();
  }, [isMobile, showControlsTemporarily]);

  const handleLike = async () => {
    if (!safeUser) {
      alert("Connectez-vous pour aimer.");
      return;
    }
    const res = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: safeUser.id, videoId: currentVideo.id })
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikesCount(prev => data.liked ? prev + 1 : Math.max(0, prev - 1));
  };

  const handleComment = async () => {
    if (!safeUser || !newComment.trim()) return;
    const res = await fetch(`/api/video/${currentVideo.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: safeUser.id, content: newComment })
    });
    const comment = await res.json();
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watch/${currentVideo.id}`);
    alert("Lien copié !");
  };

  const handleWatchAd = async () => {
    if (!safeUser) {
      alert("Veuillez vous connecter.");
      return;
    }
    try {
      const res = await fetch(`/api/ads/available?userId=${safeUser.id}`);
      const data = await res.json();
      if (data.ad) {
        setAvailableAd(data.ad);
        setShowAdModal(true);
      } else {
        alert("Aucune pub disponible actuellement, ou limite atteinte. Veuillez acheter des pièces.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la pub", error);
      alert("Erreur serveur.");
    }
  };

  const handleAdCompleted = async () => {
    if (!availableAd || !safeUser) return;
    try {
      const res = await fetch('/api/ads/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: safeUser.id, adId: availableAd.id })
      });
      const data = await res.json();
      if (data.success) {
        if (data.coins !== undefined && user) {
          user.blackCoins = data.coins;
          localStorage.setItem('user', JSON.stringify(user));
        }
        const success = onUnlock(currentVideo, 'coins');
        if (success) setHasUnlocked(true);
        setShowAdModal(false);
      } else {
        alert("Erreur lors de la validation de la pub.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation de la pub", error);
      alert("Erreur serveur.");
    }
  };

  const needsUnlock = currentVideo.coinsRequired > 0 && !hasUnlocked;

  return (
    <div
      ref={mainRef}
      tabIndex={0}
      className="fixed inset-0 bg-black z-50 flex flex-col outline-none"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onClick={() => setShowComments(false)}
    >
      {/* Boutons de sortie */}
      <div className={`absolute top-0 left-0 right-0 z-[70] flex justify-between p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={onExit} className="bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition" title="Retour">
          <ChevronDown className="w-6 h-6" />
        </button>
        <button onClick={onExit} className="bg-crimson p-2 rounded-full text-white hover:bg-red-700 transition shadow-lg" title="Quitter (Échap)">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Barre supérieure */}
      <div className={`absolute top-0 left-0 right-0 z-40 pt-16 pb-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex-1"></div>
        <div className="text-white font-semibold text-center">
          <span className={`block text-xs text-gray-400 ${isMobile ? 'text-[10px]' : ''}`}>Épisode {currentVideo.episodeNumber || currentIndex + 1}</span>
          <span className={`block text-lg ${isMobile ? 'text-base' : ''}`}>{currentVideo.title}</span>
        </div>
        <div className="flex-1 flex justify-end pr-4 text-gold font-bold items-center gap-1">
          <Coins className={`w-5 h-5 ${isMobile ? 'w-4 h-4' : ''}`} /> {userCoins}
        </div>
      </div>

      {/* Flèches desktop */}
      {!isMobile && (
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-30 hidden md:flex flex-col gap-2 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={goPrev} disabled={currentIndex === 0} className="bg-black/60 p-2 rounded-full text-white hover:bg-black/80 disabled:opacity-30">
            <ChevronUp className="w-6 h-6" />
          </button>
          <button onClick={goNext} disabled={currentIndex === safeVideos.length - 1} className="bg-black/60 p-2 rounded-full text-white hover:bg-black/80 disabled:opacity-30">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Conteneur scroll vertical */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {safeVideos.map((episode, index) => (
          <div key={episode.id} className="h-full w-full snap-start relative flex items-center justify-center bg-black">
            {needsUnlock ? (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <Coins className="w-16 h-16 text-gold mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Épisode Verrouillé</h2>
                <p className="text-gray-400 mb-6">Débloquez la suite pour {currentVideo.coinsRequired} Coins</p>

                {userCoins >= currentVideo.coinsRequired ? (
                  <button
                    onClick={() => { const success = onUnlock(currentVideo, 'coins'); if (success) setHasUnlocked(true); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold mb-3"
                  >
                    🔓 Débloquer maintenant ({userCoins} coins disponibles)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { const success = onUnlock(currentVideo, 'coins'); if (success) setHasUnlocked(true); }}
                      className="bg-crimson text-white px-6 py-3 rounded-full font-bold mb-3"
                    >
                      🔓 Débloquer avec {currentVideo.coinsRequired} Coins
                    </button>
                    <button onClick={handleWatchAd} className="bg-deepblack border border-gold text-gold px-6 py-3 rounded-full font-bold mb-3">
                      📺 Regarder une pub (Gagner {currentVideo.coinsRequired} Coins)
                    </button>
                    <button onClick={() => window.location.href = '/wallet'} className="bg-crimson text-white px-6 py-3 rounded-full font-bold mb-3 flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Acheter des pièces
                    </button>
                  </>
                )}
              </div>
            ) : videoError && index === currentIndex ? (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <XCircle className="w-16 h-16 text-crimson mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Vidéo indisponible</h2>
                <p className="text-gray-400">La source de cette vidéo est introuvable ou non supportée.</p>
              </div>
            ) : (
              <video
                ref={index === currentIndex ? videoRef : null}
                poster={episode.poster}
                className="w-full h-full object-cover"
                autoPlay={index === currentIndex}
                loop={false}
                controls={false}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => goNext()}
                onError={() => setVideoError(true)}
              />
            )}

            {/* Overlay actions */}
            <div className={`absolute bottom-20 left-4 right-16 z-10 flex justify-between items-end transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex-1 pr-4">
                <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">{episode.category || 'Micro-Drama'}</p>
                <h1 className="text-white font-display text-xl font-black leading-tight mb-2">{episode.title}</h1>
                <p className="text-gray-300 text-sm line-clamp-2">{episode.description || "Description..."}</p>
              </div>

              <div className="flex flex-col gap-4 items-center text-white">
                <button onClick={handleLike} className="flex flex-col items-center">
                  <Heart className={`w-8 h-8 ${liked ? 'text-crimson fill-crimson' : ''}`} />
                  <span className="text-xs mt-1">{likesCount.toLocaleString()}</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center">
                  <MessageCircle className="w-8 h-8" />
                  <span className="text-xs mt-1">{comments.length}</span>
                </button>
                <button onClick={handleShare} className="flex flex-col items-center">
                  <Share2 className="w-8 h-8" />
                  <span className="text-xs mt-1">Partager</span>
                </button>
                <button onClick={() => setShowEpisodesList(prev => !prev)} className="flex flex-col items-center">
                  <MoreHorizontal className="w-8 h-8" />
                  <span className="text-xs mt-1">Épisodes</span>
                </button>
              </div>
            </div>

            {/* Panneau commentaires */}
            {showComments && index === currentIndex && (
              <div className="absolute bottom-24 left-0 right-0 bg-black/90 backdrop-blur-md p-4 max-h-64 overflow-y-auto z-20" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-bold">Commentaires ({comments.length})</h3>
                  <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-3 mb-3">
                  {comments.map(c => (
                    <div key={c.id} className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gold font-bold">{c.User?.email || 'Utilisateur'}</p>
                      <p className="text-sm text-white">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 bg-gray-800 text-white p-2 rounded-lg outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button onClick={handleComment} className="bg-gold text-black p-2 rounded-lg font-bold">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Liste épisodes */}
            {showEpisodesList && (
              <div className="absolute right-4 top-16 bottom-16 w-64 bg-black/90 backdrop-blur-md rounded-xl p-4 overflow-y-auto z-20" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-bold">Épisodes</h3>
                  <button onClick={() => setShowEpisodesList(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-2">
                  {safeVideos.map((ep, idx) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        const height = containerRef.current?.clientHeight || window.innerHeight;
                        containerRef.current?.scrollTo({ top: idx * height, behavior: 'smooth' });
                        setCurrentIndex(idx);
                        setIsPlaying(true);
                        setShowEpisodesList(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition ${idx === currentIndex ? 'bg-gold text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                    >
                      {idx + 1}. {ep.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contrôles bas */}
            {index === currentIndex && !needsUnlock && !videoError && (
              <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-xs">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                    <div className="h-full bg-crimson rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-white text-xs">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-4">
                  {!isMobile && (
                    <button onClick={() => skip(-10)} className="text-white hover:text-gold" title="Reculer 10s"><SkipBack className="w-6 h-6" /></button>
                  )}
                  <button onClick={togglePlay} className="text-white hover:text-gold">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>
                  {!isMobile && (
                    <button onClick={() => skip(10)} className="text-white hover:text-gold" title="Avancer 10s"><SkipForward className="w-6 h-6" /></button>
                  )}
                  <button onClick={toggleMute} className="text-white hover:text-gold">
                    <Volume2 className="w-6 h-6" />
                  </button>
                  {!isMobile && (
                    <input type="range" min="0" max="1" step="0.1" value={muted ? 0 : volume} onChange={handleVolumeChange} className="hidden sm:block w-20 h-1" />
                  )}
                  <div className="flex-1"></div>
                  <button onClick={toggleFullscreen} className="text-white hover:text-gold">
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modale pub */}
      {showAdModal && availableAd && (
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center">
          <div className="bg-deepblack p-6 rounded-2xl border border-gold/40 max-w-md w-full text-center relative">
            <button onClick={() => setShowAdModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h3 className="text-xl font-bold text-gold mb-4">Publicité Récompensée</h3>
            <div className="flex flex-col items-center gap-4">
              <video src={availableAd.videoUrl} autoPlay controls className="w-full rounded-lg" />
              <p className="text-gray-400 text-sm">Vous gagnerez <span className="text-gold font-bold">{availableAd.rewardCoins} Coins</span> après la fin de la vidéo</p>
              <button onClick={handleAdCompleted} className="w-full py-3 bg-crimson hover:bg-red-700 text-white font-bold rounded-lg transition">
                J'ai regardé la pub, débloquer !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;