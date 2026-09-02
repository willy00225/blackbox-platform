import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';

const API_URL = 'https://blackbox-platform-production-7339.up.railway.app';

const Auth = ({ onAuth, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State pour "Mot de passe oublié"
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (!/\d/.test(pwd)) return 'Le mot de passe doit contenir au moins un chiffre.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (!isLogin) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setLoading(true);
    try {
      const url = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuth(data.user);
      } else {
        setError(data.error || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!forgotEmail) {
      setError('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Code envoyé par email.');
        if (data.debugCode) {
          setResetCode(data.debugCode);
        }
        setForgotStep(2);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code.');
      }
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!resetCode) {
      setError('Veuillez saisir le code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(3);
        setSuccess('Code vérifié. Vous pouvez définir un nouveau mot de passe.');
      } else {
        setError(data.error || 'Code invalide.');
      }
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Mot de passe réinitialisé. Vous pouvez vous connecter.');
        setTimeout(() => {
          setForgotStep(0);
          setForgotEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmNewPassword('');
          setShowResetPassword(false);
          setIsLogin(true);
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation.');
      }
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const closeForgot = () => {
    setForgotStep(0);
    setError('');
    setSuccess('');
    setForgotEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowResetPassword(false);
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center text-offwhite relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(197,160,89,0.08),transparent_40%)]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-deepblack p-8 md:p-10 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl"
      >
        {/* ✅ Logo - CHEMIN CORRIGÉ */}
        <div className="flex justify-center mb-6">
          <img src="/assets/logo.png" alt="Black Box" className="h-16 w-auto object-contain" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gold">Black Box</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          {isLogin ? 'Connexion à votre compte' : 'Créer un nouveau compte'}
        </p>

        {forgotStep === 0 && (
          <>
            <div className="flex mb-6 bg-carbon rounded-lg p-1">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  isLogin ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  !isLogin ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gold"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-grayish mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gold"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-crimson/10 border border-crimson/30 rounded-lg p-3">
                  <p className="text-crimson text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3">
                  <p className="text-emerald-300 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-crimson hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer le compte')}
              </button>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setError(''); setSuccess(''); }}
                    className="text-sm text-grayish hover:text-gold transition"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {forgotStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-center">Récupérer votre mot de passe</h2>
            <p className="text-sm text-gray-400 text-center">Entrez votre email, nous vous enverrons un code de vérification.</p>
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                  required
                />
              </div>
              {error && <div className="bg-crimson/10 border border-crimson/30 rounded-lg p-3"><p className="text-crimson text-sm">{error}</p></div>}
              {success && <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3"><p className="text-emerald-300 text-sm">{success}</p></div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition disabled:opacity-50">
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full text-sm text-grayish hover:text-white transition">
                ← Retour
              </button>
            </form>
          </div>
        )}

        {forgotStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-center">Entrez le code reçu</h2>
            <form onSubmit={handleVerifyResetCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Code de vérification</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none text-center tracking-widest font-bold"
                  required
                />
              </div>
              {error && <div className="bg-crimson/10 border border-crimson/30 rounded-lg p-3"><p className="text-crimson text-sm">{error}</p></div>}
              {success && <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3"><p className="text-emerald-300 text-sm">{success}</p></div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition disabled:opacity-50">
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </button>
              <button type="button" onClick={() => setForgotStep(1)} className="w-full text-sm text-grayish hover:text-white transition">
                ← Modifier l'email
              </button>
            </form>
          </div>
        )}

        {forgotStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-center">Définir un nouveau mot de passe</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-grayish mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-carbon border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-gold outline-none transition"
                  required
                />
              </div>
              {error && <div className="bg-crimson/10 border border-crimson/30 rounded-lg p-3"><p className="text-crimson text-sm">{error}</p></div>}
              {success && <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3"><p className="text-emerald-300 text-sm">{success}</p></div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gold hover:bg-yellow-600 text-black font-bold rounded-lg transition disabled:opacity-50">
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full text-sm text-grayish hover:text-white transition">
                Annuler
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-800">
          <button onClick={onBack} className="w-full text-xs text-gray-600 hover:text-gray-400 transition text-center">
            ← Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;