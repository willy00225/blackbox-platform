import React, { useEffect, useState } from 'react';
import { Check, Crown, Star, Users, Loader2, Shield, Zap, Film, Gift, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Subscriptions = ({ user, onUserUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, statusRes] = await Promise.all([
          fetch('/api/subscriptions/plans'),
          user?.id ? fetch(`/api/subscriptions/status/${user.id}`) : Promise.resolve(null)
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(Array.isArray(plansData) ? plansData : []);
        }

        if (statusRes && statusRes.ok) {
          const statusData = await statusRes.json();
          setCurrentStatus(statusData);
        }
      } catch (error) {
        console.error('Erreur chargement abonnements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const res = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId })
      });
      const data = await res.json();
      if (data.success) {
        // Toast-like feedback
        alert(`🎉 Abonnement ${data.planName || ''} activé ! Vous avez reçu 50 Coins bonus.`);
        if (onUserUpdate) onUserUpdate(data.user);
        // Mise à jour du statut sans recharger la page
        setCurrentStatus({
          subscription: data.user.subscription,
          expiry: data.user.subscriptionExpiry
        });
      } else {
        alert(data.error || 'Erreur lors de l\'abonnement');
      }
    } catch (error) {
      alert('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler votre abonnement ?')) return;
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentStatus({ subscription: 'none', expiry: null });
        alert('Abonnement annulé.');
      } else {
        alert(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      alert('Erreur réseau. Veuillez réessayer.');
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
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
        <p className="text-gray-400">Chargement des formules...</p>
      </div>
    );
  }

  const hasActiveSubscription = currentStatus?.subscription && currentStatus?.subscription !== 'none';

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
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
              {/* Badge populaire */}
              {isPremium && (
                <span className="absolute -top-4 right-6 bg-gold text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                  ⭐ POPULAIRE
                </span>
              )}

              {/* Icône du plan */}
              <div className={`mb-6 ${isPremium ? 'text-gold' : 'text-white'}`}>
                <Icon className="w-12 h-12" />
              </div>

              {/* Nom et description */}
              <h2 className="text-2xl font-black text-white">{plan.name}</h2>
              <p className="text-gray-400 text-sm mt-2 mb-6 min-h-[40px]">{plan.description}</p>

              {/* Prix */}
              <div className="mb-8">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-gray-400 text-lg"> FCFA</span>
                <span className="text-gray-500 text-sm block mt-1">/ {plan.duration}</span>
              </div>

              {/* Fonctionnalités */}
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

              {/* Bouton d'abonnement */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing === plan.id || isCurrentPlan}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
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

      {/* Note de bas de page */}
      <p className="text-center text-gray-500 text-xs mt-10">
        🔒 Paiement sécurisé · Sans engagement · Annulable à tout moment
      </p>
    </div>
  );
};

export default Subscriptions;