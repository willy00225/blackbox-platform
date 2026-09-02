import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';

// URL du Backend en dur pour la production
const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center text-offwhite relative overflow-hidden">
      {/* Effets de lumière */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(197,160,89,0.08),transparent_40%)]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-deepblack p-10 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/logo.png" 
            alt="Black Box" 
            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(197,160,89,0.4)]"
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gold">Administration</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Accès sécurisé</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grayish">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                placeholder="Entrez le mot de passe..."
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-crimson/10 border border-crimson/30 rounded-lg p-3">
              <p className="text-crimson text-sm">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {loading ? 'Vérification...' : 'Accéder au Panneau'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;