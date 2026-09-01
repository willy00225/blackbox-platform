const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

const Video = require('./models/Video');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie.');

    await sequelize.sync({ alter: true });
    console.log('🔄 Tables synchronisées.');

    const hls1 = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    const hls2 = 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8';
    const hls3 = 'https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8';

    const demoData = [
      {
        title: 'Les Racines de l\'Or',
        description: 'Une saga familiale entre tradition et modernité dans les rues d\'Abidjan.',
        category: 'film',
        duration: '1h45',
        url: hls1,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
        year: 2026,
        genre: 'Drame',
        casting: 'Aïcha Koné, Jean-Marc Koffi',
        director: 'Fatou Diop',
        rating: 8.7,
        coinsRequired: 0,
        trailerUrl: hls2,
        featured: true,
        releaseDate: '2026-01-15',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Cœur de Ville',
        description: 'Un jeune entrepreneur ambitieux doit choisir entre l\'amour et le pouvoir.',
        category: 'film',
        duration: '1h50',
        url: hls2,
        poster: 'https://images.unsplash.com/photo-1516280440614-669728d5a48c?w=600',
        year: 2025,
        genre: 'Romance',
        casting: 'Moussa Traoré, Awa Diallo',
        director: 'Kader Sy',
        rating: 7.9,
        coinsRequired: 5,
        trailerUrl: hls3,
        featured: false,
        releaseDate: '2025-09-10',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Lueur d\'Espoir',
        description: 'Le combat d\'une femme pour sauver son quartier de la corruption.',
        category: 'film',
        duration: '2h05',
        url: hls3,
        poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600',
        year: 2024,
        genre: 'Thriller',
        casting: 'Mariam Sanogo, Issa Ouattara',
        director: 'Salif Keita',
        rating: 8.2,
        coinsRequired: 10,
        trailerUrl: hls1,
        featured: true,
        releaseDate: '2024-11-20',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Abidjan Chic',
        description: 'Épisode 1 : La vie glamour et impitoyable des influenceurs de la capitale.',
        category: 'serie',
        seasonNumber: 1,
        episodeNumber: 1,
        duration: '1:30',
        url: hls1,
        poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
        year: 2026,
        genre: 'Drame urbain',
        casting: 'Grace Bamba, Yves Kouassi',
        director: 'Nadia Ben',
        rating: 8.9,
        coinsRequired: 0,
        trailerUrl: hls2,
        featured: true,
        releaseDate: '2026-01-05',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Abidjan Chic',
        description: 'Épisode 2 : Un contrat volé met en danger l\'entreprise familiale.',
        category: 'serie',
        seasonNumber: 1,
        episodeNumber: 2,
        duration: '1:20',
        url: hls2,
        poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
        year: 2026,
        genre: 'Drame urbain',
        casting: 'Grace Bamba, Yves Kouassi',
        director: 'Nadia Ben',
        rating: 8.9,
        coinsRequired: 5,
        trailerUrl: hls3,
        featured: false,
        releaseDate: '2026-01-12',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Thriller de Quartier',
        description: 'Épisode 1 : Un coup de feu dans la nuit, une dette à payer.',
        category: 'serie',
        seasonNumber: 1,
        episodeNumber: 1,
        duration: '1:40',
        url: hls2,
        poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
        year: 2025,
        genre: 'Suspense',
        casting: 'Moussa Kone, Fatou Bamba',
        director: 'Ibrahim Cissé',
        rating: 9.1,
        coinsRequired: 0,
        trailerUrl: hls1,
        featured: false,
        releaseDate: '2025-06-18',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Thriller de Quartier',
        description: 'Épisode 2 : Le héros est traqué dans une ruelle sans issue.',
        category: 'serie',
        seasonNumber: 1,
        episodeNumber: 2,
        duration: '1:30',
        url: hls3,
        poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600',
        year: 2025,
        genre: 'Suspense',
        casting: 'Moussa Kone, Fatou Bamba',
        director: 'Ibrahim Cissé',
        rating: 9.1,
        coinsRequired: 7,
        trailerUrl: hls2,
        featured: false,
        releaseDate: '2025-06-25',
        language: 'FR',
        quality: 'HD'
      },
      {
        title: 'Terres de Griots',
        description: 'Voyage au cœur de la tradition orale ouest-africaine.',
        category: 'documentaire',
        duration: '52min',
        url: hls3,
        poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        year: 2024,
        genre: 'Culture',
        casting: 'N/A',
        director: 'Djibril Sarr',
        rating: 8.4,
        coinsRequired: 0,
        trailerUrl: hls1,
        featured: false,
        releaseDate: '2024-03-08',
        language: 'FR',
        quality: 'HD'
      }
    ];

    const created = await Video.bulkCreate(demoData);
    console.log(`✅ Démo créée : ${created.length} vidéos insérées avec succès !`);
    console.log('📌 IDs des vidéos :', created.map(v => v.id).join(', '));
  } catch (error) {
    console.error('❌ Erreur lors de la création de la démo :', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();