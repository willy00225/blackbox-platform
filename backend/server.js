require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const webpush = require('web-push');
const { Op, DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./models/User');
const Video = require('./models/Video');
const Rating = require('./models/Rating');
const WatchHistory = require('./models/WatchHistory');
const Watchlist = require('./models/Watchlist');
const Like = require('./models/Like');
const Comment = require('./models/Comment');
const PaymentGateway = require('./models/PaymentGateway');
const Ad = require('./models/Ad');
const UserAdView = require('./models/UserAdView');
const UserSubscription = require('./models/UserSubscription');
const Settings = require('./models/Settings');
const SmsGateway = require('./models/SmsGateway');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const NotificationService = require('./services/NotificationService');

// Définition du modèle OtpCode
const OtpCode = sequelize.define('OtpCode', {
  phone: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE }
}, { tableName: 'OtpCodes' });

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const SECRET = process.env.SECRET_KEY || 'blackbox_secret';

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARES GLOBAUX ==========
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

// ========== NOTIFICATIONS PUSH (WEB-PUSH) ==========
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: 'mailto:admin@blackbox.com'
};
webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey);

// ========== BASE DE DONNÉES ==========
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à PostgreSQL (PgAdmin) réussie !');
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log('✅ Tables synchronisées (y compris OtpCodes)'))
  .catch(err => console.error('❌ Erreur de connexion à la DB :', err));

require('./models/associations');

// ========== ROUTES DE TEST ==========
app.get('/', (req, res) => {
  res.send('Black Box Backend is Alive! 🚀');
});

app.post('/api/test/create-user', async (req, res) => {
  try {
    const [user, created] = await User.findOrCreate({
      where: { email: "superviseur@blackbox.com" },
      defaults: {
        password: "admin123",
        blackCoins: 100,
        subscription: "annual"
      }
    });
    if(created) {
      res.json({ message: "🎉 Utilisateur créé dans PostgreSQL !", user });
    } else {
      res.json({ message: "ℹ️ L'utilisateur existe déjà dans la base.", user });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erreur serveur lors de la création." });
  }
});

// ========== ROUTES VIDÉOS (avec filtres, tri et genres) ==========
// GET /api/videos?search=&category=&genre=&sort=&minCoins=&maxCoins=
app.get('/api/videos', async (req, res) => {
  try {
    const { search, category, genre, sort, minCoins, maxCoins } = req.query;

    const where = {};
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    if (genre) {
      where.genre = genre;
    }
    if (minCoins || maxCoins) {
      where.coinsRequired = {};
      if (minCoins) where.coinsRequired[Op.gte] = parseInt(minCoins);
      if (maxCoins) where.coinsRequired[Op.lte] = parseInt(maxCoins);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'title') order = [['title', 'ASC']];
    if (sort === 'rating') order = [['rating', 'DESC']];
    if (sort === 'views') order = [['viewsCount', 'DESC']];

    const videos = await Video.findAll({ where, order });
    res.json(videos);
  } catch (error) {
    console.error("Erreur lors de la récupération des films :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des films." });
  }
});

// Route pour récupérer la liste des genres disponibles
app.get('/api/genres', async (req, res) => {
  try {
    const videos = await Video.findAll({ attributes: ['genre'] });
    const genres = [...new Set(videos.map(v => v.genre).filter(Boolean))];
    res.json(genres);
  } catch (error) {
    console.error("Erreur lors de la récupération des genres :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des genres." });
  }
});

// ========== ROUTES ADMIN ==========
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'BlackBox2026') {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
  }
});

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Accès refusé." });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.id !== 1) return res.status(403).json({ error: "Privilèges insuffisants." });
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide." });
  }
};

// ========== MIDDLEWARE D'AUTHENTIFICATION (JWT) avec tokenVersion ==========
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Non autorisé." });
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Session expirée." });
    }
    req.user = { id: user.id };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide." });
  }
};

app.get('/api/admin/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalVideos = await Video.count();
    const totalRatings = await Rating.count();
    const totalHistory = await WatchHistory.count();
    const users = await User.findAll({ attributes: ['id', 'email', 'blackCoins', 'subscription', 'createdAt'] });
    const videos = await Video.findAll();
    res.json({ 
      stats: { totalUsers, totalVideos, totalRatings, totalHistory, totalCoinsSpent: 0 },
      users,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des données." });
  }
});

// ========== CRUD Vidéos ==========
app.put('/api/admin/videos/:id', verifyAdmin, async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: "Film introuvable." });

    const {
      title, description, category, episodeNumber, seasonNumber, duration,
      url, coinsRequired, poster, year, genre, cast, director, rating
    } = req.body;

    const updateData = {
      title: title || '',
      description: description || null,
      category: category || 'film',
      episodeNumber: episodeNumber !== undefined ? parseInt(episodeNumber) : video.episodeNumber,
      seasonNumber: seasonNumber !== undefined ? parseInt(seasonNumber) : video.seasonNumber,
      duration: duration || '',
      url: url || '',
      coinsRequired: coinsRequired !== undefined ? parseInt(coinsRequired) : video.coinsRequired,
      poster: poster || null,
      year: year ? parseInt(year) : null,
      genre: genre || null,
      cast: cast || null,
      director: director || null,
      rating: rating !== '' && rating !== undefined ? parseFloat(rating) : null
    };

    await video.update(updateData);

    try {
      NotificationService.sendToAll('Mise à jour de contenu', `${video.title} a été mis à jour !`);
    } catch (notifError) {
      console.error("Erreur d'envoi de notification :", notifError);
    }

    res.json({ success: true, video });
  } catch (error) {
    console.error("Erreur détaillée lors de la mise à jour :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour.", details: error.message });
  }
});

app.post('/api/admin/videos', verifyAdmin, async (req, res) => {
  try {
    const {
      title, description, category, episodeNumber, seasonNumber, duration,
      url, coinsRequired, poster, year, genre, cast, director, rating
    } = req.body;

    const newVideoData = {
      title: title || '',
      description: description || null,
      category: category || 'film',
      episodeNumber: episodeNumber !== undefined ? parseInt(episodeNumber) : 1,
      seasonNumber: seasonNumber !== undefined ? parseInt(seasonNumber) : 1,
      duration: duration || '',
      url: url || '',
      coinsRequired: coinsRequired !== undefined ? parseInt(coinsRequired) : 0,
      poster: poster || null,
      year: year ? parseInt(year) : null,
      genre: genre || null,
      cast: cast || null,
      director: director || null,
      rating: rating !== '' && rating !== undefined ? parseFloat(rating) : null
    };

    const newVideo = await Video.create(newVideoData);

    NotificationService.sendToAll(
      category === 'serie' ? 'Nouvel épisode disponible' : 'Nouveau film disponible',
      `${title} vient de sortir sur Black Box !`
    );

    res.json({ success: true, video: newVideo });
  } catch (error) {
    console.error("Erreur détaillée lors de la création :", error);
    res.status(500).json({ error: "Erreur lors de la création.", details: error.message });
  }
});

