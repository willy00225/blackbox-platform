import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.token);
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center text-offwhite">
      <div className="bg-deepblack p-10 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gold">🎬 Administration</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grayish">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none"
              placeholder="Entrez le mot de passe..."
            />
          </div>
          {error && <p className="text-crimson text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition">
            Accéder au Panneau
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;