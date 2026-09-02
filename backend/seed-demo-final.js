const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connexion à la base (Railway ou local)
let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, { 
        dialect: 'postgres', 
        logging: false, 
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } 
    });
} else {
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { 
        host: process.env.DB_HOST, 
        dialect: 'postgres', 
        logging: false 
    });
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
        // ========== FILMS (MP4 Domaine Public - Internet Archive) ==========
        {
            title: 'La Petite Boutique des Horreurs', description: 'Un classique du cinéma d\'horreur des années 60, passé dans le domaine public.', category: 'film', duration: '1h12', 
            url: 'https://ia800509.us.archive.org/20/items/TheLittleShopOfHorrors1960_765/TheLittleShopOfHorrors1960.mp4', 
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', 
            year: 1960, genre: 'Horreur', casting: 'Jonathan Haze, Jackie Joseph', director: 'Roger Corman', rating: 7.2, coinsRequired: 0, featured: true, quality: 'HD'
        },
        {
            title: 'At War with the Army', description: 'Une comédie militaire mettant en scène les débuts de Jerry Lewis.', category: 'film', duration: '1h33', 
            url: 'https://ia601609.us.archive.org/28/items/AtWarWithTheArmy/AtWarWithTheArmy_512kb.mp4', 
            poster: 'https://images.unsplash.com/photo-1516280440614-669728d5a48c?w=600', 
            year: 1950, genre: 'Comédie', casting: 'Dean Martin, Jerry Lewis', director: 'Hal Walker', rating: 6.5, coinsRequired: 5, quality: 'HD'
        },
        {
            title: 'Horrors of Spider Island', description: 'Un thriller de science-fiction avec des effets spéciaux mémorables.', category: 'film', duration: '1h15', 
            url: 'https://ia801608.us.archive.org/3/items/Horrors_of_Spider_Island/Horrors_of_Spider_Island.mp4', 
            poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 
            year: 1960, genre: 'Science-Fiction', casting: 'Harald Maresch, Helga Franck', director: 'Fritz Böttger', rating: 5.8, coinsRequired: 10, quality: 'HD'
        },
        {
            title: 'Snowbeast', description: 'Une créature mystérieuse rôde dans les montagnes enneigées.', category: 'film', duration: '1h31', 
            url: 'https://ia801303.us.archive.org/30/items/Snowbeast_436/MoviePowderPresentsSnowbeast_512kb.mp4', 
            poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', 
            year: 1977, genre: 'Horreur', casting: 'Bo Svenson, Yvette Mimieux', director: 'Herb Wallerstein', rating: 6.0, coinsRequired: 5, quality: 'HD'
        },

        // ========== SÉRIES (Flux HLS Blender - Stable) ==========
        {
            title: 'Abidjan Chic', description: 'La vie glamour et impitoyable des influenceurs de la capitale.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:30', 
            url: 'https://ireplay.tv/test/hd_blender.m3u8', 
            poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', 
            year: 2026, genre: 'Drame urbain', casting: 'Grace Bamba, Yves Kouassi', director: 'Nadia Ben', rating: 8.9, coinsRequired: 0, quality: 'HD'
        },
        {
            title: 'Abidjan Chic', description: 'Un contrat volé met en danger l\'entreprise familiale.', category: 'serie', episodeNumber: 2, seasonNumber: 1, duration: '1:20', 
            url: 'https://ireplay.tv/test/hd_blender.m3u8', 
            poster: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600', 
            year: 2026, genre: 'Drame urbain', casting: 'Grace Bamba, Yves Kouassi', director: 'Nadia Ben', rating: 8.9, coinsRequired: 5, quality: 'HD'
        },
        {
            title: 'Thriller de Quartier', description: 'Un coup de feu dans la nuit, une dette à payer.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:40', 
            url: 'https://ireplay.tv/test/blender.m3u8', 
            poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600', 
            year: 2025, genre: 'Suspense', casting: 'Moussa Kone, Fatou Bamba', director: 'Ibrahim Cissé', rating: 9.1, coinsRequired: 0, quality: 'HD'
        },
        {
            title: 'Contes Modernes', description: 'Une incantation dans un bureau moderne.', category: 'serie', episodeNumber: 1, seasonNumber: 1, duration: '1:30', 
            url: 'https://ireplay.tv/test/blender.m3u8', 
            poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', 
            year: 2026, genre: 'Fantastique', casting: 'Mariam Sanogo', director: 'Nadia Ben', rating: 8.5, coinsRequired: 0, quality: 'HD'
        },

        // ========== DOCUMENTAIRES (MP4 Archive) ==========
        {
            title: 'Classiques du Cinéma', description: 'Un documentaire sur les grands classiques du cinéma mondial.', category: 'documentaire', duration: '52min', 
            url: 'https://ia800509.us.archive.org/20/items/TheLittleShopOfHorrors1960_765/TheLittleShopOfHorrors1960.mp4', 
            poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 
            year: 2024, genre: 'Culture', director: 'Divers', rating: 8.0, coinsRequired: 0, quality: 'HD'
        },
        {
            title: 'Histoire et Société', description: 'Exploration des mutations sociales à travers le temps.', category: 'documentaire', duration: '45min', 
            url: 'https://ia601609.us.archive.org/28/items/AtWarWithTheArmy/AtWarWithTheArmy_512kb.mp4', 
            poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', 
            year: 2025, genre: 'Société', director: 'Kofi', rating: 7.8, coinsRequired: 0, quality: 'HD'
        }
    ];

    await Video.bulkCreate(data);
    console.log(`✅ Catalogue de démonstration créé : ${data.length} vidéos !`);
    process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });