import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Trash2, Play, Coins, Film, Copy, Share2, Users,
  LogOut, Check, ArrowLeft, User, ChevronRight, Eye, Star, Wallet,
  Settings, Mail, Lock, Globe, Monitor, BellOff, Bell, Shield,
  Save, X, PlusCircle, History
} from 'lucide-react';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const Profile = ({ user, onLogout, onBack, onOpenWallet }) => {
  const [referralData, setReferralData] = useState({ referralLink: '', referralsCount: 0 });
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Paramètres
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [language, setLanguage] = useState(user?.language || 'fr');
  const [videoQuality, setVideoQuality] = useState(user?.videoQuality || 'auto');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user?.id || typeof user.id !== 'number') {
      setLoading(false);
      console.error("ID utilisateur invalide:", user?.id);
      return;
    }

    // Parrainage
    fetch(`${API_URL}/api/referral/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.referralLink) {
          setReferralData(data);
        }
      })
      .catch(err => console.error("Erreur parrainage", err));

    // Historique et watchlist
    Promise.all([
      fetch(`${API_URL}/api/history?userId=${user.id}`),
      fetch(`${API_URL}/api/watchlist?userId=${user.id}`)
    ])
      .then(([historyRes, watchlistRes]) => Promise.all([historyRes.json(), watchlistRes.json()]))
      .then(([historyData, watchlistData]) => {
        setHistory(Array.isArray(historyData) ? historyData : []);
        setWatchlist(Array.isArray(watchlistData) ? watchlistData : []);
      })
      .catch(err => console.error("Erreur chargement profil", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return showMessage('Token manquant, reconnectez-vous', 'error');
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.user.name, email: data.user.email }));
        showMessage('Profil mis à jour ✅');
      } else showMessage(data.error || 'Erreur', 'error');
    } catch (err) {
      showMessage('Erreur serveur', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
    try {
      const token = localStorage.getItem('token');
      if (!token) return showMessage('Token manquant, reconnectez-vous', 'error');
      const res = await fetch(`${API_URL}/api/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        showMessage('Mot de passe changé ✅');
      } else showMessage(data.error || 'Erreur', 'error');
    } catch (err) {
      showMessage('Erreur serveur', 'error');
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return showMessage('Token manquant, reconnectez-vous', 'error');
      const res = await fetch(`${API_URL}/api/profile/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ language, videoQuality, notificationsEnabled })
      });
      const data = await res.json();
      if (res.ok) showMessage('Préférences enregistrées ✅');
      else showMessage(data.error || 'Erreur', 'error');
    } catch (err) {
      showMessage('Erreur serveur', 'error');
    }
  };

  const handleLogoutAll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }
      const res = await fetch(`${API_URL}/api/profile/logout-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showMessage('Toutes les sessions ont été révoquées');
        onLogout();
      } else {
        showMessage('Session expirée, vous êtes déconnecté', 'error');
        onLogout();
      }
    } catch (err) {
      console.error(err);
      showMessage('Erreur serveur', 'error');
      onLogout();
    }
  };

  const handleCopyLink = () => {
    if (referralData.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      showMessage('Lien de parrainage indisponible', 'error');
    }
  };

  const removeFromWatchlist = async (watchlistItemId) => {
    try {
      await fetch(`${API_URL}/api/watchlist/${watchlistItemId}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(item => item.id !== watchlistItemId));
    } catch (error) {
      console.error("Erreur suppression", error);
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    // Squelettes de chargement distincts pour l'historique et la watchlist
    return (
      <div className="min-h-screen bg-carbon text-offwhite p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
              <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
              <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon text-offwhite relative overflow-hidden">
      {/* Décor d'arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-b from-deepblack via-carbon to-black pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-crimson/20 via-gold/5 to-transparent opacity-30" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {message && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-crimson text-white'}`}>
            {message.text}
          </div>
        )}

        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gold transition group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          <span>Retour au catalogue</span>
        </button>

        {/* En-tête du profil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-crimson to-gold p-1 shadow-2xl shadow-gold/20">
              <div className="w-full h-full rounded-2xl bg-deepblack flex items-center justify-center text-5xl font-black text-gold">
                {(name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-gold text-black rounded-full p-2 shadow-lg">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              {name || 'Mon Profil'}
            </h1>
            <p className="text-gray-400 text-lg">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
              <div className="bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold" />
                <span className="text-gold font-bold">{user.blackCoins} Coins</span>
              </div>
              <div className="bg-crimson/10 border border-crimson/30 rounded-full px-4 py-1.5 flex items-center gap-2">
                <Star className="w-5 h-5 text-crimson" />
                <span className="text-crimson font-semibold">Membre</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bouton Portefeuille */}
        <motion.button 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }} 
          onClick={onOpenWallet} 
          className="mb-10 w-full md:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-gold/20 to-crimson/20 border border-gold/40 hover:border-gold hover:bg-gold/10 px-6 py-4 rounded-2xl transition group"
        >
          <Wallet className="w-6 h-6 text-gold" />
          <span className="text-gold font-bold text-lg">Mon Portefeuille</span>
          <ChevronRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Section Parrainage */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-12 bg-gradient-to-r from-deepblack via-carbon to-deepblack p-8 rounded-2xl border border-gold/20 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-3">
                <div className="bg-gold/20 p-2 rounded-xl"><Share2 className="w-6 h-6 text-gold" /></div>
                Parrainage
              </h2>
              <p className="text-gray-400 max-w-xl">
                Invitez vos amis et gagnez <span className="text-gold font-bold">50 Coins</span> pour chaque ami inscrit.
                Votre ami reçoit <span className="text-gold font-bold">10 Coins</span> de bonus.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gold/10 border border-gold/30 px-5 py-2.5 rounded-full flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <span className="text-gold font-bold">{referralData.referralsCount || 0} filleul(s)</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input type="text" readOnly value={referralData.referralLink || "Chargement..."} className="w-full p-4 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-gold outline-none pr-12" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"><Copy className="w-5 h-5" /></div>
            </div>
            <button onClick={handleCopyLink} className={`px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${copied ? 'bg-green-600 text-white' : 'bg-gold hover:bg-yellow-600 text-black'}`}>
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>
        </motion.section>

        {/* Section Paramètres */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-12 bg-deepblack p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <div className="bg-gold/20 p-2 rounded-xl"><Settings className="w-6 h-6 text-gold" /></div>
            Paramètres
          </h2>

          <div className="space-y-8">
            {/* Profil */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-gold" /> Informations personnelles</h3>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="flex items-center gap-2 bg-gold hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg transition">
                    <Save className="w-4 h-4" /> Enregistrer
                  </button>
                </div>
              </form>
            </div>

            {/* Mot de passe */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-gold" /> Changer le mot de passe</h3>
              <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mot de passe actuel</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" required />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="flex items-center gap-2 bg-crimson hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition">
                    <Lock className="w-4 h-4" /> Changer le mot de passe
                  </button>
                </div>
              </form>
            </div>

            {/* Préférences */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-gold" /> Préférences</h3>
              <form onSubmit={handlePreferencesSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Langue</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none">
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Qualité vidéo</label>
                  <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none">
                    <option value="auto">Auto</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notifications push</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button type="button" onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`relative w-14 h-7 rounded-full transition ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition transform ${notificationsEnabled ? 'translate-x-7' : ''}`}></span>
                    </button>
                    <span className="text-sm text-gray-400">{notificationsEnabled ? 'Activées' : 'Désactivées'}</span>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="flex items-center gap-2 bg-gold hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg transition">
                    <Save className="w-4 h-4" /> Enregistrer préférences
                  </button>
                </div>
              </form>
            </div>

            {/* Déconnexion globale */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-gold" /> Sécurité</h3>
              <button onClick={handleLogoutAll} className="flex items-center gap-2 bg-deepblack border border-crimson/50 text-crimson hover:bg-crimson hover:text-white font-bold px-6 py-2 rounded-lg transition">
                <LogOut className="w-4 h-4" /> Se déconnecter de tous les appareils
              </button>
            </div>
          </div>
        </motion.section>

        {/* Historique et Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Historique */}
          <motion.section initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-crimson/20 p-2 rounded-xl"><Clock className="w-6 h-6 text-crimson" /></div>
              <h2 className="text-2xl font-bold">Continuer à regarder</h2>
            </div>
            {history.length === 0 ? (
              <div className="bg-deepblack p-10 rounded-xl border border-gray-800 text-center">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun historique pour le moment.</p>
                <p className="text-gray-500 text-sm mt-2">Commencez à regarder pour voir vos films ici.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {history.map((item) => (
                  <motion.div key={item.id} whileHover={{ scale: 1.02 }} className="flex items-center gap-5 bg-deepblack p-4 rounded-xl border border-gray-800 hover:border-gold/50 transition group">
                    <div className="relative flex-shrink-0">
                      <img src={item.Video?.poster} alt={item.Video?.title} className="w-24 h-36 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{item.Video?.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">Regardé le {formatDate(item.watchedAt)}</p>
                      {item.progress && (
                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-crimson to-gold rounded-full" style={{ width: `${Math.min(item.progress * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">{Math.round(item.progress * 100)}% visionné</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Watchlist */}
          <motion.section initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gold/20 p-2 rounded-xl"><Film className="w-6 h-6 text-gold" /></div>
              <h2 className="text-2xl font-bold">Ma Liste</h2>
            </div>
            {watchlist.length === 0 ? (
              <div className="bg-deepblack p-10 rounded-xl border border-gray-800 text-center">
                <PlusCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Votre liste est vide.</p>
                <p className="text-gray-500 text-sm mt-2">Ajoutez des films et séries à votre liste.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {watchlist.map((item) => (
                  <motion.div key={item.id} whileHover={{ scale: 1.05, y: -5 }} className="relative bg-deepblack rounded-xl overflow-hidden border border-gray-800 group shadow-lg hover:shadow-gold/10 transition">
                    <img src={item.Video?.poster} alt={item.Video?.title} className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition">
                      <h3 className="text-white text-sm font-semibold truncate">{item.Video?.title}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => removeFromWatchlist(item.id)} className="bg-deepblack/70 hover:bg-red-500 text-gray-300 hover:text-white p-2 rounded-lg transition" title="Retirer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="bg-gold/80 hover:bg-gold text-black p-2 rounded-lg transition" title="Regarder">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* Bouton de déconnexion simple */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 flex justify-center">
          <button onClick={onLogout} className="flex items-center gap-3 bg-deepblack border border-crimson/50 text-crimson hover:bg-crimson hover:text-white px-8 py-3 rounded-xl font-bold transition group">
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;