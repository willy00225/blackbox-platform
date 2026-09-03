import React, { useEffect, useState } from 'react';
import { Check, Crown, Star, Users, Loader2, Shield, Zap, Film, Gift, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const Subscriptions = ({ user, onUserUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [toast, setToast] = useState(null); // ✅ État pour toast

  // Afficher un toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      showToast('Connectez-vous pour voir les abonnements', 'error');
      return;
    }

    const fetchData = async () => {
      try {
        const [plansRes, statusRes] = await Promise.all([
          fetch(`${API_URL}/api/subscriptions/plans`),
          fetch(`${API_URL}/api/subscriptions/status/${user.id}`)
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(Array.isArray(plansData) ? plansData : []);
        }

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setCurrentStatus(statusData);
        }
      } catch (error) {
        console.error('Erreur chargement abonnements:', error);
        showToast('Erreur lors du chargement des formules', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user?.id) {
      showToast('Connectez-vous pour vous abonner', 'error');
      return;
    }

    setSubscribing(planId);
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Abonnement ${data.planName || ''} activé ! +50 Coins offerts.`);
        if (onUserUpdate) onUserUpdate(data.user);
        setCurrentStatus({
          subscription: data.user.subscription,
          expiry: data.user.subscriptionExpiry
        });
      } else {
        showToast(data.error || 'Erreur lors de l\'abonnement', 'error');
      }
    } catch (error) {
      showToast('Erreur réseau. Veuillez réessayer.', 'error');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler votre abonnement ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentStatus({ subscription: 'none', expiry: null });
        showToast('Abonnement annulé.');
      } else {
        showToast(data.error || 'Erreur lors de l\'annulation', 'error');
      }
    } catch (error) {
      showToast('Erreur réseau. Veuillez réessayer.', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPlanIcon = (planName) => {
    const icons = {
      Essential: Star,
      Premium: Crown,
      Family: Users,
      Standard: Film,
      Ultimate: Zap
    };
    return icons[planName] || Star;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'expired': return 'Expiré';
      default: return 'Aucun';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'inactive': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      case 'expired': return 'text-crimson bg-crimson/10 border-crimson/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-gray-800 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-8 w-64 bg-gray-800 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-gray-800 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-deepblack border border-gray-800 rounded-3xl p-8 animate-pulse">
              <div className="h-12 w-12 bg-gray-700 rounded-lg mb-6" />
              <div className="h-6 w-24 bg-gray-700 rounded mb-3" />
              <div className="h-4 w-full bg-gray-700 rounded mb-4" />
              <div className="h-10 w-32 bg-gray-700 rounded mb-8" />
              <div className="space-y-3 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 w-full bg-gray-700 rounded" />
                ))}
              </div>
              <div className="h-12 w-full bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasActiveSubscription = currentStatus?.subscription && currentStatus?.subscription !== 'none';

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-crimson text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <BadgeCheck className="w-16 h-16 text-gold mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          Choisissez votre <span className="text-gold">formule</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Accédez à tout Black Box sans consommer de pièces. Regardez en illimité, en HD, sans publicité.
        </p>
      </motion.div>

      {/* Statut actuel */}
      {hasActiveSubscription && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-deepblack to-carbon border border-gold/40 p-6 rounded-2xl mb-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gold/20 p-3 rounded-full">
                <Crown className="w-8 h-8 text-gold" />
              </div>
              <div>
                <p className="text-white font-bold text-xl capitalize">
                  {currentStatus.subscription}
                </p>
                <p className="text-gray-400 text-sm">
                  Expire le {formatDate(currentStatus.expiry)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(currentStatus.subscriptionStatus || 'active')}`}>
                {getStatusLabel(currentStatus.subscriptionStatus || 'active')}
              </span>
              <button
                onClick={handleCancel}
                className="text-crimson text-sm hover:underline"
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grille des plans */}
      {plans.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucune formule disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, idx) => {
            const Icon = getPlanIcon(plan.name);
            const isPremium = plan.name === 'Premium' || plan.name === 'Ultimate';
            const isCurrentPlan = currentStatus?.subscription === plan.name;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`relative bg-deepblack border rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                  isPremium
                    ? 'border-gold shadow-[0_10px_40px_rgba(197,160,89,0.25)]'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-4 right-6 bg-gold text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                    ⭐ POPULAIRE
                  </span>
                )}

                <div className={`mb-6 ${isPremium ? 'text-gold' : 'text-white'}`}>
                  <Icon className="w-12 h-12" />
                </div>

                <h2 className="text-2xl font-black text-white">{plan.name}</h2>
                <p className="text-gray-400 text-sm mt-2 mb-6 min-h-[40px]">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400 text-lg"> FCFA</span>
                  <span className="text-gray-500 text-sm block mt-1">/ {plan.duration}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    'Accès illimité à tout le catalogue',
                    'Sans publicité',
                    'Qualité HD & 4K',
                    'Téléchargement hors ligne',
                    'Bonus coins mensuels'
                  ].slice(0, plan.name === 'Essential' ? 3 : 5).map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id || isCurrentPlan}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[52px] ${
                    isCurrentPlan
                      ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                      : isPremium
                      ? 'bg-gold text-black hover:bg-yellow-600 hover:shadow-gold'
                      : 'bg-crimson text-white hover:bg-red-700'
                  }`}
                >
                  {subscribing === plan.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : isCurrentPlan ? (
                    'Abonnement actif'
                  ) : (
                    'S\'abonner'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-center text-gray-500 text-xs mt-10">
        🔒 Paiement sécurisé · Sans engagement · Annulable à tout moment
      </p>
    </div>
  );
};

export default Subscriptions;