app.delete('/api/admin/videos/:id', verifyAdmin, async (req, res) => {
  try {
    await Video.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// Gestion utilisateurs
app.patch('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const { coins } = req.body;
    if (coins !== undefined) {
      user.blackCoins += coins;
      await user.save();
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

// Parrainage admin
app.get('/api/admin/referral/:userId', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const referralLink = `https://blackbox.com/ref/${user.id}`;
    res.json({ referralLink });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du lien." });
  }
});

// Passerelles de paiement
app.get('/api/admin/gateways', verifyAdmin, async (req, res) => {
  try {
    const gateways = await PaymentGateway.findAll();
    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des passerelles." });
  }
});

app.post('/api/admin/gateways', verifyAdmin, async (req, res) => {
  try {
    const { id, name, logo, apiKey, apiSecret, isActive } = req.body;
    if (id) {
      await PaymentGateway.update({ name, logo, apiKey, apiSecret, isActive }, { where: { id } });
      res.json({ success: true });
    } else {
      await PaymentGateway.create({ name, logo, apiKey, apiSecret, isActive });
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la passerelle." });
  }
});

// ✅ Route DELETE pour les passerelles de paiement
app.delete('/api/admin/gateways/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await PaymentGateway.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true, message: "Passerelle supprimée." });
    } else {
      res.status(404).json({ error: "Passerelle introuvable." });
    }
  } catch (error) {
    console.error("Erreur suppression passerelle :", error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

app.get('/api/payments/active-gateway', async (req, res) => {
  try {
    const gateway = await PaymentGateway.findOne({ where: { isActive: true } });
    if (!gateway) return res.json({ error: "Aucune passerelle active" });
    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la passerelle active." });
  }
});

// ========== ROUTES PUBLICITÉS ==========
app.get('/api/admin/ads', verifyAdmin, async (req, res) => {
  try {
    const ads = await Ad.findAll();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des pubs." });
  }
});

app.post('/api/admin/ads', verifyAdmin, async (req, res) => {
  try {
    const { title, videoUrl, rewardCoins, maxPerDay, isActive } = req.body;
    const newAd = await Ad.create({ title, videoUrl, rewardCoins, maxPerDay, isActive });

    NotificationService.sendToAll('Nouvelle opportunité', 'Une nouvelle publicité est disponible, regardez-la pour gagner des coins !');

    res.json({ success: true, ad: newAd });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de la pub." });
  }
});

app.put('/api/admin/ads/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, videoUrl, rewardCoins, maxPerDay, isActive } = req.body;
    await Ad.update({ title, videoUrl, rewardCoins, maxPerDay, isActive }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de la pub." });
  }
});

app.delete('/api/admin/ads/:id', verifyAdmin, async (req, res) => {
  try {
    await Ad.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de la pub." });
  }
});

app.get('/api/ads/available', async (req, res) => {
  try {
    const userId = req.query.userId;
    const ad = await Ad.findOne({ where: { isActive: true } });
    if (!ad) return res.json({ ad: null, message: "Aucune pub disponible actuellement." });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const viewsToday = await UserAdView.count({ 
      where: { adId: ad.id, userId: userId, watchedAt: { [Op.gte]: today } } 
    });
    
    if (viewsToday >= ad.maxPerDay) {
      return res.json({ ad: null, message: "Limite de pubs atteinte pour aujourd'hui." });
    }
    res.json({ ad });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la pub." });
  }
});

app.post('/api/ads/watch', async (req, res) => {
  try {
    const { userId, adId } = req.body;
    const ad = await Ad.findByPk(adId);
    const user = await User.findByPk(userId);
    if (!ad || !user) return res.status(404).json({ error: "Pub ou utilisateur introuvable" });
    user.blackCoins += ad.rewardCoins;
    await user.save();
    await UserAdView.create({ userId, adId });
    res.json({ success: true, coins: user.blackCoins, reward: ad.rewardCoins });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du visionnage." });
  }
});

// ========== NOTIFICATIONS PUSH ==========
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    await UserSubscription.create({ userId, subscription: JSON.stringify(subscription) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement." });
  }
});

app.post('/api/admin/notifications/send', verifyAdmin, async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ error: "userId, titre et corps obligatoires." });
    }
    const sent = await NotificationService.sendToUser(userId, title, body);
    if (sent) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Aucun abonnement pour cet utilisateur" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/admin/notifications/global', verifyAdmin, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Titre et corps obligatoires." });
    }
    const sentCount = await NotificationService.sendToAll(title, body);
    res.json({ success: true, sentCount });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi global." });
  }
});

