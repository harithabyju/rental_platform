const itemService = require('./item.service');

const addItem = async (req, res) => {
    try {
        const { item_name, description, price_per_day, category_id, quantity, image_url: body_image_url } = req.body;
        // If an image was uploaded, build the URL path, otherwise use the provided URL string
        const image_url = req.file ? `/uploads/${req.file.filename}` : body_image_url;

        const item = await itemService.addItem(req.user.id, {
            item_name,
            description,
            price_per_day,
            category_id,
            image_url,
            quantity: parseInt(quantity) || 1
        });
        res.status(201).json({ message: 'Item added successfully', item });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { item_name, description, price_per_day, status, quantity, image_url: body_image_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : body_image_url;

        const item = await itemService.updateItem(req.user.id, req.params.id, {
            item_name,
            description,
            price_per_day,
            status,
            image_url,
            quantity: quantity !== undefined ? parseInt(quantity) : undefined
        });
        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.user.id, req.params.id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getItemsByShop = async (req, res) => {
    try {
        const items = await itemService.getItemsByShop(req.params.shopId);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid item ID' });
        }
        const item = await itemService.getItemById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllItems = async (req, res) => {
    try {
        const { category_id, search } = req.query;
        const items = await itemService.getAllItems({ category_id, search });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addItem,
    updateItem,
    deleteItem,
    getItemsByShop,
    getItemById,
    getAllItems,
};
