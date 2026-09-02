import React, { useEffect, useState } from 'react';
import { Coins, Wallet as WalletIcon, CreditCard, Smartphone } from 'lucide-react';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const Wallet = ({ user, onCoinsUpdate }) => {
  const [packs, setPacks] = useState([]);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('wave'); // 'wave', 'orange', 'mtn'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/payments/packs`)
      .then(res => res.json())
      .then(setPacks)
      .catch(err => console.error("Erreur chargement packs", err)); // ✅ Ajout du catch
  }, []);

  const handlePurchase = async (pack) => {
    setLoading(true);
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
        // Rediriger l'utilisateur vers la page de paiement (simulé)
        window.open(data.paymentUrl, '_blank');
        alert('Paiement initié ! Vérifiez votre téléphone pour valider.');
      } else {
        alert('Réponse inattendue du serveur.');
      }
    } catch (error) {
      console.error("Erreur paiement", error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon text-offwhite p-8">
      <h1 className="text-3xl font-bold text-gold mb-8">Mon Portefeuille</h1>
      
      {/* Solde actuel */}
      <div className="bg-deepblack p-6 rounded-xl border border-gold/30 mb-8 flex items-center gap-4">
        <WalletIcon className="w-10 h-10 text-gold" />
        <div>
          <p className="text-gray-400">Solde actuel</p>
          <p className="text-2xl font-bold text-white">{user.blackCoins} Coins</p>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Choisir le mode de paiement</h2>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => setMethod('wave')} className={`p-4 rounded-lg border ${method === 'wave' ? 'border-gold bg-gold/10' : 'border-gray-700 bg-deepblack'}`}>
            <Smartphone className="w-6 h-6 text-blue-400" /> Wave
          </button>
          <button onClick={() => setMethod('orange')} className={`p-4 rounded-lg border ${method === 'orange' ? 'border-gold bg-gold/10' : 'border-gray-700 bg-deepblack'}`}>
            <Smartphone className="w-6 h-6 text-orange-500" /> Orange Money
          </button>
          <button onClick={() => setMethod('mtn')} className={`p-4 rounded-lg border ${method === 'mtn' ? 'border-gold bg-gold/10' : 'border-gray-700 bg-deepblack'}`}>
            <Smartphone className="w-6 h-6 text-yellow-500" /> MTN MoMo
          </button>
        </div>
      </div>

      {/* Numéro de téléphone */}
      <div className="mb-8">
        <label className="block text-sm text-gray-400 mb-2">Numéro Mobile Money</label>
        <input 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+225 07 00 00 00 00"
          className="w-full p-3 bg-deepblack border border-gray-700 rounded-lg text-white focus:border-gold outline-none"
        />
      </div>

      {/* Packs de pièces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packs.map(pack => (
          <div key={pack.id} className="bg-deepblack p-6 rounded-xl border border-gray-800 hover:border-gold transition flex flex-col items-center text-center">
            <Coins className="w-12 h-12 text-gold mb-4" />
            <p className="text-3xl font-bold text-white">{pack.coins}</p>
            <p className="text-gray-400 mb-4">Coins</p>
            <p className="text-lg font-bold text-gold mb-4">{pack.price} FCFA</p>
            <button 
              onClick={() => handlePurchase(pack)}
              disabled={loading}
              className="w-full py-2 bg-crimson hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Acheter'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wallet;