// ========== AUTHENTIFICATION ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ where: { referralCode } });
      if (referrer) {
        referredBy = referrer.id;
        referrer.blackCoins += 50;
        await referrer.save();
      }
    }
    const user = await User.create({ email, password, referredBy });
    if (referredBy) {
      user.blackCoins += 10;
      await user.save();
    }
    const token = jwt.sign({ id: user.id, tokenVersion: user.tokenVersion }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, blackCoins: user.blackCoins } });
  } catch (error) {
    res.status(400).json({ error: "Email déjà utilisé ou code invalide." });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives. Réessayez dans 15 minutes."
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Mot de passe incorrect." });
    const token = jwt.sign({ id: user.id, tokenVersion: user.tokenVersion }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, blackCoins: user.blackCoins } });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ========== GESTION DES PIÈCES ==========
app.post('/api/auth/update-coins', async (req, res) => {
  try {
    const { userId, coins } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    user.blackCoins = coins;
    await user.save();
    res.json({ success: true, blackCoins: user.blackCoins });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Non autorisé." });
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Session expirée." });
    }
    res.json({ user: { id: user.id, email: user.email, blackCoins: user.blackCoins } });
  } catch (error) {
    res.status(401).json({ error: "Token invalide." });
  }
});

// ========== HISTORIQUE ==========
app.post('/api/history', async (req, res) => {
  try {
    const { userId, filmId, progress } = req.body;
    const existing = await WatchHistory.findOne({ where: { userId, filmId } });
    if (existing) {
      await existing.update({ progress, watchedAt: new Date() });
    } else {
      await WatchHistory.create({ userId, filmId, progress });
    }
    res.json({ success: true, message: "Historique mis à jour" });
  } catch (error) {
    res.status(500).json({ error: "Erreur historique" });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const { userId } = req.query;
    const history = await WatchHistory.findAll({
      where: { userId },
      include: [{ model: Video }],
      order: [['watchedAt', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
  }
});

// ========== WATCHLIST ==========
app.get('/api/watchlist', async (req, res) => {
  try {
    const { userId } = req.query;
    const watchlist = await Watchlist.findAll({
      where: { userId },
      include: [{ model: Video }]
    });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la watchlist." });
  }
});

app.delete('/api/watchlist/:id', async (req, res) => {
  try {
    await Watchlist.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// ========== RATINGS ==========
app.post('/api/ratings', async (req, res) => {
  try {
    const { userId, filmId, stars } = req.body;
    const existing = await Rating.findOne({ where: { userId, filmId } });
    if (existing) {
      await existing.update({ stars });
    } else {
      await Rating.create({ userId, filmId, stars });
    }
    res.json({ success: true, message: "Note enregistrée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la notation." });
  }
});

app.get('/api/ratings/:userId/:filmId', async (req, res) => {
  try {
    const { userId, filmId } = req.params;
    const rating = await Rating.findOne({ where: { userId, filmId } });
    if (rating) {
      res.json({ stars: rating.stars });
    } else {
      res.json({ stars: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la note." });
  }
});

// ========== LIKES & COMMENTAIRES ==========
app.post('/api/like', async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    const existing = await Like.findOne({ where: { userId, videoId } });
    if (existing) {
      await existing.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ userId, videoId });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur like" });
  }
});

app.get('/api/video/:id/likes', async (req, res) => {
  try {
    const { userId } = req.query;
    const videoId = req.params.id;
    const likesCount = await Like.count({ where: { videoId } });
    let liked = false;
    if (userId) {
      const existing = await Like.findOne({ where: { userId, videoId } });
      liked = !!existing;
    }
    res.json({ likesCount, liked });
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération likes" });
  }
});

app.get('/api/video/:id/comments', async (req, res) => {
  try {
    const videoId = req.params.id;
    const comments = await Comment.findAll({
      where: { videoId },
      include: [{ model: User, attributes: ['id', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération commentaires" });
  }
});

app.post('/api/video/:id/comments', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const videoId = req.params.id;
    const newComment = await Comment.create({ userId, videoId, content });
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Erreur ajout commentaire" });
  }
});

// ========== RECOMMANDATIONS ==========
app.get('/api/recommendations', async (req, res) => {
  try {
    const { userId } = req.query;
    const history = await WatchHistory.findAll({ 
      where: { userId }, 
      include: [{ model: Video }] 
    });
    const allVideos = await Video.findAll();
    const recommendations = allVideos.filter(v => !history.some(h => h.filmId === v.id));
    res.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: "Erreur recommandations." });
  }
});

// ========== PARRAINAGE ==========
app.get('/api/referral/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const referralsCount = await User.count({ where: { referredBy: user.id } });
    const referralLink = `https://blackbox.com/ref/${user.referralCode}`;
    res.json({ referralLink, referralsCount, referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du parrainage." });
  }
});

// ========== GESTION DU PROFIL (UTILISATEUR) ==========
app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: "Cet email est déjà utilisé." });
      user.email = email;
    }
    if (name) user.name = name;
    await user.save();
    
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
});

app.put('/api/profile/password', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Mot de passe actuel incorrect." });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du changement de mot de passe." });
  }
});

app.put('/api/profile/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, videoQuality, notificationsEnabled } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    
    if (language) user.language = language;
    if (videoQuality) user.videoQuality = videoQuality;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    await user.save();
    
    res.json({ success: true, preferences: { language: user.language, videoQuality: user.videoQuality, notificationsEnabled: user.notificationsEnabled } });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour des préférences." });
  }
});

app.post('/api/profile/logout-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    user.tokenVersion += 1;
    await user.save();
    
    res.json({ success: true, message: "Toutes les sessions ont été révoquées." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la déconnexion globale." });
  }
});

// Route pour récupérer toutes les données du profil utilisateur
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, { attributes: ['id', 'email', 'blackCoins', 'subscription', 'createdAt'] });
    const watchHistory = await WatchHistory.findAll({ where: { userId: req.params.userId }, include: [{ model: Video }] });
    const watchlist = await Watchlist.findAll({ where: { userId: req.params.userId }, include: [{ model: Video }] });
    
    res.json({ user, watchHistory, watchlist });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du profil." });
  }
});

// ========== GESTION DU PROFIL ADMIN ==========
app.put('/api/security/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Mot de passe actuel incorrect." });

    if (newPassword.length < 6) return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Mot de passe changé avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors du changement de mot de passe." });
  }
});

app.get('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des paramètres." });
  }
});

app.put('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      const existing = await Settings.findOne({ where: { key } });
      if (existing) {
        await existing.update({ value });
      } else {
        await Settings.create({ key, value });
      }
    }
    res.json({ success: true, message: "Paramètres mis à jour." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour des paramètres." });
  }
});

// ========== GESTION DES FOURNISSEURS SMS ==========
app.get('/api/admin/sms-gateways', verifyAdmin, async (req, res) => {
  try {
    const gateways = await SmsGateway.findAll();
    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des fournisseurs SMS." });
  }
});

