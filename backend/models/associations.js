const User = require('./User');
const Video = require('./Video');
const Like = require('./Like');
const Comment = require('./Comment');
const Rating = require('./Rating');
const WatchHistory = require('./WatchHistory');
const Watchlist = require('./Watchlist');

// Associations User
User.hasMany(Like, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });
User.hasMany(Rating, { foreignKey: 'userId' });
User.hasMany(WatchHistory, { foreignKey: 'userId' });
User.hasMany(Watchlist, { foreignKey: 'userId' });
User.belongsTo(User, { as: 'referrer', foreignKey: 'referredBy' });

// Associations Video
Video.hasMany(Like, { foreignKey: 'videoId' });
Video.hasMany(Comment, { foreignKey: 'videoId' });

// Associations Comment
Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Video, { foreignKey: 'videoId' });

// Associations Like
Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(Video, { foreignKey: 'videoId' });

// Associations Rating
Rating.belongsTo(User, { foreignKey: 'userId' });
Rating.belongsTo(Video, { foreignKey: 'filmId' }); // sans alias

// Associations WatchHistory
WatchHistory.belongsTo(User, { foreignKey: 'userId' });
WatchHistory.belongsTo(Video, { foreignKey: 'filmId' }); // sans alias

// Associations Watchlist
Watchlist.belongsTo(User, { foreignKey: 'userId' });
Watchlist.belongsTo(Video, { foreignKey: 'filmId' }); // sans alias

module.exports = { User, Video, Like, Comment, Rating, WatchHistory, Watchlist };