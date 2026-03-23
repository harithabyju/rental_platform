const notificationsService = require('./notifications.service');

exports.getNotifications = async (req, res) => {
    try {
        const { notifications, unreadCount } = await notificationsService.getUserNotifications(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { notifications, unreadCount }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