app.post('/api/admin/sms-gateways', verifyAdmin, async (req, res) => {
  try {
    const { id, name, logo, apiKey, apiSecret, senderId, isActive } = req.body;
    if (id) {
      await SmsGateway.update({ name, logo, apiKey, apiSecret, senderId, isActive }, { where: { id } });
      res.json({ success: true, message: "Fournisseur SMS mis à jour." });
    } else {
      await SmsGateway.create({ name, logo, apiKey, apiSecret, senderId, isActive });
      res.json({ success: true, message: "Fournisseur SMS créé." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du fournisseur SMS." });
  }
});

// ✅ Route DELETE pour les fournisseurs SMS
app.delete('/api/admin/sms-gateways/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await SmsGateway.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true, message: "Fournisseur SMS supprimé." });
    } else {
      res.status(404).json({ error: "Fournisseur introuvable." });
    }
  } catch (error) {
    console.error("Erreur suppression fournisseur SMS :", error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// ========== OTP (SMS) ==========
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Numéro de téléphone requis." });

    const gateway = await SmsGateway.findOne({ where: { isActive: true } });
    if (!gateway) return res.status(400).json({ error: "Aucun fournisseur SMS actif. Contactez l'administrateur." });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await OtpCode.destroy({ where: { phone: phoneNumber } });
    await OtpCode.create({
      phone: phoneNumber,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    console.log(`[OTP] Code ${otp} envoyé à ${phoneNumber} via ${gateway.name}`);

    // En production, ne pas renvoyer l'OTP sauf si le mode test est activé
    const showOtp = process.env.OTP_TEST_MODE === 'true';
    res.json({
      success: true,
      message: "Code envoyé (Vérifiez votre téléphone)",
      ...(showOtp ? { otp } : {})
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi du code OTP." });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const { phone, userOtp } = req.body;
    if (!phone || !userOtp) return res.status(400).json({ error: "Code manquant." });

    const record = await OtpCode.findOne({ where: { phone, code: userOtp } });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Code incorrect ou expiré." });
    }

    // Code valide : suppression pour éviter la réutilisation
    await OtpCode.destroy({ where: { id: record.id } });

    // Vérifier si un utilisateur existe avec ce numéro
    let user = await User.findOne({ where: { phone } });

    if (!user) {
      // Créer un vrai utilisateur
      user = await User.create({
        phone,
        email: `${phone.replace(/[^0-9]/g, '')}@blackbox.local`,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        blackCoins: 20,
        subscription: 'none',
        referralCode: 'BB' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        tokenVersion: 0
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, tokenVersion: user.tokenVersion },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        blackCoins: user.blackCoins
      }
    });
  } catch (error) {
    console.error("Erreur vérification OTP :", error);
    res.status(500).json({ error: "Erreur serveur lors de la vérification." });
  }
});

// ========== ABONNEMENTS ==========
// 1. Récupérer tous les plans disponibles
app.get('/api/subscriptions/plans', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({ where: { isActive: true } });
    res.json(plans);
  } catch (error) {
    console.error("Erreur récupération des plans :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des plans." });
  }
});

// 2. S'abonner à un plan (Simulation - Sans paiement réel pour l'instant)
app.post('/api/subscriptions/subscribe', async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const plan = await SubscriptionPlan.findByPk(planId);
    const user = await User.findByPk(userId);

    if (!plan || !user) return res.status(404).json({ error: "Plan ou utilisateur introuvable." });

    // Calcul de la date d'expiration
    const now = new Date();
    let expiry = new Date(now);
    if (plan.duration === 'weekly') expiry.setDate(now.getDate() + 7);
    if (plan.duration === 'monthly') expiry.setMonth(now.getMonth() + 1);
    if (plan.duration === 'annual') expiry.setFullYear(now.getFullYear() + 1);

    // Mise à jour de l'utilisateur
    await user.update({
      subscription: plan.duration,
      subscriptionStatus: 'active',
      subscriptionExpiry: expiry
    });

    // Bonus de bienvenue (par exemple, 50 coins offerts pour un abonnement)
    await user.update({ blackCoins: user.blackCoins + 50 });

    res.json({ success: true, user, plan, expiry });
  } catch (error) {
    console.error("Erreur lors de l'abonnement :", error);
    res.status(500).json({ error: "Erreur lors de l'abonnement." });
  }
});

// 3. Annuler l'abonnement
app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    await user.update({ subscription: 'none', subscriptionStatus: 'inactive', subscriptionExpiry: null });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Erreur lors de l'annulation :", error);
    res.status(500).json({ error: "Erreur lors de l'annulation." });
  }
});

