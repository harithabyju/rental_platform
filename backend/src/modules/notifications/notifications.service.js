const notificationsRepository = require('./notifications.repository');

exports.createNotification = async (userId, title, message, type = 'info') => {
    return await notificationsRepository.createNotification(userId, title, message, type);
};

exports.getUserNotifications = async (userId, limit = 10, offset = 0) => {
    const notifications = await notificationsRepository.getNotificationsByUser(userId, limit, offset);
    const unreadCount = await notificationsRepository.getUnreadCount(userId);
    return { notifications, unreadCount };
};

exports.markAsRead = async (id, userId) => {
    return await notificationsRepository.markAsRead(id, userId);
};

exports.getUnreadCount = async (userId) => {
    return await notificationsRepository.getUnreadCount(userId);
};
