import React, { useEffect, useState } from 'react';
import { Coins, Wallet as WalletIcon, CreditCard, Smartphone, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const Wallet = ({ user, onCoinsUpdate }) => {
  const [packs, setPacks] = useState([]);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('wave'); // 'wave', 'orange', 'mtn'
  const [loading, setLoading] = useState(true); // Chargement initial
  const [purchasingId, setPurchasingId] = useState(null); // Pack en cours d'achat
  const [toast, setToast] = useState(null);

  // Afficher un toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/packs`);
        if (!res.ok) throw new Error('Erreur chargement packs');
        const data = await res.json();
        setPacks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement packs", error);
        showToast('Impossible de charger les packs.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const validatePhone = (value) => {
    // Format international simple : +225XXXXXXXXXX ou 10 chiffres minimum
    return /^\+?[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ''));
  };

  const handlePurchase = async (pack) => {
    if (!validatePhone(phone)) {
      showToast('Numéro de téléphone invalide. Utilisez le format international (+225...).', 'error');
      return;
    }

    setPurchasingId(pack.id);
    try {
      const res = await fetch(`${API_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: pack.price, phone, method })
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l’initiation du paiement');
      }

      const data = await res.json();

      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        showToast('Paiement initié ! Vérifiez votre téléphone pour valider.');
      } else {
        showToast('Réponse inattendue du serveur.', 'error');
      }
    } catch (error) {
      console.error("Erreur paiement", error);
      showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  const paymentMethods = [
    { id: 'wave', label: 'Wave', color: 'text-blue-400' },
    { id: 'orange', label: 'Orange Money', color: 'text-orange-500' },
    { id: 'mtn', label: 'MTN MoMo', color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-carbon text-offwhite pt-24 md:pt-20 pb-20 px-4 sm:px-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-crimson text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gold mb-8">Mon Portefeuille</h1>

        {/* Solde actuel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-deepblack to-carbon p-6 rounded-2xl border border-gold/30 mb-10 flex items-center gap-4 shadow-lg"
        >
          <div className="bg-gold/20 p-3 rounded-full">
            <WalletIcon className="w-10 h-10 text-gold" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Solde actuel</p>
            <p className="text-3xl font-black text-white">{user.blackCoins} <span className="text-gold text-lg">Coins</span></p>
          </div>
        </motion.div>

        {/* Méthodes de paiement */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-gold" /> Choisir le mode de paiement
          </h2>
          <div className="flex gap-3 flex-wrap">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-2 p-4 rounded-xl border transition min-h-[56px] ${
                  method === m.id ? 'border-gold bg-gold/10' : 'border-gray-700 bg-deepblack hover:border-gray-500'
                }`}
              >
                <Smartphone className={`w-6 h-6 ${m.color}`} />
                <span className="text-white font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Numéro de téléphone */}
        <div className="mb-10">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Numéro Mobile Money
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+225 07 00 00 00 00"
            className="w-full p-4 bg-deepblack border border-gray-700 rounded-xl text-white focus:border-gold outline-none text-lg"
          />
        </div>

        {/* Packs de pièces */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-deepblack p-6 rounded-xl border border-gray-800 animate-pulse">
                <div className="h-12 w-12 bg-gray-700 rounded-full mx-auto mb-4" />
                <div className="h-8 w-20 bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-4 w-16 bg-gray-700 rounded mx-auto mb-4" />
                <div className="h-10 w-24 bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-16">
            <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun pack disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packs.map((pack) => (
              <motion.div
                key={pack.id}
                whileHover={{ scale: 1.03 }}
                className="bg-deepblack p-6 rounded-xl border border-gray-800 hover:border-gold transition flex flex-col items-center text-center"
              >
                <Coins className="w-12 h-12 text-gold mb-4" />
                <p className="text-3xl font-bold text-white">{pack.coins}</p>
                <p className="text-gray-400 mb-4">Coins</p>
                <p className="text-lg font-bold text-gold mb-4">{pack.price} FCFA</p>
                <button
                  onClick={() => handlePurchase(pack)}
                  disabled={purchasingId === pack.id}
                  className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 min-h-[52px] ${
                    purchasingId === pack.id
                      ? 'bg-gray-600 text-gray-300 cursor-wait'
                      : 'bg-crimson hover:bg-red-700 text-white'
                  }`}
                >
                  {purchasingId === pack.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Acheter'
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;