// 4. Vérifier le statut de l'abonnement (Pour le frontend)
app.get('/api/subscriptions/status/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    // Vérifier si l'abonnement a expiré
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      await user.update({ subscriptionStatus: 'expired' });
    }

    res.json({ subscription: user.subscription, status: user.subscriptionStatus, expiry: user.subscriptionExpiry });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut :", error);
    res.status(500).json({ error: "Erreur lors de la vérification du statut." });
  }
});

// ========== ROUTES ADMIN POUR LES PLANS D'ABONNEMENT ==========

// 1. Récupérer tous les plans (y compris inactifs)
app.get('/api/admin/plans', verifyAdmin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [['id', 'ASC']]
    });
    
    // Normaliser les données pour le frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      duration: plan.duration,
      price: parseFloat(plan.price) || 0,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features : 
                (typeof plan.features === 'string' ? plan.features.split(',').map(f => f.trim()).filter(Boolean) : []),
      isActive: plan.isActive !== false,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }));
    
    console.log("Plans envoyés:", formattedPlans);
    res.json(formattedPlans);
  } catch (error) {
    console.error("Erreur récupération des plans admin :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des plans.", details: error.message });
  }
});

// 2. Créer un plan (Admin)
app.post('/api/admin/plans', verifyAdmin, async (req, res) => {
  try {
    const { name, duration, price, description, features, isActive } = req.body;
    
    // Normaliser features
    let featuresArray = [];
    if (Array.isArray(features)) {
      featuresArray = features;
    } else if (typeof features === 'string' && features.trim()) {
      featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
    }
    
    const newPlan = await SubscriptionPlan.create({ 
      name, 
      duration: duration || 'monthly', 
      price: parseFloat(price) || 0, 
      description: description || '', 
      features: featuresArray,
      isActive: isActive !== false 
    });
    
    console.log("Plan créé:", newPlan.toJSON());
    res.status(201).json({ success: true, plan: newPlan });
  } catch (error) {
    console.error("Erreur création plan :", error);
    res.status(500).json({ error: "Erreur lors de la création du plan.", details: error.message });
  }
});

// 3. Mettre à jour un plan (Admin)
app.put('/api/admin/plans/:id', verifyAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    console.log("Recherche du plan ID:", planId);
    
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      console.log("Plan introuvable - ID:", planId);
      return res.status(404).json({ error: "Plan introuvable." });
    }
    
    const { name, duration, price, description, features, isActive } = req.body;
    
    // Normaliser features
    let featuresArray = plan.features;
    if (features !== undefined) {
      if (Array.isArray(features)) {
        featuresArray = features;
      } else if (typeof features === 'string') {
        featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
      }
    }
    
    await plan.update({ 
      name: name || plan.name,
      duration: duration || plan.duration,
      price: price !== undefined ? parseFloat(price) : plan.price,
      description: description !== undefined ? description : plan.description,
      features: featuresArray,
      isActive: isActive !== undefined ? isActive : plan.isActive
    });
    
    console.log("Plan mis à jour:", plan.toJSON());
    res.json({ success: true, plan });
  } catch (error) {
    console.error("Erreur mise à jour plan :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour.", details: error.message });
  }
});

// 4. Supprimer un plan (Admin)
app.delete('/api/admin/plans/:id', verifyAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    console.log("Tentative suppression plan ID:", planId);
    
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      console.log("Plan introuvable pour suppression - ID:", planId);
      return res.status(404).json({ error: "Plan introuvable." });
    }
    
    await plan.destroy();
    console.log("Plan supprimé avec succès - ID:", planId);
    res.json({ success: true, message: "Plan supprimé." });
  } catch (error) {
    console.error("Erreur suppression plan :", error);
    res.status(500).json({ error: "Erreur lors de la suppression.", details: error.message });
  }
});

// ========== LANCEMENT DU SERVEUR ==========
app.listen(PORT, () => {
  console.log(`🔥 Serveur Black Box en ligne sur http://localhost:${PORT}`);
});