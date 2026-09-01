const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });
} else {
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, dialect: 'postgres', logging: false });
}

const { DataTypes } = require('sequelize');
const Video = sequelize.define('Video', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.ENUM('film', 'serie', 'documentaire'), defaultValue: 'film' },
    episodeNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
    seasonNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
    duration: { type: DataTypes.STRING },
    url: { type: DataTypes.STRING, allowNull: false },
    coinsRequired: { type: DataTypes.INTEGER, defaultValue: 0 },
    poster: { type: DataTypes.STRING },
    year: { type: DataTypes.INTEGER },
    genre: { type: DataTypes.STRING },
    casting: { type: DataTypes.TEXT },
    director: { type: DataTypes.STRING },
    rating: { type: DataTypes.FLOAT },
    trailerUrl: { type: DataTypes.STRING },
    viewsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    releaseDate: { type: DataTypes.DATEONLY },
    language: { type: DataTypes.STRING, defaultValue: 'FR' },
    quality: { type: DataTypes.STRING, defaultValue: 'HD' }
}, { tableName: 'Videos', timestamps: true });

(async () => {
    await sequelize.sync({ alter: true });
    await Video.destroy({ where: {} });
    console.log('🗑️ Anciennes vidéos supprimées.');

    const data = [
        // ========== FILMS ==========
        {
            title: 'Les Racines de l\'Or', description: 'Une saga familiale entre tradition et modernité dans les rues d\'Abidjan.', category: 'film', duration: '1h45', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', year: 2026, genre: 'Drame', casting: 'Aïcha Koné, Jean-Marc Koffi', director: 'Fatou Diop', rating: 8.7, coinsRequired: 0, featured: true, quality: 'HD', language: 'FR'
        },
        {
            title: 'Cœur de Ville', description: 'Un jeune entrepreneur ambitieux doit choisir entre l\'amour et le pouvoir.', category: 'film', duration: '1h50', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', poster: 'https://images.unsplash.com/photo-1516280440614-669728d5a48c?w=600', year: 2025, genre: 'Romance', casting: 'Moussa Traoré, Awa Diallo', director: 'Kader Sy', rating: 7.9, coinsRequired: 5, quality: 'HD', language: 'FR'
        },
        {
            title: 'Lueur d\'Espoir', description: 'Le combat d\'une femme pour sauver son quartier de la corruption.', category: 'film', duration: '2h05', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', year: 2024, genre: 'Thriller', casting: 'Mariam Sanogo, Issa Ouattara', director: 'Salif Keita', rating: 8.2, coinsRequired: 10, quality: 'HD', language: 'FR'
        },
        {
            title: 'Le Prix de la Gloire', description: 'Un footballeur talentueux doit faire face aux compromis du monde professionnel.', category: 'film', duration: '1h38', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', year: 2023, genre: 'Sport', casting: 'Yves Kouassi, Grace Bamba', director: 'Nadia Ben', rating: 8.0, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Sables Sacrés', description: 'Un anthropologue découvre un secret enfoui dans le désert.', category: 'film', duration: '1h55', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600', year: 2022, genre: 'Aventure', casting: 'Kofi Mensah, Awa Diallo', director: 'Ibrahim Cissé', rating: 8.4, coinsRequired: 5, quality: 'HD', language: 'FR'
        },

        // ========== SÉRIES : ABIDJAN CHIC ==========
        {
            title: 'Abidjan Chic', description: 'La vie glamour et impitoyable des influenceurs de la capitale.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:30', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', year: 2026, genre: 'Drame urbain', casting: 'Grace Bamba, Yves Kouassi', director: 'Nadia Ben', rating: 8.9, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Abidjan Chic', description: 'Un contrat volé met en danger l\'entreprise familiale.', category: 'serie', episodeNumber: 2, seasonNumber: 1, duration: '1:20', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', year: 2026, genre: 'Drame urbain', casting: 'Grace Bamba, Yves Kouassi', director: 'Nadia Ben', rating: 8.9, coinsRequired: 5, quality: 'HD', language: 'FR'
        },
        {
            title: 'Abidjan Chic', description: 'Une trahison amoureuse bouleverse les alliances.', category: 'serie', episodeNumber: 3, seasonNumber: 1, duration: '1:25', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', year: 2026, genre: 'Drame urbain', casting: 'Grace Bamba, Yves Kouassi', director: 'Nadia Ben', rating: 8.8, coinsRequired: 5, quality: 'HD', language: 'FR'
        },

        // ========== SÉRIES : THRILLER DE QUARTIER ==========
        {
            title: 'Thriller de Quartier', description: 'Un coup de feu dans la nuit, une dette à payer.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:40', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600', year: 2025, genre: 'Suspense', casting: 'Moussa Kone, Fatou Bamba', director: 'Ibrahim Cissé', rating: 9.1, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Thriller de Quartier', description: 'Le héros est traqué dans une ruelle sans issue.', category: 'serie', episodeNumber: 2, seasonNumber: 1, duration: '1:30', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600', year: 2025, genre: 'Suspense', casting: 'Moussa Kone, Fatou Bamba', director: 'Ibrahim Cissé', rating: 9.1, coinsRequired: 7, quality: 'HD', language: 'FR'
        },

        // ========== DOCUMENTAIRES ==========
        {
            title: 'Terres de Griots', description: 'Voyage au cœur de la tradition orale ouest-africaine.', category: 'documentaire', duration: '52min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', year: 2024, genre: 'Culture', casting: 'N/A', director: 'Djibril Sarr', rating: 8.4, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Abidjan, Ville Lumière', description: 'Une exploration de l\'évolution architecturale d\'Abidjan.', category: 'documentaire', duration: '45min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', year: 2023, genre: 'Architecture', casting: 'N/A', director: 'Awa Ndiaye', rating: 7.8, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Saveurs du Continent', description: 'À la découverte des cuisines qui unissent l\'Afrique.', category: 'documentaire', duration: '58min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', year: 2025, genre: 'Cuisine', casting: 'N/A', director: 'Kofi Mensah', rating: 8.6, coinsRequired: 5, quality: 'HD', language: 'FR'
        },

        // ========== CONTES MODERNES ==========
        {
            title: 'Contes Modernes', description: 'Une incantation dans un bureau moderne.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:30', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', year: 2026, genre: 'Fantastique', casting: 'Mariam Sanogo, Salif Keita', director: 'Nadia Ben', rating: 8.5, coinsRequired: 0, quality: 'HD', language: 'FR'
        },
        {
            title: 'Contes Modernes', description: 'Le nouveau mari est l\'esprit invoqué.', category: 'serie', episodeNumber: 2, seasonNumber: 1, duration: '1:20', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', year: 2026, genre: 'Fantastique', casting: 'Mariam Sanogo, Salif Keita', director: 'Nadia Ben', rating: 8.7, coinsRequired: 10, quality: 'HD', language: 'FR'
        }
    ];

    await Video.bulkCreate(data);
    console.log(`✅ Catalogue de démonstration créé : ${data.length} vidéos !`);
    process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });