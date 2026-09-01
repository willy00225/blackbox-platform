const webpush = require('web-push');
const UserSubscription = require('../models/UserSubscription');

// Configuration VAPID (à définir dans .env)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: 'mailto:admin@blackbox.com'
};
webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey);

class NotificationService {
  /**
   * Envoie une notification à tous les abonnés enregistrés
   * @param {string} title - Titre de la notification
   * @param {string} body - Message de la notification
   * @returns {Promise<number>} Nombre de notifications envoyées avec succès
   */
  static async sendToAll(title, body) {
    try {
      const subscriptions = await UserSubscription.findAll();
      if (subscriptions.length === 0) {
        console.log('📢 Aucun abonné pour recevoir la notification.');
        return 0;
      }

      let sentCount = 0;
      for (const sub of subscriptions) {
        const pushSubscription = JSON.parse(sub.subscription);
        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title,
              body,
              icon: '/icons/logo-192.png',
              badge: '/icons/logo-192.png'
            })
          );
          sentCount++;
        } catch (error) {
          console.error(`❌ Échec d'envoi pour l'utilisateur ${sub.userId}:`, error);
        }
      }
      console.log(`✅ Notification envoyée à ${sentCount} abonné(s)`);
      return sentCount;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi global :', error);
      return 0;
    }
  }

  /**
   * Envoie une notification à un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur cible
   * @param {string} title - Titre
   * @param {string} body - Message
   * @returns {Promise<boolean>} true si envoyée, false sinon
   */
  static async sendToUser(userId, title, body) {
    try {
      const userSub = await UserSubscription.findOne({ where: { userId } });
      if (!userSub) return false;

      const pushSubscription = JSON.parse(userSub.subscription);
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({ title, body, icon: '/icons/logo-192.png' })
      );
      return true;
    } catch (error) {
      console.error(`❌ Erreur d'envoi à l'utilisateur ${userId}:`, error);
      return false;
    }
  }
}

module.exports = NotificationService;