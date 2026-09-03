import React, { useEffect, useMemo, useState, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, Plus, Pencil, Trash2, RefreshCw, CheckCircle, XCircle,
  Coins, Users, Film, Star, History, LayoutDashboard, Search, Filter,
  ChevronLeft, ChevronRight, ChevronDown, Eye, EyeOff, Copy, LogOut, Settings,
  TrendingUp, DollarSign, Activity, Award, BarChart3, PieChart,
  MoreVertical, Upload, Download, ExternalLink, Bell, User, Shield,
  Globe, Smartphone, Tablet, Monitor, Megaphone, ShoppingBag, Lock, Crown
} from 'lucide-react';

// ----- Composants hors du composant principal -----
const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            page === p ? 'bg-gold text-black shadow-gold' : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ✅ StatCard devient cliquable
const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left focus:outline-none group"
    title={`Voir ${label}`}
  >
    <div className="bg-deepblack p-6 rounded-xl border border-gray-800 group-hover:border-gold/40 transition-all duration-300 group-hover:shadow-xl cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </button>
);

// ------- ErrorBoundary -------
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Erreur AdminPanel:", error, info);
  }
  handleReset = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', textAlign: 'center', padding: '20px' }}>
          <div>
            <h2 style={{ color: '#E50914', marginBottom: '10px' }}>Oups !</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>Une erreur est survenue.</p>
            <button onClick={this.handleReset} style={{ background: '#C5A059', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
              Réessayer
            </button>
            <button onClick={() => window.location.reload()} style={{ background: '#111', color: '#fff', padding: '10px 20px', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminPanel = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';
  
  const [data, setData] = useState({
    stats: { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
    users: [],
    videos: []
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: 'film',
    episodeNumber: 1,
    seasonNumber: 1,
    duration: '',
    url: '',
    coinsRequired: 0,
    poster: '',
    year: '',
    genre: '',
    casting: '',
    director: '',
    rating: '',
    featured: false,
    trailerUrl: '',
    releaseDate: ''
  });
  const [editVideo, setEditVideo] = useState(null);
  const [toast, setToast] = useState(null);

  // État pour les publicités
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({
    title: '',
    videoUrl: '',
    rewardCoins: 10,
    dailyLimit: 5,
    isActive: true
  });

  // État pour les passerelles de paiement
  const [gateways, setGateways] = useState([]);
  const [currentGateway, setCurrentGateway] = useState({
    name: '',
    logo: '',
    apiKey: '',
    apiSecret: '',
    isActive: false
  });

  // États pour les fournisseurs SMS
  const [smsGateways, setSmsGateways] = useState([]);
  const [currentSmsGateway, setCurrentSmsGateway] = useState({
    name: '',
    logo: '',
    apiKey: '',
    apiSecret: '',
    senderId: '',
    isActive: true
  });

  // Pagination
  const [videoPage, setVideoPage] = useState(1);
  const [videosPerPage] = useState(6);
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [adPage, setAdPage] = useState(1);
  const [adsPerPage] = useState(5);
  const [smsPage, setSmsPage] = useState(1);
  const [smsPerPage] = useState(5);

  // Filtres Vidéos
  const [videoSearch, setVideoSearch] = useState('');
  const [coinMin, setCoinMin] = useState('');
  const [coinMax, setCoinMax] = useState('');
  const [videoSort, setVideoSort] = useState('title');

  // Filtres Utilisateurs
  const [userSearch, setUserSearch] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [coinUserMin, setCoinUserMin] = useState('');
  const [coinUserMax, setCoinUserMax] = useState('');
  const [userSort, setUserSort] = useState('email');

  // États UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  // États pour les paramètres admin
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [globalNotification, setGlobalNotification] = useState({ title: '', body: '' });
  const [settings, setSettings] = useState({
    adsEnabled: true,
    maintenance: false,
  });

  // ===== GESTION DES PLANS D'ABONNEMENT =====
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ 
    name: '', duration: 'monthly', price: 0, description: '', features: '', isActive: true 
  });

  // Charger les plans
  const loadPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/plans`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        } 
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement plans:", error);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Ajouter ou modifier un plan
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    
    const planId = currentPlan ? currentPlan.id : null;
    const url = planId ? `${API_URL}/api/admin/plans/${planId}` : `${API_URL}/api/admin/plans`;
    const method = planId ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newPlan.name,
          duration: newPlan.duration,
          price: parseFloat(newPlan.price) || 0,
          description: newPlan.description || '',
          features: newPlan.features || '',
          isActive: newPlan.isActive
        })
      });
      
      const responseData = await res.json().catch(() => ({}));
      
      if (res.ok) {
        showToast(planId ? '✅ Plan modifié avec succès !' : '✅ Plan créé avec succès !');
        setNewPlan({ name: '', duration: 'monthly', price: 0, description: '', features: '', isActive: true });
        setCurrentPlan(null);
        await loadPlans();
      } else {
        showToast(responseData.error || `❌ Erreur lors de l'enregistrement (${res.status})`, 'error');
      }
    } catch (error) {
      showToast('❌ Erreur serveur', 'error');
    }
  };

  // Modifier un plan
  const handleEditPlan = (plan) => {
    setCurrentPlan(plan);
    setNewPlan({ 
      name: plan.name || '', 
      duration: plan.duration || 'monthly', 
      price: plan.price || 0, 
      description: plan.description || '', 
      features: Array.isArray(plan.features) ? plan.features.join(', ') : 
                (typeof plan.features === 'string' ? plan.features : ''),
      isActive: plan.isActive !== false 
    });
  };

  // Supprimer un plan
  const handleDeletePlan = async (id) => {
    if (window.confirm('Supprimer ce plan ?')) {
      try {
        const res = await fetch(`${API_URL}/api/admin/plans/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        const responseData = await res.json().catch(() => ({}));
        
        if (res.ok) {
          setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
          showToast('🗑️ Plan supprimé !');
          await loadPlans();
        } else {
          showToast(responseData.error || `❌ Erreur lors de la suppression (${res.status})`, 'error');
        }
      } catch (error) {
        showToast('❌ Erreur serveur', 'error');
      }
    }
  };

  // Chargement initial du dashboard
  useEffect(() => {
    fetch(`${API_URL}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setData({
        stats: data.stats || { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
        users: Array.isArray(data.users) ? data.users : [],
        videos: Array.isArray(data.videos) ? data.videos : []
      });
    })
    .catch(err => console.error("Erreur dashboard", err));
  }, [token]);

  // Charger passerelles
  const loadGateways = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/gateways`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGateways(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement passerelles", error);
    }
  };

  // Charger publicités
  const loadAds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/ads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement publicités", error);
    }
  };

  // Charger les fournisseurs SMS
  const loadSmsGateways = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/sms-gateways`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSmsGateways(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur chargement fournisseurs SMS", error);
    }
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetch(`${API_URL}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(err => console.error(err));
  }, [token]);

  // Charger le profil admin
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('user')) || {};
    setAdminProfile({ name: admin.name || '', email: admin.email || '', avatar: admin.avatar || '' });
  }, []);

  useEffect(() => {
    loadGateways();
    loadAds();
    loadSmsGateways();
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== ACTIONS VIDÉOS =====
  const handleAddVideo = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newVideo)
    });
    if (res.ok) {
      showToast('✅ Film ajouté !');
      setNewVideo({
        title: '', description: '', category: 'film', episodeNumber: 1, seasonNumber: 1,
        duration: '', url: '', coinsRequired: 0, poster: '',
        year: '', genre: '', casting: '', director: '', rating: '',
        featured: false, trailerUrl: '', releaseDate: ''
      });
      setEditVideo(null);
      const updated = await fetch(`${API_URL}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const updatedData = await updated.json();
      setData({
        stats: updatedData.stats || { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
        users: Array.isArray(updatedData.users) ? updatedData.users : [],
        videos: Array.isArray(updatedData.videos) ? updatedData.videos : []
      });
    } else {
      showToast('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleEditVideo = (id) => {
    const video = data.videos.find(v => v.id === id);
    setEditVideo(video);
    setNewVideo({
      title: video.title || '',
      description: video.description || '',
      category: video.category || 'film',
      episodeNumber: video.episodeNumber || 1,
      seasonNumber: video.seasonNumber || 1,
      duration: video.duration || '',
      url: video.url || '',
      coinsRequired: video.coinsRequired || 0,
      poster: video.poster || '',
      year: video.year || '',
      genre: video.genre || '',
      casting: video.casting || '',
      director: video.director || '',
      rating: video.rating || '',
      featured: video.featured || false,
      trailerUrl: video.trailerUrl || '',
      releaseDate: video.releaseDate || ''
    });
    setActiveSection('videos');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/videos/${editVideo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newVideo)
    });
    if (res.ok) {
      showToast('✅ Film mis à jour !');
      setEditVideo(null);
      setNewVideo({
        title: '', description: '', category: 'film', episodeNumber: 1, seasonNumber: 1,
        duration: '', url: '', coinsRequired: 0, poster: '',
        year: '', genre: '', casting: '', director: '', rating: '',
        featured: false, trailerUrl: '', releaseDate: ''
      });
      const updated = await fetch(`${API_URL}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const updatedData = await updated.json();
      setData({
        stats: updatedData.stats || { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
        users: Array.isArray(updatedData.users) ? updatedData.users : [],
        videos: Array.isArray(updatedData.videos) ? updatedData.videos : []
      });
    } else {
      showToast('❌ Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Supprimer ce film ?')) {
      await fetch(`${API_URL}/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('🗑️ Film supprimé');
      const updated = await fetch(`${API_URL}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const updatedData = await updated.json();
      setData({
        stats: updatedData.stats || { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
        users: Array.isArray(updatedData.users) ? updatedData.users : [],
        videos: Array.isArray(updatedData.videos) ? updatedData.videos : []
      });
    }
  };

  // ===== ACTIONS UTILISATEURS =====
  const handleGiveCoins = async (userId) => {
    const coins = prompt("Combien de pièces offrir ? (chiffre négatif pour retirer)");
    if (coins) {
      await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ coins: parseInt(coins) })
      });
      showToast('💰 Pièces distribuées');
      const updated = await fetch(`${API_URL}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      const updatedData = await updated.json();
      setData({
        stats: updatedData.stats || { totalUsers: 0, totalVideos: 0, totalRatings: 0, totalHistory: 0 },
        users: Array.isArray(updatedData.users) ? updatedData.users : [],
        videos: Array.isArray(updatedData.videos) ? updatedData.videos : []
      });
    }
  };

  const copyReferral = async (userId) => {
    await navigator.clipboard.writeText(`https://blackbox.com/ref/${userId}`);
    showToast('🔗 Lien copié !');
  };

  // ===== ACTIONS PASSERELLES =====
  const handleGatewaySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentGateway)
      });
      if (res.ok) {
        showToast('✅ Passerelle enregistrée !');
        loadGateways();
        setCurrentGateway({ name: '', logo: '', apiKey: '', apiSecret: '', isActive: false });
      } else {
        showToast('❌ Erreur enregistrement passerelle', 'error');
      }
    } catch (error) {
      showToast('❌ Erreur serveur', 'error');
    }
  };

  const handleDeleteGateway = async (id) => {
    if (window.confirm('Supprimer cette passerelle ?')) {
      const res = await fetch(`${API_URL}/api/admin/gateways/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('🗑️ Passerelle supprimée');
        loadGateways();
      } else {
        showToast('❌ Erreur suppression', 'error');
      }
    }
  };

  // ===== ACTIONS PUBLICITÉS =====
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAd)
      });
      if (res.ok) {
        showToast('✅ Publicité enregistrée !');
        loadAds();
        setNewAd({ title: '', videoUrl: '', rewardCoins: 10, dailyLimit: 5, isActive: true });
      } else {
        showToast('❌ Erreur enregistrement publicité', 'error');
      }
    } catch (error) {
      showToast('❌ Erreur serveur', 'error');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Supprimer cette publicité ?')) {
      const res = await fetch(`${API_URL}/api/admin/ads/${adId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('🗑️ Publicité supprimée');
        loadAds();
      } else {
        showToast('❌ Erreur suppression', 'error');
      }
    }
  };

  // Actions SMS
  const handleSmsGatewaySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/sms-gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentSmsGateway)
      });
      if (res.ok) {
        showToast('✅ Fournisseur SMS enregistré !');
        loadSmsGateways();
        setCurrentSmsGateway({ name: '', logo: '', apiKey: '', apiSecret: '', senderId: '', isActive: true });
      } else {
        showToast('❌ Erreur enregistrement fournisseur SMS', 'error');
      }
    } catch (error) {
      showToast('❌ Erreur serveur', 'error');
    }
  };

  const handleDeleteSmsGateway = async (id) => {
    if (window.confirm('Supprimer ce fournisseur SMS ?')) {
      const res = await fetch(`${API_URL}/api/admin/sms-gateways/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('🗑️ Fournisseur SMS supprimé');
        loadSmsGateways();
      } else {
        showToast('❌ Erreur suppression', 'error');
      }
    }
  };

  // ===== DÉCONNEXION =====
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/admin');
    }
  };

  // ===== GESTION DES PARAMÈTRES ADMIN =====
  const handleAdminProfileSave = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(adminProfile)
    });
    if (res.ok) {
      showToast('✅ Profil admin mis à jour');
    } else {
      showToast('❌ Erreur', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/security/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('✅ Mot de passe changé');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      showToast(data.error || '❌ Erreur', 'error');
    }
  };

  const handleGlobalNotificationSend = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/notifications/global`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(globalNotification)
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`✅ Notification envoyée à ${data.sentCount} utilisateurs`);
    } else {
      showToast(data.error || '❌ Erreur', 'error');
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ settings })
    });
    if (res.ok) {
      showToast('✅ Paramètres enregistrés');
    } else {
      showToast('❌ Erreur', 'error');
    }
  };

  // ===== FILTRES & PAGINATION VIDÉOS =====
  const filteredVideos = useMemo(() => {
    if (!Array.isArray(data.videos)) return [];
    let result = [...data.videos];

    if (videoSearch) {
      result = result.filter(v => 
        v.title && v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
        v.description && v.description.toLowerCase().includes(videoSearch.toLowerCase()) ||
        v.genre && v.genre.toLowerCase().includes(videoSearch.toLowerCase())
      );
    }

    if (coinMin !== '') {
      result = result.filter(v => v.coinsRequired >= parseInt(coinMin));
    }

    if (coinMax !== '') {
      result = result.filter(v => v.coinsRequired <= parseInt(coinMax));
    }

    switch (videoSort) {
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
        break;
      case 'coins':
        result.sort((a, b) => (a.coinsRequired || 0) - (b.coinsRequired || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        break;
    }

    return result;
  }, [data.videos, videoSearch, coinMin, coinMax, videoSort]);

  const totalVideoPages = Math.ceil(filteredVideos.length / videosPerPage);
  const currentVideos = filteredVideos.slice((videoPage - 1) * videosPerPage, videoPage * videosPerPage);

  // ===== FILTRES & PAGINATION UTILISATEURS =====
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(data.users)) return [];
    let result = [...data.users];

    if (userSearch) {
      result = result.filter(u => u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    }

    if (subscriptionFilter !== 'all') {
      result = result.filter(u => u.subscription === subscriptionFilter);
    }

    if (coinUserMin !== '') {
      result = result.filter(u => (u.blackCoins || 0) >= parseInt(coinUserMin));
    }

    if (coinUserMax !== '') {
      result = result.filter(u => (u.blackCoins || 0) <= parseInt(coinUserMax));
    }

    switch (userSort) {
      case 'email':
        result.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        break;
      case 'coins':
        result.sort((a, b) => (a.blackCoins || 0) - (b.blackCoins || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        break;
    }

    return result;
  }, [data.users, userSearch, subscriptionFilter, coinUserMin, coinUserMax, userSort]);

  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const resetVideoFilters = () => {
    setVideoSearch('');
    setCoinMin('');
    setCoinMax('');
    setVideoSort('title');
    setVideoPage(1);
  };

  const resetUserFilters = () => {
    setUserSearch('');
    setSubscriptionFilter('all');
    setCoinUserMin('');
    setCoinUserMax('');
    setUserSort('email');
    setUserPage(1);
  };

  // Pagination publicités
  const totalAdPages = Math.ceil(ads.length / adsPerPage);
  const currentAds = ads.slice((adPage - 1) * adsPerPage, adPage * adsPerPage);

  // Pagination SMS
  const totalSmsPages = Math.ceil(smsGateways.length / smsPerPage);
  const currentSmsGateways = smsGateways.slice((smsPage - 1) * smsPerPage, smsPage * smsPerPage);

  // ===== RENDU =====
  return (
    <div className="min-h-screen bg-carbon text-offwhite relative overflow-x-hidden">
      {/* Toast amélioré */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-crimson text-white' : 'bg-deepblack border border-gold/40 text-gold'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-deepblack border-r border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">BlackBox</h1>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setActiveSection('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'dashboard' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Tableau de bord
            </button>
            <button
              onClick={() => { setActiveSection('videos'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'videos' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Film className="w-5 h-5" />
              Films
            </button>
            <button
              onClick={() => { setActiveSection('users'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'users' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Utilisateurs
            </button>
            <button
              onClick={() => { setActiveSection('ads'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'ads' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              Publicités
            </button>
            <button
              onClick={() => { setActiveSection('payments'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'payments' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Paiements
            </button>
            <button
              onClick={() => { setActiveSection('sms'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'sms' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Fournisseurs SMS
            </button>
            {/* ✅ Nouveau bouton Abonnements */}
            <button
              onClick={() => { setActiveSection('plans'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'plans' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Crown className="w-5 h-5" />
              Abonnements
            </button>
            <button
              onClick={() => { setActiveSection('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeSection === 'settings' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              Paramètres
            </button>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition">
            <ExternalLink className="w-5 h-5" />
            Voir le site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-carbon/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gold font-display hidden sm:block">
                {activeSection === 'dashboard' && 'Tour de Contrôle'}
                {activeSection === 'videos' && 'Gestion des Films'}
                {activeSection === 'users' && 'Utilisateurs'}
                {activeSection === 'ads' && 'Publicités'}
                {activeSection === 'payments' && 'Passerelles de Paiement'}
                {activeSection === 'sms' && 'Fournisseurs SMS'}
                {activeSection === 'plans' && 'Plans d\'Abonnement'}
                {activeSection === 'settings' && 'Paramètres'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson rounded-full text-[10px] flex items-center justify-center text-white">3</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm hidden md:block">Admin</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-deepblack border border-gray-700 rounded-lg shadow-xl z-50">
                    <button
                      onClick={() => { setActiveSection('settings'); setShowAdminMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Paramètres
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-crimson hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* SECTION DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Cartes de Stats cliquables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Utilisateurs" value={data.stats.totalUsers || 0} color="bg-blue-600" onClick={() => setActiveSection('users')} />
                <StatCard icon={Film} label="Films" value={data.stats.totalVideos || 0} color="bg-purple-600" onClick={() => setActiveSection('videos')} />
                <StatCard icon={Star} label="Notes" value={data.stats.totalRatings || 0} color="bg-gold" onClick={() => setActiveSection('videos')} />
                <StatCard icon={History} label="Historiques" value={data.stats.totalHistory || 0} color="bg-crimson" onClick={() => setActiveSection('users')} />
              </div>

              {/* Graphiques factices */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-deepblack p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Aperçu des revenus</h3>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gold/20 rounded-t-lg hover:bg-gold/40 transition" style={{ height: `${height}%` }}></div>
                        <span className="text-xs text-gray-500">J{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Répartition</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Abonnements</span>
                      <span className="text-white font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-gold h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Publicité</span>
                      <span className="text-white font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-crimson h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Achats coins</span>
                      <span className="text-white font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liens rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => setActiveSection('videos')} className="bg-deepblack p-6 rounded-xl border border-gray-800 hover:border-gold/50 transition group">
                  <Plus className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-white font-semibold text-lg">Ajouter un film</h3>
                  <p className="text-gray-400 text-sm mt-2">Publier une nouvelle vidéo</p>
                </button>
                <button onClick={() => setActiveSection('users')} className="bg-deepblack p-6 rounded-xl border border-gray-800 hover:border-gold/50 transition group">
                  <Users className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-white font-semibold text-lg">Gérer les utilisateurs</h3>
                  <p className="text-gray-400 text-sm mt-2">Voir et modifier les comptes</p>
                </button>
                <button onClick={() => setActiveSection('payments')} className="bg-deepblack p-6 rounded-xl border border-gray-800 hover:border-gold/50 transition group">
                  <CreditCard className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-white font-semibold text-lg">Paiements</h3>
                  <p className="text-gray-400 text-sm mt-2">Configurer les passerelles</p>
                </button>
              </div>
            </div>
          )}

          {/* SECTION VIDEOS */}
          {activeSection === 'videos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Film className="w-6 h-6 text-gold" /> Catalogue
                </h2>

                {/* Filtres */}
                <div className="mb-6 p-4 bg-carbon rounded-lg border border-gray-700">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={videoSearch}
                        onChange={(e) => { setVideoSearch(e.target.value); setVideoPage(1); }}
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Coins min"
                      value={coinMin}
                      onChange={(e) => { setCoinMin(e.target.value); setVideoPage(1); }}
                      className="w-24 px-2 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Coins max"
                      value={coinMax}
                      onChange={(e) => { setCoinMax(e.target.value); setVideoPage(1); }}
                      className="w-24 px-2 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                    <select
                      value={videoSort}
                      onChange={(e) => setVideoSort(e.target.value)}
                      className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none cursor-pointer"
                    >
                      <option value="title">Tri : Titre</option>
                      <option value="duration">Tri : Durée</option>
                      <option value="coins">Tri : Coins</option>
                      <option value="date">Tri : Date</option>
                    </select>
                    <button
                      onClick={resetVideoFilters}
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                      title="Réinitialiser"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Liste des vidéos */}
                <div className="space-y-4">
                  {currentVideos.map((video, index) => (
                    <div
                      key={video.id || `video-${index}`}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-carbon rounded-lg border border-gray-700 hover:border-gold/40 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={video.poster} alt="" className="w-16 h-16 object-cover rounded-lg" />
                          <span className="absolute -bottom-1 -right-1 bg-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {video.coinsRequired} <Coins className="w-3 h-3 inline" />
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{video.title}</p>
                          <p className="text-sm text-gray-500">
                            {video.category} - {video.duration}
                            {video.episodeNumber > 1 && ` (S${video.seasonNumber} E${video.episodeNumber})`}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">{video.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <button onClick={() => handleEditVideo(video.id)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition" title="Modifier">
                          <Pencil className="w-4 h-4 text-gold" />
                        </button>
                        <button onClick={() => handleDeleteVideo(video.id)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-crimson" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination page={videoPage} totalPages={totalVideoPages} setPage={setVideoPage} />
              </div>

              {/* Formulaire Ajout/Édition */}
              <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  {editVideo ? <Pencil className="w-5 h-5 text-gold" /> : <Plus className="w-5 h-5 text-gold" />}
                  {editVideo ? 'Modifier' : 'Ajouter'}
                </h2>
                <form onSubmit={editVideo ? handleSaveEdit : handleAddVideo} className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Titre</label>
                    <input type="text" value={newVideo.title} onChange={(e) => setNewVideo({...newVideo, title: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none transition" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Catégorie</label>
                    <select value={newVideo.category} onChange={(e) => setNewVideo({...newVideo, category: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none cursor-pointer">
                      <option value="film">Film</option>
                      <option value="serie">Série</option>
                      <option value="documentaire">Documentaire</option>
                    </select>
                  </div>
                  {newVideo.category === 'serie' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1.5">Saison</label>
                        <input type="number" min="1" value={newVideo.seasonNumber} onChange={(e) => setNewVideo({...newVideo, seasonNumber: parseInt(e.target.value)})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1.5">Épisode</label>
                        <input type="number" min="1" value={newVideo.episodeNumber} onChange={(e) => setNewVideo({...newVideo, episodeNumber: parseInt(e.target.value)})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Durée</label>
                    <input type="text" placeholder="ex: 2:30" value={newVideo.duration} onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">URL de la vidéo (.mp4 ou .m3u8 HLS)</label>
                    <input type="text" value={newVideo.url} onChange={(e) => setNewVideo({...newVideo, url: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" required />
                    <p className="text-xs text-gray-500 mt-1">Astuce : Utilisez un lien .m3u8 pour un streaming fluide et adaptatif (HD même en 3G).</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">URL de l'affiche</label>
                    <input type="text" value={newVideo.poster} onChange={(e) => setNewVideo({...newVideo, poster: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Description</label>
                    <textarea value={newVideo.description} onChange={(e) => setNewVideo({...newVideo, description: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" rows="3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1.5">Année</label>
                      <input type="number" value={newVideo.year} onChange={(e) => setNewVideo({...newVideo, year: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1.5">Genre</label>
                      <input type="text" value={newVideo.genre} onChange={(e) => setNewVideo({...newVideo, genre: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Casting</label>
                    <input type="text" value={newVideo.casting} onChange={(e) => setNewVideo({...newVideo, casting: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Réalisateur</label>
                    <input type="text" value={newVideo.director} onChange={(e) => setNewVideo({...newVideo, director: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Note (sur 10)</label>
                    <input type="number" step="0.1" value={newVideo.rating} onChange={(e) => setNewVideo({...newVideo, rating: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Bande-annonce (URL)</label>
                    <input type="text" value={newVideo.trailerUrl} onChange={(e) => setNewVideo({...newVideo, trailerUrl: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Date de sortie</label>
                    <input type="date" value={newVideo.releaseDate} onChange={(e) => setNewVideo({...newVideo, releaseDate: e.target.value})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Prix (Coins)</label>
                    <input type="number" value={newVideo.coinsRequired} onChange={(e) => setNewVideo({...newVideo, coinsRequired: parseInt(e.target.value) || 0})} className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none" required />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVideo.featured}
                        onChange={(e) => setNewVideo({...newVideo, featured: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      Mettre en avant (Hero)
                    </label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition flex items-center justify-center gap-2">
                    {editVideo ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editVideo ? 'Sauvegarder' : 'Publier'}
                  </button>
                </form>
                {editVideo && (
                  <button
                    onClick={() => {
                      setEditVideo(null);
                      setNewVideo({
                        title: '', description: '', category: 'film', episodeNumber: 1, seasonNumber: 1,
                        duration: '', url: '', coinsRequired: 0, poster: '',
                        year: '', genre: '', casting: '', director: '', rating: '',
                        featured: false, trailerUrl: '', releaseDate: ''
                      });
                    }}
                    className="w-full py-2 mt-2 bg-deepblack border border-gray-700 text-gray-400 hover:text-white rounded-lg transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION UTILISATEURS */}
          {activeSection === 'users' && (
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" /> Utilisateurs
              </h2>

              <div className="mb-6 p-4 bg-carbon rounded-lg border border-gray-700">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par email..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <select
                    value={subscriptionFilter}
                    onChange={(e) => { setSubscriptionFilter(e.target.value); setUserPage(1); }}
                    className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="all">Abonnement : Tous</option>
                    <option value="annual">Annuel</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Coins min"
                    value={coinUserMin}
                    onChange={(e) => { setCoinUserMin(e.target.value); setUserPage(1); }}
                    className="w-24 px-2 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Coins max"
                    value={coinUserMax}
                    onChange={(e) => { setCoinUserMax(e.target.value); setUserPage(1); }}
                    className="w-24 px-2 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                  />
                  <select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value)}
                    className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:border-gold outline-none cursor-pointer"
                  >
                    <option value="email">Tri : Email</option>
                    <option value="coins">Tri : Coins</option>
                    <option value="date">Tri : Date</option>
                  </select>
                  <button
                    onClick={resetUserFilters}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                    title="Réinitialiser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="p-3 pl-4">Utilisateur</th>
                      <th className="p-3">Pièces</th>
                      <th className="p-3">Abonnement</th>
                      <th className="p-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user.id || `user-${index}`} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gold/20 text-gold rounded-full flex items-center justify-center font-bold">
                              {user.email && user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-gold font-bold flex items-center gap-1">
                            <Coins className="w-4 h-4" /> {user.blackCoins}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.subscription === 'annual' ? 'bg-emerald-900/50 text-emerald-300' :
                            user.subscription === 'monthly' ? 'bg-blue-900/50 text-blue-300' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {user.subscription === 'annual' ? 'Annuel' : user.subscription === 'monthly' ? 'Mensuel' : 'Aucun'}
                          </span>
                        </td>
                        <td className="p-3 pr-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleGiveCoins(user.id)}
                              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                              title="Offrir des pièces"
                            >
                              <Coins className="w-4 h-4" /> Coins
                            </button>
                            <button
                              onClick={() => copyReferral(user.id)}
                              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                              title="Copier le lien de parrainage"
                            >
                              <Copy className="w-4 h-4" /> Lien
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination page={userPage} totalPages={totalUserPages} setPage={setUserPage} />
            </div>
          )}

          {/* SECTION PUBLICITÉS */}
          {activeSection === 'ads' && (
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-gold" /> Publicités
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-gray-400 mb-4 font-medium">Publicités existantes</h3>
                  {ads.length === 0 ? (
                    <div className="bg-carbon p-8 rounded-lg border border-gray-700 text-center">
                      <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune publicité configurée.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentAds.map((ad, index) => (
                        <div key={ad.id || `ad-${index}`} className="flex justify-between items-center p-4 bg-carbon rounded-lg border border-gray-700 hover:border-gold/40 transition">
                          <div>
                            <p className="font-semibold text-white">{ad.title}</p>
                            <p className="text-sm text-gray-400">{ad.rewardCoins} Coins - Limite/jour : {ad.dailyLimit}</p>
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                              ad.isActive ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {ad.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-crimson" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Pagination page={adPage} totalPages={totalAdPages} setPage={setAdPage} />
                </div>

                <form onSubmit={handleAdSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Titre</label>
                    <input
                      type="text"
                      placeholder="Nom de la publicité"
                      value={newAd.title}
                      onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">URL de la vidéo</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newAd.videoUrl}
                      onChange={(e) => setNewAd({...newAd, videoUrl: e.target.value})}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1.5">Pièces récompensées</label>
                      <input
                        type="number"
                        min="1"
                        value={newAd.rewardCoins}
                        onChange={(e) => setNewAd({...newAd, rewardCoins: parseInt(e.target.value) || 0})}
                        className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1.5">Limite par jour</label>
                      <input
                        type="number"
                        min="1"
                        value={newAd.dailyLimit}
                        onChange={(e) => setNewAd({...newAd, dailyLimit: parseInt(e.target.value) || 0})}
                        className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAd.isActive}
                        onChange={(e) => setNewAd({...newAd, isActive: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      Activer cette publicité
                    </label>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Enregistrer la publicité
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION FOURNISSEURS SMS */}
          {activeSection === 'sms' && (
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-gold" /> Fournisseurs SMS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-gray-400 mb-4 font-medium">Fournisseurs configurés</h3>
                  {smsGateways.length === 0 ? (
                    <div className="bg-carbon p-8 rounded-lg border border-gray-700 text-center">
                      <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun fournisseur SMS configuré.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentSmsGateways.map((gateway, index) => (
                        <div key={gateway.id || `sms-${index}`} className="flex justify-between items-center p-4 bg-carbon rounded-lg border border-gray-700 hover:border-gold/40 transition">
                          <div className="flex items-center gap-4">
                            {gateway.logo ? (
                              <img src={gateway.logo} alt={gateway.name} className="w-12 h-12 object-contain rounded-full bg-white p-1" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{gateway.name}</p>
                              <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                gateway.isActive ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-800 text-gray-400'
                              }`}>
                                {gateway.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentSmsGateway(gateway)}
                              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4 text-gold" />
                            </button>
                            <button
                              onClick={() => handleDeleteSmsGateway(gateway.id)}
                              className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-crimson" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Pagination page={smsPage} totalPages={totalSmsPages} setPage={setSmsPage} />
                </div>

                <form onSubmit={handleSmsGatewaySubmit} className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Nom du fournisseur</label>
                    <input
                      type="text"
                      placeholder="ex: Termii, Twilio, Africa's Talking"
                      value={currentSmsGateway.name}
                      onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, name: e.target.value })}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">URL du logo (optionnel)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={currentSmsGateway.logo}
                      onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, logo: e.target.value })}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Clé API</label>
                    <input
                      type="text"
                      placeholder="Clé publique"
                      value={currentSmsGateway.apiKey}
                      onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, apiKey: e.target.value })}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Clé Secrète</label>
                    <input
                      type="password"
                      placeholder="Clé secrète"
                      value={currentSmsGateway.apiSecret}
                      onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, apiSecret: e.target.value })}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">ID Expéditeur (Sender ID)</label>
                    <input
                      type="text"
                      placeholder="ex: BlackBox"
                      value={currentSmsGateway.senderId}
                      onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, senderId: e.target.value })}
                      className="w-full p-2.5 bg-carbon rounded-lg border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSmsGateway.isActive}
                        onChange={(e) => setCurrentSmsGateway({ ...currentSmsGateway, isActive: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      Activer ce fournisseur
                    </label>
                    {currentSmsGateway.id && (
                      <button
                        type="button"
                        onClick={() => setCurrentSmsGateway({ name: '', logo: '', apiKey: '', apiSecret: '', senderId: '', isActive: true })}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition flex items-center justify-center gap-2">
                    {currentSmsGateway.id ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {currentSmsGateway.id ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION PLANS D'ABONNEMENT */}
          {activeSection === 'plans' && (
            <div className="bg-deepblack p-6 rounded-xl border border-gray-800 mb-8">
              <h2 className="text-xl font-bold mb-6">💎 Plans d'Abonnement</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Liste des plans */}
                <div className="lg:col-span-2 space-y-3">
                  {plans.length === 0 ? (
                    <p className="text-gray-500">Aucun plan créé pour le moment.</p>
                  ) : (
                    plans.map(plan => (
                      <div key={plan.id} className="flex justify-between items-center p-4 bg-carbon rounded-lg border border-gray-700">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {plan.name === 'Premium' ? <Crown className="w-4 h-4 text-gold" /> : plan.name === 'Family' ? <Users className="w-4 h-4 text-gold" /> : <Star className="w-4 h-4 text-gold" />}
                            {plan.name}
                          </p>
                          <p className="text-sm text-gray-500">{plan.price} FCFA / {plan.duration}</p>
                          <p className="text-xs text-gray-600">{plan.isActive ? 'Actif' : 'Inactif'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditPlan(plan)} className="text-gold hover:bg-gray-700 px-3 py-1 rounded">✏️ Modifier</button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="text-crimson hover:bg-gray-700 px-3 py-1 rounded">🗑️ Supprimer</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulaire Ajout/Modification */}
                <div className="bg-carbon p-5 rounded-xl border border-gray-700">
                  <h3 className="font-bold mb-4">{currentPlan ? 'Modifier le plan' : 'Ajouter un plan'}</h3>
                  <form onSubmit={handlePlanSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400">Nom du plan</label>
                      <select 
                        value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                        className="w-full p-2 bg-deepblack border border-gray-700 rounded text-white focus:border-gold outline-none"
                      >
                        <option value="">Choisir...</option>
                        <option value="Essential">Essential</option>
                        <option value="Premium">Premium</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Durée</label>
                      <select 
                        value={newPlan.duration} onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                        className="w-full p-2 bg-deepblack border border-gray-700 rounded text-white focus:border-gold outline-none"
                      >
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="annual">Annuel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Prix (FCFA)</label>
                      <input type="number" value={newPlan.price} onChange={(e) => setNewPlan({...newPlan, price: parseInt(e.target.value) || 0})} className="w-full p-2 bg-deepblack border border-gray-700 rounded text-white focus:border-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Description</label>
                      <input type="text" value={newPlan.description} onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} className="w-full p-2 bg-deepblack border border-gray-700 rounded text-white focus:border-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Avantages (séparés par des virgules)</label>
                      <input type="text" value={newPlan.features} onChange={(e) => setNewPlan({...newPlan, features: e.target.value})} placeholder="HD, Sans pub, Accès illimité..." className="w-full p-2 bg-deepblack border border-gray-700 rounded text-white focus:border-gold outline-none" />
                    </div>
                    <label className="flex items-center gap-2 text-gray-300 text-sm">
                      <input type="checkbox" checked={newPlan.isActive} onChange={(e) => setNewPlan({...newPlan, isActive: e.target.checked})} />
                      Activer ce plan
                    </label>
                    <button type="submit" className="w-full py-2 bg-gold hover:bg-yellow-600 text-black font-bold rounded">
                      {currentPlan ? 'Sauvegarder' : 'Créer le plan'}
                    </button>
                  </form>
                  {currentPlan && (
                    <button onClick={() => { setCurrentPlan(null); setNewPlan({ name: '', duration: 'monthly', price: 0, description: '', features: '', isActive: true }); }} className="w-full py-2 mt-2 bg-deepblack border border-gray-700 text-gray-400 hover:text-white rounded">
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION PARAMÈTRES */}
          {activeSection === 'settings' && (
            <div className="space-y-8">
              <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-gold" /> Profil Admin
                </h2>
                <form onSubmit={handleAdminProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nom</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Avatar URL</label>
                    <input
                      type="text"
                      value={adminProfile.avatar}
                      onChange={(e) => setAdminProfile({ ...adminProfile, avatar: e.target.value })}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <button type="submit" className="bg-gold hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg">
                    Enregistrer
                  </button>
                </form>
              </div>

              <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-gold" /> Sécurité
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-crimson hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg">
                    Changer le mot de passe
                  </button>
                </form>
              </div>

              <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-gold" /> Notifications globales
                </h2>
                <form onSubmit={handleGlobalNotificationSend} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Titre</label>
                    <input
                      type="text"
                      value={globalNotification.title}
                      onChange={(e) => setGlobalNotification({ ...globalNotification, title: e.target.value })}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                    <textarea
                      value={globalNotification.body}
                      onChange={(e) => setGlobalNotification({ ...globalNotification, body: e.target.value })}
                      className="w-full p-2 bg-carbon rounded border border-gray-700 text-white focus:border-gold outline-none"
                      rows="3"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-gold hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg">
                    Envoyer à tous
                  </button>
                </form>
              </div>

              <div className="bg-deepblack p-6 rounded-xl border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-gold" /> Fonctionnalités
                </h2>
                <form onSubmit={handleSettingsSave} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Publicités récompensées</span>
                    <input
                      type="checkbox"
                      checked={settings.adsEnabled}
                      onChange={(e) => setSettings({ ...settings, adsEnabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Mode maintenance</span>
                    <input
                      type="checkbox"
                      checked={settings.maintenance}
                      onChange={(e) => setSettings({ ...settings, maintenance: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                  <button type="submit" className="bg-gold hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg">
                    Enregistrer
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Export avec ErrorBoundary pour éviter l'écran noir
export default function AdminPanelWrapper(props) {
  return <ErrorBoundary><AdminPanel {...props} /></ErrorBoundary>;
}