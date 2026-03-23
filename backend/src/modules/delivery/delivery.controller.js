const deliveryService = require('./delivery.service');

exports.getDeliveryOptions = async (req, res, next) => {
    try {
        const { shopId, lat, lng } = req.query;
        if (!shopId) return res.status(400).json({ message: 'shopId is required' });
        const options = await deliveryService.getDeliveryOptions(
            parseInt(shopId),
            lat ? parseFloat(lat) : null,
            lng ? parseFloat(lng) : null
        );
        res.json(options);
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const data = await deliveryService.getDeliveryStatus(parseInt(bookingId), req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

exports.updateDeliveryStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'status is required' });
        const order = await deliveryService.updateDeliveryStatus(parseInt(bookingId), req.user.id, status);
        res.json({ message: 'Delivery status updated', deliveryOrder: order });
    } catch (err) {
        next(err);
    }
};

exports.getShopDeliveries = async (req, res, next) => {
    try {
        const { status } = req.query;
        const deliveries = await deliveryService.getShopDeliveries(req.user.id, status);
        res.json(deliveries);
    } catch (err) {
        next(err);
    }
};
